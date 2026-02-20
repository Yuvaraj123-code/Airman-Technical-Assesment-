FROM node:18-bookworm-slim

WORKDIR /app

# Prisma engines need OpenSSL in the runtime image.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY src/prisma ./src/prisma/

# Install dependencies
RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "src/server.js"]
