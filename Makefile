all: build up

up:
	sudo docker compose up

build:
	sudo docker compose build

down:
	sudo docker compose down

clean:
	sudo docker system prune -a -f --volumes