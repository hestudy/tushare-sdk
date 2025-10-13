# Feature Specification: SDK财务数据功能测试

**Feature Branch**: `010-sdk`
**Created**: 2025-10-13
**Status**: Draft
**Input**: User description: "为sdk的财务数据功能编写测试"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 财务数据API单元测试 (Priority: P1)

开发团队需要为三大财务报表API(利润表、资产负债表、现金流量表)编写完整的单元测试,验证API函数能够正确调用底层的client.query方法,并传递正确的参数格式。这些测试应该使用mock技术,不依赖真实的API调用。

**Why this priority**: 单元测试是测试金字塔的基础层,必须优先实现。它们运行速度快、不依赖外部服务,能够快速验证代码逻辑的正确性。这是保证代码质量的第一道防线。

**Independent Test**: 可以通过运行 `pnpm --filter @hestudy/tushare-sdk test` 独立验证单元测试是否全部通过,测试覆盖率是否达到80%以上。

**Acceptance Scenarios**:

1. **Given** TushareClient实例已创建且query方法被mock, **When** 调用getIncomeStatement方法传入查询参数, **Then** 应该调用client.query('income', params)并返回mock数据
2. **Given** TushareClient实例已创建, **When** 调用getBalanceSheet方法不传参数, **Then** 应该调用client.query('balancesheet', undefined)
3. **Given** TushareClient实例已创建, **When** 调用getCashFlow方法传入ts_code和日期范围, **Then** 应该正确传递所有参数到query方法
4. **Given** mock的query方法返回空数组, **When** 调用任意财务数据方法, **Then** 应该返回空数组而不抛出异常
5. **Given** mock的query方法抛出异常, **When** 调用财务数据方法, **Then** 应该将异常正确向上传播

---

### User Story 2 - 财务数据类型定义测试 (Priority: P1)

开发团队需要验证财务数据的TypeScript类型定义是否完整且准确,确保利润表94个字段、资产负债表81个字段、现金流量表87个字段的类型定义都符合Tushare API官方文档规范。

**Why this priority**: TypeScript类型定义是SDK的核心价值之一,错误或不完整的类型定义会直接影响用户的开发体验和代码质量。类型测试必须与功能测试同步进行。

**Independent Test**: 可以通过TypeScript编译检查和专门的类型测试用例独立验证,使用`expectTypeOf`等工具验证类型推断是否正确。

**Acceptance Scenarios**:

1. **Given** 用户导入IncomeStatementItem类型, **When** 在TypeScript代码中使用该类型, **Then** 所有94个字段都应该有正确的类型提示(必填字段为string,财务数据字段为number?)
2. **Given** 用户创建BalanceSheetItem对象, **When** 只提供必填字段(ts_code, ann_date, end_date等), **Then** TypeScript不应该报错
3. **Given** 用户创建CashFlowItem对象, **When** 提供错误类型的字段值(如将number字段赋值为string), **Then** TypeScript应该在编译时报错
4. **Given** 用户使用FinancialQueryParams类型, **When** 设置report_type字段, **Then** 类型提示应该只允许'1'|'2'|'3'|'4'这四个值
5. **Given** 用户从@hestudy/tushare-sdk导入类型, **When** 导入所有三大报表的类型和查询参数类型, **Then** 所有类型都应该可用且有正确的JSDoc注释

---

### User Story 3 - 财务数据集成测试 (Priority: P2)

开发团队需要编写集成测试,使用真实的Tushare API Token验证财务数据功能在实际环境中的表现,包括数据获取、缓存机制、错误处理等端到端场景。

**Why this priority**: 集成测试验证系统各组件协同工作的正确性,是功能测试的重要补充。优先级为P2是因为它依赖于外部API和有效的Token,但对于验证实际可用性至关重要。

**Independent Test**: 可以通过设置TUSHARE_TOKEN环境变量后运行集成测试独立验证,测试应该能够获取真实数据并验证数据结构的完整性。

**Acceptance Scenarios**:

1. **Given** 设置了有效的TUSHARE_TOKEN环境变量, **When** 调用getIncomeStatement查询平安银行2023年报, **Then** 应该返回包含完整94个字段定义的利润表数据
2. **Given** 用户账户积分充足, **When** 连续两次调用同一财务数据接口, **Then** 第二次调用应该从缓存返回,响应时间显著更快
3. **Given** 用户使用无效的股票代码, **When** 调用任意财务数据方法, **Then** 应该返回空数组而不抛出异常
4. **Given** 用户账户积分不足2000分, **When** 调用财务数据接口, **Then** 应该抛出ApiError并包含权限不足的错误信息
5. **Given** 用户查询未来日期的财务数据, **When** 调用财务数据方法, **Then** 应该返回空数组并记录警告日志
6. **Given** API请求因网络问题失败, **When** 配置了重试机制, **Then** 应该自动重试并在达到最大重试次数后抛出异常

---

### User Story 4 - TushareClient类方法测试 (Priority: P2)

开发团队需要验证TushareClient类上的财务数据方法(client.getIncomeStatement、client.getBalanceSheet、client.getCashFlow)能够正确工作,与直接调用API函数的行为一致,确保用户体验的一致性。

**Why this priority**: TushareClient类是用户的主要使用入口,类方法的测试确保了API的易用性和一致性。优先级为P2是因为它依赖于P1的单元测试基础。

**Independent Test**: 可以通过单独的测试套件验证TushareClient类的三个方法是否正确调用内部的API函数,测试方法签名和返回值是否符合预期。

**Acceptance Scenarios**:

1. **Given** 创建了TushareClient实例, **When** 调用client.getIncomeStatement方法, **Then** 应该返回与直接调用getIncomeStatement(client, params)相同的结果
2. **Given** TushareClient实例, **When** 通过IDE查看client对象的方法提示, **Then** 应该看到getIncomeStatement、getBalanceSheet、getCashFlow三个方法及其完整的TypeScript类型签名
3. **Given** 调用client.getBalanceSheet时传入参数, **When** 参数格式错误, **Then** 应该与API函数产生相同的错误提示
4. **Given** TushareClient配置了缓存和重试, **When** 通过client方法调用财务数据接口, **Then** 应该继承这些配置并正确应用

---

### User Story 5 - 边界条件和错误处理测试 (Priority: P3)

开发团队需要编写测试验证财务数据功能在各种边界条件和错误场景下的行为,确保系统的健壮性和用户友好的错误提示。

**Why this priority**: 边界条件测试确保系统在异常情况下的稳定性和可靠性。优先级为P3是因为它是在核心功能测试完成后的补充和增强。

**Independent Test**: 可以通过专门的测试套件独立验证各种边界条件的处理,包括空参数、无效参数、异常数据等场景。

**Acceptance Scenarios**:

1. **Given** 调用财务数据方法, **When** ts_code参数为空字符串, **Then** 应该返回合理的错误提示或空数组
2. **Given** 调用财务数据方法, **When** period和start_date同时提供, **Then** 应该按照文档说明的优先级处理(period优先)
3. **Given** API返回的财务数据, **When** 某些字段值为null, **Then** TypeScript类型系统应该正确处理(所有财务字段为可选类型)
4. **Given** 查询的报告期数据尚未公布, **When** 调用财务数据接口, **Then** 应该返回空数组而不是抛出异常
5. **Given** 同时发起多个财务数据请求, **When** 配置了并发控制, **Then** 应该正确限制并发数量并按队列顺序处理

---

### Edge Cases

- 当用户传入的日期格式不正确(如"2023-12-31"而非"20231231")时,应该有清晰的参数格式错误提示
- 当查询的股票代码包含特殊字符或空格时,应该进行参数验证并返回错误
- 当财务数据API返回的字段数量与类型定义不匹配时,应该记录警告但不中断程序
- 当用户尝试查询VIP接口(如income_vip)但使用的是基础接口方法时,应该有明确的提示说明接口差异
- 当测试环境没有TUSHARE_TOKEN时,集成测试应该被优雅地跳过,而不是失败
- 当mock数据的结构与实际API返回不一致时,测试应该能够检测到这种差异
- 当财务数据字段值超出正常范围(如负的总资产)时,测试应该验证数据但不强制验证业务逻辑正确性

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须为getIncomeStatement、getBalanceSheet、getCashFlow三个API函数提供完整的单元测试,覆盖参数传递、返回值处理、异常处理等场景
- **FR-002**: 系统必须为IncomeStatementItem、BalanceSheetItem、CashFlowItem三个类型提供TypeScript类型测试,验证所有字段的类型定义正确性
- **FR-003**: 系统必须为TushareClient类的三个财务数据方法提供测试,验证它们与直接调用API函数的行为一致性
- **FR-004**: 系统必须提供集成测试,使用真实API验证财务数据功能的端到端流程,包括数据获取、缓存、重试机制
- **FR-005**: 所有单元测试必须使用mock技术,不依赖真实的API调用,确保测试运行速度快且稳定
- **FR-006**: 集成测试必须支持在没有TUSHARE_TOKEN环境变量时优雅跳过,而不是测试失败
- **FR-007**: 测试必须验证财务数据类型的所有字段(利润表94个、资产负债表81个、现金流量表87个)都有正确的类型定义
- **FR-008**: 测试必须验证FinancialQueryParams参数类型的所有字段都是可选的,且有正确的类型约束
- **FR-009**: 测试必须覆盖边界条件,包括空参数、无效参数、空返回、异常场景等
- **FR-010**: 测试必须验证错误处理机制,包括权限不足、参数错误、网络错误等场景的错误信息是否清晰
- **FR-011**: 测试必须验证缓存机制对财务数据接口的有效性,第二次相同请求应该显著更快
- **FR-012**: 测试必须使用vitest测试框架,与现有测试代码保持一致的风格和结构
- **FR-013**: 单元测试必须放置在`packages/tushare-sdk/tests/unit/financial.test.ts`文件中
- **FR-014**: 集成测试必须放置在`packages/tushare-sdk/tests/integration/financial.integration.test.ts`文件中
- **FR-015**: 所有财务数据测试的代码覆盖率必须达到80%以上,包括API函数、类型导出、Client类方法

### Key Entities

- **Financial API Test Suite**: 财务数据API的单元测试套件,包含getIncomeStatement、getBalanceSheet、getCashFlow三个函数的测试用例
- **Financial Type Test Suite**: 财务数据类型的测试套件,验证IncomeStatementItem、BalanceSheetItem、CashFlowItem的类型定义
- **Financial Integration Test Suite**: 财务数据的集成测试套件,使用真实API验证端到端流程
- **TushareClient Method Test Cases**: TushareClient类方法的测试用例,验证client.getIncomeStatement等方法的行为
- **Mock Financial Data**: 用于单元测试的模拟财务数据,包含完整的字段定义和合理的数值
- **Test Utilities**: 测试辅助工具,如创建mock client、生成测试数据、验证类型等

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 财务数据功能的单元测试覆盖率必须达到80%以上,所有核心代码路径都被测试覆盖
- **SC-002**: 所有单元测试必须在3秒内完成执行,确保开发过程中的快速反馈
- **SC-003**: 集成测试必须能够成功获取真实的财务数据,并验证数据结构包含所有必需的字段(至少90%的字段定义被实际数据覆盖)
- **SC-004**: 类型测试必须验证所有262个财务字段(94+81+87)的类型定义都正确且可用
- **SC-005**: 测试必须覆盖至少15个不同的测试场景,包括正常流程、边界条件、异常处理等
- **SC-006**: 当没有TUSHARE_TOKEN环境变量时,测试套件应该能够跳过集成测试并通过所有单元测试,总体测试通过率100%
- **SC-007**: 错误场景的测试必须验证至少5种不同的错误类型,包括权限错误、参数错误、网络错误等
- **SC-008**: 缓存机制的测试必须验证第二次相同请求的响应时间比第一次快至少50%
- **SC-009**: 测试代码必须遵循现有的测试代码风格,与existing测试文件(如api.test.ts、api.integration.test.ts)保持一致的结构和命名规范
- **SC-010**: 所有测试必须在CI/CD环境中稳定运行,失败率低于1%(排除网络问题导致的偶发失败)

## Dependencies

- 依赖现有的财务数据功能实现(packages/tushare-sdk/src/api/financial.ts和models/financial.ts)
- 依赖现有的TushareClient类及其query方法、缓存、重试等核心功能
- 依赖vitest测试框架及其配置(packages/tushare-sdk/vitest.config.ts)
- 依赖现有的测试工具和结构(tests/unit/和tests/integration/目录结构)
- 集成测试依赖有效的Tushare Pro API Token(通过TUSHARE_TOKEN环境变量提供)
- 集成测试依赖Tushare账户具有至少2000积分的权限
- 类型测试可能需要安装@vitest/expect-type或类似的类型测试工具

## Assumptions

- 财务数据功能已经完全实现并通过了基本的手动验证
- 现有的测试框架(vitest)已正确配置且工作正常
- 测试环境可以访问互联网并调用Tushare API(对于集成测试)
- 开发者在运行集成测试前会正确设置TUSHARE_TOKEN环境变量
- Tushare API的接口规范保持稳定,不会在测试编写后发生重大变更
- 现有的getFinancialData函数的测试用例可以作为新测试的参考模板
- mock数据的结构应该与真实API返回尽可能一致,以提高测试的有效性
- 测试数据使用真实存在的股票代码(如000001.SZ、600519.SH)以确保集成测试的可靠性

## Out of Scope

- 不包括性能测试和负载测试(如并发1000个请求的压力测试)
- 不包括VIP接口(income_vip、balancesheet_vip、cashflow_vip)的测试
- 不包括财务指标计算功能的测试(如根据数据计算ROE、流动比率等)
- 不包括财务数据可视化功能的测试
- 不包括跨浏览器兼容性测试
- 不包括财务数据质量验证的测试(如检测财务数据的合理性、一致性)
- 不包括其他财务相关接口(如财务快报express、业绩预告forecast)的测试
- 不包括测试数据的持久化或测试报告的生成(使用vitest默认的报告功能即可)
- 不包括端到端的UI测试(财务数据功能仅为SDK,没有UI界面)
- 不包括向后兼容性测试(如验证旧版本API的支持)
