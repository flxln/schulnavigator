# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Coolify (und andere CI-Umgebungen) setzen häufig NODE_ENV=production beim Build.
# Dann installiert `npm ci` keine devDependencies — `next build` braucht sie aber
# (z. B. @tailwindcss/postcss für globals.css).
RUN npm ci --include=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_EMBED_ENABLED=true
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts/validate-runtime.mjs ./scripts/validate-runtime.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/validate-access-shared.mjs ./scripts/validate-access-shared.mjs
COPY --from=builder --chown=nextjs:nodejs /app/lib/access-token-constants.mjs ./lib/access-token-constants.mjs
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1
CMD ["sh", "-c", "node scripts/validate-runtime.mjs && node server.js"]
