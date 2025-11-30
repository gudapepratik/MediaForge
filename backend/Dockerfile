FROM node:22-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

RUN npm install --production

COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
