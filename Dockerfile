# ---------- Stage 1: Build ----------
FROM node:18-slim AS builder
WORKDIR /app

# Copy dependency manifests first (better cache)
COPY package*.json ./

# Install all dependencies (incl. devDependencies for build)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Run build (generates dist/)
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-slim AS production
WORKDIR /app

# Copy only package files and install prod deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps || npm install --only=production --legacy-peer-deps

# Copy required runtime files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/working-server.js ./
COPY --from=builder /app/pending-data.json ./
COPY --from=builder /app/admin-data.json ./

# Create uploads directory for file uploads
RUN mkdir -p uploads

# Security: non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Railway exposes $PORT automatically
EXPOSE $PORT

ENV NODE_ENV=production

# Start server
CMD ["node", "working-server.js"]
