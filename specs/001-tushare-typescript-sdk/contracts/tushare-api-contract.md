# Tushare API Contract

**Version**: 1.0.0  
**Date**: 2025-10-09  
**Base URL**: `https://api.tushare.pro`

## 通用请求格式

所有 Tushare API 调用使用统一的 HTTP POST 接口。

### 端点
```
POST https://api.tushare.pro
```

### 请求头
```
Content-Type: application/json
```

### 请求体
```json
{
  "api_name": "string",        // 必需: API 接口名称
  "token": "string",           // 必需: 认证 Token
  "params": {                  // 可选: 查询参数对象
    "key": "value"
  },
  "fields": "string"           // 可选: 返回字段 (逗号分隔)
}
```

### 响应格式
```json
{
  "code": 0,                   // 响应代码: 0 成功, 其他失败
  "msg": "success",            // 响应消息
  "data": {
    "fields": ["field1", "field2"],  // 字段名数组
    "items": [                       // 数据行数组
      ["value1", "value2"],
      ["value3", "value4"]
    ]
  }
}
```

---

## API 接口定义

### 1. stock_basic - 股票列表

**描述**: 获取股票基础信息

**权限要求**: 2000积分

**请求示例**:
```json
{
  "api_name": "stock_basic",
  "token": "YOUR_TOKEN",
  "params": {
    "exchange": "",
    "list_status": "L"
  },
  "fields": "ts_code,symbol,name,area,industry,list_date"
}
```

**请求参数**:
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| ts_code | string | 否 | 股票代码 (如 000001.SZ) |
| list_status | string | 否 | 上市状态: L上市 D退市 P暂停 |
| exchange | string | 否 | 交易所: SSE SZSE |

**响应字段**:
| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| symbol | string | 股票简称 |
| name | string | 股票名称 |
| area | string | 地域 |
| industry | string | 行业 |
| list_date | string | 上市日期 (YYYYMMDD) |
| exchange | string | 交易所 |
| market | string | 市场类型 |

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "fields": ["ts_code", "symbol", "name", "area", "industry", "list_date"],
    "items": [
      ["000001.SZ", "000001", "平安银行", "深圳", "银行", "19910403"],
      ["000002.SZ", "000002", "万科A", "深圳", "全国地产", "19910129"]
    ]
  }
}
```

---

### 2. daily - 日线行情

**描述**: 获取股票日线行情数据

**权限要求**: 2000积分

**请求示例**:
```json
{
  "api_name": "daily",
  "token": "YOUR_TOKEN",
  "params": {
    "ts_code": "000001.SZ",
    "start_date": "20230101",
    "end_date": "20231231"
  },
  "fields": "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount"
}
```

**请求参数**:
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| ts_code | string | 否 | 股票代码 |
| trade_date | string | 否 | 交易日期 (YYYYMMDD) |
| start_date | string | 否 | 开始日期 (YYYYMMDD) |
| end_date | string | 否 | 结束日期 (YYYYMMDD) |

**注意**: `ts_code` 和 `trade_date` 至少需要提供一个

**响应字段**:
| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| trade_date | string | 交易日期 (YYYYMMDD) |
| open | number | 开盘价 |
| high | number | 最高价 |
| low | number | 最低价 |
| close | number | 收盘价 |
| pre_close | number | 昨收价 |
| change | number | 涨跌额 |
| pct_chg | number | 涨跌幅 (%) |
| vol | number | 成交量 (手) |
| amount | number | 成交额 (千元) |

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "fields": ["ts_code", "trade_date", "open", "high", "low", "close", "vol"],
    "items": [
      ["000001.SZ", "20230103", 12.50, 12.80, 12.40, 12.75, 150000],
      ["000001.SZ", "20230104", 12.75, 13.00, 12.70, 12.95, 180000]
    ]
  }
}
```

---

### 3. income - 利润表

**描述**: 获取上市公司利润表数据

**权限要求**: 2000积分

**请求示例**:
```json
{
  "api_name": "income",
  "token": "YOUR_TOKEN",
  "params": {
    "ts_code": "000001.SZ",
    "period": "20231231"
  },
  "fields": "ts_code,end_date,revenue,operate_profit,total_profit,n_income"
}
```

**请求参数**:
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| ts_code | string | 否 | 股票代码 |
| ann_date | string | 否 | 公告日期 (YYYYMMDD) |
| start_date | string | 否 | 开始报告期 (YYYYMMDD) |
| end_date | string | 否 | 结束报告期 (YYYYMMDD) |
| period | string | 否 | 报告期 (YYYYMMDD) |
| report_type | string | 否 | 报告类型: 1一季报 2半年报 3三季报 4年报 |

**响应字段**:
| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| ann_date | string | 公告日期 (YYYYMMDD) |
| end_date | string | 报告期 (YYYYMMDD) |
| report_type | string | 报告类型 |
| revenue | number | 营业收入 (元) |
| operate_profit | number | 营业利润 (元) |
| total_profit | number | 利润总额 (元) |
| n_income | number | 净利润 (元) |
| n_income_attr_p | number | 归属母公司净利润 (元) |
| basic_eps | number | 基本每股收益 (元) |

---

### 4. trade_cal - 交易日历

**描述**: 获取各大交易所交易日历

**权限要求**: 2000积分

**请求示例**:
```json
{
  "api_name": "trade_cal",
  "token": "YOUR_TOKEN",
  "params": {
    "exchange": "SSE",
    "start_date": "20230101",
    "end_date": "20231231"
  }
}
```

**请求参数**:
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| exchange | string | 否 | 交易所: SSE SZSE |
| start_date | string | 否 | 开始日期 (YYYYMMDD) |
| end_date | string | 否 | 结束日期 (YYYYMMDD) |
| is_open | string | 否 | 是否交易: 0休市 1交易 |

**响应字段**:
| 字段名 | 类型 | 描述 |
|--------|------|------|
| exchange | string | 交易所 |
| cal_date | string | 日期 (YYYYMMDD) |
| is_open | number | 是否交易: 0休市 1交易 |
| pretrade_date | string | 上一交易日 |

---

## 错误代码

### HTTP 状态码
| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | Token 无效或过期 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

### 业务错误码 (code 字段)
| 错误码 | 描述 |
|--------|------|
| 0 | 成功 |
| -1 | Token 无效 |
| -2 | 积分不足 |
| -3 | 权限不足 |
| -4 | 参数错误 |
| -5 | 请求频率超限 |

### 错误响应示例
```json
{
  "code": -1,
  "msg": "token无效或过期",
  "data": null
}
```

---

## 限流规则

Tushare API 根据用户积分限制请求频率：

| 积分等级 | 每分钟请求数 | 并发数 |
|----------|-------------|--------|
| 200 | 60 | 1 |
| 2000 | 300 | 5 |
| 5000 | 1200 | 20 |

**限流响应**:
- HTTP 状态码: 429
- 响应头: `Retry-After: {秒数}`
- 建议: 使用指数退避重试策略

---

## 最佳实践

### 1. 参数验证
- 在客户端侧进行参数验证，减少无效请求
- 日期格式统一转换为 YYYYMMDD

### 2. 错误处理
- 区分可重试错误 (429, 500, 503, timeout) 和不可重试错误 (401, 400)
- 对于 429 错误，遵循 `Retry-After` 响应头

### 3. 缓存策略
- 基础数据 (stock_basic): 缓存 1 天
- 日线行情: 缓存到当日结束
- 实时数据: 不缓存

### 4. 并发控制
- 根据积分等级设置合理的并发数
- 使用队列机制避免突发请求

### 5. 日志记录
- 记录请求参数、响应时间、错误信息
- 便于问题排查和性能优化
