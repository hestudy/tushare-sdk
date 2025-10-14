# Data Model: MCP 服务 CI 发包工作流

**Feature**: 014-mcp-ci
**Date**: 2025-10-14

## 概述

本功能为 CI/CD 工作流,不涉及持久化的数据模型或数据库实体。但工作流中存在多个运行时数据结构和状态转换,需要明确定义以确保逻辑清晰。

## 核心实体

### 1. Package (包)

表示 monorepo 中的一个可发布的 npm 包。

**属性**:
- `id`: 包标识符 (`"sdk"` | `"mcp"`)
- `name`: npm 包名 (`"@hestudy/tushare-sdk"` | `"@hestudy/tushare-mcp"`)
- `path`: 包在仓库中的相对路径 (`"packages/tushare-sdk"` | `"apps/tushare-mcp"`)
- `dist_path`: 构建输出目录 (`"packages/tushare-sdk/dist"` | `"apps/tushare-mcp/dist"`)

**示例**:
```json
{
  "id": "mcp",
  "name": "@hestudy/tushare-mcp",
  "path": "apps/tushare-mcp",
  "dist_path": "apps/tushare-mcp/dist"
}
```

---

### 2. Version Tag (版本标签)

表示触发发布流程的 Git 标签。

**属性**:
- `raw_tag`: 完整标签名 (如 `"sdk-v1.2.0"`, `"mcp-v0.5.0-beta.1"`)
- `package_id`: 提取的包标识符 (`"sdk"` | `"mcp"`)
- `version`: 提取的语义化版本号 (如 `"1.2.0"`, `"0.5.0-beta.1"`)
- `is_prerelease`: 是否为预发布版本 (boolean)
- `prerelease_tag`: 预发布标识符 (如 `"beta"`, `"alpha"`, `null` for stable)

**验证规则**:
- `raw_tag` 必须匹配正则表达式: `^(sdk|mcp)-v\d+\.\d+\.\d+(-[a-z]+(\.\d+)?)?$`
- `version` 必须遵循语义化版本规范 (SemVer)
- 如果 `version` 包含 `-`,则 `is_prerelease = true`

**示例**:
```json
{
  "raw_tag": "mcp-v1.0.0-beta.1",
  "package_id": "mcp",
  "version": "1.0.0-beta.1",
  "is_prerelease": true,
  "prerelease_tag": "beta"
}
```

---

### 3. Dist Tag (npm 分发标签)

表示 npm 包的分发标签,用于版本发布策略。

**属性**:
- `tag`: 标签名称 (如 `"latest"`, `"beta"`, `"alpha"`, `"rc"`, `"next"`)

**推断规则**:
- 如果 `Version.is_prerelease = false` → `"latest"`
- 如果 `Version.is_prerelease = true` → 从 `Version.prerelease_tag` 提取标识符

**示例**:
```yaml
# 稳定版本
version: "1.0.0"
dist_tag: "latest"

# 预发布版本
version: "1.0.0-beta.1"
dist_tag: "beta"
```

---

### 4. Changelog (变更日志)

表示版本之间的代码变更历史。

**属性**:
- `current_tag`: 当前发布的标签
- `previous_tag`: 上一个发布的标签(同一包)
- `commits`: commit 列表 (数组)
  - `message`: commit 消息
  - `hash`: commit 短哈希(7位)
- `is_first_release`: 是否为首次发布 (boolean)

**生成逻辑**:
```bash
# 1. 获取同包的上一个标签
PREVIOUS_TAG=$(git tag -l "${PACKAGE_ID}-v*" --sort=-version:refname | grep -A1 "$CURRENT_TAG" | tail -1)

# 2. 如果没有上一个标签,标记为首次发布
if [ -z "$PREVIOUS_TAG" ]; then
  is_first_release=true
fi

# 3. 生成 commit 列表
git log $PREVIOUS_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges
```

**示例**:
```json
{
  "current_tag": "mcp-v1.0.0",
  "previous_tag": "mcp-v0.9.0",
  "is_first_release": false,
  "commits": [
    { "message": "feat: 新增查询工具", "hash": "a1b2c3d" },
    { "message": "fix: 修复参数验证", "hash": "e4f5g6h" }
  ]
}
```

---

### 5. GitHub Release

表示在 GitHub 上创建的版本发布记录。

**属性**:
- `tag_name`: Git 标签名 (如 `"mcp-v1.0.0"`)
- `release_name`: Release 显示名称 (如 `"Release mcp-v1.0.0"`)
- `body`: Release 描述(Markdown 格式,包含变更日志)
- `prerelease`: 是否标记为预发布 (boolean)
- `draft`: 是否为草稿 (固定为 `false`)

**示例**:
```yaml
tag_name: "mcp-v1.0.0"
release_name: "Release mcp-v1.0.0"
body: |
  ## What's Changed
  - feat: 新增查询工具 (a1b2c3d)
  - fix: 修复参数验证 (e4f5g6h)

  **Full Changelog**: https://github.com/owner/repo/compare/mcp-v0.9.0...mcp-v1.0.0
prerelease: false
draft: false
```

---

## 状态转换

### 工作流状态机

```
[标签推送] → [验证标签格式] → [提取包信息] → [测试&构建] → [版本同步] → [冲突检测] → [发布到 npm] → [创建 Release] → [完成]
                   ↓ 失败                           ↓ 失败         ↓ 失败        ↓ 失败         ↓ 失败             ↓ 失败
                [终止]                          [终止]         [终止]        [终止]         [终止]             [终止]
```

**状态说明**:

| 状态 | 描述 | 成功条件 | 失败处理 |
|------|------|---------|---------|
| 验证标签格式 | 检查标签是否匹配 `(sdk\|mcp)-v*` | 匹配正则表达式 | 快速失败,输出错误提示 |
| 提取包信息 | 解析 package_id 和 version | 成功提取并设置输出变量 | 快速失败 |
| 测试&构建 | 执行 lint/type-check/build/test | 所有步骤返回 0 | 终止流程,不进入发布阶段 |
| 版本同步 | 将标签版本写入 package.json | npm version 成功 | 终止流程 |
| 冲突检测 | 检查 npm 是否已存在该版本 | 版本不存在 | 终止流程,提示使用新版本号 |
| 发布到 npm | 执行 pnpm publish | 发布成功且验证通过 | 终止流程,不创建 Release |
| 创建 Release | 生成变更日志并创建 GitHub Release | Release 创建成功 | 记录警告,但不影响整体成功 |
| 完成 | 输出成功通知和链接 | 所有步骤完成 | N/A |

---

## 数据流图

```
Git Tag (sdk-v1.2.0)
       ↓
  [解析标签]
       ↓
  Package ID: "sdk"
  Version: "1.2.0"
       ↓
  [查找包配置]
       ↓
  Package Path: "packages/tushare-sdk"
  Package Name: "@hestudy/tushare-sdk"
       ↓
  [执行测试构建] → 验证 dist/ 存在
       ↓
  [同步版本] → package.json 更新为 1.2.0
       ↓
  [推断 dist-tag] → "latest"
       ↓
  [检查版本冲突] → npm view @hestudy/tushare-sdk@1.2.0
       ↓
  [发布] → npm publish --tag latest
       ↓
  [生成变更日志] → 获取 sdk-v1.1.0..sdk-v1.2.0 的 commits
       ↓
  [创建 Release] → GitHub Release 记录
       ↓
  [通知] → 输出 npm 链接和 Release 链接
```

---

## 并发约束

**并发控制策略**:
```yaml
concurrency:
  group: publish-${{ github.ref }}  # 示例: publish-refs/tags/sdk-v1.2.0
  cancel-in-progress: false
```

**约束规则**:
- 同一标签的多次推送 → 排队执行(不取消进行中的任务)
- 不同标签(包括不同包) → 并行执行
- 最大并发数 → 由 GitHub Actions runner 池限制

**示例场景**:

| 时间 | 标签推送 | 执行状态 |
|------|---------|---------|
| T1 | `sdk-v1.2.0` | 开始执行 |
| T2 | `mcp-v1.0.0` | 并行执行(不同标签) |
| T3 | `sdk-v1.2.0` 重新推送 | 排队等待 T1 完成 |
| T4 | `sdk-v1.3.0` | 并行执行(不同标签) |

---

## 环境变量和 Secrets

### GitHub Secrets (必需)

| 名称 | 用途 | 示例值 |
|------|------|--------|
| `NPM_AUTOMATION_TOKEN` | npm 发布认证 | `npm_xxx...` |
| `TUSHARE_TOKEN` | 测试步骤所需(集成测试) | `tushare_xxx...` |
| `GITHUB_TOKEN` | 创建 GitHub Release(自动提供) | `ghp_xxx...` |

### 工作流输出变量

| 变量名 | 作用域 | 类型 | 示例值 |
|--------|--------|------|--------|
| `package_id` | job 间传递 | string | `"mcp"` |
| `package_name` | job 间传递 | string | `"@hestudy/tushare-mcp"` |
| `package_path` | job 间传递 | string | `"apps/tushare-mcp"` |
| `version` | job 间传递 | string | `"1.0.0-beta.1"` |
| `dist_tag` | job 间传递 | string | `"beta"` |
| `is_prerelease` | job 间传递 | boolean | `true` |

---

## 关系图

```
Version Tag (1:1) ← detects → Package
                      ↓
                 infers
                      ↓
                  Dist Tag
                      ↓
                 publishes to
                      ↓
                npm Registry Record
                      ↓
                 triggers
                      ↓
                GitHub Release (1:1) ← contains → Changelog
```

**关系说明**:
- 一个 Version Tag 对应一个 Package(通过 package_id)
- 一个 Version Tag 推断一个 Dist Tag
- 一个 Package 版本发布后创建一个 npm Registry Record
- 一个 npm Registry Record 触发创建一个 GitHub Release
- 一个 GitHub Release 包含一个 Changelog(生成自 git log)

---

## 验证规则总结

| 实体 | 验证规则 | 错误处理 |
|------|---------|---------|
| Version Tag | 必须匹配 `^(sdk\|mcp)-v\d+\.\d+\.\d+(-[a-z]+(\.\d+)?)?$` | 快速失败,提示正确格式 |
| Package | package.json 必须存在于 `package_path` | 快速失败 |
| Version | 标签版本必须与同步后的 package.json 版本一致 | 终止发布 |
| Dist Tag | 预发布标识符必须是常见值(alpha/beta/rc/next) | 使用提取的标识符,无严格验证 |
| Build Artifacts | dist/ 目录必须存在且包含文件 | 终止发布 |
| npm Version | npm 上不能已存在相同版本号 | 终止发布,提示使用新版本号 |

---

## 扩展性考虑

### 未来支持更多包

如需添加第三个包(如 `cli`),只需:
1. 标签格式支持 `cli-v*`
2. 在包识别脚本中添加 `cli` 分支
3. 添加对应的包路径和名称映射

**无需修改工作流整体结构**,因为逻辑已参数化。
