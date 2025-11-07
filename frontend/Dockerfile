FROM node:alpine AS base
RUN apk add --no-cache libc6-compat rsync
RUN npm install -g pnpm@10.15.1
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY app/package.json ./app/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/node_modules ./app/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY app ./app
COPY tsconfig.base.json ./
RUN pnpm build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/app/.next ./app/.next
COPY --from=builder --chown=nextjs:nodejs /app/app/public ./app/public
COPY --from=builder --chown=nextjs:nodejs /app/app/package.json ./app/package.json
COPY --from=builder --chown=nextjs:nodejs /app/app/node_modules ./app/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
USER nextjs
WORKDIR /app/app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
CMD ["pnpm", "start"]
