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

# 启动开发服务
pnpm run start:dev
```

## 🏗️ 项目规范

### 代码风格
本项目使用 [Biome](https://biomejs.dev/) 进行代码格式化与 Lint 检查。

- **Lint**: `pnpm run lint`
- **Format**: `pnpm run format`
- **EditorConfig**: 已配置 `.editorconfig`，请确保编辑器安装相应插件。

### 提交规范
本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，并配置了 Commitlint 与 Commitizen。

- **提交代码**: 推荐使用 `pnpm run commit` 交互式提交。
- **Commit Message**: 必须符合 `<type>(<scope>): <subject>` 格式。

### 分支管理
- `main`: 主分支，受保护，仅允许 PR 合并。
- `feat/*`: 功能分支。
- `fix/*`: 修复分支。

## 🧪 测试

```bash
# 单元测试
pnpm run test

# 覆盖率测试
pnpm run test:cov

# E2E 测试
pnpm run test:e2e
```

## 📄 文档
- [安全策略](./SECURITY.md)
- [变更日志](./CHANGELOG.md)

## 🤝 贡献
请阅读 [Contributing Guide](./.github/PULL_REQUEST_TEMPLATE.md) 了解如何参与贡献。
