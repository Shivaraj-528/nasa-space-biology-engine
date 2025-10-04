# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* .npmrc* ./
RUN npm install --legacy-peer-deps || npm install

# Copy the rest of the source
COPY . .

# Build TypeScript
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8000

CMD ["npm", "start"]
