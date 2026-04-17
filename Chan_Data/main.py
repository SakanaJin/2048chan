import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import timedelta
from sqlalchemy import select

from Chan_Data.database import Base, engine, db_session

from Chan_Data.Utils.Response import HttpException

#table classes
from Chan_Data.Entities.Users import User
from Chan_Data.Entities.Auth import Auth
from Chan_Data.Entities.Topics import Topic
from Chan_Data.Entities.Threads import Thread
from Chan_Data.Entities.SubscribedThreads import SubscribedThread
from Chan_Data.Entities.Messages import Message

#controller routers
from Chan_Data.Controllers import (
    UserController,
    AuthController,
    TopicController,
    ThreadController,
    ThreadWSController
)

GUEST_GRACE = timedelta(days=1)

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_topics()
    scheduler.start()
    yield

app = FastAPI(lifespan=lifespan, redirect_slashes=False)

#app.include_router(controller.router)
app.include_router(UserController.router)
app.include_router(AuthController.router)
app.include_router(TopicController.router)
app.include_router(ThreadWSController.router)
app.include_router(ThreadController.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HttpException)
def HttpExceptionHandler(request: Request, exception: HttpException):
    return JSONResponse(
        exception.response.model_dump(),
        status_code=exception.status_code
    )

#cron jobs


def seed_topics():
    with open("./Chan_Data/Topics.json") as f:
        seeds = json.load(f)
    with db_session() as db:
        topics = db.scalars(
            select(Topic)
        ).all()
        for seed in seeds:
            if seed in topics:
                continue
            topic = Topic(
                name=seed["name"]
            )
            db.add(topic)
        db.commit()