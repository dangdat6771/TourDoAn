# =============================================
# Frontend Multi-stage Dockerfile
# Stage 1: Build React app with Vite
# Stage 2: Serve with Nginx + reverse proxy
# =============================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first (for dependency caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
