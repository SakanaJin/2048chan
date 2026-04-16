from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Depends
from pydantic import ValidationError, BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from Chan_Data.Utils.WSManager import WSManager, WSMHandler, WSMTypes, WSMessage, WSCodes
from Chan_Data.database import db_session
from Chan_Data.Entities.Users import User
from Chan_Data.Controllers.AuthController import get_current_user

router = APIRouter(prefix="/ws/threads", tags=["ThreadsWS"])

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

@WSMHandler.register("not-found")
async def notfound():
    pass