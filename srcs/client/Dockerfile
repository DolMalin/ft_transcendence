FROM node:buster

ARG CLIENT_PORT

WORKDIR /usr/src/client
ENV PATH /usr/src/client/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm install react-scripts@5.0.1 -g
RUN npm install --save typescript

COPY . .
EXPOSE ${CLIENT_PORT}:${CLIENT_PORT}
ENV PORT=${CLIENT_PORT}
CMD [ "npm", "run", "start"]