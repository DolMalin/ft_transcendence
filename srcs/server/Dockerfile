FROM node:buster

ARG SERVER_PORT

WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install -g @nestjs/cli

# COPY . .
EXPOSE ${SERVER_PORT}
ENV PORT=${SERVER_PORT}
CMD npm install ; npm run start:dev