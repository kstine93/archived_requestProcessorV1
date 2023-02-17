FROM registry.opensource.zalan.do/library/node-14.15-alpine:latest

RUN apk add --no-cache ffmpeg

COPY package.json package.json
COPY dist /dist/

RUN npm install --only=production

WORKDIR /dist
ENTRYPOINT node index.js