from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from Chan_Data.database import get_db
from Chan_Data.Utils.Response import Response, HttpException
from Chan_Data.Entities.Topics import Topic

router = APIRouter(prefix="/api/topics", tags=["Topics"])

@router.get("")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    topics = db.scalars(
        select(Topic)
    ).all()
    response.data = [topic.toGetDto() for topic in topics]
    return response

@router.get("/{id}")
def get_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    topic = db.get(Topic, id)
    if not topic:
        response.add_error("id", "Topic not found")
        raise HttpException(status_code=404, response=response)
    response.data = topic.toGetDto()
    return response