from fastapi import APIRouter, Depends
from sqlalchemy import select, exists
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from Chan_Data.database import get_db
from Chan_Data.Utils.Response import Response, HttpException
from Chan_Data.Utils.Time import round_nearest_hour
from Chan_Data.Utils.Role import Role
from Chan_Data.Entities.Threads import Thread
from Chan_Data.Entities.Topics import Topic
from Chan_Data.Controllers.AuthController import get_current_user
from Chan_Data.Entities.dtos import ThreadCreateDto

router = APIRouter(prefix="/api/threads", tags=["Threads"])

THREAD_TIME = 7 #days
MAX_THREADS = 20

@router.get("")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    threads = db.scalars(
        select(Thread)
    ).all()
    response.data = [thread.toGetDto() for thread in threads]
    return response

@router.get("/{id}")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    thread = db.get(Thread, id)
    if not thread:
        response.add_error("id", "thread not found")
        raise HttpException(status_code=404, response=response)
    thread.views += 1
    db.commit()
    response.data = thread.toGetDto()
    return response

@router.get("topic/{id}")
def get_by_topic(id: int, db: Session = Depends(get_db)):
    response = Response()
    topicexists = db.scalar(select(exists().where(Topic.id == id)))
    if not topicexists:
        response.add_error("id", "topic not found")
        raise HttpException(status_code=404, response=response)
    threads = db.scalars(
        select(Thread)
        .where(Thread.topicid == id)
    ).all()
    response.data = [thread.toGetDto() for thread in threads]
    return response

@router.post("/{id}/subscribe")
def subscribe(id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    response = Response()
    thread = db.get(Thread, id)
    if not thread:
        response.add_error("id", "thread not found")
        raise HttpException(status_code=404, response=response)
    if user in thread.subscribers:
        response.add_error("user", "user already subscribed")
        raise HttpException(status_code=400, response=response)
    thread.subscribers.append(user)
    db.commit()
    response.data = True
    return response

@router.post("/{id}/unsubscribe")
def unsubscribe(id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    response = Response()
    thread = db.get(Thread, id)
    if not thread:
        response.add_error("id", "thread not found")
        raise HttpException(status_code=404, response=response)
    if thread not in user.subbedthreads or thread.creatorid == user.id:
        response.add_error("user", "user cannot unsubscribe from thread")
        raise HttpException(status_code=400, response=response)
    thread.subscribers.remove(user)
    db.commit()
    response.data = True
    return response

@router.post("/topic/{id}")
def create(threaddto: ThreadCreateDto, id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    response = Response()
    topic = db.get(Topic, id)
    if not topic:
        response.add_error("topic", "topic not found")
        raise HttpException(status_code=404, response=response)
    if len(topic.threads) >= MAX_THREADS:
        response.add_error("topic", "topic has too many threads")
        raise HttpException(status_code=503, response=response)
    if id in [topic.id for topic in user.owned_threads]:
        response.add_error("topic", "user already has thread in this topic")
        raise HttpException(status_code=409, response=response)
    if len(threaddto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    thread = Thread(
        name=threaddto.name,
        creatorid=user.id,
        topicid=id,
        expiresat=round_nearest_hour(datetime.now() + timedelta(days=THREAD_TIME))
    )
    db.add(thread)
    thread.subscribers.append(user)
    db.commit()
    response.data = thread.toGetDto()
    return response

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    response = Response()
    thread = db.get(Thread, id)
    if not thread:
        response.add_error("id", "thread not found")
        raise HttpException(status_code=404, response=response)
    if thread.creatorid != user.id and user.role != Role.ADMIN:
        response.add_error("user", "forbidden")
        raise HttpException(status_code=403, response=response)
    db.delete(thread)
    db.commit()
    response.data = True
    return response