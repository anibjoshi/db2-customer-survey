# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

    # Install frontend dependencies (skip postinstall)
    RUN npm ci --ignore-scripts

# Copy frontend source
COPY src ./src
COPY public ./public

# Build frontend
RUN npm run build:client

# Production stage
FROM ubuntu:22.04

WORKDIR /app

# Install Node.js and IBM Db2 CLI driver dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    python3 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    libpam0g \
    libaio1 \
    libnsl2 \
    libuuid1 \
    libstdc++6 \
    libgcc-s1 \
    libxml2 \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --production

# Copy server code
COPY server/db2-server.js ./
COPY server/db2-setup.sql ./

# Copy built frontend
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Set working directory to server
WORKDIR /app/server

# Set production environment
ENV NODE_ENV=production

# Start server
CMD ["node", "db2-server.js"]

