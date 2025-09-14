# Use Node.js 18 LTS runtime
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source
COPY . .

# Build the app (Vite)
RUN npm run build

# Clean dev deps (optional optimization)
RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads

# Switch to non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose Railway's port
EXPOSE $PORT

ENV NODE_ENV=production

CMD ["node", "working-server.js"]
