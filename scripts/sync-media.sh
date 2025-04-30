#!/bin/bash

# 配置信息
REMOTE_USER="root"
REMOTE_HOST="154.9.24.189"
REMOTE_PATH="/root/my-personal-docs/public"
LOCAL_PATH="./public"

# 确保远程目录存在
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH/music $REMOTE_PATH/photos"

# 同步音乐文件
echo "Syncing music files..."
rsync -avz --progress "$LOCAL_PATH/music/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/music/"

# 同步照片
echo "Syncing photos..."
rsync -avz --progress "$LOCAL_PATH/photos/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/photos/"

echo "Media sync completed!" 