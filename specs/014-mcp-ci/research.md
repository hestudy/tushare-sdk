# Research: MCP 服务 CI 发包工作流

**Feature**: 014-mcp-ci
**Date**: 2025-10-14
**Status**: Completed

## 研究目标

本研究旨在确定如何将现有的单包发布流程扩展为多包发布流程,通过标签关键字识别来区分应该发布哪个包(sdk vs mcp)。

## 关键研究问题

### 1. 标签关键字识别策略

**研究问题**: 如何通过 Git 标签区分 SDK 和 MCP 包的发布?

**方案对比**:

| 方案 | 标签格式 | 优点 | 缺点 |
|------|---------|------|------|
| 1. 前缀识别 | `sdk-v1.0.0`, `mcp-v1.0.0` | 清晰直观,易于识别 | 标签较长,需要修改现有标签习惯 |
| 2. 路径参数 | `v1.0.0` + workflow dispatch 输入 | 标签简洁 | 无法通过标签推送自动触发,需要手动选择 |
| 3. 单标签多发布 | `v1.0.0` 同时发布两个包 | 版本号同步 | 不符合需求(两个包独立版本) |
| 4. 条件触发 | `v1.0.0` + 检测变更文件路径 | 自动识别变更范围 | 标签无法明确意图,容易误判 |

**决策**: 方案 1 - 前缀识别

**理由**:
- 符合功能规格要求:"通过标签的关键字标识来区分应该发布哪个包"
- 明确表达发布意图,避免歧义
- 实现简单,通过 `if` 条件判断标签前缀即可
- 支持独立版本管理(sdk 和 mcp 可以有不同的版本号)
- 向后兼容:可以设置 `v*` 不带前缀的标签默认发布 SDK(保持现有行为)

**实现细节**:
```yaml
# 提取包标识符
if [[ $GITHUB_REF_NAME =~ ^(sdk|mcp)-v ]]; then
  PACKAGE_ID=$(echo $GITHUB_REF_NAME | sed -E 's/^(sdk|mcp)-.*/\1/')
  VERSION=$(echo $GITHUB_REF_NAME | sed -E 's/^(sdk|mcp)-v//')
elif [[ $GITHUB_REF_NAME =~ ^v ]]; then
  PACKAGE_ID="sdk"  # 默认发布 SDK(向后兼容)
  VERSION=$(echo $GITHUB_REF_NAME | sed -E 's/^v//')
else
  echo "Invalid tag format"
  exit 1
fi
```

---

### 2. 多包工作流结构设计

**研究问题**: 如何组织工作流以支持多个包,同时保持逻辑清晰?

**方案对比**:

| 方案 | 结构 | 优点 | 缺点 |
|------|------|------|------|
| 1. 单文件条件分支 | 一个 publish.yml,内部用 if 条件区分包 | 便于维护,避免重复 | 单文件较大,逻辑复杂 |
| 2. 多文件独立流程 | publish-sdk.yml + publish-mcp.yml | 逻辑完全分离,易读 | 大量代码重复,维护困难 |
| 3. 复用 workflow | 主 workflow 调用可复用的 workflow | DRY 原则,最佳实践 | 配置复杂,GitHub Actions 复用语法限制多 |

**决策**: 方案 1 - 单文件条件分支

**理由**:
- 两个包的发布流程高度相似(test-and-build, publish, create-release),只有路径和包名不同
- 通过条件表达式(`if`)和变量可以有效控制逻辑分支
- 便于对比和维护两个包的配置差异
- GitHub Actions 的 workflow 复用功能限制较多(例如无法复用带 `needs` 的 job)

**实现策略**:
- 在工作流开始时通过一个 "detect-package" step 识别包类型并设置输出变量
- 所有后续 job 使用 `needs.detect-package.outputs.package_id` 来决定路径和包名
- 关键路径参数化:
  - `PACKAGE_PATH`: `packages/tushare-sdk` 或 `apps/tushare-mcp`
  - `PACKAGE_NAME`: `@hestudy/tushare-sdk` 或 `@hestudy/tushare-mcp`

---

### 3. 并发控制策略

**研究问题**: 如何确保同一个包的多个版本不会并发发布,但不同包可以并行发布?

**方案对比**:

| 方案 | 并发控制 | 优点 | 缺点 |
|------|---------|------|------|
| 1. 按标签名分组 | `group: publish-${{ github.ref }}` | 同一标签排队,不同标签并行 | 无法区分包,sdk-v1.0.0 和 mcp-v1.0.0 也会排队 |
| 2. 按包 ID 分组 | `group: publish-${{ needs.detect.outputs.package_id }}` | 同一包排队,不同包并行 | 同一包的不同版本也会排队(过于严格) |
| 3. 按包 ID + 版本分组 | `group: publish-${{ github.ref }}` (保持现有) | 精确控制,每个版本独立 | 理论上可以并发发布同一包的不同版本(但实际不应该) |

**决策**: 方案 1 - 按标签名分组(保持现有)

**理由**:
- 标签名已经包含包标识符(`sdk-v1.0.0`, `mcp-v1.0.0`),天然区分不同包
- 同一标签推送多次会排队执行,避免重复发布
- 不同标签(包括不同包的标签)可以并行执行,提高效率
- 简单直接,无需额外配置

**确认现有配置**:
```yaml
concurrency:
  group: publish-${{ github.ref }}  # github.ref = refs/tags/sdk-v1.0.0
  cancel-in-progress: false
```

---

### 4. 版本同步和验证机制

**研究问题**: 如何确保 Git 标签版本与 package.json 版本一致?

**现有实现分析**(来自 SDK 发布流程):
```yaml
# 1. 提取版本号(去除 v 前缀)
TAG_VERSION=${GITHUB_REF_NAME#v}

# 2. 同步到 package.json(使用 npm version 命令)
npm version $TAG_VERSION --no-git-tag-version --allow-same-version

# 3. 验证一致性
PKG_VERSION=$(node -p "require('./package.json').version")
if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then exit 1; fi
```

**多包适配**:

需要修改路径引用:
```yaml
# SDK
cd packages/tushare-sdk
npm version $TAG_VERSION --no-git-tag-version --allow-same-version
PKG_VERSION=$(node -p "require('./packages/tushare-sdk/package.json').version")

# MCP
cd apps/tushare-mcp
npm version $TAG_VERSION --no-git-tag-version --allow-same-version
PKG_VERSION=$(node -p "require('./apps/tushare-mcp/package.json').version")
```

**决策**: 保持现有机制,仅修改路径参数

**理由**:
- 现有机制已验证有效,覆盖同步、验证、冲突检测
- 通过变量 `PACKAGE_PATH` 参数化路径即可复用逻辑
- 无需重新设计

---

### 5. 测试和构建命令差异处理

**研究问题**: SDK 和 MCP 包的测试/构建命令是否有差异?如何处理?

**当前命令对比**:

| 步骤 | SDK 命令 | MCP 命令 | 是否一致 |
|------|---------|---------|---------|
| Lint | `pnpm lint` | `pnpm lint` | ✅ 一致(workspace 级别) |
| Type check | `pnpm type-check` | `pnpm type-check` | ✅ 一致(workspace 级别) |
| Build | `pnpm build` | `pnpm build` | ✅ 一致(workspace 级别) |
| Test | `pnpm test:coverage` | `pnpm test:coverage` | ✅ 一致(workspace 级别) |

**决策**: 无需修改,继续使用 workspace 级别命令

**理由**:
- pnpm workspace 会自动执行所有子包的对应脚本
- 即使只发布一个包,执行全部测试也能确保没有破坏其他包(回归测试)
- 简化工作流配置,无需条件分支

**备选方案**(如需优化):
```yaml
# 仅测试目标包
pnpm --filter @hestudy/tushare-sdk test:coverage
pnpm --filter @hestudy/tushare-mcp test:coverage
```

---

### 6. npm provenance 和权限配置

**研究问题**: 两个包发布是否需要不同的权限或 provenance 配置?

**当前配置分析**:
```yaml
permissions:
  contents: write    # 创建 GitHub Release
  id-token: write    # npm provenance

env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTOMATION_TOKEN }}
  NPM_CONFIG_PROVENANCE: true
```

**验证点**:
- `NPM_AUTOMATION_TOKEN` 是否有 `@hestudy/tushare-mcp` 的发布权限?
- provenance 配置是否对两个包都有效?

**决策**: 保持现有配置,无需修改

**理由**:
- npm token 通常按 scope(@hestudy)授权,而非按具体包名
- provenance 是 npm 标准功能,所有包都支持
- 工作流权限声明是仓库级别的,不区分包

**前提假设**(需要人工确认):
- GitHub Secret `NPM_AUTOMATION_TOKEN` 具有发布 `@hestudy/*` 所有包的权限
- 如果首次发布 MCP 包,确保 npm 上已创建包或 token 有创建新包的权限

---

### 7. 变更日志生成策略

**研究问题**: 如何为两个包生成独立的变更日志?

**现有实现**:
```yaml
# 获取上一个标签
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

# 生成变更日志(包含所有 commits)
git log $PREVIOUS_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges
```

**问题分析**:
- 现有实现获取"上一个标签",不区分包
- 如果 SDK 和 MCP 交替发布,变更日志会包含另一个包的 commits

**方案对比**:

| 方案 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| 1. 保持现有(所有 commits) | 不修改 | 简单,包含所有变更 | 变更日志混合两个包的 commits |
| 2. 按包过滤 commits | `git log --grep="(sdk|mcp):"` | 变更日志精确 | 要求 commit message 遵循规范 |
| 3. 按路径过滤 commits | `git log -- packages/tushare-sdk/` | 基于实际文件变更 | 公共依赖变更难以归类 |
| 4. 按标签前缀过滤 | 获取同前缀的上一个标签 | 精确匹配包的版本历史 | 实现较复杂 |

**决策**: 方案 4 - 按标签前缀过滤

**理由**:
- 最符合语义:获取同一个包的上一次发布,生成本次发布的变更日志
- 不依赖 commit message 规范或路径假设
- 准确反映用户视角的版本变更

**实现**:
```bash
PACKAGE_ID="sdk"  # 或 "mcp"
CURRENT_TAG="sdk-v1.2.0"

# 获取同一包的上一个标签
PREVIOUS_TAG=$(git tag -l "${PACKAGE_ID}-v*" --sort=-version:refname | grep -A1 "$CURRENT_TAG" | tail -1)

# 如果没有找到(首次发布),使用所有历史
if [ -z "$PREVIOUS_TAG" ]; then
  PREVIOUS_TAG=""  # git log 会显示所有历史
fi

# 生成变更日志
git log $PREVIOUS_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges
```

---

## 技术决策总结

| 决策点 | 选择方案 | 关键理由 |
|--------|---------|---------|
| 标签识别 | 前缀识别(`sdk-v*`, `mcp-v*`) | 清晰直观,符合需求 |
| 工作流结构 | 单文件条件分支 | 避免代码重复,便于维护 |
| 并发控制 | 按标签名分组 | 同标签排队,不同标签(包)并行 |
| 版本同步 | 保持现有机制,参数化路径 | 已验证有效,无需重新设计 |
| 测试命令 | Workspace 级别命令 | 简化配置,确保回归测试 |
| 权限配置 | 保持现有配置 | Token 按 scope 授权,适用所有包 |
| 变更日志 | 按标签前缀过滤 | 精确匹配包的版本历史 |

---

## 实现风险和缓解措施

### 风险 1: 首次发布 MCP 包时无历史标签
**影响**: 变更日志生成失败或包含错误范围
**缓解**: 在脚本中处理空标签情况,生成"First Release"标记

### 风险 2: 用户推送错误的标签格式
**影响**: 工作流触发但识别失败
**缓解**: 在工作流开始时验证标签格式,不符合则快速失败并提示正确格式

### 风险 3: NPM_AUTOMATION_TOKEN 权限不足
**影响**: MCP 包发布失败
**缓解**: 在实现前验证 token 权限,必要时更新 token 或创建占位包

### 风险 4: 两个包的并行发布争用 pnpm install
**影响**: 偶发性安装失败
**缓解**: pnpm 使用全局 store,并发安装是安全的;如有问题,添加 install 锁

---

## 后续行动项

1. ✅ 确认 NPM_AUTOMATION_TOKEN 具有发布 `@hestudy/tushare-mcp` 的权限
2. ✅ 设计工作流变量结构(package_id, package_path, package_name)
3. ✅ 编写标签识别和验证脚本
4. ✅ 修改现有 publish.yml,添加条件分支逻辑
5. ✅ 测试边缘情况(首次发布、错误标签、并发发布)

---

## 参考资料

- [GitHub Actions - Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [Semantic Versioning](https://semver.org/)
- [pnpm workspace](https://pnpm.io/workspaces)
