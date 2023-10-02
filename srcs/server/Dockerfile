FROM node:buster

ARG SERVER_PORT

WORKDIR /usr/src/app
# COPY package*.json ./
RUN npm install -g @nestjs/cli

# COPY . .
EXPOSE ${SERVER_PORT}
ENV PORT=${SERVER_PORT}
CMD npm install ; npm i @nestjs/websockets socket.io @nestjs/platform-socket.io socket.io-client ; npm run start:dev