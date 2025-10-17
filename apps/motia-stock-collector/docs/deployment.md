# 部署文档 - Motia 股市数据采集应用

本文档提供了 Motia 股市数据采集应用的完整部署指南,包括本地开发环境、测试环境和生产环境的部署步骤。

## 目录

- [部署前准备](#部署前准备)
- [本地开发环境部署](#本地开发环境部署)
- [测试环境部署](#测试环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 容器化部署](#docker-容器化部署)
- [云平台部署](#云平台部署)
- [部署验证](#部署验证)
- [常见问题排查](#常见问题排查)

## 部署前准备

### 系统要求

| 组件 | 要求 | 推荐 |
|------|------|------|
| 操作系统 | Linux/macOS/Windows | Ubuntu 22.04 LTS / macOS 13+ |
| Node.js | 18.0.0+ | 20.x LTS |
| 内存 | 512MB+ | 1GB+ |
| 磁盘空间 | 5GB+ | 10GB+ (含备份) |
| 网络 | 稳定互联网连接 | 带宽 ≥ 10Mbps |

### 账号准备

1. **Tushare Pro 账户**
   - 注册地址: https://tushare.pro/register
   - 获取 API Token
   - 确认账户等级和限流配额(免费账户约 200次/分钟)

2. **服务器账号** (生产环境)
   - SSH 访问权限
   - sudo 权限(如需安装系统依赖)

### 依赖安装

#### Linux (Ubuntu/Debian)

```bash
# 更新包管理器
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 build-essential (编译 better-sqlite3 需要)
sudo apt install -y build-essential python3

# 安装 pnpm
npm install -g pnpm

# 验证安装
node --version  # 应显示 v20.x.x
pnpm --version  # 应显示 8.x.x
```

#### macOS

```bash
# 使用 Homebrew 安装 Node.js
brew install node@20

# 安装 pnpm
npm install -g pnpm

# 验证安装
node --version
pnpm --version
```

#### Windows

```bash
# 使用 Chocolatey 安装 Node.js
choco install nodejs-lts -y

# 或使用官方安装包
# https://nodejs.org/en/download/

# 安装 pnpm
npm install -g pnpm

# 安装构建工具 (编译 better-sqlite3 需要)
npm install -g windows-build-tools
```

## 本地开发环境部署

### 1. 克隆仓库

```bash
# 克隆项目
git checkout 017-
cd apps/motia-stock-collector
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 如果遇到 better-sqlite3 编译错误,尝试:
pnpm rebuild better-sqlite3
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

配置内容:

```env
# Tushare API Token (必填)
TUSHARE_TOKEN=your_32_character_token_here

# 数据库路径
DATABASE_PATH=./data/stock.db

# 日志级别
LOG_LEVEL=debug

# API 限流配置
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000

# Workbench 端口
WORKBENCH_PORT=3000
```

### 4. 初始化数据库

```bash
# 创建数据目录
mkdir -p data

# 运行应用,自动初始化数据库
pnpm dev
```

应用启动后会自动创建数据库表结构。

### 5. 访问 Workbench

打开浏览器访问: http://localhost:3000

## 测试环境部署

测试环境用于在正式上线前验证功能和性能。

### 1. 准备测试服务器

```bash
# SSH 连接到测试服务器
ssh user@test-server.example.com

# 创建应用目录
sudo mkdir -p /opt/motia-stock-collector
sudo chown $USER:$USER /opt/motia-stock-collector
cd /opt/motia-stock-collector
```

### 2. 部署代码

```bash
# 方式 1: Git 部署
git clone https://github.com/your-org/tushare-sdk.git
cd tushare-sdk
git checkout 017-
cd apps/motia-stock-collector

# 方式 2: 打包部署
# 在本地打包
tar -czf motia-stock-collector.tar.gz apps/motia-stock-collector
# 上传到服务器
scp motia-stock-collector.tar.gz user@test-server:/opt/
# 在服务器解压
tar -xzf motia-stock-collector.tar.gz
```

### 3. 安装依赖

```bash
cd /opt/motia-stock-collector/apps/motia-stock-collector
pnpm install --prod
```

### 4. 配置环境

```bash
# 配置环境变量
cp .env.example .env
nano .env

# 测试环境配置示例
TUSHARE_TOKEN=your_test_token
DATABASE_PATH=/opt/motia-stock-collector/data/stock-test.db
LOG_LEVEL=info
WORKBENCH_PORT=3000
```

### 5. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'motia-stock-collector-test',
    script: 'pnpm',
    args: 'start',
    cwd: '/opt/motia-stock-collector/apps/motia-stock-collector',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'test',
    },
  }],
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看日志
pm2 logs motia-stock-collector-test

# 查看状态
pm2 status

# 设置开机自启动
pm2 save
pm2 startup
```

## 生产环境部署

### 1. 服务器准备

```bash
# SSH 连接到生产服务器
ssh user@prod-server.example.com

# 创建应用目录
sudo mkdir -p /opt/motia-stock-collector
sudo mkdir -p /opt/motia-stock-collector/data/backups
sudo chown -R $USER:$USER /opt/motia-stock-collector
```

### 2. 部署应用

```bash
cd /opt/motia-stock-collector

# 克隆代码
git clone https://github.com/your-org/tushare-sdk.git
cd tushare-sdk
git checkout 017-
cd apps/motia-stock-collector

# 安装生产依赖
pnpm install --prod
```

### 3. 生产环境配置

```bash
# 配置环境变量
cp .env.example .env
nano .env

# 生产环境配置
TUSHARE_TOKEN=your_production_token
DATABASE_PATH=/opt/motia-stock-collector/data/stock.db
LOG_LEVEL=info
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000
WORKBENCH_PORT=3000
```

### 4. 安全加固

```bash
# 限制文件权限
chmod 600 .env
chmod 755 data/
chmod 644 data/*.db

# 配置防火墙 (Ubuntu/Debian)
sudo ufw allow 3000/tcp  # 仅在需要外部访问 Workbench 时
sudo ufw enable

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### 5. 使用 Systemd 管理服务

创建 systemd 服务文件:

```bash
sudo nano /etc/systemd/system/motia-stock-collector.service
```

内容:

```ini
[Unit]
Description=Motia Stock Collector Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/motia-stock-collector/apps/motia-stock-collector
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=motia-stock-collector

[Install]
WantedBy=multi-user.target
```

启动服务:

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start motia-stock-collector

# 设置开机自启动
sudo systemctl enable motia-stock-collector

# 查看状态
sudo systemctl status motia-stock-collector

# 查看日志
sudo journalctl -u motia-stock-collector -f
```

### 6. 配置反向代理 (可选)

如果需要通过域名访问 Workbench,可以使用 Nginx 作为反向代理:

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/motia-stock-collector
```

Nginx 配置:

```nginx
server {
    listen 80;
    server_name stock-collector.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置:

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/motia-stock-collector /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

配置 HTTPS (使用 Let's Encrypt):

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d stock-collector.example.com

# 自动续期
sudo certbot renew --dry-run
```

## Docker 容器化部署

### 1. 创建 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

# 安装构建工具
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --prod

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  motia-stock-collector:
    build: .
    container_name: motia-stock-collector
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - TUSHARE_TOKEN=${TUSHARE_TOKEN}
      - DATABASE_PATH=/app/data/stock.db
      - LOG_LEVEL=info
      - WORKBENCH_PORT=3000
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3. 构建和运行

```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重启容器
docker-compose restart
```

### 4. Docker 数据备份

```bash
# 备份数据卷
docker run --rm \
  -v motia-stock-collector_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/data-$(date +%Y%m%d).tar.gz /data

# 恢复数据
docker run --rm \
  -v motia-stock-collector_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/data-20241015.tar.gz -C /
```

## 云平台部署

### AWS 部署

#### 使用 EC2

```bash
# 1. 启动 EC2 实例
# - AMI: Ubuntu 22.04 LTS
# - 实例类型: t3.small (推荐) 或 t3.micro (测试)
# - 存储: 20GB SSD

# 2. 配置安全组
# - SSH (22): 你的 IP
# - HTTP (80): 0.0.0.0/0 (如果使用 Nginx)
# - Custom TCP (3000): 你的 IP (Workbench 访问)

# 3. 连接到实例
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# 4. 按照生产环境部署步骤安装应用
```

#### 使用 ECS (Docker)

```bash
# 1. 创建 ECR 仓库
aws ecr create-repository --repository-name motia-stock-collector

# 2. 构建并推送镜像
docker build -t motia-stock-collector .
docker tag motia-stock-collector:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/motia-stock-collector:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/motia-stock-collector:latest

# 3. 创建 ECS 任务定义和服务
# (通过 AWS Console 或 CLI)
```

### Azure 部署

```bash
# 1. 创建 Azure 虚拟机
az vm create \
  --resource-group myResourceGroup \
  --name motia-stock-collector-vm \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys

# 2. 连接并部署
ssh azureuser@<vm-ip-address>
# 按照生产环境部署步骤安装应用
```

### Google Cloud Platform

```bash
# 1. 创建 Compute Engine 实例
gcloud compute instances create motia-stock-collector \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-small \
  --zone=us-central1-a

# 2. 连接并部署
gcloud compute ssh motia-stock-collector --zone=us-central1-a
# 按照生产环境部署步骤安装应用
```

## 部署验证

### 1. 健康检查

```bash
# 检查应用是否运行
curl http://localhost:3000/health

# 检查 API 是否正常
curl "http://localhost:3000/api/quotes?limit=10"

# 检查数据库连接
sqlite3 data/stock.db "SELECT COUNT(*) FROM daily_quotes;"
```

### 2. 功能测试

```bash
# 测试交易日历采集
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"topic":"calendar.update.needed","data":{}}'

# 测试数据采集
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"topic":"data.collection.triggered","data":{"tradeDate":"2024-01-15"}}'

# 查询任务日志
curl "http://localhost:3000/api/task-logs?limit=10"
```

### 3. 性能测试

```bash
# 使用 Apache Bench 测试
ab -n 100 -c 10 "http://localhost:3000/api/quotes?limit=100"

# 或使用 wrk
wrk -t4 -c100 -d30s "http://localhost:3000/api/quotes?limit=100"
```

## 常见问题排查

### 1. 应用无法启动

**症状**: 应用启动后立即退出

**排查步骤**:

```bash
# 检查日志
journalctl -u motia-stock-collector -n 50

# 或
pm2 logs motia-stock-collector

# 检查环境变量
env | grep TUSHARE_TOKEN

# 检查端口占用
netstat -tlnp | grep 3000

# 手动启动查看错误
cd /opt/motia-stock-collector/apps/motia-stock-collector
NODE_ENV=production pnpm start
```

**常见原因**:
- Tushare Token 未配置或无效
- 端口 3000 已被占用
- 数据目录权限不足
- 依赖未正确安装

### 2. 数据库连接失败

**症状**: 报错 "Cannot open database"

**解决方案**:

```bash
# 检查数据目录权限
ls -la data/
chmod 755 data/
chmod 644 data/*.db

# 检查磁盘空间
df -h

# 手动创建数据库
sqlite3 data/stock.db ".databases"
```

### 3. API 限流错误

**症状**: 频繁出现 HTTP 429 错误

**解决方案**:

```bash
# 调整限流参数
nano .env
# 修改 RATE_LIMIT_CONCURRENT=3
# 修改 RATE_LIMIT_RETRY_DELAY=120000

# 重启应用
systemctl restart motia-stock-collector
```

### 4. 内存不足

**症状**: 应用崩溃或 OOM 错误

**解决方案**:

```bash
# 检查内存使用
free -h
top

# 调整 Node.js 内存限制
# 编辑 systemd 服务文件
sudo nano /etc/systemd/system/motia-stock-collector.service

# 添加环境变量
Environment="NODE_OPTIONS=--max-old-space-size=512"

# 重启服务
sudo systemctl daemon-reload
sudo systemctl restart motia-stock-collector
```

### 5. Workbench 无法访问

**症状**: 浏览器无法连接到 Workbench

**解决方案**:

```bash
# 检查应用是否运行
systemctl status motia-stock-collector

# 检查端口监听
netstat -tlnp | grep 3000

# 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp

# 检查 Nginx 配置 (如果使用)
sudo nginx -t
sudo systemctl status nginx
```

## 回滚策略

### 1. 版本回滚

```bash
# Git 回滚
cd /opt/motia-stock-collector/tushare-sdk
git checkout 017-
git pull
git checkout <previous-commit-hash>

# 重启应用
systemctl restart motia-stock-collector
```

### 2. 数据库回滚

```bash
# 恢复数据库备份
cp data/backups/stock_20241015.db data/stock.db

# 重启应用
systemctl restart motia-stock-collector
```

### 3. 容器回滚

```bash
# 回滚到之前的镜像
docker-compose down
docker-compose pull  # 拉取指定版本
docker-compose up -d
```

## 监控和日志

### 1. 应用日志

```bash
# Systemd 日志
journalctl -u motia-stock-collector -f

# PM2 日志
pm2 logs motia-stock-collector

# 日志文件
tail -f logs/app.log
```

### 2. 系统监控

```bash
# CPU 和内存监控
top
htop

# 磁盘监控
df -h
du -sh data/

# 网络监控
netstat -an | grep 3000
```

### 3. 数据库监控

```bash
# 查看数据库大小
du -h data/stock.db

# 查询记录数
sqlite3 data/stock.db << EOF
SELECT
  'daily_quotes' as table_name,
  COUNT(*) as count
FROM daily_quotes
UNION ALL
SELECT
  'trade_calendar',
  COUNT(*)
FROM trade_calendar
UNION ALL
SELECT
  'task_logs',
  COUNT(*)
FROM task_logs;
EOF
```

## 备份和恢复

详细的备份策略请参考 [运维手册](./operations.md)。

## 总结

按照本文档的步骤,你应该能够成功部署 Motia 股市数据采集应用到各种环境。如有问题,请参考常见问题排查部分或联系技术支持。

## 相关文档

- [README.md](../README.md) - 项目概述
- [运维手册](./operations.md) - 日常运维指南
- [Motia 官方文档](https://motia.dev) - Motia 框架文档
