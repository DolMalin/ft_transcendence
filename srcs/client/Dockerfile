FROM node:buster

ARG CLIENT_PORT
ARG SERVER_URL
ARG SERVER_IP


WORKDIR /usr/src/client
ENV PATH /usr/src/client/node_modules/.bin:$PATH

COPY package.json .
# COPY ../.env .
COPY package-lock.json .

# RUN npm install
COPY . .
EXPOSE ${CLIENT_PORT}:${CLIENT_PORT}
ENV PORT=$CLIENT_PORT
ENV REACT_APP_SERVER_URL=$SERVER_URL
CMD npm i --save-dev @chakra-ui/react @emotion/react @emotion/styled framer-motion typescript react-scripts reactjs-popup @nestjs/websockets socket.io socket.io-client ; npm run start
