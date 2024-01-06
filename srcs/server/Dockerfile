FROM node:21

ARG SERVER_PORT

WORKDIR /usr/src/app

COPY . .

EXPOSE ${SERVER_PORT}
ENV PORT=${SERVER_PORT}
RUN npm install
RUN npm run build

CMD [ "npm", "run" ,"start:prod" ]

