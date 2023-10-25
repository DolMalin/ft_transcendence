NAME = ft_malaise
DOCKER = docker
COMPOSE = sudo docker compose -p ${NAME} -f srcs/docker-compose.yml
COMPOSE_SKEWL = docker compose -p ${NAME} -f srcs/docker-compose.yml

all: up

ps:
	$(COMPOSE_SKEWL) ps

images:
	$(COMPOSE_SKEWL) images

volumes:
	$(DOCKER) volume ls

networks:
	$(DOCKER) network ls

start: $(DEPENDENCIES)
	$(COMPOSE_SKEWL) start

stop:
	$(COMPOSE_SKEWL) stop

restart: $(DEPENDENCIES)
	$(COMPOSE_SKEWL) restart

up: $(DEPENDENCIES)
	$(COMPOSE_SKEWL) up --detach --build

down:
	$(COMPOSE_SKEWL) down

clean:
	$(COMPOSE_SKEWL) down --rmi all --volumes

fclean: clean

prune: down fclean
	$(DOCKER) system prune -a -f

re: fclean all

.PHONY: all ps images volumes networks start stop restart up down clean fclean prune re
