FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

# Copy source code
COPY . .

# Generate Prisma client for the correct platform
# RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]