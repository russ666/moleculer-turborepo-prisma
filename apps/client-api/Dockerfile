# --- Build stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json ./
COPY apps/client-api/package.json ./apps/client-api/
COPY packages/prisma/package.json ./packages/prisma/

# Install all workspace deps
RUN npm ci --include=optional

# Copy source
COPY apps/client-api ./apps/client-api
COPY packages/prisma ./packages/prisma

# Build
RUN npm run build --workspace=apps/client-api

# --- Runtime stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/client-api/package.json ./apps/client-api/

RUN npm ci --workspace=apps/client-api --include=optional --omit=dev

COPY --from=builder /app/apps/client-api/dist ./apps/client-api/dist

WORKDIR /app/apps/client-api

EXPOSE 8000

CMD ["node", "dist/index.js"]
