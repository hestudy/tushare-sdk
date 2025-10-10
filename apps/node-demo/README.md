# Tushare SDK 演示应用

这是一个简单的 Node.js 应用,用于演示如何使用 Tushare SDK 进行数据查询。

## 快速开始

### 1. 安装依赖

在项目根目录运行:

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的 Tushare API Token:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```bash
TUSHARE_TOKEN=your_actual_token_here
```

> 💡 **获取 Token**: 访问 [https://tushare.pro](https://tushare.pro) 注册并获取 API Token

### 3. 运行演示

```bash
# 开发模式(推荐)
pnpm dev

# 或构建后运行
pnpm build
pnpm start
```

## 使用示例

### 运行所有示例

```bash
pnpm dev
```

### 运行特定示例

```bash
# 股票列表查询
pnpm dev -- --example=stock-list

# 日线数据查询
pnpm dev -- --example=daily-data

# 交易日历查询
pnpm dev -- --example=trade-calendar

# 每日指标查询
pnpm dev -- --example=daily-basic
```

### 启用详细输出

```bash
pnpm dev -- --verbose
```

### 输出 JSON 格式

```bash
pnpm dev -- --format=json
```

## 项目结构

```
apps/node-demo/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── config.ts             # 配置管理
│   ├── types.ts              # 类型定义
│   ├── error-handling.ts     # 错误处理演示
│   ├── examples/             # API 调用示例
│   │   ├── stock-list.ts     # 股票列表查询
│   │   ├── daily-data.ts     # 日线数据查询
│   │   ├── trade-calendar.ts # 交易日历查询
│   │   └── daily-basic.ts    # 每日指标查询
│   └── utils/                # 工具函数
│       ├── error-handler.ts  # 错误处理工具
│       ├── formatter.ts      # 输出格式化
│       └── example-runner.ts # 示例执行器
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   └── integration/          # 集成测试
├── .env.example              # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 类型检查

```bash
pnpm type-check
```

## 可用示例

### 1. 股票列表查询 (stock-list)

演示如何使用 `getStockBasic` API 获取股票基本信息。

**运行命令**:
```bash
pnpm dev -- --example=stock-list
```

### 2. 日线数据查询 (daily-data)

演示如何使用 `getDailyQuote` API 获取股票日线行情数据。

**运行命令**:
```bash
pnpm dev -- --example=daily-data
```

### 3. 交易日历查询 (trade-calendar)

演示如何使用 `getTradeCalendar` API 获取交易日历数据。

**运行命令**:
```bash
pnpm dev -- --example=trade-calendar
```

### 4. 每日指标查询 (daily-basic)

演示如何使用 `getDailyBasic` API 获取股票每日基本面指标数据。

**运行命令**:
```bash
pnpm dev -- --example=daily-basic
```

**演示内容**:
- 场景 1: 按交易日期查询全市场数据
- 场景 2: 按股票代码查询历史数据
- 场景 3: 自定义返回字段

**关键字段**:
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `pe`: 市盈率(动态)
- `pb`: 市净率
- `turnover_rate`: 换手率(%)
- `total_mv`: 总市值(万元)

**权限要求**: 需要 2000+ 积分

---

## 功能特性

- ✅ **基础 SDK 功能**: 演示客户端初始化和 API 调用
- ✅ **错误处理**: 展示各种错误场景的处理方式
- ✅ **多种 API**: 包含股票列表、日线数据、交易日历、每日指标等示例
- ✅ **格式化输出**: 支持控制台和 JSON 两种输出格式
- ✅ **完整测试**: 包含单元测试和集成测试

## 常见问题

### 提示缺少 TUSHARE_TOKEN

确保在 `apps/node-demo/` 目录下创建了 `.env` 文件,并正确设置了 `TUSHARE_TOKEN`。

### API 调用失败

1. 检查 Token 是否有效
2. 检查网络连接
3. 查看错误消息中的建议

### 类型错误

确保 SDK 已构建:

```bash
cd packages/tushare-sdk
pnpm build
```

## 更多信息

- 📖 [SDK 文档](../../packages/tushare-sdk/README.md)
- 📖 [API 参考](../../docs/api.md)
- 🌐 [Tushare Pro 官网](https://tushare.pro)

## 许可证

MIT
