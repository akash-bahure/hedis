FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache \
    graphicsmagick \
    ghostscript \
    poppler-utils

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "server.js"]