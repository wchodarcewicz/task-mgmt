ARG IMAGE=node:20.11-alpine
FROM $IMAGE

WORKDIR /app

RUN apk add --no-cache bash curl git py-pip make && \
  npx node-prune && \
  npm cache clean --force && \
  npm i -g @nestjs/cli

COPY docker ./docker
COPY .npmr[c] package.json package-lock.json ./

RUN npm ci && \
  npm cache clean --force && \
  npm dedupe && \
  rm -f .npmrc

COPY . .
RUN npm run build
