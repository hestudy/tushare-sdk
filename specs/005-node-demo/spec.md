# Feature Specification: Node Demo 每日指标演示

**Feature Branch**: `005-node-demo`  
**Created**: 2025-10-10  
**Status**: Draft  
**Input**: User description: "在node-demo应用中增加每日指标的演示"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看每日指标基本用法 (Priority: P1)

作为 SDK 用户,我希望通过运行 node-demo 应用查看如何使用 `getDailyBasic` API 获取股票每日指标数据,以便快速了解 API 的基本用法。

**Why this priority**: 这是核心功能,展示最常用的查询场景(按日期查询全市场数据),为用户提供最直接的学习价值。

**Independent Test**: 可以通过运行 `pnpm --filter node-demo start --example=daily-basic` 命令独立测试,成功返回每日指标数据并在控制台展示。

**Acceptance Scenarios**:

1. **Given** 用户已配置有效的 Tushare Token, **When** 运行 `pnpm --filter node-demo start --example=daily-basic`, **Then** 应用成功查询指定日期的每日指标数据并在控制台展示关键字段(股票代码、交易日期、市盈率、市净率等)
2. **Given** 用户运行 `pnpm --filter node-demo start --example=all`, **When** 执行所有示例, **Then** 每日指标示例应该被包含在执行列表中并成功运行
3. **Given** 用户运行 `pnpm --filter node-demo start --example=daily-basic --format=json`, **When** 指定 JSON 输出格式, **Then** 应用以 JSON 格式输出每日指标数据

---

### User Story 2 - 查看多种查询方式 (Priority: P2)

作为 SDK 用户,我希望看到多种查询每日指标的方式(按日期、按股票、自定义字段等),以便了解 API 的灵活性和不同使用场景。

**Why this priority**: 帮助用户理解 API 的完整能力,展示不同查询参数的组合使用,提升学习效果。

**Independent Test**: 可以通过查看控制台输出验证是否展示了多个查询示例,每个示例都有清晰的说明和结果展示。

**Acceptance Scenarios**:

1. **Given** 用户运行每日指标示例, **When** 查看输出, **Then** 应该看到至少 3 种不同的查询方式:按日期查询全市场、按股票代码查询历史数据、自定义返回字段
2. **Given** 每个查询示例, **When** 执行查询, **Then** 应该显示查询参数、返回数据条数和示例数据
3. **Given** 用户查看代码, **When** 阅读示例代码, **Then** 每个查询都有清晰的注释说明使用场景和参数含义

---

### User Story 3 - 查看错误处理演示 (Priority: P3)

作为 SDK 用户,我希望看到如何正确处理每日指标 API 可能出现的错误(权限不足、参数错误等),以便在自己的项目中实现健壮的错误处理。

**Why this priority**: 错误处理是生产环境必需的,但不是快速入门的核心内容,可以作为进阶学习内容。

**Independent Test**: 可以通过查看示例代码中的 try-catch 块和错误处理逻辑来验证。

**Acceptance Scenarios**:

1. **Given** 用户查看示例代码, **When** 阅读错误处理部分, **Then** 应该看到完整的 try-catch 错误处理示例
2. **Given** 查询失败(如网络错误), **When** 捕获异常, **Then** 应用应该显示友好的错误信息而不是崩溃
3. **Given** 用户在 verbose 模式运行, **When** 发生错误, **Then** 应该看到详细的错误堆栈和调试信息

---

### Edge Cases

- **无数据返回**: 当查询的日期没有交易数据时(如周末、节假日),应该返回空数组并给出提示
- **Token 未配置**: 当用户未配置 Tushare Token 时,应该显示清晰的配置指引
- **权限不足**: 当用户积分不足 2000 时,应该显示权限要求说明
- **日期格式错误**: 当用户修改代码使用错误的日期格式时,应该显示参数格式说明
- **网络超时**: 当网络请求超时时,应该显示重试建议

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 演示应用必须提供 `daily-basic` 示例选项,用户可以通过 `--example=daily-basic` 参数单独运行
- **FR-002**: 演示应用必须展示至少 3 种每日指标查询方式:按交易日期查询、按股票代码查询、自定义返回字段
- **FR-003**: 演示应用必须在控制台清晰展示查询结果,包括数据条数和示例数据(至少前 3 条)
- **FR-004**: 演示应用必须展示关键字段:股票代码(ts_code)、交易日期(trade_date)、市盈率(pe)、市净率(pb)、换手率(turnover_rate)、总市值(total_mv)
- **FR-005**: 演示应用必须包含完整的错误处理,捕获并友好展示 API 调用可能出现的错误
- **FR-006**: 演示应用必须在代码中添加详细注释,说明每个查询的使用场景和参数含义
- **FR-007**: 演示应用必须支持 verbose 模式,显示详细的请求和响应信息
- **FR-008**: 演示应用必须支持 JSON 和 console 两种输出格式
- **FR-009**: 演示应用必须在 README 中添加每日指标示例的使用说明
- **FR-010**: 演示应用必须遵循现有的代码结构和风格,与其他示例(stock-list、daily-data、trade-calendar)保持一致

### Key Entities

- **每日指标示例(Daily Basic Example)**: 演示如何使用 `getDailyBasic` API 的示例模块,包含多个查询场景和完整的错误处理
- **查询参数(Query Parameters)**: 包括交易日期(trade_date)、股票代码(ts_code)、日期范围(start_date/end_date)、返回字段(fields)
- **每日指标数据(Daily Basic Data)**: 包含股票代码、交易日期、市盈率、市净率、换手率、总市值等关键财务指标
- **示例输出(Example Output)**: 格式化的控制台输出或 JSON 输出,展示查询结果和关键信息

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 30 秒内成功运行每日指标示例并看到输出结果
- **SC-002**: 示例代码包含至少 3 种不同的查询方式,每种都有清晰的注释和说明
- **SC-003**: 控制台输出清晰易读,用户可以快速理解每个查询的目的和结果
- **SC-004**: 示例代码的注释覆盖率达到 80% 以上,关键逻辑都有说明
- **SC-005**: 错误处理完整,所有可能的异常都被捕获并友好展示
- **SC-006**: README 文档更新,包含每日指标示例的使用说明和示例输出
- **SC-007**: 代码风格与现有示例一致,通过 ESLint 检查
- **SC-008**: 示例可以在 `--example=all` 模式下与其他示例一起成功运行
