# Data Model: 财务数据文档

**Feature Branch**: `012-` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)

## 概述

本文档定义了财务数据文档功能的核心数据模型,包括文档结构、现金流量表数据模型和导航配置。这些模型确保文档内容结构化、一致性和可维护性。

## 核心实体

### 1. 财务报表文档页面 (Financial Report Document Page)

财务报表文档页面是展示单个财务报表 API(如利润表、资产负债表、现金流量表)的完整文档。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| title | string | 是 | 文档标题,包含 API 名称和简短说明 | "get_cashflow - 获取现金流量表数据" |
| description | string | 是 | 文档描述,用于 SEO 和页面摘要 | "获取上市公司的现金流量表数据,包括经营、投资、筹资活动现金流" |
| keywords | string[] | 是 | 关键词列表,用于搜索优化 | ["财务数据", "现金流量表", "get_cashflow"] |
| type | string | 是 | 文档类型标识 | "api" |
| order | number | 是 | 文档排序顺序 | 3 |
| functionSignature | FunctionSignature | 是 | 函数签名定义 | 见下方 FunctionSignature 模型 |
| parameters | ParameterTableRow[] | 是 | 参数说明表格 | 见下方 ParameterTableRow 模型 |
| returnFields | ReturnFieldRow[] | 是 | 返回字段说明表格 | 见下方 ReturnFieldRow 模型 |
| codeExamples | CodeExample[] | 是 | 代码示例列表(至少 2 个) | 见下方 CodeExample 模型 |
| exceptions | ExceptionRow[] | 是 | 异常说明表格 | 见下方 ExceptionRow 模型 |
| notes | string[] | 是 | 注意事项列表 | ["金额单位: 元", "日期格式: YYYYMMDD"] |
| relatedApis | RelatedApi[] | 否 | 相关 API 链接 | 见下方 RelatedApi 模型 |

#### 关系

- 属于"财务数据"章节(Finance Section)
- 通过导航配置(NavigationConfig)链接到其他财务报表文档
- 引用 SDK 中的数据模型定义(如 `CashFlowItem`)

#### 验证规则

1. **标题格式**: 必须遵循 `{api_name} - {简短说明}` 格式
2. **参数完整性**: 参数表格必须包含至少 5 个参数行
3. **字段完整性**: 返回字段表格必须包含至少 50 个字段行(现金流量表)
4. **示例数量**: 代码示例至少 2 个,最多 5 个
5. **代码可执行**: 所有示例代码必须语法正确且可执行(除 token 占位符)

---

### 2. 函数签名 (FunctionSignature)

定义 API 函数的 TypeScript 签名。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| functionName | string | 是 | 函数名称 | "getCashFlow" |
| parameters | string | 是 | 参数类型定义 | "params: FinancialQueryParams" |
| returnType | string | 是 | 返回类型定义 | "Promise<CashFlowItem[]>" |
| isAsync | boolean | 是 | 是否为异步函数 | true |

#### 示例

```typescript
async function getCashFlow(params: FinancialQueryParams): Promise<CashFlowItem[]>
```

---

### 3. 参数说明行 (ParameterTableRow)

参数表格中的单行数据,描述一个 API 参数。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| paramName | string | 是 | 参数名称(包含对象路径) | "params.ts_code" |
| type | string | 是 | 参数类型 | "string" |
| required | boolean | 是 | 是否必填 | false |
| description | string | 是 | 参数说明 | "股票代码" |
| defaultValue | string | 否 | 默认值 | "-" |
| example | string | 是 | 示例值 | "'000001.SZ'" |

#### 验证规则

1. **类型准确性**: 类型必须与 SDK 中的 TypeScript 类型定义一致
2. **示例有效性**: 示例值必须符合实际业务场景(如使用真实股票代码)
3. **描述清晰性**: 描述应简洁明了,避免技术术语

---

### 4. 返回字段行 (ReturnFieldRow)

返回字段表格中的单行数据,描述返回数据的一个字段。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| fieldName | string | 是 | 字段名称 | "n_cashflow_act" |
| type | string | 是 | 字段类型 | "number" |
| description | string | 是 | 字段说明(业务含义) | "经营活动产生的现金流量净额" |
| unit | string | 否 | 单位(如适用) | "元" |
| isCore | boolean | 否 | 是否为核心字段 | true |

#### 验证规则

1. **字段完整性**: 字段列表必须与 SDK 模型定义(`CashFlowItem`)完全一致
2. **类型准确性**: 类型必须与 TypeScript 类型定义一致
3. **业务含义**: 描述应体现业务含义,而非技术实现
4. **单位明确**: 所有金额字段必须标注单位为"元"

---

### 5. 代码示例 (CodeExample)

单个代码示例,展示 API 的实际使用场景。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| title | string | 是 | 示例标题 | "获取指定公司的最新现金流量表" |
| description | string | 否 | 场景说明 | "查询某公司最新报告期的现金流量表,分析其经营活动现金流健康度" |
| language | string | 是 | 代码语言 | "typescript" |
| code | string | 是 | 示例代码(完整可执行) | 见下方示例 |
| expectedOutput | string | 否 | 预期输出说明 | "返回数组包含 1 条记录,展示三大活动现金流数据" |

#### 示例代码结构

```typescript
import { getCashFlow } from '@tushare/sdk';

const cashflowData = await getCashFlow({
  ts_code: '000001.SZ',
  period: '20231231'
});

// 分析经营活动现金流健康度
if (cashflowData.length > 0) {
  const data = cashflowData[0];
  console.log(`经营现金流净额: ${data.n_cashflow_act / 100000000} 亿元`);
  console.log(`投资现金流净额: ${data.n_cashflow_inv_act / 100000000} 亿元`);
  console.log(`筹资现金流净额: ${data.n_cash_flows_fnc_act / 100000000} 亿元`);
}
```

#### 验证规则

1. **语法正确性**: 代码必须通过 TypeScript 编译器验证
2. **导入路径**: 使用 `@tushare/sdk` 而非相对路径
3. **真实数据**: 使用真实股票代码和合理报告期
4. **注释清晰**: 包含必要的注释说明业务逻辑
5. **完整可执行**: 代码可以直接复制粘贴执行(除 token 配置)

---

### 6. 异常说明行 (ExceptionRow)

异常表格中的单行数据,描述一种可能的错误情况。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| exceptionType | string | 是 | 异常类型 | "ApiError" |
| description | string | 是 | 异常描述 | "API 调用失败" |
| triggerCondition | string | 是 | 触发条件 | "网络错误或服务端错误" |

---

### 7. 相关 API (RelatedApi)

指向其他相关文档的链接。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| apiName | string | 是 | API 名称 | "get_income" |
| title | string | 是 | 链接显示文本 | "获取利润表数据" |
| link | string | 是 | 文档路径(相对路径) | "/api/finance/income" |

---

### 8. 现金流量表数据模型 (CashFlowItem)

现金流量表的完整数据结构,已在 SDK 中定义(`packages/tushare-sdk/src/models/financial.ts`)。

#### 核心属性分类

##### 基本标识字段 (8 个)
- `ts_code` - 股票代码
- `ann_date` - 公告日期
- `f_ann_date` - 实际公告日期
- `end_date` - 报告期
- `comp_type` - 公司类型
- `report_type` - 报表类型
- `end_type` - 报告期类型
- `update_flag` - 更新标识

##### 经营活动现金流 (16 个核心字段)
- `n_cashflow_act` - **经营活动产生的现金流量净额**(最核心)
- `c_fr_sale_sg` - 销售商品、提供劳务收到的现金
- `c_paid_goods_s` - 购买商品、接受劳务支付的现金
- `c_paid_to_for_empl` - 支付给职工以及为职工支付的现金
- `c_paid_for_taxes` - 支付的各项税费
- 其他 11 个经营活动相关字段...

##### 投资活动现金流 (9 个核心字段)
- `n_cashflow_inv_act` - **投资活动产生的现金流量净额**
- `c_pay_acq_const_fiolta` - 购建固定资产、无形资产和其他长期资产支付的现金
- `c_paid_invest` - 投资支付的现金
- `c_recp_return_invest` - 取得投资收益收到的现金
- 其他 5 个投资活动相关字段...

##### 筹资活动现金流 (8 个核心字段)
- `n_cash_flows_fnc_act` - **筹资活动产生的现金流量净额**
- `c_recp_borrow` - 取得借款收到的现金
- `c_prepay_amt_borr` - 偿还债务支付的现金
- `c_pay_dist_dpcp_int_exp` - 分配股利、利润或偿付利息支付的现金
- 其他 4 个筹资活动相关字段...

##### 现金汇总指标 (7 个核心字段)
- `n_incr_cash_cash_equ` - **现金及现金等价物净增加额**
- `c_cash_equ_beg_period` - 期初现金及现金等价物余额
- `c_cash_equ_end_period` - 期末现金及现金等价物余额
- 其他 4 个汇总字段...

##### 补充项目 (39 个字段)
- 包含间接法计算、资产减值、折旧摊销等补充信息

#### 数据类型

- 所有金额字段: `number | undefined` (单位: 元)
- 所有日期字段: `string` (格式: YYYYMMDD)
- 所有分类字段: `string`(枚举值)

#### 验证规则

1. **必填字段**: `ts_code`, `ann_date`, `f_ann_date`, `end_date`, `comp_type`, `report_type`, `end_type` 必须有值
2. **金额合理性**: 金额字段应为合理范围(不能为 NaN 或 Infinity)
3. **日期格式**: 日期字段必须为 8 位数字字符串(YYYYMMDD)
4. **三大活动平衡**: 理论上 `n_cashflow_act + n_cashflow_inv_act + n_cash_flows_fnc_act ≈ n_incr_cash_cash_equ`(考虑汇率影响)

---

### 9. 文档导航结构 (NavigationConfig)

定义文档站的导航菜单结构。

#### 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| sectionName | string | 是 | 章节名称 | "财务数据" |
| sectionPath | string | 否 | 章节路径(如有独立页面) | "/api/finance" |
| items | NavigationItem[] | 是 | 章节下的子项目列表 | 见下方 NavigationItem 模型 |
| order | number | 否 | 章节排序 | 2 |

#### NavigationItem 属性

| 属性名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| text | string | 是 | 导航项显示文本 | "现金流量表" |
| link | string | 是 | 文档路径 | "/api/finance/cashflow" |
| order | number | 否 | 排序顺序 | 3 |

#### 示例配置

```typescript
{
  sectionName: "财务数据",
  items: [
    { text: "利润表", link: "/api/finance/income", order: 1 },
    { text: "资产负债表", link: "/api/finance/balance", order: 2 },
    { text: "现金流量表", link: "/api/finance/cashflow", order: 3 }
  ]
}
```

#### 关系

- 在 `rspress.config.ts` 中配置顶层导航
- 在 `apps/docs/docs/api/finance/_meta.json` 中配置子导航

#### 状态转换

当前状态: **被注释**(Commented Out)
目标状态: **启用**(Enabled)

转换条件:
1. 所有财务报表文档页面已创建并通过测试
2. 文档内容完整且符合质量标准
3. E2E 导航测试通过

---

## 实体关系图(Entity Relationship)

```
DocumentPage (财务报表文档页面)
├── FunctionSignature (1:1)
├── ParameterTableRow (1:N)
├── ReturnFieldRow (1:N)
├── CodeExample (1:N, 至少2个)
├── ExceptionRow (1:N)
└── RelatedApi (1:N)

NavigationConfig (导航配置)
└── NavigationItem (1:N)
    └── DocumentPage (N:1, 链接到具体文档)

CashFlowItem (现金流量表数据模型)
└── DocumentPage.returnFields (被文档引用)
```

---

## 数据验证和一致性

### 1. 文档与 SDK 一致性

**验证点**:
- 文档中的 `FunctionSignature` 必须与 SDK 中的实际函数签名一致
- 文档中的 `ParameterTableRow` 必须与 SDK 中的 `FinancialQueryParams` 类型定义一致
- 文档中的 `ReturnFieldRow` 必须与 SDK 中的 `CashFlowItem` 接口定义一致

**验证方法**:
- 使用 TypeScript 编译器 API 解析 SDK 类型定义
- 对比文档内容与解析结果
- 在 CI 流程中自动化验证

### 2. 代码示例可执行性

**验证点**:
- 所有 `CodeExample.code` 必须语法正确
- 导入路径必须为 `@tushare/sdk`
- 使用的类型和函数必须在 SDK 中存在

**验证方法**:
- 提取代码示例并编译(使用 TypeScript 编译器)
- 可选:在测试环境中实际执行(需要真实 token)

### 3. 链接有效性

**验证点**:
- `RelatedApi.link` 必须指向存在的文档页面
- `NavigationItem.link` 必须指向存在的文档页面

**验证方法**:
- 在构建时检查文件是否存在
- 在 E2E 测试中验证链接可点击且能正确导航

---

## 数据模型演进

### 当前版本: v1.0

- 支持三大财务报表文档(利润表、资产负债表、现金流量表)
- 支持基础代码示例和业务场景示例
- 支持参数和返回字段的完整说明

### 未来扩展(Out of Scope)

- 交互式 API 调试工具(API Playground)
- 文档内嵌的数据可视化图表
- 多语言版本支持
- 文档评论和反馈系统

---

**数据模型版本**: v1.0
**最后更新**: 2025-10-13
**下一步**: 创建契约文件(contracts/)定义数据结构的具体格式
