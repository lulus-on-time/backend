FROM node:20.11.0

WORKDIR /websocket

COPY package.json .

RUN npm i --omit=dev

ADD dist ./dist

CMD [ "node", "dist/app.js" ]

LABEL name="lulus on time"
LABEL version="1.0.0"


EXPOSE 80
