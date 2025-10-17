/**
 * 项目设置验证脚本
 * 验证所有核心组件是否正确配置
 */

import { DatabaseService } from './lib/database';
import {
  validateStockCode,
  validateDate,
  formatDateToTushare,
  formatDateFromTushare,
} from './lib/utils';

console.log('🔍 开始验证项目设置...\n');

// 1. 验证数据库模块
console.log('✅ 测试 1: 数据库模块');
try {
  const db = new DatabaseService(':memory:');
  console.log('  - 数据库服务初始化成功');

  // 测试保存交易日历
  db.saveTradeCalendar([
    {
      calDate: '2024-01-01',
      exchange: 'SSE',
      isOpen: 0,
      pretradeDate: null,
    },
    {
      calDate: '2024-01-02',
      exchange: 'SSE',
      isOpen: 1,
      pretradeDate: '2023-12-29',
    },
  ]);
  console.log('  - 交易日历保存成功');

  // 测试查询交易日
  const isTradeDay = db.isTradeDay('2024-01-02');
  if (isTradeDay === true) {
    console.log('  - 交易日查询功能正常');
  } else {
    throw new Error('交易日查询失败');
  }

  // 测试保存行情数据
  db.saveQuotes([
    {
      tsCode: '600519.SH',
      tradeDate: '2024-01-02',
      open: 1450.0,
      high: 1460.0,
      low: 1445.0,
      close: 1455.0,
      preClose: 1450.0,
      change: 5.0,
      pctChg: 0.34,
      vol: 50000,
      amount: 72500,
    },
  ]);
  console.log('  - 行情数据保存成功');

  // 测试查询行情
  const quotes = db.queryQuotes({ tsCode: '600519.SH', limit: 10 });
  if (quotes.length === 1) {
    console.log('  - 行情数据查询功能正常');
  } else {
    throw new Error('行情查询失败');
  }

  db.close();
  console.log('  ✓ 数据库模块测试通过\n');
} catch (error: any) {
  console.error(`  ✗ 数据库模块测试失败: ${error.message}\n`);
  process.exit(1);
}

// 2. 验证工具函数模块
console.log('✅ 测试 2: 工具函数模块');
try {
  // 测试日期格式转换
  const tushareDate = formatDateToTushare('2024-01-02');
  if (tushareDate !== '20240102') {
    throw new Error('日期格式转换失败');
  }
  console.log('  - 日期格式转换功能正常');

  const normalDate = formatDateFromTushare('20240102');
  if (normalDate !== '2024-01-02') {
    throw new Error('日期格式逆转换失败');
  }
  console.log('  - 日期格式逆转换功能正常');

  // 测试股票代码验证
  if (!validateStockCode('600519.SH')) {
    throw new Error('股票代码验证失败');
  }
  if (validateStockCode('invalid')) {
    throw new Error('股票代码验证应拒绝无效格式');
  }
  console.log('  - 股票代码验证功能正常');

  // 测试日期验证
  if (!validateDate('2024-01-02')) {
    throw new Error('日期验证失败');
  }
  if (validateDate('2024-13-01')) {
    throw new Error('日期验证应拒绝无效日期');
  }
  console.log('  - 日期验证功能正常');

  console.log('  ✓ 工具函数模块测试通过\n');
} catch (error: any) {
  console.error(`  ✗ 工具函数模块测试失败: ${error.message}\n`);
  process.exit(1);
}

// 3. 检查环境变量配置
console.log('✅ 测试 3: 环境变量配置');
if (process.env.TUSHARE_TOKEN) {
  console.log('  - TUSHARE_TOKEN: 已配置');
} else {
  console.log('  ⚠️  TUSHARE_TOKEN: 未配置 (需要在 .env 文件中设置)');
}

if (process.env.DATABASE_PATH) {
  console.log(`  - DATABASE_PATH: ${process.env.DATABASE_PATH}`);
} else {
  console.log('  - DATABASE_PATH: 使用默认值 ./data/stock.db');
}

console.log(`  - LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
console.log(
  `  - RATE_LIMIT_CONCURRENT: ${process.env.RATE_LIMIT_CONCURRENT || '5'}`
);
console.log('  ✓ 环境变量检查完成\n');

// 4. 检查数据目录
console.log('✅ 测试 4: 数据目录');
import fs from 'fs';
import path from 'path';

const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  console.log('  ⚠️  数据目录不存在,正在创建...');
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('  ✓ 数据目录创建成功');
} else {
  console.log('  ✓ 数据目录已存在');
}

// 5. 检查 Step 文件
console.log('\n✅ 测试 5: Step 文件检查');
const stepsDir = './steps';
const stepFiles = fs.readdirSync(stepsDir).filter((f) => f.endsWith('.ts'));
console.log(`  - 发现 ${stepFiles.length} 个 Step 文件:`);
stepFiles.forEach((file) => {
  console.log(`    • ${file}`);
});
console.log('  ✓ Step 文件检查完成\n');

console.log('🎉 所有验证测试通过!');
console.log('\n下一步:');
console.log('1. 确保 .env 文件中配置了有效的 TUSHARE_TOKEN');
console.log('2. 运行 `npm run dev` 启动开发服务器');
console.log('3. 访问 http://localhost:3000 查看 Motia Workbench');
console.log('4. 按照 quickstart.md 指南执行完整流程\n');
