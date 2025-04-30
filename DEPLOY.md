# 个人文档网站部署指南

## 目录
1. [环境信息](#环境信息)
2. [前期准备](#前期准备)
3. [首次部署](#首次部署)
4. [更新部署](#更新部署)
5. [维护指南](#维护指南)
6. [备份策略](#备份策略)
7. [故障排查](#故障排查)
8. [安全加固](#安全加固)
9. [性能优化](#性能优化)

## 环境信息

### 服务器配置
- IP 地址：154.9.24.189
- 操作系统：Ubuntu Server 24.04 LTS
- 用户名：root
- 密码：KWdURGrCCDF13bqu
- 端口：22（SSH）、80（HTTP）、443（HTTPS）

### 域名信息
- 主域名：yukitoqaq.art
- 子域名：www.yukitoqaq.art
- DNS 记录：
  ```
  yukitoqaq.art.      A     154.9.24.189
  www.yukitoqaq.art.  A     154.9.24.189
  ```

### 代码仓库
- 地址：https://github.com/yukito0209/my-personal-docs.git
- 分支：master
- 技术栈：Next.js、TypeScript、TailwindCSS

## 前期准备

### 1. 本地环境配置
```bash
# 安装 Node.js (推荐使用 nvm)
winget install -e --id OpenJS.NodeJS.LTS

# 克隆代码仓库
git clone https://github.com/yukito0209/my-personal-docs.git
cd my-personal-docs

# 安装依赖
npm install
```

### 2. 域名配置
1. 登录域名管理面板
2. 添加 A 记录：
   - 主域名：yukitoqaq.art -> 154.9.24.189
   - www：www.yukitoqaq.art -> 154.9.24.189
3. 等待 DNS 解析生效（通常需要 5-10 分钟）

### 3. 服务器初始配置
```bash
# SSH 连接到服务器
ssh root@154.9.24.189

# 更新系统包
apt update && apt upgrade -y

# 设置时区
timedatectl set-timezone Asia/Shanghai

# 安装基础工具
apt install -y vim curl git htop
```

## 首次部署

### 1. 上传部署脚本
```bash
# 在本地执行
cd /path/to/my-personal-docs
scp scripts/server-setup.sh root@154.9.24.189:/root/
scp scripts/backup.sh root@154.9.24.189:/root/
```

### 2. 执行服务器设置脚本
```bash
# SSH 连接到服务器
ssh root@154.9.24.189

# 设置执行权限
chmod +x /root/server-setup.sh
chmod +x /root/backup.sh

# 执行设置脚本
./server-setup.sh
```

### 3. 同步媒体文件
```bash
# 在本地执行（Windows）
scripts\sync-media.bat
```

### 4. 验证部署
1. 检查服务状态：
   ```bash
   # 检查 Nginx 状态
   systemctl status nginx

   # 检查 PM2 状态
   pm2 status
   ```

2. 验证网站访问：
   - HTTP: http://yukitoqaq.art
   - HTTPS: https://yukitoqaq.art
   - www: https://www.yukitoqaq.art

3. 检查 SSL 证书：
   ```bash
   certbot certificates
   ```

## 更新部署

### 1. 更新代码
```bash
# SSH 连接到服务器
ssh root@154.9.24.189

# 进入项目目录
cd /root/my-personal-docs

# 拉取最新代码
git pull origin master

# 安装依赖
npm install

# 构建项目
npm run build

# 重启应用
pm2 restart my-personal-docs
```

### 2. 更新媒体文件
```bash
# 在本地执行（Windows）
scripts\sync-media.bat
```

### 3. 验证更新
1. 检查应用日志：
   ```bash
   pm2 logs my-personal-docs
   ```

2. 验证新功能和更改
3. 检查媒体文件是否正确同步

## 维护指南

### 日常维护命令

1. 应用管理：
   ```bash
   # 查看应用状态
   pm2 status

   # 查看实时日志
   pm2 logs my-personal-docs

   # 重启应用
   pm2 restart my-personal-docs

   # 停止应用
   pm2 stop my-personal-docs

   # 启动应用
   pm2 start my-personal-docs
   ```

2. Nginx 管理：
   ```bash
   # 测试配置
   nginx -t

   # 重启 Nginx
   systemctl restart nginx

   # 重新加载配置
   systemctl reload nginx

   # 查看错误日志
   tail -f /var/log/nginx/error.log
   ```

3. SSL 证书管理：
   ```bash
   # 查看证书
   certbot certificates

   # 手动更新证书
   certbot renew

   # 测试自动更新
   certbot renew --dry-run
   ```

### 定期维护任务

1. 系统更新：
   ```bash
   # 更新系统包
   apt update && apt upgrade -y

   # 清理不需要的包
   apt autoremove -y
   ```

2. 日志清理：
   ```bash
   # 清理旧日志
   find /var/log -type f -name "*.log.*" -mtime +30 -delete
   ```

3. 磁盘空间检查：
   ```bash
   # 检查磁盘使用情况
   df -h

   # 查看大文件
   du -h --max-depth=1 /root/my-personal-docs
   ```

## 备份策略

### 1. 自动备份
已配置每周日凌晨 3 点自动备份：
```bash
# 查看定时任务
crontab -l

# 手动执行备份
/root/backup.sh
```

### 2. 备份内容
- 媒体文件（音乐和照片）
- Nginx 配置
- SSL 证书

### 3. 备份管理
```bash
# 查看备份文件
ls -lh /root/backups

# 手动创建备份
cd /root
tar -czf my-personal-docs-backup-$(date +%Y%m%d).tar.gz my-personal-docs/public/music my-personal-docs/public/photos
```

## 故障排查

### 1. 网站无法访问
1. 检查服务状态：
   ```bash
   systemctl status nginx
   pm2 status
   ```

2. 检查日志：
   ```bash
   tail -f /var/log/nginx/error.log
   pm2 logs my-personal-docs
   ```

3. 检查端口：
   ```bash
   netstat -tulpn | grep -E ':(80|443|3000)'
   ```

### 2. SSL 证书问题
1. 验证证书：
   ```bash
   certbot certificates
   ```

2. 手动更新：
   ```bash
   certbot renew --force-renewal
   ```

### 3. 媒体文件问题
1. 检查权限：
   ```bash
   ls -la /root/my-personal-docs/public/music
   ls -la /root/my-personal-docs/public/photos
   ```

2. 检查 Nginx 配置：
   ```bash
   nginx -t
   cat /etc/nginx/sites-available/my-personal-docs
   ```

## 安全加固

### 1. 防火墙配置
```bash
# 安装 UFW
apt install ufw

# 配置规则
ufw allow ssh
ufw allow http
ufw allow https

# 启用防火墙
ufw enable
```

### 2. SSH 安全
```bash
# 修改 SSH 配置
vim /etc/ssh/sshd_config

# 建议的安全设置：
# PermitRootLogin prohibit-password
# PasswordAuthentication no
# MaxAuthTries 3

# 重启 SSH 服务
systemctl restart sshd
```

### 3. 文件权限
```bash
# 设置适当的文件权限
chown -R root:root /root/my-personal-docs
chmod -R 755 /root/my-personal-docs/public
```

## 性能优化

### 1. Nginx 优化
已配置：
- HTTP/2 支持
- Gzip 压缩
- 静态文件缓存
- 安全头部

### 2. 应用优化
- PM2 进程管理
- Next.js 生产构建
- 图片优化

### 3. 监控
```bash
# 系统资源监控
htop

# 磁盘 I/O
iostat -x 1

# 网络连接
netstat -ant | grep ESTABLISHED | wc -l
```

## 常见问题

1. Q: 如何添加新的媒体文件？
   A: 将文件放入本地 `public/music` 或 `public/photos` 目录，然后运行 `scripts\sync-media.bat`

2. Q: 如何更改域名？
   A: 修改 Nginx 配置和 SSL 证书配置，然后重新申请证书

3. Q: 如何扩展磁盘空间？
   A: 参考云服务商的磁盘扩容指南，然后执行 `resize2fs` 命令 