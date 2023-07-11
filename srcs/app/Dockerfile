FROM node:buster

ARG APP_PORT

WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# COPY ../.env .
COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm install react-scripts@3.4.1 -g

COPY . .
EXPOSE ${APP_PORT}:${APP_PORT}
ENV PORT=${APP_PORT}
CMD [ "npm", "run", "start"]