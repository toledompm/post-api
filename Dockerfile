FROM node:18.16-alpine AS build

ARG NODE_ENV=prod

WORKDIR /app

RUN npm install -g npm@9.6.1

COPY package*.json ./

RUN npm install

COPY src ./src

RUN npm run build

FROM node:18.16-alpine AS app

WORKDIR /app

RUN npm install -g npm@9.6.1

COPY --from=build /app/package*.json ./

RUN npm install --only=prod

COPY --from=build /app/dist ./

ENTRYPOINT [ "node", "app.js" ]
