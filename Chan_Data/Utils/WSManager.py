from fastapi import WebSocket, WebSocketException
from pydantic import BaseModel
from typing import Dict, Callable, Optional
from enum import Enum, IntEnum

from Chan_Data.Entities.Threads import Thread
from Chan_Data.database import db_session

class WSMTypes(str, Enum):
    READY = "ready"
    MESSAGE = "message"
    PAGE = "page"

class WSCodes(IntEnum):
    NORMAL_CLOSURE = 1000
    GOING_AWAY = 1001
    POLICY_VIOLATION = 1008
    INTERNAL_SERVER_ERROR = 1011
    UNEXPECTED_CLOSURE = 1006
    FORCE_DC = 4001

class WSMessage(BaseModel):
    Mtype: WSMTypes
    data: Optional[object] = None

    
class MessageHandler():
    """Do not use this class use WSMHandler"""
    def __init__(self):
        self.handlers: Dict[WSMTypes, Callable] = {}

    def register(self, type: WSMTypes):
        def decorator(func):
            self.handlers[type] = func
            return func
        return decorator

class ConnectionManager:
    """Do not use this class use WSManager"""
    def __init__(self):
        self.threads: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self, threadid: int, userid: int, websocket: WebSocket):
        await websocket.accept()
        with db_session() as db:
            thread = db.get(Thread, threadid)
            if not thread:
                raise WebSocketException(code=WSCodes.POLICY_VIOLATION, reason="thread doesn't exist")
            if self.user_in_thread(userid=userid, threadid=threadid):
                raise WebSocketException(code=WSCodes.POLICY_VIOLATION, reason="user already in thread")
            self.threads.setdefault(threadid, dict())[userid] = websocket

    def disconnect(self, threadid: int, userid: int):
        if self.user_in_thread(userid=userid, threadid=threadid):
            del self.threads[threadid][userid]
            if not self.threads[threadid]: del self.threads[threadid]

    async def disconnect_user(self, threadid: int, userid: int, reason: str):
        if self.user_in_thread(userid=userid, threadid=threadid):
            await self.threads[threadid][userid].close(code=WSCodes.FORCE_DC, reason=reason)
            del self.threads[threadid][userid]
            if not self.threads[threadid]: del self.threads[threadid]

    async def disconnect_thread(self, threadid: int):
        if threadid not in self.threads:
            return
        for connection in self.threads[threadid].values():
            await connection.close(code=WSCodes.FORCE_DC, reason="Thread Closing")
        del self.threads[threadid]

    async def broadcast(self, threadid: int, message: WSMessage, excludeuserid: int=None):
        if threadid in self.threads:
            for userid, connection in self.threads[threadid].items():
                if userid == excludeuserid:
                    continue
                await connection.send_json(message.model_dump(mode="json"))

    def user_in_thread(self, userid: int, threadid: int) -> bool:
        return threadid in self.threads and userid in self.threads[threadid]

WSManager = ConnectionManager()
WSMHandler = MessageHandler()