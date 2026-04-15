# 2048chan

Like 4chan, but bad.

## Setup

This setup is for a development environment only.

2048chan was created using **python3.14.2** and **bun1.3.11**. 2048chan was created to use PostgreSQL.

### .env (backend)

Create a file named _".env"_ inside of _/2048chan_.

```
DBSTRING=postgresql+psycopg2://chanuser:1337@localhost:5432/Chan
SECRET_KEY=<key for cookies>
```

### .env (frontend)

Create a file named _".env"_ inside of _/2048chan/Chan-Web_.

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_WS_BASE_URL=ws://127.0.0.1:8000/ws
```

## Dependencies (Linux)

In the root directory of the project run the following commands.</br></br>

`python3 -m venv .venv`</br>
`source ./.venv/bin/activate`</br>
`pip install -r requirements.txt`</br>

In _/2048chan/Chan-Web_ run the following command.</br></br>

`bun install`

## Running

In a terminal with the venv activated run: `uvicorn Chan_Data.main:app`</br>

In a seperate terminal run the following command: `bun run dev`
