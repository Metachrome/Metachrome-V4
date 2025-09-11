# Use Node.js 18 LTS runtime
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files for production dependencies only
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps || npm install --only=production --legacy-peer-deps

# Copy the pre-built application and server files
COPY simple-start.js ./
COPY database-integration.js ./
COPY dist ./dist

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "simple-start.js"]
