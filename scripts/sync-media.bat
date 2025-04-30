@echo off
echo Syncing media files to server...

REM 同步音乐文件
echo Syncing music files...
scp -r .\public\music\* root@154.9.24.189:/root/my-personal-docs/public/music/

REM 同步照片
echo Syncing photos...
scp -r .\public\photos\* root@154.9.24.189:/root/my-personal-docs/public/photos/

echo Media sync completed! 