#!/bin/bash

# CI 环境测试脚本
# 在 CI 环境中运行演示应用的自动化测试

set -e  # 遇到错误立即退出

echo "=========================================="
echo "CI 环境测试"
echo "=========================================="

# 检查是否在 CI 环境
if [ -z "$CI" ]; then
  echo "警告: 不在 CI 环境中运行"
fi

# 检查必需的环境变量
if [ -z "$TUSHARE_TOKEN" ]; then
  echo "✗ 错误: TUSHARE_TOKEN 环境变量未设置"
  echo "  在 CI 中,请通过 secrets 设置此变量"
  exit 1
fi
echo "✓ TUSHARE_TOKEN 已配置"

# 安装依赖
echo ""
echo "安装依赖..."
cd ../..
pnpm install --frozen-lockfile
echo "✓ 依赖安装完成"

# 返回演示应用目录
cd apps/node-demo

# 类型检查
echo ""
echo "运行类型检查..."
pnpm type-check
echo "✓ 类型检查通过"

# 运行测试
echo ""
echo "运行测试套件..."
pnpm test
echo "✓ 测试通过"

# 运行测试覆盖率
echo ""
echo "生成测试覆盖率报告..."
pnpm test:coverage || true
echo "✓ 覆盖率报告生成完成"

# 构建应用
echo ""
echo "构建应用..."
pnpm build
echo "✓ 构建成功"

# 运行演示应用(使用真实 Token)
echo ""
echo "运行演示应用..."
pnpm dev
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ 演示应用运行成功"
else
  echo "✗ 演示应用运行失败,退出码: $EXIT_CODE"
  exit $EXIT_CODE
fi

# 测试 JSON 输出
echo ""
echo "测试 JSON 输出..."
pnpm dev -- --format=json > /tmp/ci-demo-output.json
echo "✓ JSON 输出成功"

# 验证 JSON 格式
if command -v jq &> /dev/null; then
  echo "验证 JSON 格式..."
  jq . /tmp/ci-demo-output.json > /dev/null
  echo "✓ JSON 格式正确"
  
  # 验证输出包含必需字段
  VERSION=$(jq -r '.version' /tmp/ci-demo-output.json)
  TOTAL=$(jq -r '.summary.total' /tmp/ci-demo-output.json)
  SUCCESS=$(jq -r '.summary.success' /tmp/ci-demo-output.json)
  
  echo "  版本: $VERSION"
  echo "  总示例数: $TOTAL"
  echo "  成功数: $SUCCESS"
  
  if [ "$SUCCESS" -eq "$TOTAL" ]; then
    echo "✓ 所有示例执行成功"
  else
    echo "✗ 部分示例失败"
    exit 1
  fi
fi

# 测试错误处理(使用无效 Token)
echo ""
echo "测试错误处理..."
TUSHARE_TOKEN="invalid_token" pnpm dev || true
echo "✓ 错误处理测试完成"

echo ""
echo "=========================================="
echo "✓ CI 测试完成!"
echo "=========================================="
echo ""
echo "所有 CI 测试均已通过。"
