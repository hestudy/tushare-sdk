#!/bin/bash

# 检查开发服务器端口配置
echo "🔍 检查 rspress 开发服务器配置..."
echo ""

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 已被占用"
    echo "占用进程:"
    lsof -Pi :3000 -sTCP:LISTEN
    echo ""
    echo "建议: 停止占用进程或使用 reuseExistingServer 选项"
else
    echo "✅ 端口 3000 可用"
fi

echo ""
echo "📝 配置信息:"
echo "  - rspress 默认端口: 3000"
echo "  - playwright.config.ts: webServer.url = http://localhost:3000"
echo "  - playwright.config.ts: baseURL = http://localhost:3000"
echo ""
echo "💡 运行 E2E 测试:"
echo "  pnpm test:e2e"
echo ""
echo "📌 注意:"
echo "  - rspress 会自动选择可用端口(3000, 3001, 3002...)"
echo "  - Playwright 会等待 http://localhost:3000 可访问后开始测试"
