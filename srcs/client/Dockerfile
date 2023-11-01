FROM node:buster

ARG CLIENT_PORT

WORKDIR /usr/src/client
ENV PATH /usr/src/client/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

# RUN npm install

COPY . .
EXPOSE ${CLIENT_PORT}:${CLIENT_PORT}
ENV PORT=${CLIENT_PORT}
CMD npm install ; npm run start