from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import timedelta

from Chan_Data.database import Base, engine

from Chan_Data.Utils.Response import HttpException

#table classes
from Chan_Data.Entities.Users import User
from Chan_Data.Entities.Auth import Auth

#controller routers
from Chan_Data.Controllers import (
    UserController,
    AuthController
)

GUEST_GRACE = timedelta(days=1)

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    scheduler.start()
    yield

app = FastAPI(lifespan=lifespan, redirect_slashes=False)

#app.include_router(controller.router)
app.include_router(UserController.router)
app.include_router(AuthController.router)

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