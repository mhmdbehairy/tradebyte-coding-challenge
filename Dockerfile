# Stage 1 — build the Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies based on lockfile first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# Stage 2 — serve the static bundle with nginx
FROM nginx:alpine AS production
ENV NODE_ENV=production

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx default port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
