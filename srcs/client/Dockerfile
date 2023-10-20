FROM node:buster

ARG CLIENT_PORT

WORKDIR /usr/src/client
ENV PATH /usr/src/client/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

# RUN npm install -g npm@10.2.0
# RUN npm install  -g

COPY . .
EXPOSE ${CLIENT_PORT}:${CLIENT_PORT}
ENV PORT=${CLIENT_PORT}
CMD npm i --save-dev @chakra-ui/react @emotion/react @emotion/styled framer-motion typescript react-scripts reactjs-popup @nestjs/websockets socket.io socket.io-client ; npm run start