## ===========
## Build stage
## 使用 node:22-slim 作为基础镜像，启用 Corepack 固定 pnpm 版本
## 仅负责安装依赖与构建产物，避免将开发文件带入运行层
## ===========
FROM node:22-slim AS builder
WORKDIR /app

# 开发环境变量，仅在构建阶段使用
ENV NODE_ENV=development

# 激活 pnpm，并与项目 packageManager 对齐版本
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# 先复制依赖清单，充分利用 Docker 层缓存
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# 安装依赖（锁定版本），随后复制代码并构建
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 剪裁为生产依赖，减小运行时镜像体积
RUN pnpm prune --prod

## ===========
## Runtime stage
## 仅包含生产依赖与构建产物，镜像更小更安全
## ===========
FROM node:22-slim AS runner
WORKDIR /app

# 生产环境变量
ENV NODE_ENV=production

# 仅复制运行所需内容
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# 服务端口由应用内 PORT 控制，默认 3000
EXPOSE 35000

# 启动应用
CMD ["node","dist/main.js"]
