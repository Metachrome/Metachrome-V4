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

# Copy all files from builder and create defaults for missing ones
COPY --from=builder /app/ /tmp/source/
RUN cp /tmp/source/dist ./dist -r && \
    cp /tmp/source/working-server.js ./ && \
    cp /tmp/source/railway-start.js ./ && \
    (cp /tmp/source/pending-data.json ./ || echo '{"deposits":[],"withdrawals":[]}' > pending-data.json) && \
    (cp /tmp/source/admin-data.json ./ || echo '[]' > admin-data.json) && \
    (cp /tmp/source/users-data.json ./ || echo '[]' > users-data.json) && \
    (cp /tmp/source/trades-data.json ./ || echo '[]' > trades-data.json) && \
    (cp /tmp/source/transactions-data.json ./ || echo '[]' > transactions-data.json) && \
    rm -rf /tmp/source

# Create uploads directory for file uploads
RUN mkdir -p uploads

# Security: non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Railway automatically injects $PORT
EXPOSE $PORT

ENV NODE_ENV=production

# Start server with Railway startup script
CMD ["node", "railway-start.js"]
