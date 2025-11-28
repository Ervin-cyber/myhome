# Use a Debian-based Node image for ARM
FROM --platform=linux/arm64 node:20-bullseye

# Copy env BEFORE build
COPY .env .env

# Set working directory
WORKDIR /app

# Install build tools for better-sqlite3
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

RUN rm -rf .next

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]