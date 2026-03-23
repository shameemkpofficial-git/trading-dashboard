# ─── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: minimal runtime image ──────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Run as non-root for security
USER node

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
