# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY src ./src
COPY public ./public

# Build frontend
RUN npm run build:client

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install IBM Db2 CLI driver dependencies
RUN apk add --no-cache \
    libc6-compat \
    gcc \
    g++ \
    make \
    python3

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

# Start server
CMD ["node", "db2-server.js"]

