FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads && chown nestjs:nodejs uploads

USER nestjs

EXPOSE 8000
ENV NODE_ENV=production
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:8000/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "dist/main"]
