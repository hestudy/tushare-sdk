# Data Model: GitHub CI 自动化发布

**Date**: 2025-10-10  
**Feature**: 002-github-ci  
**Purpose**: 定义发布流程的核心实体、状态和关系

> **重要说明**: 本文档定义的 TypeScript 接口为 **概念模型**，用于理解发布流程的数据结构和状态转换。  
> 实际实现中，这些数据由 **GitHub Actions 运行时管理**，不需要显式编码。  
> Workflow 配置使用 YAML 格式，不涉及 TypeScript 代码。

## 核心实体

### 1. Version Tag (版本标签)

**描述**: 代表一个特定的发布版本，由 Git 标签创建

**属性**:
```typescript
interface VersionTag {
  /** 标签名称，如 v1.0.0 */
  name: string;
  
  /** 版本号（去除 v 前缀），如 1.0.0 */
  version: string;
  
  /** 版本类型 */
  type: 'stable' | 'prerelease';
  
  /** 预发布标识符（仅 prerelease），如 alpha, beta, rc */
  prereleaseTag?: 'alpha' | 'beta' | 'rc' | 'next';
  
  /** 关联的 commit SHA */
  commitSha: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 创建者 */
  createdBy: string;
}
```

**验证规则**:
- `name` 必须符合 `v{major}.{minor}.{patch}[-{prerelease}]` 格式
- `version` 必须符合语义化版本规范 (semver)
- `type` 根据是否包含 `-` 自动推断
- `prereleaseTag` 从版本号中提取（如 1.0.0-beta.1 → beta）

**示例**:
```typescript
// 稳定版本
{
  name: "v1.0.0",
  version: "1.0.0",
  type: "stable",
  prereleaseTag: undefined,
  commitSha: "abc123",
  createdAt: new Date("2025-10-10T10:00:00Z"),
  createdBy: "maintainer@example.com"
}

// 预发布版本
{
  name: "v1.0.0-beta.1",
  version: "1.0.0-beta.1",
  type: "prerelease",
  prereleaseTag: "beta",
  commitSha: "def456",
  createdAt: new Date("2025-10-10T09:00:00Z"),
  createdBy: "maintainer@example.com"
}
```

---

### 2. Release Workflow (发布工作流)

**描述**: 代表一次完整的发布流程执行

**属性**:
```typescript
interface ReleaseWorkflow {
  /** Workflow 运行 ID */
  id: string;
  
  /** 触发的版本标签 */
  versionTag: VersionTag;
  
  /** 工作流状态 */
  status: WorkflowStatus;
  
  /** 执行步骤 */
  steps: WorkflowStep[];
  
  /** 开始时间 */
  startedAt: Date;
  
  /** 结束时间 */
  completedAt?: Date;
  
  /** 执行时长（秒） */
  duration?: number;
  
  /** 错误信息（如果失败） */
  error?: WorkflowError;
}

type WorkflowStatus = 
  | 'queued'        // 已排队
  | 'in_progress'   // 执行中
  | 'success'       // 成功
  | 'failure'       // 失败
  | 'cancelled';    // 已取消

interface WorkflowStep {
  /** 步骤名称 */
  name: string;
  
  /** 步骤状态 */
  status: 'pending' | 'running' | 'success' | 'failure' | 'skipped';
  
  /** 开始时间 */
  startedAt?: Date;
  
  /** 结束时间 */
  completedAt?: Date;
  
  /** 执行日志 URL */
  logUrl: string;
}

interface WorkflowError {
  /** 错误类型 */
  type: 'test_failure' | 'build_failure' | 'publish_failure' | 'auth_failure' | 'version_conflict';
  
  /** 错误消息 */
  message: string;
  
  /** 失败的步骤 */
  failedStep: string;
  
  /** 详细日志 */
  details: string;
}
```

**状态转换**:
```
queued → in_progress → success
                    ↘ failure
                    ↘ cancelled
```

**步骤顺序**:
1. Checkout code
2. Setup environment (Node.js, pnpm)
3. Install dependencies
4. Lint
5. Type check
6. Build
7. Test
8. Sync version from tag
9. Publish to npm
10. Create GitHub Release

---

### 3. Release Record (发布记录)

**描述**: 代表已完成的发布，包含发布后的元数据

**属性**:
```typescript
interface ReleaseRecord {
  /** Release ID (GitHub Release ID) */
  id: string;
  
  /** 版本标签 */
  versionTag: VersionTag;
  
  /** npm 包信息 */
  package: PackageInfo;
  
  /** 发布时间 */
  publishedAt: Date;
  
  /** 变更日志 */
  changelog: Changelog;
  
  /** GitHub Release URL */
  releaseUrl: string;
  
  /** npm 包 URL */
  npmUrl: string;
  
  /** 发布状态 */
  status: 'published' | 'failed';
  
  /** 关联的 workflow */
  workflowId: string;
}

interface PackageInfo {
  /** 包名 */
  name: string;
  
  /** 版本号 */
  version: string;
  
  /** dist-tag */
  distTag: string;
  
  /** 包大小（字节） */
  size: number;
  
  /** 文件列表 */
  files: string[];
}

interface Changelog {
  /** 变更日志内容（Markdown） */
  content: string;
  
  /** 提取的 commits */
  commits: CommitInfo[];
  
  /** 是否符合 conventional commits */
  isConventional: boolean;
  
  /** 格式警告（如有不符合规范的 commits） */
  formatWarnings?: string[];
}

interface CommitInfo {
  /** Commit SHA */
  sha: string;
  
  /** Commit 消息 */
  message: string;
  
  /** 作者 */
  author: string;
  
  /** 提交时间 */
  date: Date;
  
  /** Commit 类型（如果符合 conventional commits） */
  type?: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
}
```

---

### 4. Authentication Credentials (认证凭证)

**描述**: 用于访问 npm 仓库的安全凭证

**属性**:
```typescript
interface AuthCredentials {
  /** 凭证类型 */
  type: 'npm_automation_token';
  
  /** Token 名称（用于识别） */
  name: string;
  
  /** Token 权限范围 */
  scope: string[];
  
  /** 过期时间 */
  expiresAt?: Date;
  
  /** 最后使用时间 */
  lastUsedAt?: Date;
  
  /** 状态 */
  status: 'active' | 'expired' | 'revoked';
}
```

**存储位置**: GitHub Secrets (`NPM_AUTOMATION_TOKEN`)

**验证规则**:
- Token 必须是 Granular Access Token
- 必须具有 automation 权限
- 必须具有目标包的 publish 权限

---

### 5. Dist Tag (发布标签)

**描述**: npm 包的发布标签，用于区分不同的发布渠道

**属性**:
```typescript
interface DistTag {
  /** 标签名称 */
  name: 'latest' | 'alpha' | 'beta' | 'rc' | 'next';
  
  /** 对应的版本号 */
  version: string;
  
  /** 更新时间 */
  updatedAt: Date;
}
```

**推断规则**:
```typescript
function inferDistTag(version: string): string {
  if (!version.includes('-')) {
    return 'latest';
  }
  
  const match = version.match(/-([a-z]+)/i);
  if (match) {
    return match[1].toLowerCase();
  }
  
  return 'next'; // 默认
}
```

**示例**:
- `1.0.0` → `latest`
- `1.0.0-alpha.1` → `alpha`
- `1.0.0-beta.2` → `beta`
- `1.0.0-rc.1` → `rc`
- `1.0.0-1` → `next`

---

## 实体关系

```
VersionTag (1) ──triggers──> (1) ReleaseWorkflow
                                      │
                                      │ creates
                                      ↓
                                 (1) ReleaseRecord
                                      │
                                      │ contains
                                      ↓
                                 (1) PackageInfo
                                 (1) Changelog
                                 (1) DistTag

AuthCredentials ──used by──> ReleaseWorkflow
```

---

## 状态机

### Release Workflow 状态机

```
[Tag Pushed]
     ↓
  queued ──────────────────────────────────┐
     ↓                                      │
in_progress                                 │
     ├─→ [All steps pass] → success         │
     ├─→ [Any step fails] → failure         │
     └─→ [User cancels]   → cancelled ──────┘
```

### 步骤状态机

```
pending → running → success
               ├──→ failure
               └──→ skipped
```

---

## 数据验证

### Version Tag 验证

```typescript
function validateVersionTag(tag: string): boolean {
  const semverRegex = /^v(\d+\.\d+\.\d+(?:-[a-z]+\.\d+)?)$/i;
  return semverRegex.test(tag);
}
```

### Version Uniqueness 验证

```typescript
async function checkVersionExists(packageName: string, version: string): Promise<boolean> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/${version}`);
    return response.ok;
  } catch {
    return false;
  }
}
```

### Package.json Sync 验证

```typescript
function syncVersionFromTag(tag: string, packageJsonPath: string): void {
  const version = tag.replace(/^v/, '');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (pkg.version !== version) {
    pkg.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  }
}
```

---

## 性能指标

### Workflow 执行时间

| 步骤 | 目标时间 | 最大时间 |
|------|---------|---------|
| Checkout | 10s | 30s |
| Setup | 20s | 60s |
| Install | 30s | 120s |
| Lint | 10s | 30s |
| Type check | 15s | 45s |
| Build | 20s | 60s |
| Test | 30s | 120s |
| Publish | 20s | 60s |
| Create Release | 10s | 30s |
| **总计** | **165s (2.75min)** | **555s (9.25min)** |

### 成功率指标

- **目标成功率**: ≥ 95%
- **失败原因分布**:
  - 测试失败: 60%
  - 构建失败: 20%
  - 认证失败: 10%
  - 版本冲突: 5%
  - 网络问题: 5%

---

## 错误处理

### 错误类型与恢复策略

| 错误类型 | 检测时机 | 恢复策略 |
|---------|---------|---------|
| `test_failure` | Test 步骤 | 修复代码后重新推送标签 |
| `build_failure` | Build 步骤 | 修复构建配置后重新推送标签 |
| `publish_failure` | Publish 步骤 | 检查 npm 状态，手动重试 |
| `auth_failure` | Publish 步骤 | 更新 GitHub Secrets 中的 token |
| `version_conflict` | Publish 步骤 | 使用新版本号重新推送标签 |

### 错误消息模板

```typescript
const ERROR_MESSAGES = {
  test_failure: 'Tests failed. Please fix the failing tests and push a new tag.',
  build_failure: 'Build failed. Please check the build configuration and try again.',
  publish_failure: 'Failed to publish to npm. Please check npm status and retry manually.',
  auth_failure: 'NPM authentication failed. Please update NPM_AUTOMATION_TOKEN in GitHub Secrets.',
  version_conflict: 'Version {version} already exists on npm. Please use a new version number.',
};
```

---

## 安全考虑

### Secrets 管理

- **NPM_AUTOMATION_TOKEN**: 存储在 GitHub Secrets，仅在 publish 步骤使用
- **访问控制**: 使用 environment protection rules 限制发布权限
- **审计日志**: 所有发布操作记录在 GitHub Actions 日志中

### 权限最小化

```yaml
permissions:
  contents: write    # 创建 GitHub Release
  packages: write    # 发布包（如果使用 GitHub Packages）
  id-token: write    # OIDC token（未来可能用于无密钥认证）
```

---

## 扩展性考虑

### 未来支持的功能

1. **多包发布**: 基于 git diff 检测变更的包
2. **发布通知**: Slack/Discord/Email 通知
3. **回滚机制**: 自动 deprecate 有问题的版本
4. **发布审批**: 需要人工审批才能发布
5. **Canary 发布**: 发布到特定的 canary 渠道

### 数据模型扩展点

```typescript
// 未来可能添加的字段
interface ReleaseRecord {
  // ... 现有字段
  
  /** 发布审批记录 */
  approvals?: Approval[];
  
  /** 回滚信息 */
  rollback?: RollbackInfo;
  
  /** 通知记录 */
  notifications?: Notification[];
}
```
