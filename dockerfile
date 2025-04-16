# Base image
FROM node:23-alpine3.20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose API port
EXPOSE 5000

# Start app
CMD ["npm", "run", "start:dev"]
