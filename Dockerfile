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
COPY --from=builder /app/railway-start.js ./

# Copy data files with fallback handling
COPY --from=builder /app/pending-data.json ./pending-data.json 2>/dev/null || echo '{"deposits":[],"withdrawals":[]}' > ./pending-data.json
COPY --from=builder /app/admin-data.json ./admin-data.json 2>/dev/null || echo '[]' > ./admin-data.json
COPY --from=builder /app/users-data.json ./users-data.json 2>/dev/null || echo '[]' > ./users-data.json
COPY --from=builder /app/trades-data.json ./trades-data.json 2>/dev/null || echo '[]' > ./trades-data.json
COPY --from=builder /app/transactions-data.json ./transactions-data.json 2>/dev/null || echo '[]' > ./transactions-data.json

# Ensure all data files exist with defaults
RUN echo '{"deposits":[],"withdrawals":[]}' > pending-data-default.json && \
    echo '[]' > admin-data-default.json && \
    echo '[]' > users-data-default.json && \
    echo '[]' > trades-data-default.json && \
    echo '[]' > transactions-data-default.json && \
    test -f pending-data.json || cp pending-data-default.json pending-data.json && \
    test -f admin-data.json || cp admin-data-default.json admin-data.json && \
    test -f users-data.json || cp users-data-default.json users-data.json && \
    test -f trades-data.json || cp trades-data-default.json trades-data.json && \
    test -f transactions-data.json || cp transactions-data-default.json transactions-data.json && \
    rm -f *-default.json

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
