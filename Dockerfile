# Use Node.js 18 LTS
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --no-optional --legacy-peer-deps

# Copy source code
COPY . .

# Build the application with explicit node options
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "simple-start.js"]
