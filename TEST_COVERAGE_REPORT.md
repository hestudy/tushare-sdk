# 测试覆盖率报告

## 执行时间

- 日期: 2025-10-17
- 命令: `pnpm test:coverage`

## 总体结果

### 项目级统计

| 包                    | 文件数 | 测试数 | 通过   | 失败  | 状态        |
| --------------------- | ------ | ------ | ------ | ----- | ----------- |
| @hestudy/tushare-sdk  | 多个   | 151+   | ✅     | 0     | ✅ 通过     |
| @hestudy/tushare-mcp  | 多个   | 227    | ✅     | 0     | ✅ 通过     |
| @hestudy/tushare-demo | 多个   | 多个   | ✅     | 0     | ✅ 通过     |
| @tushare/docs         | 多个   | 多个   | ✅     | 0     | ✅ 通过     |
| motia-stock-collector | 14     | 162    | ✅ 149 | ❌ 13 | ⚠️ 部分失败 |

### motia-stock-collector 失败明细

#### 1. collection-flow.test.ts (2个失败)

- **Scenario 3: API Failure and Retry**
  - 失败: should succeed after retry with API recovery
  - 问题: 重试后期望状态为 'SUCCESS',但实际为 'FAILED'
  - 原因: 任务重试逻辑或数据库保存问题

- **Scenario 4: Historical Data Backfill**
  - 失败: should backfill multiple trade days successfully
  - 问题: 期望保存3条记录,但仅保存了1条
  - 原因: 批量插入或查询逻辑问题

#### 2. export-data.test.ts (4个失败)

- **CSV格式导出测试**
  - 问题: CSV导出返回0条记录(期望>0)
  - 原因: 数据查询返回空或格式不匹配

- **JSON格式导出测试**
  - 问题: JSON导出数据count为0(期望>0)
  - 原因: 同上

- **参数验证测试**
  - 问题: 有效参数组合测试失败
  - 原因: 数据不一致

#### 3. schedule-daily-collection.test.ts (2个失败)

- **Handler - Trade Day Behavior**
  - 失败: should trigger collection on trade day
  - 问题: 发出事件主题为 'calendar.update.needed' 而非 'data.collection.triggered'
  - 原因: checkTradeCalendar函数判断交易日历数据缺失

- **Error Handling**
  - 失败: should not throw error on database failure
  - 问题: 期望调用error日志但未被调用
  - 原因: 错误处理逻辑未正确执行

#### 4. query-task-logs-api.test.ts (类似问题 - 未列出但存在)

- 问题: 查询任务日志返回0条记录
- 原因: 数据库保存失败

#### 5. storage-query-flow.test.ts (类似问题 - 未列出但存在)

- 问题: CSV/JSON导出和查询返回不一致的记录数
- 原因: 数据去重或批量操作逻辑问题

## 修复工作进展

### ✅ 已完成的修复

1. **时间依赖问题** - 所有硬编码日期已替换为动态日期
   - collection-flow.test.ts: 使用 `getNextTradeDay()` 和 `getWeekendDay()`
   - schedule-daily-collection.test.ts: 使用固定交易日期和 vi.spyOn mock
   - storage-query-flow.test.ts: 使用 `getTestDate()` 生成动态日期
   - export-data.test.ts: 同样处理

2. **测试工具** - 创建了日期辅助函数
   - 文件: `tests/helpers/date-helpers.ts`
   - 函数: `getTestBaseDate()`, `getTestDate()`, `getConsecutiveDates()`

### ⚠️ 仍需修复的问题

1. **数据库保存/查询不一致**
   - 数据被保存到内存数据库但查询返回0条
   - 需要检查:
     - `saveQuotes()` 是否正确调用
     - `queryQuotes()` 的SQL条件是否正确
     - 数据格式是否匹配

2. **事件发出逻辑**
   - `schedule-daily-collection` 的 `checkTradeCalendar` 返回了错误的事件
   - 需要调查: 为何判断交易日历数据不存在

3. **任务重试逻辑**
   - collection-flow Scenario 3 的重试后状态仍为 'FAILED'
   - 需要检查任务日志保存逻辑

4. **批量操作**
   - 历史数据补齐仅保存了部分数据
   - 需要调查批量插入的问题

## 建议的后续步骤

1. **优先级 1 - 数据查询问题**

   ```bash
   # 检查数据库实现
   grep -n "queryQuotes" apps/motia-stock-collector/lib/database.ts
   # 运行单个测试调试
   pnpm test storage-query-flow.test.ts -- --reporter=verbose
   ```

2. **优先级 2 - 事件发出问题**
   - 检查 `checkTradeCalendar` 中的 `hasTradeCalendarData` 实现
   - 验证测试数据是否正确保存到数据库

3. **优先级 3 - 集成测试修复**
   - 使用更完善的 Mock 替代某些数据库操作
   - 或使用真实的内存数据库实例(已部分完成)

## 覆盖率概览

### 主包 - @hestudy/tushare-sdk

- 整体覆盖率: **优秀**
- 状态: ✅ **全部通过**

### MCP包 - @hestudy/tushare-mcp

- 整体覆盖率: **优秀** (80%+)
- 状态: ✅ **全部通过**

### motia-stock-collector

- 整体覆盖率: **良好** (测试数量多,但部分集成测试失败)
- 状态: ⚠️ **需要修复 13 个失败测试**
- 失败率: 13/162 = 8%

## 结论

✅ **主项目(Tushare SDK)** 的测试全部通过,覆盖率优秀。
⚠️ **motia-stock-collector 应用** 的大部分测试通过,但仍有 13 个集成测试失败,主要涉及:

- 数据库查询/保存的一致性问题
- 事件发出逻辑
- 重试和批量操作

建议对这 13 个失败测试进行深入调查,重点关注数据库层的实现和事件流的正确性。
