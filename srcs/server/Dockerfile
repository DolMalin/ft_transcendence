FROM node:latest

ARG SERVER_PORT
ARG SERVER_URL
ARG SERVER_IP

WORKDIR /usr/src/app
# ENV PATH /usr/src/server/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

COPY . .

EXPOSE ${SERVER_PORT}
ENV PORT=${SERVER_PORT}
RUN npm install
CMD ['npm' 'run' 'build']

ENTRYPOINT [ "npm", "run" ,"start:prod" ]

# CMD [ "tail", "-f", "/dev/null" ]