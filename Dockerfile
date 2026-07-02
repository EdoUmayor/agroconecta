# ---------- Etapa 1: dependencias y build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar la cache de Docker
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npm cache clean --force

# Generamos el cliente de Prisma en base al schema
RUN npx prisma generate

# ---------- Etapa 2: imagen final, liviana ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Usuario no root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY src ./src

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
