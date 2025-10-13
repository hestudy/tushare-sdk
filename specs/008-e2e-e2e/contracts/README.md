# Contracts: E2E 测试接口契约

**Feature**: 008-e2e-e2e
**Date**: 2025-10-13
**Purpose**: 定义E2E测试的接口契约、配置规范和验证规则

---

## 概述

本目录包含E2E测试的所有接口契约和配置规范,确保测试代码的一致性和可维护性。

---

## 文件列表

### 1. `page-object-interface.ts`

**用途**: 定义所有页面对象必须实现的接口

**核心接口**:
- `IBasePage` - 所有页面对象的基础接口
- `INavigable` - 导航功能接口
- `ICodeExamples` - 代码示例功能接口
- `IResponsive` - 响应式设计测试接口
- `PageSelectors` - 选择器定义接口

**使用场景**:
- 实现新的页面对象类时,作为接口约束
- 确保所有页面对象提供一致的API
- 提供 TypeScript 类型检查和 IDE 支持

**示例**:
```typescript
import { IBasePage, INavigable } from './page-object-interface';

export class GuidePage implements IBasePage, INavigable {
  constructor(public readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async clickNavLink(linkText: string): Promise<void> {
    await this.page.click(`nav a:has-text("${linkText}")`);
  }

  // ... 实现其他接口方法
}
```

---

### 2. `test-config-schema.ts`

**用途**: 定义 Playwright 测试配置的类型和验证规则

**核心类型**:
- `E2ETestConfig` - 完整的E2E测试配置
- `WebServerConfig` - 开发服务器配置
- `TestProjectConfig` - 测试项目配置
- `DeviceConfig` - 设备和视口配置

**预定义配置**:
- `DEFAULT_CONFIG` - 本地开发默认配置
- `CI_CONFIG` - CI 环境配置
- `TEST_PROJECTS` - 预定义的测试项目(桌面、移动)

**使用场景**:
- 配置 `playwright.config.ts` 时提供类型检查
- 验证配置的完整性和正确性
- 根据环境自动选择配置

**示例**:
```typescript
import { E2ETestConfig, getEnvConfig, validateConfig } from './test-config-schema';

const config: E2ETestConfig = {
  ...getEnvConfig(),
  testDir: './tests/e2e',
  projects: [TEST_PROJECTS.DESKTOP_CHROME, TEST_PROJECTS.MOBILE_CHROME]
};

const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('配置错误:', errors);
  process.exit(1);
}

export default config;
```

---

## 契约原则

### 1. 接口稳定性

所有接口一旦定义,应保持向后兼容:
- **添加新方法**: ✅ 允许,使用可选参数或默认实现
- **修改方法签名**: ❌ 禁止,除非有重大版本升级
- **删除方法**: ❌ 禁止,先标记为 deprecated 再删除

### 2. 类型安全

所有接口必须提供完整的 TypeScript 类型:
- 使用 `readonly` 标记不可变属性
- 使用 `?` 标记可选属性
- 使用枚举或联合类型限制取值范围
- 避免使用 `any`,使用 `unknown` 或具体类型

### 3. 文档完整

所有接口必须包含 JSDoc 注释:
- 描述接口或方法的用途
- 说明参数的含义和类型
- 提供使用示例
- 标注默认值和约束条件

### 4. 验证规则

配置和参数必须提供验证:
- 必需字段不能为空
- 数值范围必须合法(如 timeout > 0)
- 枚举值必须在允许的范围内
- 依赖关系必须满足(如 webServer 配置)

---

## 使用指南

### 实现新的页面对象

1. 导入接口:
```typescript
import { IBasePage, INavigable, PageSelectors } from '../contracts/page-object-interface';
```

2. 实现接口:
```typescript
export class MyPage implements IBasePage, INavigable {
  constructor(public readonly page: Page) {}

  // 实现所有接口方法...
}
```

3. 运行类型检查:
```bash
pnpm tsc --noEmit
```

### 配置测试项目

1. 导入配置:
```typescript
import { E2ETestConfig, getEnvConfig, TEST_PROJECTS } from './contracts/test-config-schema';
```

2. 创建配置:
```typescript
const config: E2ETestConfig = {
  ...getEnvConfig(),
  projects: [TEST_PROJECTS.DESKTOP_CHROME]
};
```

3. 验证配置:
```typescript
const errors = validateConfig(config);
if (errors.length > 0) {
  throw new Error(`配置错误: ${errors.join(', ')}`);
}
```

---

## 版本管理

契约文件使用语义化版本管理:

- **MAJOR (1.0.0 → 2.0.0)**: 破坏性变更(删除接口、修改方法签名)
- **MINOR (1.0.0 → 1.1.0)**: 新增接口或方法(向后兼容)
- **PATCH (1.0.0 → 1.0.1)**: 文档更新、类型修正(无功能变更)

当前版本: **1.0.0**

---

## 常见问题

### Q: 为什么需要接口契约?

A: 接口契约确保:
- 所有页面对象提供一致的API
- TypeScript 编译器能够捕获类型错误
- 团队成员遵循相同的设计模式
- 代码易于重构和维护

### Q: 如果需要添加新方法怎么办?

A: 添加新方法到相应的接口,并更新所有实现类。如果方法是可选的,使用 `?` 标记:

```typescript
export interface IBasePage {
  newOptionalMethod?(): Promise<void>;
}
```

### Q: 如何扩展现有接口?

A: 使用接口继承:

```typescript
export interface IAdvancedPage extends IBasePage {
  advancedFeature(): Promise<void>;
}
```

### Q: 配置验证失败怎么办?

A: 检查 `validateConfig()` 返回的错误信息,修正配置中的问题。常见错误:
- 缺少必需字段 (baseURL, testDir)
- 数值不合法 (timeout <= 0)
- webServer 配置不完整

---

## 下一步

- ✅ 完成 contracts/ (当前目录)
- ⏭️ 生成 quickstart.md (测试开发快速开始指南)
- ⏭️ 更新 agent context
