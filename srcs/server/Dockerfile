FROM node:buster

ARG SERVER_PORT

WORKDIR /usr/src/app
ENV PATH /usr/src/server/node_modules/.bin:$PATH

# COPY package*.json ./
# RUN npm install

# COPY . .
EXPOSE ${SERVER_PORT}
ENV PORT=${SERVER_PORT}
CMD npm install ; npm i @nestjs/websockets socket.io @nestjs/platform-socket.io socket.io-client ; npm run start:dev