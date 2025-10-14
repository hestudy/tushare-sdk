# Quickstart: 文档站点 MCP 使用指南验证

**Feature**: 015-mcp
**Date**: 2025-10-14
**Purpose**: 提供快速验证文档修改正确性的步骤清单

## 概述

本文档提供一系列验证步骤,确保文档修改符合预期,所有配置示例可用,文档站点正常构建和显示。

## 前置条件

在执行验证之前,确保已完成以下任务:

- [ ] 修改 `/README.md`,添加 MCP 服务章节
- [ ] 创建 `/apps/docs/docs/guide/mcp-usage.md`,编写完整的 MCP 使用指南
- [ ] 修改 `/apps/docs/rspress.config.ts`,更新侧边栏配置

## 验证步骤

### 步骤 1: 文件完整性检查

确认所有文件已正确创建或修改:

```bash
# 检查文件是否存在
ls -lh /Users/hestudy/Documents/project/tushare-sdk/README.md
ls -lh /Users/hestudy/Documents/project/tushare-sdk/apps/docs/docs/guide/mcp-usage.md
ls -lh /Users/hestudy/Documents/project/tushare-sdk/apps/docs/rspress.config.ts
```

**预期结果**: 所有文件都存在且大小合理

---

### 步骤 2: Markdown 语法检查

验证 Markdown 文件的语法正确性:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk

# 检查 README.md 语法(可选,使用 markdownlint)
# npx markdownlint-cli README.md

# 检查 mcp-usage.md 语法
# npx markdownlint-cli apps/docs/docs/guide/mcp-usage.md
```

**手动检查清单**:
- [ ] Frontmatter 格式正确 (`---` 包裹,YAML 格式)
- [ ] 代码块使用正确的语言标识 (`json`, `bash`, `typescript`)
- [ ] 链接格式正确 (`[文本](URL)`)
- [ ] 表格格式正确 (标题行、分隔符、数据行对齐)
- [ ] 标题层级合理 (无跳级,如 h2 → h4)

---

### 步骤 3: TypeScript 类型检查

验证 rspress 配置文件的 TypeScript 语法:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps/docs

# 运行类型检查
pnpm type-check
```

**预期结果**:
```
✓ Type checking passed without errors
```

**如果失败**: 检查 rspress.config.ts 的语法,确保:
- 对象属性名拼写正确
- 逗号、括号、引号配对
- 新增的侧边栏配置符合类型定义

---

### 步骤 4: 文档站点构建验证

验证文档站点能否成功构建:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps/docs

# 构建文档站点
pnpm build
```

**预期结果**:
```
✓ Build completed successfully
✓ Generated static site in dist/
```

**如果失败**: 检查错误信息,常见问题:
- Markdown 文件路径不存在
- 图片或资源文件缺失
- 内部链接错误(如 `/guide/non-existent`)

---

### 步骤 5: 本地预览文档站点

启动本地开发服务器,预览文档站点:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps/docs

# 启动开发服务器
pnpm dev
```

**预期结果**:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

访问 `http://localhost:3000`,进行以下检查:

#### 5.1 首页检查

- [ ] 首页正常显示
- [ ] 首页特性列表中是否需要添加 MCP 服务介绍(可选)

#### 5.2 侧边栏导航检查

- [ ] 点击左侧边栏"指南"
- [ ] 展开"快速入门"组
- [ ] 确认"MCP 使用指南"链接显示在列表中
- [ ] 链接文本为"MCP 使用指南"

#### 5.3 MCP 使用指南页面检查

点击"MCP 使用指南"链接,检查页面内容:

- [ ] 页面 URL 为 `/guide/mcp-usage`
- [ ] 页面标题显示为"MCP 使用指南"
- [ ] 页面右侧显示目录(Outline)
- [ ] 目录包含所有主要章节:
  - [ ] 什么是 MCP
  - [ ] 前置要求
  - [ ] 安装
  - [ ] 配置
  - [ ] 可用工具
  - [ ] 使用示例
  - [ ] 进阶配置
  - [ ] 常见问题
  - [ ] 相关链接

#### 5.4 内容格式检查

滚动页面,检查各部分内容:

- [ ] 所有代码块正确高亮显示
- [ ] 表格格式正确,列对齐
- [ ] 链接可点击,颜色正确
- [ ] 折叠块(details)可展开/收起
- [ ] 图标(如 ✅ ⚪ 📈)正常显示

#### 5.5 链接有效性检查

点击文档中的链接,验证:

- [ ] 内部链接(如 `/guide/quick-start`)可正常跳转
- [ ] 外部链接(如 https://modelcontextprotocol.io)在新标签页打开
- [ ] 所有外部链接可访问(HTTP 200)

**建议使用的外部链接检查工具**:
```bash
# 使用 linkinator 检查链接
npx linkinator http://localhost:3000/guide/mcp-usage --recurse
```

#### 5.6 响应式设计检查

- [ ] 在桌面浏览器中正常显示
- [ ] 在移动浏览器中正常显示(使用浏览器开发者工具模拟)
- [ ] 侧边栏在移动端可折叠

---

### 步骤 6: 配置示例可用性验证

验证文档中的配置示例确实可用:

#### 6.1 验证 npx 方式配置

如果你有 Tushare Token,可以在本地测试:

```bash
# 临时配置环境变量
export TUSHARE_TOKEN="your_actual_token"

# 测试 npx 方式启动
npx -y @hestudy/tushare-mcp
```

**预期结果**: MCP 服务器成功启动,监听 stdio

#### 6.2 验证本地开发方式配置

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps/tushare-mcp

# 确保已构建
pnpm build

# 测试本地运行
export TUSHARE_TOKEN="your_actual_token"
node dist/index.js
```

**预期结果**: MCP 服务器成功启动

#### 6.3 验证 Claude Desktop 配置(可选)

如果你已安装 Claude Desktop:

1. 按照文档中的步骤编辑 `claude_desktop_config.json`
2. 完全退出并重启 Claude Desktop
3. 在对话中询问: "你现在可以使用哪些工具?"
4. 确认看到 Tushare 相关工具(query_stock_quote, query_financial, 等)

---

### 步骤 7: README 修改验证

验证项目根目录 README.md 的修改:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk

# 查看 README.md 文件
cat README.md | grep -A 50 "## 🤖 MCP 服务"
```

**检查清单**:
- [ ] MCP 服务章节已添加
- [ ] 章节位置在"特性"之后,"快速开始"之前
- [ ] 内容字数在 200-300 字之间
- [ ] 包含功能特性、快速使用、使用示例、相关链接
- [ ] 链接指向文档站点的 MCP 使用指南
- [ ] 配置示例可直接复制粘贴

---

### 步骤 8: 字数统计

验证文档字数符合要求:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk

# README MCP 章节字数
# (需要手动计算或使用工具)

# MCP 使用指南字数
wc -m apps/docs/docs/guide/mcp-usage.md
```

**预期结果**:
- README MCP 章节: 200-300 字
- MCP 使用指南: 3000-5000 字

---

### 步骤 9: 构建性能检查

验证文档站点构建性能:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps/docs

# 清理旧构建
rm -rf dist

# 计时构建
time pnpm build
```

**预期结果**: 构建时间合理(通常 < 60 秒)

---

### 步骤 10: 浏览器兼容性检查(可选)

在不同浏览器中测试文档站点:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] 移动浏览器(iOS Safari / Chrome Mobile)

**检查项**:
- [ ] 页面正常渲染
- [ ] 代码块高亮正确
- [ ] 表格格式正确
- [ ] 链接可点击

---

## 验收标准总览

以下是完整的验收标准清单:

### 文件完整性
- [ ] `/README.md` 已修改,包含 MCP 服务章节
- [ ] `/apps/docs/docs/guide/mcp-usage.md` 已创建
- [ ] `/apps/docs/rspress.config.ts` 已修改,侧边栏配置更新

### 内容质量
- [ ] README MCP 章节字数在 200-300 字
- [ ] MCP 使用指南字数在 3000-5000 字
- [ ] 包含至少 3 个使用示例
- [ ] 包含至少 3 种常见问题排查
- [ ] 所有配置示例可直接复制粘贴使用

### 技术验证
- [ ] TypeScript 类型检查通过
- [ ] 文档站点构建成功
- [ ] 本地预览正常显示
- [ ] 所有代码块正确高亮
- [ ] 所有表格格式正确

### 链接验证
- [ ] 所有内部链接可正常跳转
- [ ] 所有外部链接有效(HTTP 200)
- [ ] 包含所有必需的外部参考链接(MCP 官网、Tushare 官网、Claude Desktop 下载等)

### 配置验证
- [ ] npx 方式配置可用
- [ ] 本地开发方式配置可用
- [ ] Claude Desktop 配置示例正确

### 用户体验
- [ ] 页面在桌面和移动设备上正常显示
- [ ] 侧边栏导航清晰,MCP 使用指南易于发现
- [ ] 目录结构合理,章节顺序符合逻辑
- [ ] 代码示例和说明清晰易懂

---

## 快速验证脚本

以下是一个快速验证脚本,自动执行主要检查步骤:

```bash
#!/bin/bash

# 快速验证脚本
# Usage: bash quickstart-validate.sh

set -e

echo "=== 文档站点 MCP 使用指南验证 ==="
echo ""

# 检查文件存在
echo "1. 检查文件完整性..."
test -f /Users/hestudy/Documents/project/tushare-sdk/README.md && echo "  ✓ README.md 存在"
test -f /Users/hestudy/Documents/project/tushare-sdk/apps/docs/docs/guide/mcp-usage.md && echo "  ✓ mcp-usage.md 存在"
test -f /Users/hestudy/Documents/project/tushare-sdk/apps/docs/rspress.config.ts && echo "  ✓ rspress.config.ts 存在"
echo ""

# TypeScript 类型检查
echo "2. TypeScript 类型检查..."
cd /Users/hestudy/Documents/project/tushare-sdk/apps/docs
pnpm type-check && echo "  ✓ 类型检查通过"
echo ""

# 文档站点构建
echo "3. 文档站点构建..."
pnpm build && echo "  ✓ 构建成功"
echo ""

# 字数统计
echo "4. 字数统计..."
mcp_usage_chars=$(wc -m < /Users/hestudy/Documents/project/tushare-sdk/apps/docs/docs/guide/mcp-usage.md)
echo "  MCP 使用指南字数: $mcp_usage_chars"
echo ""

echo "=== 验证完成 ==="
echo ""
echo "下一步:"
echo "  1. 运行 'pnpm dev' 启动开发服务器"
echo "  2. 访问 http://localhost:3000/guide/mcp-usage 预览页面"
echo "  3. 检查页面内容、格式、链接是否正确"
echo ""
```

保存为 `quickstart-validate.sh`,然后运行:

```bash
bash quickstart-validate.sh
```

---

## 常见问题

### Q: 构建失败,提示找不到文件

**A**: 检查文件路径是否正确,确保:
- `mcp-usage.md` 位于 `apps/docs/docs/guide/` 目录下
- 文件名拼写正确(小写,使用连字符)

### Q: 侧边栏没有显示新链接

**A**: 检查:
- rspress.config.ts 语法是否正确
- 是否完全重启了开发服务器(Ctrl+C 停止,然后 `pnpm dev` 重启)
- 浏览器缓存是否需要清除(硬刷新: Ctrl+Shift+R)

### Q: 代码块没有语法高亮

**A**: 检查:
- 代码块是否使用了正确的语言标识(````json```, ````bash``` 等)
- 语言标识拼写是否正确

### Q: 链接点击无效

**A**: 检查:
- 内部链接是否使用绝对路径(如 `/guide/installation` 而非 `./installation`)
- 外部链接是否包含完整的协议(如 `https://` 而非 `www.`)

---

## 下一步

验证通过后,可以执行 `/speckit.tasks` 命令生成任务清单,开始实际的文档编写工作。

Phase 1 设计阶段完成后,建议用户审查:
- `data-model.md`: 文档结构和内容框架
- `contracts/`: 文档大纲和配置修改清单
- `quickstart.md`: 验证步骤

审查通过后,执行实现任务并按本文档进行验证。
