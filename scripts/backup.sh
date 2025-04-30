#!/bin/bash

# 配置信息
BACKUP_DIR="/root/backups"
APP_DIR="/root/my-personal-docs"
DATE=$(date +%Y%m%d)
KEEP_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份媒体文件
echo "Backing up media files..."
tar -czf $BACKUP_DIR/my-personal-docs-media-$DATE.tar.gz $APP_DIR/public/music $APP_DIR/public/photos

# 备份 Nginx 配置
echo "Backing up Nginx configuration..."
cp /etc/nginx/sites-available/my-personal-docs $BACKUP_DIR/nginx-config-$DATE.conf

# 删除超过 30 天的备份
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "my-personal-docs-media-*.tar.gz" -mtime +$KEEP_DAYS -delete
find $BACKUP_DIR -name "nginx-config-*.conf" -mtime +$KEEP_DAYS -delete

echo "Backup completed!"
echo "Backup files are stored in $BACKUP_DIR"
echo "- Media backup: my-personal-docs-media-$DATE.tar.gz"
echo "- Nginx config: nginx-config-$DATE.conf" 