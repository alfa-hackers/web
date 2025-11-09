FROM node:alpine AS base
RUN apk add --no-cache libc6-compat rsync \
    && npm install -g pnpm@10.15.1
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY app/package.json ./app/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=1 /app .

USER nextjs
WORKDIR /app/app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
CMD ["pnpm", "start"]
