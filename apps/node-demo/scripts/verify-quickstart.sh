#!/bin/bash

# 验证 quickstart.md 中的完整流程
# 此脚本按照 quickstart.md 的步骤验证演示应用

set -e  # 遇到错误立即退出

echo "=========================================="
echo "验证 Quickstart 流程"
echo "=========================================="

# 检查环境
echo ""
echo "步骤 1: 检查环境"
echo "---"

# 检查 Node.js 版本
NODE_VERSION=$(node --version)
echo "✓ Node.js 版本: $NODE_VERSION"

# 检查 pnpm 版本
PNPM_VERSION=$(pnpm --version)
echo "✓ pnpm 版本: $PNPM_VERSION"

# 检查 .env 文件
if [ ! -f ".env" ]; then
  echo "✗ 错误: 缺少 .env 文件"
  echo "  请复制 .env.example 并配置 TUSHARE_TOKEN"
  exit 1
fi
echo "✓ .env 文件存在"

# 检查 TUSHARE_TOKEN
source .env
if [ -z "$TUSHARE_TOKEN" ]; then
  echo "✗ 错误: TUSHARE_TOKEN 未设置"
  echo "  请在 .env 文件中设置您的 Token"
  exit 1
fi
echo "✓ TUSHARE_TOKEN 已配置"

# 安装依赖
echo ""
echo "步骤 2: 安装依赖"
echo "---"
cd ../..
pnpm install
echo "✓ 依赖安装完成"

# 返回演示应用目录
cd apps/node-demo

# 运行演示应用
echo ""
echo "步骤 3: 运行演示应用"
echo "---"
pnpm dev
echo "✓ 演示应用运行成功"

# 测试命令行参数
echo ""
echo "步骤 4: 测试命令行参数"
echo "---"

echo "测试 --example=stock-list"
pnpm dev -- --example=stock-list
echo "✓ 单个示例运行成功"

echo "测试 --verbose"
pnpm dev -- --verbose --example=stock-list
echo "✓ Verbose 模式运行成功"

echo "测试 --format=json"
pnpm dev -- --format=json --example=stock-list > /tmp/demo-output.json
echo "✓ JSON 输出成功"

# 验证 JSON 输出格式
if command -v jq &> /dev/null; then
  echo "验证 JSON 格式..."
  jq . /tmp/demo-output.json > /dev/null
  echo "✓ JSON 格式正确"
fi

# 运行测试
echo ""
echo "步骤 5: 运行测试"
echo "---"
pnpm test
echo "✓ 测试通过"

# 类型检查
echo ""
echo "步骤 6: 类型检查"
echo "---"
pnpm type-check
echo "✓ 类型检查通过"

# 构建
echo ""
echo "步骤 7: 构建应用"
echo "---"
pnpm build
echo "✓ 构建成功"

# 运行构建后的代码
echo ""
echo "步骤 8: 运行构建后的代码"
echo "---"
pnpm start
echo "✓ 构建后的代码运行成功"

echo ""
echo "=========================================="
echo "✓ Quickstart 验证完成!"
echo "=========================================="
echo ""
echo "所有步骤均已成功完成。"
echo "演示应用已准备好供用户使用。"
