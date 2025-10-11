# Feature Specification: 基于SDK源代码完善文档站内容

**Feature Branch**: `007-sdk`
**Created**: 2025-10-11
**Status**: Draft
**Input**: User description: "根据sdk的代码注释和源代码,完善文档站的文档内容"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 从SDK源代码提取API文档 (Priority: P1)

开发者需要能够在文档站中查看完整的API参考文档,这些文档应该直接反映SDK源代码中的实际类型定义和JSDoc注释,确保文档与代码实现保持100%一致。

**Why this priority**: 这是文档站的核心价值 - 为用户提供准确、完整的API参考。如果API文档不完整或与实际代码不一致,用户将无法正确使用SDK,严重影响开发体验。

**Independent Test**: 可以通过访问文档站的任意API页面(如 /api/stock/basic),验证页面是否显示完整的类型定义、参数说明、返回值说明,并与SDK源代码进行对比确认一致性。

**Acceptance Scenarios**:

1. **Given** 用户访问股票基础信息API文档页(/api/stock/basic), **When** 查看参数和返回值说明, **Then** 应显示与TushareClient.getStockBasic()方法及StockBasicParams、StockBasicItem类型定义完全一致的信息
2. **Given** 用户访问每日指标API文档页, **When** 查看字段说明, **Then** 应显示DailyBasicItem接口中所有字段的完整JSDoc注释(包括换手率、市盈率等指标的计算公式和说明)
3. **Given** 用户访问日线行情API文档页, **When** 查看示例代码, **Then** 应显示使用getDailyQuote方法的实际可运行示例
4. **Given** 用户访问交易日历API文档页, **When** 查看参数说明, **Then** 应显示TradeCalParams中所有参数的说明,包括exchange枚举值的完整列表

---

### User Story 2 - 了解SDK的高级特性和配置选项 (Priority: P2)

开发者需要了解如何配置SDK的重试机制、缓存策略、并发控制等高级特性,以优化应用性能和可靠性。

**Why this priority**: 这些高级特性是SDK的核心竞争力,但许多用户可能不知道这些功能的存在或如何正确配置。完善的文档可以显著提升用户体验和SDK的实际应用价值。

**Independent Test**: 可以通过访问配置指南页面(/guide/configuration),验证是否详细说明了RetryConfig、CacheConfig、ConcurrencyConfig的所有配置项,并提供实际应用场景的示例。

**Acceptance Scenarios**:

1. **Given** 用户想要配置重试策略, **When** 访问配置文档, **Then** 应看到RetryConfig的所有选项(maxRetries、initialDelay、maxDelay、backoffFactor)的详细说明和计算公式示例
2. **Given** 用户想要使用缓存功能, **When** 查看缓存配置文档, **Then** 应看到如何启用内存缓存、自定义缓存提供者(如Redis实现示例)的完整说明
3. **Given** 用户想要控制API请求频率, **When** 查看并发控制文档, **Then** 应看到如何根据Tushare积分等级配置maxConcurrent和minInterval的指南
4. **Given** 用户想要自定义日志输出, **When** 查看日志配置文档, **Then** 应看到Logger接口说明和如何实现自定义日志记录器的示例

---

### User Story 3 - 查看完整的类型系统和错误处理指南 (Priority: P2)

开发者需要了解SDK提供的所有TypeScript类型定义和错误处理机制,以便编写类型安全的代码并正确处理各种异常情况。

**Why this priority**: TypeScript类型安全是SDK的核心特性之一。完整的类型文档和错误处理指南可以帮助用户避免常见错误,减少调试时间。

**Independent Test**: 可以通过访问类型参考页面,验证是否列出所有导出的类型,并通过查看错误处理页面验证是否说明了所有错误类型和处理方式。

**Acceptance Scenarios**:

1. **Given** 用户想要了解所有可用的数据模型类型, **When** 访问类型参考文档, **Then** 应看到StockBasicItem、DailyQuoteItem、DailyBasicItem等所有模型类型的完整字段列表
2. **Given** 用户遇到API调用错误, **When** 查看错误处理文档, **Then** 应看到ApiError类的所有属性(type、code、retryable、retryAfter)和ApiErrorType枚举的所有可能值
3. **Given** 用户想要实现自定义缓存, **When** 查看CacheProvider接口文档, **Then** 应看到接口的所有方法签名和实现示例(如Redis缓存提供者)
4. **Given** 用户想要使用日期工具函数, **When** 查看工具函数文档, **Then** 应看到formatDate、parseDate、isValidDateFormat函数的详细说明和使用示例

---

### User Story 4 - 通过实际示例学习SDK用法 (Priority: P3)

开发者希望通过丰富的代码示例快速学习如何在不同场景下使用SDK,包括基本用法、批量请求、错误处理、性能优化等。

**Why this priority**: 示例代码是用户学习SDK最快的方式。虽然这是辅助性内容,但对提升用户满意度和降低学习曲线有重要作用。

**Independent Test**: 可以通过访问快速开始页面和各API文档页面,验证每个API是否至少提供3个不同场景的可运行示例。

**Acceptance Scenarios**:

1. **Given** 用户第一次使用SDK, **When** 访问快速开始页面, **Then** 应看到从安装到首次调用的完整示例,包括如何创建TushareClient实例
2. **Given** 用户想要批量查询多个股票, **When** 查看批量请求示例, **Then** 应看到使用Promise.all并发请求的完整代码和注意事项
3. **Given** 用户想要优化性能, **When** 查看性能优化指南, **Then** 应看到启用缓存、控制并发、使用日期过滤等最佳实践的对比示例
4. **Given** 用户想要处理API限流错误, **When** 查看错误处理示例, **Then** 应看到如何捕获RATE_LIMIT错误并使用retryAfter自动重试的代码

---

### Edge Cases

- 当SDK源代码中的JSDoc注释不完整或缺失时,如何在文档中标注"待补充"或使用合理的默认描述?
- 如何处理SDK中已实现但文档站中尚未创建对应页面的API(如getFinancialData)?
- 当SDK源代码更新后,如何确保文档站内容与代码保持同步?
- 如何处理某些API方法需要特定Tushare积分等级才能使用的情况(在文档中标注权限要求)?
- 当文档站配置中的导航链接指向尚未实现的API页面时,如何处理(如/api/fund/basic、/api/finance/income)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须从packages/tushare-sdk/src目录下的源代码文件中提取所有导出的类型定义和JSDoc注释
- **FR-002**: 系统必须为TushareClient类的每个公共方法(getStockBasic、getDailyQuote、getTradeCalendar、getDailyBasic)生成或更新对应的API文档页面
- **FR-003**: 系统必须为所有配置接口(TushareConfig、RetryConfig、CacheConfig、ConcurrencyConfig)生成详细的配置说明文档
- **FR-004**: 系统必须更新指南页面(installation.md、quick-start.md、configuration.md),确保其中的包名、导入语句、示例代码与实际SDK导出保持一致
- **FR-005**: 系统必须为DailyBasicItem模型生成完整的字段文档,包括所有财务指标的计算公式说明(如市盈率、市净率、换手率等)
- **FR-006**: 系统必须在API文档中明确标注权限要求,例如getDailyBasic需要至少2000积分
- **FR-007**: 系统必须在配置文档中提供针对不同Tushare积分等级的并发控制配置建议(如200积分用户1次/秒,5000积分用户20次/秒)
- **FR-008**: 系统必须更新错误处理文档,准确反映ApiError类的所有属性和ApiErrorType枚举的所有值
- **FR-009**: 系统必须为重试机制文档添加指数退避算法的详细说明和延迟计算公式示例
- **FR-010**: 系统必须为缓存机制文档添加LRU淘汰策略的说明和自定义Redis缓存提供者的完整实现示例
- **FR-011**: 系统必须在快速开始页面中纠正错误的函数名(如getStockDaily应为getDailyQuote)和包名(应为@hestudy/tushare-sdk)
- **FR-012**: 系统必须为每个API文档页面添加"相关API"链接部分,引用SDK中实际存在的相关方法

### Key Entities

- **SDK源代码文件**: TypeScript源文件,包含类型定义、接口、类和JSDoc注释,位于packages/tushare-sdk/src目录
- **API文档页面**: Markdown文档,描述单个API方法的参数、返回值和使用示例,位于apps/docs/docs/api目录
- **指南页面**: Markdown文档,提供安装、配置、快速开始等教程内容,位于apps/docs/docs/guide目录
- **类型定义**: TypeScript接口和类型,定义API参数和返回值结构,如StockBasicParams、DailyBasicItem等
- **配置选项**: TushareConfig及相关子配置接口,定义客户端的各种配置参数
- **JSDoc注释**: 源代码中的文档注释,包含参数说明、示例代码、权限要求等信息

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有SDK中实际存在的API方法(getStockBasic、getDailyQuote、getTradeCalendar、getDailyBasic)都必须有对应的完整文档页面,准确率100%
- **SC-002**: API文档中的类型定义(参数和返回值)与源代码中的TypeScript类型定义完全一致,一致性检查通过率100%
- **SC-003**: 指南页面中的所有示例代码必须使用正确的包名(@hestudy/tushare-sdk)和实际存在的导出成员,可运行性100%
- **SC-004**: 配置文档必须包含所有配置选项(至少15个配置属性),覆盖TushareConfig、RetryConfig、CacheConfig、ConcurrencyConfig的所有字段,完整性100%
- **SC-005**: DailyBasicItem的文档必须包含所有15+个字段的说明,包括市盈率(pe、pe_ttm)、市净率(pb)、换手率等指标的计算公式
- **SC-006**: 错误处理文档必须准确列出ApiErrorType的所有枚举值(AUTH_ERROR、RATE_LIMIT、NETWORK_ERROR、SERVER_ERROR、VALIDATION_ERROR、TIMEOUT_ERROR)
- **SC-007**: 每个API文档页面必须包含至少3个不同场景的代码示例,覆盖基本用法、参数过滤、错误处理
- **SC-008**: 文档中所有提到的类型、接口、类名必须与SDK实际导出的名称一致(如TushareClient、StockBasicItem等),名称准确率100%

## Dependencies

- 依赖对packages/tushare-sdk/src目录下所有TypeScript源文件的读取权限
- 依赖对apps/docs/docs目录下Markdown文档文件的写入权限
- 文档更新完成后,需要运行rspress构建以验证文档站可以正常生成

## Assumptions

- SDK源代码中的JSDoc注释已基本完善,可以直接用于生成文档
- 文档站使用rspress框架,支持标准Markdown语法和frontmatter
- 不需要自动化工具提取源代码注释,可以手动编写文档内容
- 文档内容使用中文编写,与现有文档风格保持一致
- 暂不实现文档与源代码的自动同步机制,本次为一次性完善
- 对于SDK中未实现的API(如getFinancialData虽在index.ts中导出但实际可能未完整实现),文档站中保留占位页面但标注"待实现"或移除相关导航链接

## Out of Scope

- 不包括创建SDK源代码中不存在的新API文档
- 不包括修改SDK源代码本身
- 不包括实现文档自动生成工具或CI/CD集成
- 不包括翻译文档为其他语言
- 不包括添加交互式API playground或在线代码编辑器
- 不包括修改rspress配置或主题样式
- 不包括为文档站添加搜索功能或其他高级特性
