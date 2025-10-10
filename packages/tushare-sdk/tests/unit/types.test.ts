/**
 * 类型测试 - 验证 TypeScript 类型安全
 * 
 * 测试目标:
 * - T031: 验证严格模式下无 any 类型泄漏
 * - T032: 验证错误参数在编译时被捕获
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient';
import { ApiErrorType } from '../../src/types/error';
import type {
  TushareConfig,
  RetryConfig,
  CacheConfig,
  ConcurrencyConfig,
} from '../../src/types/config';
import type {
  StockBasicItem,
  StockBasicParams,
} from '../../src/models/stock';
import type {
  DailyQuoteItem,
  DailyQuoteParams,
} from '../../src/models/quote';
import type { ApiError } from '../../src/types/error';
import type {
  TushareResponse,
  TushareRequest,
} from '../../src/types/response';

describe('类型安全测试', () => {
  describe('T031: 严格模式下无 any 类型泄漏', () => {
    it('TushareClient 类型完整', () => {
      const config: TushareConfig = {
        token: 'test_token',
      };

      const client = new TushareClient(config);

      // 验证方法返回类型不是 any
      expectTypeOf(client.query).returns.resolves.not.toBeAny();
      expectTypeOf(client.getStockBasic).returns.resolves.not.toBeAny();
      expectTypeOf(client.getDailyQuote).returns.resolves.not.toBeAny();
    });

    it('配置类型完整', () => {
      const config: TushareConfig = {
        token: 'test_token',
        endpoint: 'https://api.tushare.pro',
        timeout: 30000,
      };

      // 验证配置对象的所有属性都有明确类型
      expectTypeOf(config.token).toBeString();
      expectTypeOf(config.endpoint).toEqualTypeOf<string | undefined>();
      expectTypeOf(config.timeout).toEqualTypeOf<number | undefined>();
    });

    it('重试配置类型完整', () => {
      const retryConfig: RetryConfig = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2,
      };

      expectTypeOf(retryConfig.maxRetries).toBeNumber();
      expectTypeOf(retryConfig.initialDelay).toBeNumber();
      expectTypeOf(retryConfig.maxDelay).toBeNumber();
      expectTypeOf(retryConfig.backoffFactor).toBeNumber();
    });

    it('缓存配置类型完整', () => {
      const cacheConfig: CacheConfig = {
        enabled: true,
        ttl: 3600000,
      };

      expectTypeOf(cacheConfig.enabled).toBeBoolean();
      expectTypeOf(cacheConfig.ttl).toEqualTypeOf<number | undefined>();
    });

    it('并发配置类型完整', () => {
      const concurrencyConfig: ConcurrencyConfig = {
        maxConcurrent: 5,
        minInterval: 200,
      };

      expectTypeOf(concurrencyConfig.maxConcurrent).toBeNumber();
      expectTypeOf(concurrencyConfig.minInterval).toBeNumber();
    });

    it('股票数据模型类型完整', () => {
      const stock: StockBasicItem = {
        ts_code: '000001.SZ',
        symbol: '000001',
        name: '平安银行',
        area: '深圳',
        industry: '银行',
        list_date: '19910403',
      };

      expectTypeOf(stock.ts_code).toBeString();
      expectTypeOf(stock.symbol).toBeString();
      expectTypeOf(stock.name).toBeString();
      expectTypeOf(stock.area).toBeString();
      expectTypeOf(stock.industry).toBeString();
      expectTypeOf(stock.list_date).toBeString();
    });

    it('行情数据模型类型完整', () => {
      const quote: DailyQuoteItem = {
        ts_code: '000001.SZ',
        trade_date: '20231229',
        open: 12.5,
        high: 12.8,
        low: 12.4,
        close: 12.75,
        pre_close: 12.45,
        change: 0.3,
        pct_chg: 2.41,
        vol: 1500000,
        amount: 190000,
      };

      expectTypeOf(quote.ts_code).toBeString();
      expectTypeOf(quote.trade_date).toBeString();
      expectTypeOf(quote.open).toBeNumber();
      expectTypeOf(quote.close).toBeNumber();
      expectTypeOf(quote.vol).toBeNumber();
    });

    it('错误类型完整', () => {
      const errorType: ApiErrorType = ApiErrorType.AUTH_ERROR;

      expectTypeOf(errorType).toMatchTypeOf<ApiErrorType>();
      expectTypeOf(errorType).not.toBeAny();
    });

    it('API 响应类型完整', () => {
      const response: TushareResponse = {
        code: 0,
        msg: 'success',
        data: {
          fields: ['ts_code', 'name'],
          items: [['000001.SZ', '平安银行']],
        },
      };

      expectTypeOf(response.code).toBeNumber();
      expectTypeOf(response.msg).toBeString();
      expectTypeOf(response.data).not.toBeAny();
    });

    it('API 请求类型完整', () => {
      const request: TushareRequest = {
        api_name: 'stock_basic',
        token: 'test_token',
        params: { list_status: 'L' },
        fields: 'ts_code,name',
      };

      expectTypeOf(request.api_name).toBeString();
      expectTypeOf(request.token).toBeString();
      expectTypeOf(request.params).not.toBeAny();
    });
  });

  describe('T032: 错误参数在编译时被捕获', () => {
    it('股票查询参数类型检查', () => {
      const validParams: StockBasicParams = {
        ts_code: '000001.SZ',
        list_status: 'L',
        exchange: 'SSE',
      };

      // 验证 list_status 只接受特定值
      expectTypeOf(validParams.list_status).toEqualTypeOf<
        'L' | 'D' | 'P' | undefined
      >();

      // 验证 exchange 只接受特定值
      expectTypeOf(validParams.exchange).toEqualTypeOf<
        'SSE' | 'SZSE' | undefined
      >();
    });

    it('行情查询参数类型检查', () => {
      const validParams: DailyQuoteParams = {
        ts_code: '000001.SZ',
        trade_date: '20231229',
        start_date: '20230101',
        end_date: '20231231',
      };

      expectTypeOf(validParams.ts_code).toEqualTypeOf<string | undefined>();
      expectTypeOf(validParams.trade_date).toEqualTypeOf<
        string | undefined
      >();
    });

    it('配置对象必需字段检查', () => {
      // token 是必需的
      expectTypeOf<TushareConfig>().toHaveProperty('token');

      // 其他字段是可选的
      const minimalConfig: TushareConfig = {
        token: 'test_token',
      };

      expectTypeOf(minimalConfig).toMatchTypeOf<TushareConfig>();
    });

    it('重试配置字段类型检查', () => {
      const config: RetryConfig = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2,
      };

      // 所有字段都是必需的数字
      expectTypeOf(config.maxRetries).toBeNumber();
      expectTypeOf(config.initialDelay).toBeNumber();
      expectTypeOf(config.maxDelay).toBeNumber();
      expectTypeOf(config.backoffFactor).toBeNumber();
    });

    it('API 错误类型枚举检查', () => {
      const validTypes: ApiErrorType[] = [
        ApiErrorType.AUTH_ERROR,
        ApiErrorType.RATE_LIMIT,
        ApiErrorType.NETWORK_ERROR,
        ApiErrorType.SERVER_ERROR,
        ApiErrorType.VALIDATION_ERROR,
        ApiErrorType.TIMEOUT_ERROR,
      ];

      validTypes.forEach((type) => {
        expectTypeOf(type).toMatchTypeOf<ApiErrorType>();
      });
    });

    it('泛型方法类型推断', () => {
      const client = new TushareClient({ token: 'test' });

      // query 方法应该返回正确的泛型类型
      expectTypeOf(client.query<StockBasicItem>)
        .returns.resolves.toEqualTypeOf<StockBasicItem[]>();

      expectTypeOf(client.query<DailyQuoteItem>)
        .returns.resolves.toEqualTypeOf<DailyQuoteItem[]>();
    });

    it('方法返回类型精确匹配', () => {
      const client = new TushareClient({ token: 'test' });

      // getStockBasic 应该返回 StockBasicItem[]
      expectTypeOf(client.getStockBasic)
        .returns.resolves.toEqualTypeOf<StockBasicItem[]>();

      // getDailyQuote 应该返回 DailyQuoteItem[]
      expectTypeOf(client.getDailyQuote)
        .returns.resolves.toEqualTypeOf<DailyQuoteItem[]>();
    });
  });

  describe('类型兼容性测试', () => {
    it('配置对象可以部分覆盖', () => {
      const baseConfig: TushareConfig = {
        token: 'test_token',
      };

      const extendedConfig: TushareConfig = {
        ...baseConfig,
        timeout: 60000,
        retry: {
          maxRetries: 5,
          initialDelay: 2000,
          maxDelay: 60000,
          backoffFactor: 3,
        },
      };

      expectTypeOf(extendedConfig).toMatchTypeOf<TushareConfig>();
    });

    it('数据模型可以安全扩展', () => {
      interface ExtendedStockItem extends StockBasicItem {
        customField: string;
      }

      const extendedStock: ExtendedStockItem = {
        ts_code: '000001.SZ',
        symbol: '000001',
        name: '平安银行',
        area: '深圳',
        industry: '银行',
        list_date: '19910403',
        customField: 'custom',
      };

      expectTypeOf(extendedStock).toMatchTypeOf<StockBasicItem>();
    });
  });
});
