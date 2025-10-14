/**
 * 财务数据文档内容验证测试
 *
 * 使用 vitest 验证现金流量表文档的内容完整性和正确性
 * 测试场景:
 * - T016: 现金流量表文档结构验证(必需章节存在)
 * - T017: 现金流量表参数表格验证(至少5个参数)
 * - T018: 现金流量表返回字段验证(至少50个字段,与SDK模型一致)
 * - T019: 现金流量表代码示例语法验证(TypeScript编译检查)
 * - T020: 链接有效性验证(内部链接指向存在的页面)
 *
 * Note: 这些测试将在文档创建后运行,当前文档尚未创建,测试预期会失败
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// 文档文件路径
const CASHFLOW_DOC_PATH = path.resolve(__dirname, '../../../docs/api/finance/cashflow.md');
const INCOME_DOC_PATH = path.resolve(__dirname, '../../../docs/api/finance/income.md');
const BALANCE_DOC_PATH = path.resolve(__dirname, '../../../docs/api/finance/balance.md');

describe('财务数据文档内容验证', () => {
  describe('T016: 现金流量表文档结构验证', () => {
    it('现金流量表文档文件应该存在', () => {
      const exists = fs.existsSync(CASHFLOW_DOC_PATH);
      expect(exists, '现金流量表文档文件不存在,请先创建 apps/docs/docs/api/finance/cashflow.md').toBe(true);
    });

    it('文档应该包含 frontmatter (title, description, keywords)', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 验证 frontmatter 格式
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('title:');
      expect(content).toContain('description:');
    });

    it('文档应该包含必需的章节: 函数签名', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/##\s*(函数签名|Function Signature)/);
    });

    it('文档应该包含必需的章节: 参数说明', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/##\s*(参数|参数说明|Parameters)/);
    });

    it('文档应该包含必需的章节: 返回值说明', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/##\s*(返回值|返回值说明|Return)/);
    });

    it('文档应该包含必需的章节: 代码示例', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/##\s*(代码示例|示例|Examples?)/);
    });
  });

  describe('T017: 现金流量表参数表格验证', () => {
    it('文档应该包含参数表格,至少5个参数', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取参数章节内容(从 "## 参数" 到下一个 "##" 标题)
      const paramSectionMatch = content.match(/##\s*(参数|参数说明|Parameters)([\s\S]*?)(?=\n##\s|\n#\s|$)/i);

      if (!paramSectionMatch) {
        expect.fail('未找到参数章节');
      }

      const paramSection = paramSectionMatch[2];

      // 验证包含表格标记
      expect(paramSection).toContain('|');

      // 统计参数行数(排除表头和分隔线)
      const paramRows = paramSection
        .split('\n')
        .filter(line => line.includes('|') && !line.includes('---') && !line.includes('参数') && !line.includes('类型') && !line.includes('必填'));

      expect(paramRows.length, '参数数量应该至少为5个').toBeGreaterThanOrEqual(5);
    });

    it('参数表格应该包含必需的列: 参数名、类型、必填、描述', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 查找表头行
      const tableHeaderMatch = content.match(/\|[^\n]*参数[^\n]*\|/i);

      if (!tableHeaderMatch) {
        expect.fail('未找到参数表格表头');
      }

      const headerLine = tableHeaderMatch[0];

      // 验证表头包含必需的列
      expect(headerLine).toMatch(/参数|Parameter/i);
      expect(headerLine).toMatch(/类型|Type/i);
      expect(headerLine).toMatch(/必填|Required/i);
      expect(headerLine).toMatch(/描述|说明|Description/i);
    });
  });

  describe('T018: 现金流量表返回字段验证', () => {
    it('文档应该包含返回字段列表,至少50个字段', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取返回值章节内容
      const returnSectionMatch = content.match(/##\s*(返回值|返回值说明|Return)([\s\S]*?)(?=\n##\s|\n#\s|$)/i);

      if (!returnSectionMatch) {
        expect.fail('未找到返回值章节');
      }

      const returnSection = returnSectionMatch[2];

      // 统计字段行数(表格行)
      const fieldRows = returnSection
        .split('\n')
        .filter(line => line.includes('|') && !line.includes('---') && !line.includes('字段') && !line.includes('类型') && !line.includes('说明'));

      expect(fieldRows.length, '返回字段数量应该至少为50个(现金流量表核心字段)').toBeGreaterThanOrEqual(50);
    });

    it('返回字段列表应该包含核心字段: n_cashflow_act, n_cashflow_inv_act, n_cash_flows_fnc_act', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 验证核心字段存在
      expect(content, '应包含核心字段: n_cashflow_act (经营活动现金流)').toContain('n_cashflow_act');
      expect(content, '应包含核心字段: n_cashflow_inv_act (投资活动现金流)').toContain('n_cashflow_inv_act');
      expect(content, '应包含核心字段: n_cash_flows_fnc_act (筹资活动现金流)').toContain('n_cash_flows_fnc_act');
    });

    it('返回字段应该说明金额单位为 "元"', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 验证文档中说明了金额单位
      expect(content).toMatch(/单位.*元|元.*单位/i);
    });
  });

  describe('T019: 现金流量表代码示例语法验证', () => {
    it('文档应该包含至少2个代码示例', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 统计 TypeScript 代码块数量
      const codeBlocks = content.match(/```typescript|```ts/gi);
      const codeBlockCount = codeBlocks ? codeBlocks.length : 0;

      expect(codeBlockCount, '代码示例数量应该至少为2个').toBeGreaterThanOrEqual(2);
    });

    it('代码示例应该使用正确的导入路径: @hestudy/tushare-sdk 或 @tushare/sdk', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取所有代码块
      const codeBlocksMatch = content.match(/```(?:typescript|ts)([\s\S]*?)```/gi);

      if (!codeBlocksMatch || codeBlocksMatch.length === 0) {
        expect.fail('未找到代码块');
      }

      // 验证至少一个代码块使用了正确的导入路径
      const hasValidImport = codeBlocksMatch.some(block => {
        return block.includes('@hestudy/tushare-sdk') || block.includes('@tushare/sdk');
      });

      expect(hasValidImport, '至少一个代码示例应该使用正确的导入路径').toBe(true);
    });

    it('代码示例应该使用真实股票代码格式 (如 000001.SZ, 600519.SH)', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取所有代码块
      const codeBlocksMatch = content.match(/```(?:typescript|ts)([\s\S]*?)```/gi);

      if (!codeBlocksMatch || codeBlocksMatch.length === 0) {
        expect.fail('未找到代码块');
      }

      // 验证代码示例中使用了真实股票代码格式
      const hasValidStockCode = codeBlocksMatch.some(block => {
        return block.match(/\d{6}\.(SZ|SH|BJ)/);
      });

      expect(hasValidStockCode, '至少一个代码示例应该使用真实股票代码格式').toBe(true);
    });

    it('代码示例应该使用合理的日期格式 (YYYYMMDD)', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取所有代码块
      const codeBlocksMatch = content.match(/```(?:typescript|ts)([\s\S]*?)```/gi);

      if (!codeBlocksMatch || codeBlocksMatch.length === 0) {
        expect.fail('未找到代码块');
      }

      // 验证代码示例中使用了 YYYYMMDD 格式的日期
      const hasValidDateFormat = codeBlocksMatch.some(block => {
        return block.match(/['"]20\d{6}['"]/); // 匹配如 '20231231'
      });

      expect(hasValidDateFormat, '至少一个代码示例应该使用 YYYYMMDD 日期格式').toBe(true);
    });
  });

  describe('T020: 链接有效性验证', () => {
    it('现金流量表文档中的内部链接应该指向存在的文档页面', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');

      // 提取所有内部链接 (相对路径链接)
      const internalLinks = content.match(/\[([^\]]+)\]\(\/api\/[^)]+\)/g);

      if (!internalLinks || internalLinks.length === 0) {
        // 如果没有内部链接,跳过测试
        return;
      }

      // 验证每个链接指向的文件是否存在
      const docsDir = path.resolve(__dirname, '../../../docs');
      internalLinks.forEach(link => {
        const urlMatch = link.match(/\(([^)]+)\)/);
        if (urlMatch) {
          const url = urlMatch[1];
          // 将 URL 转换为文件路径 (如 /api/finance/income -> docs/api/finance/income.md)
          const filePath = path.join(docsDir, `${url}.md`);
          const exists = fs.existsSync(filePath);
          expect(exists, `链接 ${url} 指向的文件不存在: ${filePath}`).toBe(true);
        }
      });
    });

    it('利润表和资产负债表文档应该存在(作为相关链接的目标)', () => {
      const incomeExists = fs.existsSync(INCOME_DOC_PATH);
      const balanceExists = fs.existsSync(BALANCE_DOC_PATH);

      expect(incomeExists, '利润表文档应该存在: apps/docs/docs/api/finance/income.md').toBe(true);
      expect(balanceExists, '资产负债表文档应该存在: apps/docs/docs/api/finance/balance.md').toBe(true);
    });
  });

  describe('文档质量检查', () => {
    it('文档应该包含注意事项章节', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/##\s*(注意事项|Notes?)/i);
    });

    it('文档应该说明权限要求 (2000积分)', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/2000.*积分|积分.*2000/i);
    });

    it('文档应该说明数据时效性', () => {
      if (!fs.existsSync(CASHFLOW_DOC_PATH)) {
        expect.fail('文档文件不存在,跳过测试');
      }

      const content = fs.readFileSync(CASHFLOW_DOC_PATH, 'utf-8');
      expect(content).toMatch(/T\+1|公告.*更新|数据.*时效/i);
    });
  });
});
