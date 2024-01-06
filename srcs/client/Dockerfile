FROM node:latest

ARG CLIENT_PORT
ARG SERVER_URL
ARG SERVER_IP

WORKDIR /usr/src/client
# ENV PATH /usr/src/client/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

COPY . .

EXPOSE ${CLIENT_PORT}
ENV PORT=${CLIENT_PORT}
RUN npm install
CMD ['npm' 'run' 'build']

ENTRYPOINT [ "npm", "run" ,"start" ]

# CMD [ "tail", "-f", "/dev/null" ]
