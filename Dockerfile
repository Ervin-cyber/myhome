# 1. Build stage
FROM --platform=linux/arm64 node:20-alpine AS builder

WORKDIR /app

# Install build tools for better-sqlite3
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --build-from-source better-sqlite3

COPY . .
RUN npm run build

# 2. Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
