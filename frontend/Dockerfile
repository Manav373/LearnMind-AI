# Build stage
FROM node:22-slim AS builder

WORKDIR /app

ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

# Build args for environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
