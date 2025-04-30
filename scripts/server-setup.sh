#!/bin/bash

# 更新系统
apt update && apt upgrade -y

# 安装必要的软件
apt install -y nodejs npm nginx certbot python3-certbot-nginx

# 安装 PM2
npm install -g pm2

# 创建应用目录
mkdir -p /root/my-personal-docs
cd /root/my-personal-docs

# 克隆代码
git clone https://github.com/yukito0209/my-personal-docs.git .

# 安装依赖
npm install

# 构建应用
npm run build

# 配置 Nginx
cat > /etc/nginx/sites-available/my-personal-docs << 'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name yukitoqaq.art www.yukitoqaq.art;

    # 将 HTTP 重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yukitoqaq.art www.yukitoqaq.art;

    # SSL 配置将由 Certbot 自动添加

    # 主应用代理
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

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 媒体文件缓存配置
    location /music/ {
        alias /root/my-personal-docs/public/music/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
        add_header X-Content-Type-Options "nosniff";
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
    }

    location /photos/ {
        alias /root/my-personal-docs/public/photos/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
        add_header X-Content-Type-Options "nosniff";
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
    }

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 性能优化
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
}
EOL

# 启用站点配置
ln -sf /etc/nginx/sites-available/my-personal-docs /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 申请 SSL 证书
certbot --nginx -d yukitoqaq.art -d www.yukitoqaq.art --non-interactive --agree-tos --email yukitoqaq@gmail.com

# 使用 PM2 启动应用
pm2 start npm --name "my-personal-docs" -- start

# 设置 PM2 开机自启
pm2 save
pm2 startup

# 配置自动更新 SSL 证书
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet") | crontab - 