install:
	./.venv/bin/pip install -r requirements.txt
	cd Chan-Web && bun install

runb:
	./.venv/bin/uvicorn Chan_Data.main:app --reload

runf:
	cd Chan-Web && bun run dev

run:
	./.venv/bin/uvicorn Chan_Data.main:app --reload & cd Chan-Web && bun run dev

resetdb:
	sudo -u postgres psql -c "DROP DATABASE IF EXISTS chan;"
	sudo -u postgres psql -c "CREATE DATABASE chan;"
	sudo -u postgres psql -d myapp -c "ALTER DATABASE chan OWNER TO chanuser;"

setup:
	@echo "Creating Python virtual environment..."
	python3 -m venv .venv
	@echo "Installing backend dependencies..."
	./.venv/bin/pip install -r requirements.txt
	@echo "Installing frontend dependencies"
	cd Chan-Web && bun install
	@echo "Creating template .env files"
	cp frontendenv.example ./Chan-Web/.env
	cp backendenv.example ./.env
	@echo "Creating Database..."
	sudo -u postgres psql -f ./dbsetup.sql
	@echo "Setup Complete"
