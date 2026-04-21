from pydantic import BaseModel
from datetime import datetime

from Chan_Data.Utils.Role import Role

class LoginDto(BaseModel):
    username: str
    password: str

class UserCreateDto(BaseModel):
    username: str
    password: str
    confirm_password: str

class UserGetDto(BaseModel):
    id: int
    username: str
    role: Role
    pfp_path: str
    subbedthreads: list[ThreadShallowDto]
    ownedthreads: list[ThreadShallowDto]
    
class UserShallowDto(BaseModel):
    id: int
    username: str
    pfp_path: str

class TopicGetDto(BaseModel):
    id: int
    name: str
    views: int
    threads: list[ThreadShallowDto]

class TopicShallowDto(BaseModel):
    id: int
    name: str
    views: int

class ThreadCreateDto(BaseModel):
    name: str

class ThreadGetDto(BaseModel):
    id: int
    name: str
    views: int
    subscribers: int
    expiresat: datetime
    creator: UserShallowDto

class ThreadShallowDto(BaseModel):
    id: int
    name: str
    views: int
    subscribers: int
    expiresat: datetime

class MessageCreateDto(BaseModel):
    content: str

class MessageGetDto(BaseModel):
    id: int
    content: str
    createdat: datetime
    author: UserShallowDto
    thread: ThreadShallowDto

class MessageShallowDto(BaseModel):
    id: int
    content: str
    createdat: datetime
    author: UserShallowDto

class PaginationDto(BaseModel):
    current_page: int
    total_pages: int
    total_messages: int
    page_size: int
    has_more: bool

class PageDto(BaseModel):
    messages: MessageShallowDto
    pagination: PaginationDto