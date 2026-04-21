from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Depends
from pydantic import ValidationError
from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session
from datetime import datetime

from Chan_Data.Utils.WSManager import WSManager, WSMHandler, WSMTypes, WSMessage, WSCodes
from Chan_Data.database import db_session
from Chan_Data.Entities.Users import User
from Chan_Data.Entities.Messages import Message
from Chan_Data.Entities.Threads import Thread
from Chan_Data.Controllers.AuthController import get_current_user
from Chan_Data.Entities.dtos import PageDto, PaginationDto, MessageCreateDto

router = APIRouter(prefix="/ws/threads", tags=["ThreadsWS"])

PAGE_SIZE = 50 #messages

def get_page(db: Session, threadid: int, page: int = 1) -> PageDto:
    offset = (page - 1) * PAGE_SIZE
    messages = db.scalars(
        select(Message)
        .where(Message.threadid == threadid)
        .order_by(desc(Message.id))
        .offset(offset)
        .limit(PAGE_SIZE)
    ).all()
    total_messages = db.execute(
        select(func.count(Thread.id))
        .select_from(
            select(Thread)
            .where(Thread.id == threadid)
        )
    )
    total_pages = -(-total_messages // PAGE_SIZE)
    pagination = PaginationDto(
        current_page=page,
        total_pages=total_pages,
        total_messages=total_messages,
        page_size=PAGE_SIZE,
        has_more=page < total_pages
    )
    return PageDto(
        messages=reversed(message.toShallowDto() for message in messages),
        pagination=pagination
    )

@router.websocket("/{threadid}")
async def thread_websocket(websocket: WebSocket, threadid: int, user: User = Depends(get_current_user)):
    await WSManager.connect(threadid=threadid, userid=user.id, websocket=websocket)
    try:
        while True:
            m = await websocket.receive_json()
            try:
                message = WSMessage.model_validate(m)
            except ValidationError:
                continue
            await WSMHandler.handlers.get(message.Mtype, WSMHandler.handlers["not-found"])(
                message=message,
                threadid=threadid,
                userid=user.id,
                websocket=websocket
            )
    except WebSocketDisconnect as e:
        if e.code != WSCodes.FORCE_DC:
            WSManager.disconnect(threadid=threadid, userid=user.id)
    except WebSocketException as e:
        if e.code != WSCodes.POLICY_VIOLATION:
            WSManager.disconnect(threadid=threadid, userid=user.id)

@WSMHandler.register(WSMTypes.READY)
async def onready(message: WSMessage, threadid: int, websocket: WebSocket, **kwargs):
    if not message.data:
        return
    with db_session() as db:
        pagedata = get_page(db, threadid, page=1)
        newMessage = WSMessage(Mtype=message.Mtype, data=pagedata)
        await websocket.send_json(newMessage.model_dump(mode="json"))

@WSMHandler.register(WSMTypes.MESSAGE)
async def onmessage(message: WSMessage, threadid: int, userid: int):
    if not message.data:
        return
    try:
        messagedata = MessageCreateDto.model_validate(message.data)
    except ValidationError:
        return
    with db_session() as db:
        message = Message(
            content=messagedata.content,
            authorid=userid,
            threadid=threadid,
            created_at=datetime.now()
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        newMessage = WSMessage(Mtype=message.type, data=message.toShallowDto())
        await WSManager.broadcast(threadid=threadid, message=newMessage)

@WSMHandler.register(WSMTypes.PAGE)
async def onpage(message: WSMessage, threadid: int, websocket: WebSocket, **kwargs):
    if not message.data:
        return
    page = message.data
    with db_session() as db:
        pagedata = get_page(db, threadid, page=page)
        newMessage = WSMessage(Mtype=message.Mtype, data=pagedata)
        await websocket.send_json(newMessage.model_dump(mode="json"))

@WSMHandler.register("not-found")
async def notfound():
    pass