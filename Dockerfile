# ---------- Stage 1: Build ----------
FROM node:18-slim AS builder
WORKDIR /app

# Copy dependency manifests first
COPY package*.json ./

# Install all dependencies (including devDeps) using npm install
# (avoids Rollup optional dependency bug with npm ci)
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build app (generates dist/)
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-slim AS production
WORKDIR /app

# Copy only package files and install prod deps
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy required runtime files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/working-server.js ./
COPY --from=builder /app/pending-data.json ./
COPY --from=builder /app/admin-data.json ./

# Create uploads directory for file uploads
RUN mkdir -p uploads

# Security: use non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Railway automatically injects $PORT
EXPOSE $PORT

ENV NODE_ENV=production

# Start server
CMD ["node", "working-server.js"]
