FROM node:20.11.0

WORKDIR /websocket

ENV DATABASE_URL="postgresql://postgres:findmyself123@34.75.54.53/mydb?schema=findmyself"

COPY ../../package.json .

COPY ../../tsconfig.json .

COPY ../../prisma ./prisma

COPY ../../src/api ./src/api

RUN npm i

RUN npm run build

RUN rm -rf tsconfig.json

RUN rm -rf ./prisma

RUN rm -rf ./src

RUN npm i --omit=dev

CMD [ "node", "dist/api/app.js" ]

LABEL name="lulus on time"
LABEL version="1.0.0"

EXPOSE 80
