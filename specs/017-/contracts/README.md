# API Contracts: 股市数据定时采集与存储应用

本目录包含所有 Motia Steps 的配置和接口契约定义。

## Step 契约列表

### 1. Cron Steps (定时任务)

- [schedule-daily-collection.step.json](./schedule-daily-collection.step.json) - 每日数据采集调度器

### 2. Event Steps (事件处理)

- [collect-daily-quotes.step.json](./collect-daily-quotes.step.json) - 采集日线行情数据
- [collect-trade-calendar.step.json](./collect-trade-calendar.step.json) - 采集交易日历
- [save-quotes-to-db.step.json](./save-quotes-to-db.step.json) - 保存行情数据到数据库

### 3. API Steps (HTTP 接口)

- [query-quotes-api.step.json](./query-quotes-api.step.json) - 查询历史行情接口
- [export-data.step.json](./export-data.step.json) - 数据导出接口

## Event Topics

应用中使用的事件主题:

| Topic                       | 触发者                    | 订阅者               | 数据格式                                      |
| --------------------------- | ------------------------- | -------------------- | --------------------------------------------- |
| `data.collection.triggered` | schedule-daily-collection | collect-daily-quotes | `{ tradeDate: string }`                       |
| `quotes.collected`          | collect-daily-quotes      | save-quotes-to-db    | `{ quotes: DailyQuote[], tradeDate: string }` |
| `calendar.update.needed`    | collect-trade-calendar    | -                    | `{ year: number }`                            |

## REST API Endpoints

| Method | Path          | 说明         | Step             |
| ------ | ------------- | ------------ | ---------------- |
| GET    | `/api/quotes` | 查询历史行情 | query-quotes-api |
| GET    | `/api/export` | 导出数据     | export-data      |

## 契约版本

- Version: 1.0.0
- Last Updated: 2025-10-15
