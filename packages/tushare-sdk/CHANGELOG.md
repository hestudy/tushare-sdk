# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @hestudy/tushare-sdk
- TypeScript SDK for Tushare Pro API
- Complete TypeScript type definitions with strict mode
- Automatic retry mechanism with exponential backoff
- Pluggable cache system with built-in memory cache
- Concurrency control for rate limiting
- Support for Node.js 18+ and modern browsers
- Comprehensive JSDoc comments for all public APIs
- Test coverage ≥ 80%

### Core Features
- `TushareClient` - Main client class for API access
- `getStockBasic()` - Get stock basic information
- `getDailyQuote()` - Get daily quote data
- `getFinancialData()` - Get financial data
- `getTradeCalendar()` - Get trading calendar
- `query()` - Generic query method for all Tushare APIs

### Services
- `RetryService` - Automatic retry with exponential backoff and jitter
- `MemoryCacheProvider` - Built-in memory cache with LRU eviction
- `ConcurrencyLimiter` - Queue-based concurrency control
- `ConsoleLogger` - Built-in logger with configurable log levels

### Types
- Complete TypeScript type definitions for all APIs
- `TushareConfig` - Client configuration interface
- `ApiError` - Typed error handling
- `CacheProvider` - Cache provider interface for custom implementations
- `Logger` - Logger interface for custom implementations

### Documentation
- Quick start guide
- API documentation
- Data model documentation
- Technical research documentation
- Examples for common use cases

## [1.0.0] - 2025-10-10

### Added
- Initial stable release
- Full implementation of core features
- Complete test suite with ≥ 80% coverage
- Production-ready build configuration
- Comprehensive documentation

### Features
- ✅ TypeScript strict mode support
- ✅ Automatic retry mechanism
- ✅ Pluggable cache system
- ✅ Concurrency control
- ✅ Multi-environment support (Node.js + Browser)
- ✅ Complete JSDoc comments
- ✅ High performance (< 50KB gzipped)
- ✅ Extensive test coverage

### Documentation
- ✅ Quick start guide
- ✅ API reference
- ✅ Data model documentation
- ✅ Advanced usage examples
- ✅ Migration guide

### Infrastructure
- ✅ Turborepo monorepo setup
- ✅ rslib build configuration
- ✅ Vitest test framework
- ✅ ESLint + Prettier code quality
- ✅ GitHub Actions CI/CD (planned)

---

## Release Notes

### Version 1.0.0

This is the first stable release of @hestudy/tushare-sdk, providing a modern, type-safe way to access Tushare Pro API in TypeScript/JavaScript projects.

**Key Highlights:**
- 🎯 Complete TypeScript support with strict mode
- 🚀 Modern toolchain (rslib + Vitest + Turborepo)
- 🔄 Smart retry mechanism with exponential backoff
- 💾 Flexible caching with Redis support
- 🌐 Works in both Node.js and browsers
- 📝 Excellent IDE support with JSDoc
- ⚡ High performance and small bundle size
- 🧪 Comprehensive test coverage

**Breaking Changes:**
- None (initial release)

**Migration Guide:**
- This is the first release, no migration needed

**Known Issues:**
- None

**Future Plans:**
- Add more API method wrappers
- Improve documentation with more examples
- Add CLI tool for common tasks
- Performance optimizations
- Community feedback integration

---

## Versioning Policy

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

## Support

For questions, issues, or feature requests:
- GitHub Issues: [Report an issue](https://github.com/your-org/tushare-sdk/issues)
- Documentation: [Read the docs](../../specs/001-tushare-typescript-sdk/)
- Tushare Official: [https://tushare.pro](https://tushare.pro)
