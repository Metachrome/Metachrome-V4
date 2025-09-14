# ---------- Stage 1: Build ----------
FROM node:18-slim AS builder
WORKDIR /app

# Copy only package.json (not lockfile)
COPY package.json ./

# Install all dependencies fresh in Linux (including devDeps)
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build app (generates dist/)
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-slim AS production
WORKDIR /app

# Copy only package.json (not lockfile)
COPY package.json ./

# Install only production deps
RUN npm install --only=production --legacy-peer-deps

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

# Railway automatically injects $PORT
EXPOSE $PORT

ENV NODE_ENV=production

# Start server
CMD ["node", "working-server.js"]
