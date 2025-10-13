# tushare-sdk Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-13

## Active Technologies
- TypeScript 5.x+, Node.js 18+ LTS + rslib (构建工具), vitest (测试框架), turborepo (monorepo 管理), axios/fetch (HTTP 客户端) (001-tushare-typescript-sdk)
- YAML (GitHub Actions workflow), Node.js 18+ + GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v2, actions/create-release@v1), npm CLI, GitHub Release Notes (原生) (002-github-ci)
- N/A (无状态 CI 流程) (002-github-ci)
- TypeScript 5.x+ / Node.js 18+ LTS + 本地 @tushare/sdk 包 (workspace 依赖), dotenv (环境变量管理) (003-apps-node-sdk)
- N/A (演示应用不需要持久化存储) (003-apps-node-sdk)
- TypeScript 5.x+ (严格模式) + 无新增依赖,使用现有 TushareClient (004-sdk)
- N/A (API 客户端,无本地存储) (004-sdk)
- TypeScript 5.x+ / Node.js 18+ LTS + @hestudy/tushare-sdk (本地 workspace 依赖), 现有 node-demo 工具函数 (005-node-demo)
- TypeScript 5.x+ / Node.js 18+ LTS + rspress (静态站点生成器), @rspress/plugin-* (官方插件) (006-sdk)
- 静态文件(Markdown/MDX 文档源文件) (006-sdk)
- TypeScript 5.3+, Node.js 18+ (007-sdk)
- TypeScript 5.x+ / Node.js 18+ LTS + Playwright (E2E测试框架), @playwright/test (测试运行器) (008-e2e-e2e)
- TypeScript 5.6+, Node.js 18+ LTS (008-e2e-e2e)
- N/A (E2E测试不需要持久化存储) (008-e2e-e2e)
- TypeScript 5.3+ / Node.js 18+ LTS + rslib (构建工具), vitest (测试框架), axios (HTTP客户端), 现有TushareClient核心功能 (009-sdk)
- N/A (API客户端SDK,无本地持久化存储) (009-sdk)
- TypeScript 5.3+ / Node.js 18+ LTS + vitest (测试框架), @vitest/expect-type (类型测试), 现有TushareClient (测试目标) (010-sdk)
- N/A (测试不需要持久化存储) (010-sdk)

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
- 010-sdk: Added TypeScript 5.3+ / Node.js 18+ LTS + vitest (测试框架), @vitest/expect-type (类型测试), 现有TushareClient (测试目标)
- 009-sdk: Added TypeScript 5.3+ / Node.js 18+ LTS + rslib (构建工具), vitest (测试框架), axios (HTTP客户端), 现有TushareClient核心功能
- 008-e2e-e2e: Added TypeScript 5.6+, Node.js 18+ LTS

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
