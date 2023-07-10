all: build up

up:
	docker compose up

build:
	docker compose build

down:
	docker compose down

clean:
	docker system prune -a -f --volumes