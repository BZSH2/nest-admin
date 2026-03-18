# Nest Admin

基于 NestJS 的后台管理系统基础架构项目。

## 📦 环境准备

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0

推荐使用 `nvm` 管理 Node 版本：

```bash
nvm use
```

## 🛠️ 快速开始

```bash
# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.example .env

# 启动开发服务
pnpm run start:dev
```

默认启动后可访问：
- API 文档：`/docs`
- 存活检查：`/health`、`/health/live`
- 就绪检查：`/health/ready`

> `ConfigModule` 已启用启动前环境变量校验。缺少数据库/JWT 等关键配置时，应用会直接启动失败，而不是带着坏配置运行。

## 🔐 权限控制

当前项目已接入**轻量 RBAC 骨架**：
- 通过 `ADMIN_PHONE_NUMBERS` 环境变量配置管理员手机号白名单
- `Users` 管理接口默认要求管理员权限
- 登录后用户角色会在鉴权阶段动态解析为 `admin` 或 `user`

示例：

```env
ADMIN_PHONE_NUMBERS=13800138000,13900139000
```

> 这是一个**不改数据库结构**的轻量版本，适合当前阶段快速保护后台管理接口。后续如果要做完整 RBAC，可再演进为数据库角色/权限模型。

## 🏗️ 项目规范

### 代码风格
本项目使用 [Biome](https://biomejs.dev/) 进行代码格式化与 Lint 检查。

- **Lint**: `pnpm run lint`
- **Format**: `pnpm run format`
- **Check**: `pnpm run check`
- **EditorConfig**: 已配置 `.editorconfig`，请确保编辑器安装相应插件。

### 提交规范
本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，并配置了 Commitlint 与 Commitizen。

- **提交代码**: 推荐使用 `pnpm run commit` 交互式提交。
- **Commit Message**: 必须符合 `<type>(<scope>): <subject>` 格式。

### 分支管理
- `master`: 主分支，受保护，仅允许 PR 合并。
- `feat/*`: 功能分支。
- `fix/*`: 修复分支。

## 🧪 测试

```bash
# 单元测试
pnpm test --runInBand

# 覆盖率测试
pnpm run test:cov

# E2E 测试
pnpm test:e2e --runInBand
```

当前测试覆盖包括：
- App 基础接口
- 健康检查接口
- 环境变量校验
- 用户密码哈希与 refresh token 校验逻辑
- Controller 请求类型与权限守卫逻辑

## 🚀 持续集成与部署

- `CI` 工作流会在 push / pull request 到 `master` 时执行静态检查、构建、单测与 e2e。
- `deploy` 工作流仅在 push 到 `master` 或手动触发时执行，避免 PR 阶段误部署。
- 生产环境容器健康检查与部署脚本统一使用 `/health/ready`，确保数据库可达后再判定服务就绪。
- `.env.example` 默认使用 `HOST=0.0.0.0`，更适合 Docker / 服务器部署场景。

## 📄 文档
- [安全策略](./SECURITY.md)
- [变更日志](./CHANGELOG.md)

## 🤝 贡献
请阅读 [Contributing Guide](./.github/PULL_REQUEST_TEMPLATE.md) 了解如何参与贡献。
