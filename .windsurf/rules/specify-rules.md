# tushare-sdk Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-09

## Active Technologies
- TypeScript 5.x+, Node.js 18+ LTS + rslib (构建工具), vitest (测试框架), turborepo (monorepo 管理), axios/fetch (HTTP 客户端) (001-tushare-typescript-sdk)
- YAML (GitHub Actions workflow), Node.js 18+ + GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v2, actions/create-release@v1), npm CLI, GitHub Release Notes (原生) (002-github-ci)
- N/A (无状态 CI 流程) (002-github-ci)
- TypeScript 5.x+ / Node.js 18+ LTS + 本地 @tushare/sdk 包 (workspace 依赖), dotenv (环境变量管理) (003-apps-node-sdk)
- N/A (演示应用不需要持久化存储) (003-apps-node-sdk)
- TypeScript 5.x+ (严格模式) + 无新增依赖,使用现有 TushareClien (004-sdk)
- N/A (API 客户端,无本地存储) (004-sdk)

## Project Structure
```
src/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
TypeScript 5.x+, Node.js 18+ LTS: Follow standard conventions

## Recent Changes
- 004-sdk: Added TypeScript 5.x+ (严格模式) + 无新增依赖,使用现有 TushareClien
- 003-apps-node-sdk: Added TypeScript 5.x+ / Node.js 18+ LTS + 本地 @tushare/sdk 包 (workspace 依赖), dotenv (环境变量管理)
- 002-github-ci: Added YAML (GitHub Actions workflow), Node.js 18+ + GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v2, actions/create-release@v1), npm CLI, GitHub Release Notes (原生)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
