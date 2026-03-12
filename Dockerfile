## ==========
## Base stage
## 统一启用 corepack / pnpm
## ==========
FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

## ==========
## Build dependencies
## 安装完整依赖用于编译
## ==========
FROM base AS deps
ENV NODE_ENV=development
ENV HUSKY=0
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts

## ==========
## Build stage
## 编译产物
## ==========
FROM deps AS builder
COPY . .
RUN pnpm build

## ==========
## Production dependencies
## 单独安装生产依赖，避免 prune 带来的 prepare/husky 问题
## ==========
FROM base AS prod-deps
ENV NODE_ENV=production
ENV HUSKY=0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

## ==========
## Runtime stage
## 仅包含运行所需内容
## ==========
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
EXPOSE 35000
CMD ["node", "dist/main.js"]
