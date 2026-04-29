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
- 通过 `ADMIN_PHONE_NUMBERS` 环境变量配置初始化管理员手机号白名单
- `Users` 管理接口默认要求管理员权限
- 角色已支持持久化到 `users.role`
- 登录后用户角色会优先读取数据库角色；历史用户若角色为空，可回退到管理员白名单进行兼容识别

示例：

```env
ADMIN_PHONE_NUMBERS=13800138000,13900139000
```

## 👥 角色管理接口

当前已补齐基础角色管理接口：
- `GET /roles/options`：获取可分配角色列表
- `GET /roles/users/:userId`：获取指定用户当前角色信息
- `PATCH /roles/users/:userId`：更新指定用户角色

说明：
- 以上接口默认要求 **admin** 权限
- 角色当前采用枚举值：`admin` / `user`
- 新注册用户会默认写入 `user`，初始化管理员手机号可根据白名单自动写入 `admin`

> 这是一版适合当前项目阶段的轻量实现：先把角色识别、角色更新、管理权限入口打通，再决定是否继续演进到独立角色表 / 权限点表。

## 🔁 认证接口约定

当前 Auth 接口已补齐更稳定的返回契约：
- `POST /auth/register` → 返回当前注册用户资料（含 role）
- `POST /auth/login` → 返回 `accessToken` / `refreshToken`
- `POST /auth/refresh` → 返回新 token 对
- `POST /auth/logout` → 返回明确消息，不再暴露 TypeORM `UpdateResult`
- `GET /auth/profile` → 返回当前登录用户资料（含 role）
- `POST /auth/change-password` → 返回明确消息

Swagger 也已同步补齐这些响应模型，前后端联调时可以直接看文档约定字段。

## 🖼️ 静态资源接口

当前已补齐一套基础静态资源管理接口，默认面向 **admin** 使用：

- `GET /static-assets`：分页查询静态资源
- `GET /static-assets/folders`：获取资源分组 / 目录选项（含数量）
- `GET /static-assets/:id`：查询静态资源详情
- `POST /static-assets/upload`：上传静态资源（`multipart/form-data`）
- `PATCH /static-assets/:id`：更新资源名称 / 分组 / 备注
- `DELETE /static-assets/batch`：批量删除静态资源
- `DELETE /static-assets/:id`：删除静态资源（软删除记录 + 尝试删除物理文件）

默认行为：
- 文件默认保存到 `storage/static-assets`
- 默认公开访问路径为 `/<STATIC_ASSETS_ROUTE_PREFIX>/...`，默认即 `/static-assets/...`
- 列表查询支持：
  - `keyword`
  - `folder`
  - `fileType`
  - `imagesOnly=true`（前端图片库模式）
  - `uncategorizedOnly=true`（仅未分组资源）
- 分组接口会返回目录名、是否未分组、各目录资源数量
- 批量删除接口会返回请求数量、成功删除数量、缺失 ID 列表
- 返回结果会同时给出：
  - `storagePath`：存储相对路径
  - `accessPath`：站内访问路径
  - `accessUrl`：若配置 `STATIC_ASSETS_PUBLIC_BASE_URL`，则返回完整公网 URL

环境变量补充：

```env
STATIC_ASSETS_DIR=storage/static-assets
STATIC_ASSETS_ROUTE_PREFIX=static-assets
STATIC_ASSETS_PUBLIC_BASE_URL=
```

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

## 🗃️ 数据库 Migration

当前仓库已补齐 TypeORM migration 基础配置，可直接执行：

```bash
# 查看待执行 migration
pnpm run migration:show

# 执行 migration
pnpm run migration:run

# 回滚最近一次 migration
pnpm run migration:revert
```

本次新增的自定义表单模块对应 migration：
- `src/database/migrations/1776224000000-create-custom-forms-table.ts`

当前测试覆盖包括：
- App 基础接口
- 健康检查接口
- 环境变量校验
- 用户密码哈希与 refresh token 校验逻辑
- Controller 请求类型与权限守卫逻辑
- Auth service 的注册 / 登出 / profile 闭环
- 角色解析、角色管理 controller/service

## 🚀 持续集成与部署

- `CI` 工作流会在 push / pull request 到 `master` 时执行静态检查、构建、单测与 e2e。
- `deploy` 工作流仅在 push 到 `master` 或手动触发时执行，避免 PR 阶段误部署。
- 生产环境容器健康检查与部署脚本统一使用 `/health/ready`，确保数据库可达后再判定服务就绪。
- `.env.example` 默认使用 `HOST=0.0.0.0`，更适合 Docker / 服务器部署场景。

## 📄 文档
- [现有产品文档](./docs/current-product-doc.md)
- [系统管理模块产品规划](./docs/system-management-prd.md)
- [安全策略](./SECURITY.md)
- [变更日志](./CHANGELOG.md)

## 🤝 贡献
请阅读 [Contributing Guide](./.github/PULL_REQUEST_TEMPLATE.md) 了解如何参与贡献。
