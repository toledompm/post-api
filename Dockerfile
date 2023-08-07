FROM node:18.16-alpine AS base

ARG NODE_ENV=prod

WORKDIR /app

RUN npm install -g npm@9.8.1

FROM base AS build

COPY package*.json ./

RUN npm install

COPY src ./src

COPY *tsconfig.json ./

RUN npm run build

FROM base AS app

COPY --from=build /app/package*.json ./

RUN npm install --only=prod

COPY --from=build /app/dist ./

ENTRYPOINT [ "node", "app.js" ]
