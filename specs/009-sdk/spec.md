# Feature Specification: SDK财务数据功能完善

**Feature Branch**: `009-sdk`
**Created**: 2025-10-13
**Status**: Draft
**Input**: User description: "为sdk增加获取财务数据的功能"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 获取公司利润表数据 (Priority: P1)

量化分析师需要获取上市公司的利润表数据,包括营业收入、净利润、每股收益等核心财务指标,用于基本面分析和财务建模。

**Why this priority**: 利润表是财务分析的核心数据源,包含企业盈利能力的关键指标。这是最基础和最常用的财务数据查询场景,必须优先实现。

**Independent Test**: 可以通过调用 `client.getIncomeStatement({ ts_code: '000001.SZ', period: '20231231' })` 独立验证是否能成功返回利润表数据,并验证返回数据包含营业收入、净利润等核心字段。

**Acceptance Scenarios**:

1. **Given** 用户已创建TushareClient实例, **When** 调用getIncomeStatement方法查询指定股票的年报利润表, **Then** 应返回包含营业收入、净利润、每股收益等完整财务指标的数组
2. **Given** 用户查询某股票指定日期范围的利润表, **When** 提供start_date和end_date参数, **Then** 应返回该时间范围内所有报告期的利润表数据
3. **Given** 用户只想查询年报数据, **When** 指定report_type为4, **Then** 应只返回年度财务报表数据
4. **Given** 用户积分不足2000分, **When** 调用利润表接口, **Then** 应返回清晰的权限错误提示

---

### User Story 2 - 获取公司资产负债表数据 (Priority: P1)

投资分析师需要查看上市公司的资产负债表,了解公司的资产结构、负债水平、偿债能力等财务状况,评估投资风险。

**Why this priority**: 资产负债表与利润表同等重要,反映企业的财务健康状况和资本结构。这是完整财务分析不可或缺的数据维度。

**Independent Test**: 可以通过调用 `client.getBalanceSheet({ ts_code: '600519.SH', period: '20231231' })` 独立验证是否能返回资产负债表数据,包含总资产、总负债、股东权益等关键字段。

**Acceptance Scenarios**:

1. **Given** 用户已创建TushareClient实例, **When** 调用getBalanceSheet方法查询指定公司的资产负债表, **Then** 应返回包含总资产、总负债、股东权益、流动资产、固定资产等完整数据
2. **Given** 用户查询多个报告期的资产负债表, **When** 提供日期范围参数, **Then** 应返回时间序列数据,支持趋势分析
3. **Given** 用户需要计算财务比率, **When** 获取资产负债表数据后, **Then** 数据中应包含足够详细的科目,如流动资产、流动负债,以便计算流动比率等指标

---

### User Story 3 - 获取公司现金流量表数据 (Priority: P1)

财务分析人员需要获取现金流量表数据,了解企业的现金流入流出情况、经营活动现金流、投资和筹资活动现金流,评估企业的现金创造能力和流动性。

**Why this priority**: 现金流量表是三大财务报表之一,对于评估企业的实际盈利质量和可持续性至关重要。"利润可以造假,现金流不会说谎"。

**Independent Test**: 可以通过调用 `client.getCashFlow({ ts_code: '000001.SZ', start_date: '20230101', end_date: '20231231' })` 独立验证是否能返回现金流量表数据,包含经营活动、投资活动、筹资活动的现金流。

**Acceptance Scenarios**:

1. **Given** 用户已创建TushareClient实例, **When** 调用getCashFlow方法查询现金流量表, **Then** 应返回包含经营活动现金流净额、投资活动现金流净额、筹资活动现金流净额的完整数据
2. **Given** 用户需要分析企业的现金创造能力, **When** 获取多期现金流量表数据, **Then** 应能从返回数据中获取自由现金流相关的各项指标
3. **Given** 用户查询现金流量表时未指定报告期, **When** 只提供ts_code参数, **Then** 应返回该股票的最新财务报告期数据

---

### User Story 4 - 在TushareClient中直接调用财务数据方法 (Priority: P1)

SDK用户期望能够直接通过TushareClient实例调用财务数据方法,而不是导入独立的API函数,以保持与其他SDK方法(如getStockBasic、getDailyQuote)的一致性。

**Why this priority**: 当前getFinancialData虽然在API模块中存在,但TushareClient类未暴露该方法,导致用户体验不一致。这是API设计的完整性问题,影响SDK的易用性。

**Independent Test**: 可以通过创建TushareClient实例后,直接调用 `client.getIncomeStatement()` 验证方法是否可访问,无需额外导入API函数。

**Acceptance Scenarios**:

1. **Given** 用户创建了TushareClient实例, **When** 通过IDE查看client对象的可用方法, **Then** 应看到getIncomeStatement、getBalanceSheet、getCashFlow等财务数据方法
2. **Given** 用户调用client.getIncomeStatement(), **When** 查看TypeScript类型提示, **Then** 应显示完整的参数类型和返回值类型定义
3. **Given** 用户使用财务数据方法, **When** 未传入任何参数, **Then** 应提供合理的参数验证提示

---

### Edge Cases

- 当用户账户积分不足2000分时调用财务数据接口,应返回清晰的权限不足错误,而不是通用API错误
- 当查询的股票代码不存在或格式错误时,应返回空数组并记录警告日志,而不是抛出异常
- 当请求的报告期(period)尚未公布财务数据时,应返回空数组,提示"该报告期数据尚未公布"
- 当同时提供period和start_date/end_date参数时,应明确哪个参数优先级更高(建议:period优先)
- 当财务数据字段值为null或缺失时,TypeScript类型系统应正确处理(所有财务数据字段应为可选类型)
- 当用户请求VIP接口(如income_vip)但积分不足5000时,应提供清晰的升级提示

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: TushareClient类必须提供getIncomeStatement方法,用于获取上市公司利润表数据,调用Tushare的income接口
- **FR-002**: TushareClient类必须提供getBalanceSheet方法,用于获取上市公司资产负债表数据,调用Tushare的balancesheet接口
- **FR-003**: TushareClient类必须提供getCashFlow方法,用于获取上市公司现金流量表数据,调用Tushare的cashflow接口
- **FR-004**: 系统必须为利润表定义完整的TypeScript类型(IncomeStatementItem),包含至少50个标准财务字段(如营业总收入、营业收入、利息收入、营业总成本、营业成本、利息支出、营业利润、利润总额、净利润、每股收益等)
- **FR-005**: 系统必须为资产负债表定义完整的TypeScript类型(BalanceSheetItem),包含至少60个标准字段(如总资产、流动资产、非流动资产、总负债、流动负债、非流动负债、股东权益等)
- **FR-006**: 系统必须为现金流量表定义完整的TypeScript类型(CashFlowItem),包含至少40个标准字段(如经营活动现金流净额、投资活动现金流净额、筹资活动现金流净额等)
- **FR-007**: 所有财务数据方法必须支持通过ts_code、period、start_date、end_date、report_type等参数进行灵活查询
- **FR-008**: 财务数据方法必须继承TushareClient的缓存、重试、并发控制等核心特性
- **FR-009**: 系统必须在方法的JSDoc注释中明确标注权限要求(至少2000积分)和积分消耗规则
- **FR-010**: 财务数据相关的类型定义必须从index.ts中导出,确保用户可以导入使用
- **FR-011**: 系统必须保留现有的financial.ts文件中的FinancialItem和FinancialParams类型作为通用财务数据类型(向后兼容)
- **FR-012**: 所有财务数据字段必须包含详细的JSDoc注释,说明字段含义和单位(如"营业总收入(元)")

### Key Entities

- **IncomeStatementItem**: 利润表数据项,包含营业收入、净利润、每股收益等所有利润表字段
- **BalanceSheetItem**: 资产负债表数据项,包含总资产、总负债、股东权益等所有资产负债表字段
- **CashFlowItem**: 现金流量表数据项,包含经营活动现金流、投资活动现金流、筹资活动现金流等所有现金流量表字段
- **FinancialQueryParams**: 财务数据查询参数,包含ts_code、period、start_date、end_date、report_type等查询条件
- **TushareClient扩展方法**: getIncomeStatement、getBalanceSheet、getCashFlow三个新增的财务数据查询方法

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户能够在3行代码内完成从创建客户端到获取财务数据的完整流程(创建client→调用方法→获取数据)
- **SC-002**: 所有三个财务报表接口(利润表、资产负债表、现金流量表)都必须在TushareClient中实现,方法覆盖率100%
- **SC-003**: 财务数据类型定义的字段完整性必须达到Tushare官方文档的90%以上(基于官方API返回的字段数量)
- **SC-004**: 用户在TypeScript环境下调用财务数据方法时,IDE必须能够提供完整的类型提示和参数自动完成
- **SC-005**: 财务数据查询支持至少3种查询模式:按报告期查询(period)、按日期范围查询(start_date+end_date)、按报告类型筛选(report_type)
- **SC-006**: 当用户权限不足时,错误消息必须明确说明所需的最低积分要求(如"此接口需要至少2000积分")
- **SC-007**: 所有财务数据方法的单元测试覆盖率必须达到80%以上
- **SC-008**: SDK文档中必须包含至少5个财务数据使用示例,涵盖基本查询、时间序列分析、财务比率计算等场景

## Dependencies

- 依赖现有的TushareClient核心功能(query方法、重试机制、缓存机制、并发控制)
- 依赖Tushare Pro API的财务数据接口(income、balancesheet、cashflow)
- 用户需要拥有至少2000积分的Tushare账户才能使用财务数据功能
- 需要更新SDK的TypeScript类型导出(index.ts)以包含新的财务数据类型

## Assumptions

- Tushare Pro API的财务数据接口规范保持稳定,字段定义不会频繁变更
- 财务数据接口的积分要求(2000积分)在可预见的未来不会大幅提高
- 用户主要使用场景为A股上市公司的财务数据查询,暂不考虑港股、美股等其他市场
- 财务数据的报告期格式统一为YYYYMMDD(如20231231表示2023年年报)
- 用户能够理解财务报表的基本概念,SDK不需要提供财务指标的教育性说明
- 现有的financial.ts文件将被重构或扩展,而不是完全替换(保持向后兼容)

## Out of Scope

- 不包括财务指标的自动计算功能(如根据资产负债表自动计算流动比率、资产负债率等)
- 不包括财务数据的可视化功能(图表绘制由用户自行实现)
- 不包括财务数据的异常检测或质量评估功能
- 不包括VIP接口(income_vip、balancesheet_vip、cashflow_vip)的实现,仅实现基础接口
- 不包括财务快报(express)、业绩预告(forecast)等其他财务相关接口
- 不包括财务数据的本地持久化存储功能
- 不包括跨市场(A股、港股、美股)财务数据的统一查询接口
- 不包括财务数据的同比、环比增长率自动计算
