FROM node:22-alpine

WORKDIR /usr/src/app

COPY worker/package*.json ./
RUN npm install --only=production

COPY worker/ .

CMD ["node", "index.js"]
