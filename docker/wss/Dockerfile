FROM node:20.11.0

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

WORKDIR /websocket

COPY package.json .

COPY tsconfig.json .

COPY prisma ./prisma

COPY src/wss ./src/wss

COPY src/db ./src/db

RUN npm i

RUN npm run build

RUN rm -rf tsconfig.json

RUN rm -rf ./prisma

RUN rm -rf ./src

RUN npm i --omit=dev

CMD ["node", "dist/wss/app.js" ]

LABEL name="lulus on time"
LABEL version="1.0.0"

EXPOSE 80