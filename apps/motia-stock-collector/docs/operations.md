# 运维手册 - Motia 股市数据采集应用

本手册提供 Motia 股市数据采集应用的日常运维指南,包括监控、备份、故障排查和常规维护任务。

## 目录

- [日常运维任务](#日常运维任务)
- [监控和告警](#监控和告警)
- [备份和恢复](#备份和恢复)
- [故障排查](#故障排查)
- [性能调优](#性能调优)
- [安全维护](#安全维护)
- [数据管理](#数据管理)
- [升级和维护](#升级和维护)

## 日常运维任务

### 每日检查清单

```bash
#!/bin/bash
# daily-check.sh - 每日健康检查脚本

echo "=== Motia 股市数据采集应用 - 每日健康检查 ==="
echo "检查时间: $(date)"
echo ""

# 1. 检查应用状态
echo "1. 应用状态:"
systemctl is-active motia-stock-collector && echo "✓ 应用运行正常" || echo "✗ 应用未运行"

# 2. 检查数据采集任务
echo ""
echo "2. 最近采集任务:"
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
SELECT
  task_name,
  status,
  records_count,
  datetime(start_time) as start_time
FROM task_logs
WHERE DATE(start_time) = DATE('now')
ORDER BY start_time DESC
LIMIT 5;
EOF

# 3. 检查数据库大小
echo ""
echo "3. 数据库状态:"
du -h /opt/motia-stock-collector/data/stock.db
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
SELECT
  'daily_quotes' as table,
  COUNT(*) as count,
  DATE(MIN(trade_date)) as earliest,
  DATE(MAX(trade_date)) as latest
FROM daily_quotes;
EOF

# 4. 检查磁盘空间
echo ""
echo "4. 磁盘空间:"
df -h /opt/motia-stock-collector | tail -n 1

# 5. 检查错误日志
echo ""
echo "5. 最近错误日志:"
journalctl -u motia-stock-collector -p err -n 5 --no-pager

echo ""
echo "=== 检查完成 ==="
```

### 每周维护任务

```bash
#!/bin/bash
# weekly-maintenance.sh - 每周维护脚本

echo "=== 每周维护任务 ==="

# 1. 数据库优化
echo "1. 优化数据库..."
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
VACUUM;
ANALYZE;
EOF

# 2. 清理旧日志 (保留 6 个月)
echo "2. 清理旧任务日志..."
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
DELETE FROM task_logs
WHERE created_at < datetime('now', '-6 months');
EOF

# 3. 检查数据完整性
echo "3. 检查数据完整性..."
sqlite3 /opt/motia-stock-collector/data/stock.db "PRAGMA integrity_check;"

# 4. 备份数据库
echo "4. 创建数据库备份..."
backup_dir="/opt/motia-stock-collector/data/backups"
mkdir -p "$backup_dir"
cp /opt/motia-stock-collector/data/stock.db "$backup_dir/stock_$(date +%Y%m%d).db"

# 5. 清理旧备份 (保留最近 30 天)
echo "5. 清理旧备份..."
find "$backup_dir" -name "stock_*.db" -mtime +30 -delete

echo "=== 维护任务完成 ==="
```

### 每月审计任务

- 审查任务执行成功率
- 检查 API 使用配额
- 审查系统日志中的异常
- 更新文档和操作手册
- 安全更新和补丁

## 监控和告警

### 应用监控

#### 1. 使用 Motia Workbench

```bash
# 访问 Workbench
http://your-server:3000

# 主要监控指标:
# - Steps 执行状态 (Traces 标签)
# - 实时日志 (Logs 标签)
# - 工作流可视化 (Workflow 标签)
# - 性能指标 (Metrics 标签)
```

#### 2. 使用命令行工具

```bash
# 查看最近任务执行状态
./scripts/check-tasks.sh

#!/bin/bash
# check-tasks.sh
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
.mode column
.headers on
SELECT
  task_name,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
  ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) || '%' as success_rate
FROM task_logs
WHERE created_at >= datetime('now', '-7 days')
GROUP BY task_name
ORDER BY task_name;
EOF
```

### 系统监控

#### CPU 和内存监控

```bash
# 实时监控
htop

# 查看应用资源使用
ps aux | grep motia

# 查看 Node.js 进程详细信息
top -p $(pgrep -f "motia-stock-collector")
```

#### 磁盘监控

```bash
# 磁盘使用情况
df -h

# 数据目录大小
du -sh /opt/motia-stock-collector/data/*

# 监控磁盘 I/O
iostat -x 5
```

#### 网络监控

```bash
# 检查端口监听
netstat -tlnp | grep 3000

# 监控网络连接
ss -s

# 检查 API 调用
tcpdump -i any -nn port 443 and host api.tushare.pro
```

### 告警配置

#### 1. 邮件告警

创建告警脚本:

```bash
#!/bin/bash
# alert.sh - 发送邮件告警

RECIPIENT="admin@example.com"
SUBJECT="Motia Stock Collector Alert"
MESSAGE=$1

echo "$MESSAGE" | mail -s "$SUBJECT" "$RECIPIENT"
```

#### 2. 集成到监控检查

```bash
# 在每日检查脚本中添加告警逻辑
if ! systemctl is-active motia-stock-collector > /dev/null; then
    ./alert.sh "应用服务已停止!"
fi

# 检查失败任务
FAILED_COUNT=$(sqlite3 /opt/motia-stock-collector/data/stock.db \
  "SELECT COUNT(*) FROM task_logs WHERE status='FAILED' AND DATE(start_time) = DATE('now')")

if [ "$FAILED_COUNT" -gt 3 ]; then
    ./alert.sh "今日任务失败次数超过阈值: $FAILED_COUNT"
fi
```

#### 3. 使用 Prometheus + Grafana (高级)

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'motia-stock-collector'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

## 备份和恢复

### 备份策略

#### 1. 自动备份配置

创建备份脚本:

```bash
#!/bin/bash
# backup.sh - 数据库自动备份脚本

APP_DIR="/opt/motia-stock-collector"
DATA_DIR="$APP_DIR/data"
BACKUP_DIR="$DATA_DIR/backups"
REMOTE_BACKUP_DIR="/path/to/remote/backup"  # 远程备份位置

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份文件名
BACKUP_FILE="stock_$(date +%Y%m%d_%H%M%S).db"

echo "开始备份数据库..."

# 1. 本地备份
sqlite3 "$DATA_DIR/stock.db" ".backup '$BACKUP_DIR/$BACKUP_FILE'"

if [ $? -eq 0 ]; then
    echo "✓ 本地备份成功: $BACKUP_FILE"

    # 2. 压缩备份
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "✓ 备份已压缩"

    # 3. 远程备份 (可选)
    if [ -d "$REMOTE_BACKUP_DIR" ]; then
        cp "$BACKUP_DIR/$BACKUP_FILE.gz" "$REMOTE_BACKUP_DIR/"
        echo "✓ 远程备份成功"
    fi

    # 4. 清理旧备份 (保留最近 30 天)
    find "$BACKUP_DIR" -name "stock_*.db.gz" -mtime +30 -delete
    echo "✓ 清理旧备份完成"

else
    echo "✗ 备份失败!"
    exit 1
fi

echo "备份完成"
```

#### 2. 配置 Cron 定时备份

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2:00 备份
0 2 * * * /opt/motia-stock-collector/scripts/backup.sh >> /var/log/motia-backup.log 2>&1

# 每周日凌晨 3:00 完整备份并上传到云存储
0 3 * * 0 /opt/motia-stock-collector/scripts/backup-to-cloud.sh >> /var/log/motia-backup.log 2>&1
```

### 恢复操作

#### 1. 恢复数据库

```bash
#!/bin/bash
# restore.sh - 数据库恢复脚本

if [ -z "$1" ]; then
    echo "用法: ./restore.sh <backup_file.db.gz>"
    echo ""
    echo "可用备份:"
    ls -lh /opt/motia-stock-collector/data/backups/stock_*.db.gz
    exit 1
fi

BACKUP_FILE=$1
DATA_DIR="/opt/motia-stock-collector/data"

# 停止应用
echo "停止应用服务..."
systemctl stop motia-stock-collector

# 备份当前数据库
echo "备份当前数据库..."
cp "$DATA_DIR/stock.db" "$DATA_DIR/stock.db.pre-restore.$(date +%Y%m%d_%H%M%S)"

# 解压并恢复
echo "恢复数据库..."
gunzip -c "$BACKUP_FILE" > "$DATA_DIR/stock.db"

if [ $? -eq 0 ]; then
    echo "✓ 数据库恢复成功"

    # 验证数据库完整性
    sqlite3 "$DATA_DIR/stock.db" "PRAGMA integrity_check;"

    # 启动应用
    echo "启动应用服务..."
    systemctl start motia-stock-collector

    echo "恢复完成"
else
    echo "✗ 恢复失败!"
    exit 1
fi
```

#### 2. 灾难恢复

```bash
# 完全灾难恢复步骤:

# 1. 在新服务器上重新部署应用
# (参考部署文档)

# 2. 停止应用
systemctl stop motia-stock-collector

# 3. 恢复最新备份
./restore.sh /path/to/latest/backup.db.gz

# 4. 验证配置文件
cat .env

# 5. 启动应用
systemctl start motia-stock-collector

# 6. 验证功能
curl http://localhost:3000/api/quotes?limit=10
```

## 故障排查

### 常见问题诊断

#### 1. 应用无响应

```bash
# 检查进程状态
systemctl status motia-stock-collector

# 检查端口占用
netstat -tlnp | grep 3000

# 检查最近日志
journalctl -u motia-stock-collector -n 100 --no-pager

# 检查资源使用
top -p $(pgrep -f "motia-stock-collector")

# 尝试重启
systemctl restart motia-stock-collector
```

#### 2. 数据采集失败

```bash
# 查看最近失败任务
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
SELECT
  task_name,
  start_time,
  error_message
FROM task_logs
WHERE status = 'FAILED'
ORDER BY start_time DESC
LIMIT 10;
EOF

# 检查 API Token
grep TUSHARE_TOKEN /opt/motia-stock-collector/.env

# 测试 API 连接
curl -X POST https://api.tushare.pro \
  -H "Content-Type: application/json" \
  -d '{"api_name":"trade_cal","token":"your_token","params":{},"fields":""}'

# 查看限流状态
# (检查 API 响应中的 rate limit headers)
```

#### 3. 数据库错误

```bash
# 检查数据库完整性
sqlite3 /opt/motia-stock-collector/data/stock.db "PRAGMA integrity_check;"

# 检查数据库锁
lsof | grep stock.db

# 修复数据库 (如果损坏)
sqlite3 /opt/motia-stock-collector/data/stock.db << EOF
PRAGMA integrity_check;
REINDEX;
VACUUM;
EOF
```

#### 4. 内存泄漏

```bash
# 监控内存使用
watch -n 5 'ps aux | grep motia'

# 生成堆快照 (Node.js)
kill -USR2 $(pgrep -f "motia-stock-collector")

# 重启应用释放内存
systemctl restart motia-stock-collector
```

### 日志分析

```bash
# 查看错误日志
journalctl -u motia-stock-collector -p err -n 50

# 统计错误类型
journalctl -u motia-stock-collector -p err --no-pager | \
  grep -oP '(?<=Error: ).*' | sort | uniq -c | sort -rn

# 查看特定时间段日志
journalctl -u motia-stock-collector --since "2024-01-15 17:00" --until "2024-01-15 18:00"

# 实时查看日志
journalctl -u motia-stock-collector -f
```

## 性能调优

### 数据库优化

```bash
# 优化数据库
./scripts/optimize-db.sh

#!/bin/bash
# optimize-db.sh

DB_PATH="/opt/motia-stock-collector/data/stock.db"

echo "优化数据库..."

sqlite3 "$DB_PATH" << EOF
-- 分析表统计信息
ANALYZE;

-- 重建索引
REINDEX;

-- 清理碎片
VACUUM;

-- 启用 WAL 模式 (如果未启用)
PRAGMA journal_mode=WAL;

-- 调整缓存大小 (8MB)
PRAGMA cache_size=-8000;

-- 优化查询规划器
PRAGMA optimize;
EOF

echo "数据库优化完成"
```

### API 限流调优

```env
# .env 配置调整

# 根据账户等级调整
# 免费账户:
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000

# VIP 账户:
RATE_LIMIT_CONCURRENT=10
RATE_LIMIT_RETRY_DELAY=30000

# 高级账户:
RATE_LIMIT_CONCURRENT=20
RATE_LIMIT_RETRY_DELAY=10000
```

### Node.js 性能调优

```bash
# 编辑 systemd 服务文件
sudo nano /etc/systemd/system/motia-stock-collector.service

# 添加性能优化参数
[Service]
Environment="NODE_OPTIONS=--max-old-space-size=1024"  # 最大堆内存 1GB
Environment="UV_THREADPOOL_SIZE=8"  # libuv 线程池大小

# 重载并重启
sudo systemctl daemon-reload
sudo systemctl restart motia-stock-collector
```

## 安全维护

### 1. 定期安全检查

```bash
# 检查文件权限
ls -la /opt/motia-stock-collector/.env
ls -la /opt/motia-stock-collector/data/

# 应该是:
# -rw------- (600) .env
# drwxr-xr-x (755) data/

# 修正权限
chmod 600 /opt/motia-stock-collector/.env
chmod 755 /opt/motia-stock-collector/data/
```

### 2. 更新依赖

```bash
# 检查过期依赖
cd /opt/motia-stock-collector
pnpm outdated

# 更新依赖 (谨慎操作)
pnpm update

# 审计安全漏洞
pnpm audit

# 修复安全漏洞
pnpm audit fix
```

### 3. 密钥轮换

```bash
# 定期更换 Tushare Token (如果支持)
# 1. 在 Tushare 控制台生成新 Token
# 2. 更新 .env 文件
# 3. 重启应用

nano /opt/motia-stock-collector/.env
# 更新 TUSHARE_TOKEN

systemctl restart motia-stock-collector
```

## 数据管理

### 数据清理

```bash
# 清理旧数据
./scripts/cleanup-data.sh

#!/bin/bash
# cleanup-data.sh

DB_PATH="/opt/motia-stock-collector/data/stock.db"

echo "清理旧数据..."

# 1. 清理 6 个月前的任务日志
sqlite3 "$DB_PATH" << EOF
DELETE FROM task_logs
WHERE created_at < datetime('now', '-6 months');
EOF

# 2. 清理 5 年前的行情数据 (可选)
sqlite3 "$DB_PATH" << EOF
DELETE FROM daily_quotes
WHERE trade_date < date('now', '-5 years');
EOF

# 3. 优化数据库
sqlite3 "$DB_PATH" "VACUUM;"

echo "清理完成"
```

### 数据导出

```bash
# 导出全部数据为 CSV
./scripts/export-all-data.sh

#!/bin/bash
# export-all-data.sh

DB_PATH="/opt/motia-stock-collector/data/stock.db"
EXPORT_DIR="/opt/motia-stock-collector/data/exports"

mkdir -p "$EXPORT_DIR"

# 导出日线行情
sqlite3 -header -csv "$DB_PATH" \
  "SELECT * FROM daily_quotes ORDER BY trade_date, ts_code;" \
  > "$EXPORT_DIR/daily_quotes_$(date +%Y%m%d).csv"

# 导出交易日历
sqlite3 -header -csv "$DB_PATH" \
  "SELECT * FROM trade_calendar ORDER BY cal_date;" \
  > "$EXPORT_DIR/trade_calendar_$(date +%Y%m%d).csv"

# 压缩导出文件
tar -czf "$EXPORT_DIR/full_export_$(date +%Y%m%d).tar.gz" \
  -C "$EXPORT_DIR" \
  "daily_quotes_$(date +%Y%m%d).csv" \
  "trade_calendar_$(date +%Y%m%d).csv"

echo "数据导出完成: $EXPORT_DIR/full_export_$(date +%Y%m%d).tar.gz"
```

### 数据统计报告

```bash
# 生成数据统计报告
./scripts/generate-report.sh

#!/bin/bash
# generate-report.sh

DB_PATH="/opt/motia-stock-collector/data/stock.db"

echo "=== 数据统计报告 ==="
echo "生成时间: $(date)"
echo ""

# 数据量统计
echo "## 数据量统计"
sqlite3 "$DB_PATH" << EOF
.mode column
.headers on
SELECT
  'daily_quotes' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT ts_code) as unique_stocks,
  DATE(MIN(trade_date)) as earliest_date,
  DATE(MAX(trade_date)) as latest_date
FROM daily_quotes
UNION ALL
SELECT
  'trade_calendar',
  COUNT(*),
  NULL,
  DATE(MIN(cal_date)),
  DATE(MAX(cal_date))
FROM trade_calendar;
EOF

echo ""
echo "## 任务执行统计 (最近 30 天)"
sqlite3 "$DB_PATH" << EOF
SELECT
  task_name,
  COUNT(*) as executions,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
  ROUND(AVG(records_count), 0) as avg_records
FROM task_logs
WHERE created_at >= datetime('now', '-30 days')
GROUP BY task_name;
EOF

echo ""
echo "=== 报告结束 ==="
```

## 升级和维护

### 应用升级流程

```bash
#!/bin/bash
# upgrade.sh - 应用升级脚本

echo "=== 应用升级流程 ==="

# 1. 备份数据
echo "1. 备份数据..."
./scripts/backup.sh

# 2. 停止应用
echo "2. 停止应用..."
systemctl stop motia-stock-collector

# 3. 拉取最新代码
echo "3. 更新代码..."
cd /opt/motia-stock-collector/tushare-sdk
git fetch origin
git checkout 017-
git pull origin 017-

# 4. 更新依赖
echo "4. 更新依赖..."
cd apps/motia-stock-collector
pnpm install --prod

# 5. 运行数据库迁移 (如果需要)
echo "5. 运行数据库迁移..."
# ./scripts/migrate.sh

# 6. 启动应用
echo "6. 启动应用..."
systemctl start motia-stock-collector

# 7. 验证升级
echo "7. 验证升级..."
sleep 5
systemctl status motia-stock-collector
curl -f http://localhost:3000/api/quotes?limit=1 && echo "✓ 升级成功" || echo "✗ 升级失败"

echo "=== 升级完成 ==="
```

### 回滚流程

```bash
#!/bin/bash
# rollback.sh - 回滚到之前版本

echo "=== 回滚流程 ==="

if [ -z "$1" ]; then
    echo "用法: ./rollback.sh <git_commit_hash>"
    exit 1
fi

ROLLBACK_COMMIT=$1

# 1. 停止应用
systemctl stop motia-stock-collector

# 2. 回滚代码
cd /opt/motia-stock-collector/tushare-sdk
git checkout $ROLLBACK_COMMIT

# 3. 重新安装依赖
cd apps/motia-stock-collector
pnpm install --prod

# 4. 恢复数据库 (如果需要)
# ./restore.sh /path/to/backup.db.gz

# 5. 启动应用
systemctl start motia-stock-collector

echo "=== 回滚完成 ==="
```

## 运维检查表

### 启动检查表

- [ ] 验证 `.env` 文件配置正确
- [ ] 检查数据库文件存在且可访问
- [ ] 确认 Tushare Token 有效
- [ ] 验证网络连接正常
- [ ] 检查磁盘空间充足 (≥ 5GB)
- [ ] 确认端口 3000 未被占用
- [ ] 启动应用服务
- [ ] 访问 Workbench 确认正常
- [ ] 检查最近任务执行日志

### 维护检查表

- [ ] 每日健康检查
- [ ] 每周数据库优化
- [ ] 每周备份验证
- [ ] 每月安全审计
- [ ] 每月数据统计报告
- [ ] 季度性能评估
- [ ] 季度依赖更新

## 联系支持

如果遇到无法解决的问题,请:

1. 收集相关日志和错误信息
2. 记录问题复现步骤
3. 查看项目 GitHub Issues
4. 联系技术支持团队

## 相关文档

- [README.md](../README.md) - 项目概述
- [部署文档](./deployment.md) - 部署指南
- [Motia 官方文档](https://motia.dev) - Motia 框架文档
- [Tushare Pro 文档](https://tushare.pro/document/2) - Tushare API 文档
