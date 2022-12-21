FROM node:18.12-alpine AS build

ARG NODE_ENV=prod

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:18.12-alpine AS app

WORKDIR /app

COPY --from=build /app/dist /app

RUN npm install --only=prod

ENTRYPOINT [ "node", "index.js" ]
