FROM node:20-alpine AS builder
WORKDIR /app

COPY admin-frontend/package.json admin-frontend/package-lock.json ./
RUN npm ci

COPY shared /shared
COPY admin-frontend .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173
ENV HOST=0.0.0.0
ENV VITE_API_ORIGIN=http://api:8000

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./server.cjs

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:4173').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "server.cjs"]
