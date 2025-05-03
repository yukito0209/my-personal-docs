# Yukito の 复式高层

[English](./README_EN.md) | 简体中文

这是我的个人网站项目，使用 Next.js 和 Fumadocs UI 构建的现代化个人主页和文档系统。

## 🌟 功能特点

### 🎨 UI 与交互
- 响应式设计，支持移动端和桌面端
- **多处应用毛玻璃 (Frosted Glass) UI 效果**
- **全局应用霞鹜文楷 (LXGW WenKai) 字体**
- **自定义亮/暗模式切换按钮**
- **深/浅色模式平滑背景图片过渡**
- **照片卡片悬停发光效果**

### 🏠 个人主页
- 个人信息展示
- 教育经历展示
- 兴趣爱好展示
- 作品集展示
- 实时公告栏

### 🎵 音乐播放器
- **基于 React Context 的定制化音乐播放器**
- 支持本地音乐文件播放 (MP3, WAV, OGG, FLAC)
- 专辑封面显示
- 播放控制（播放/暂停、上一首/下一首）
- 音量控制与进度条

### 📚 文档系统
- 基于 Fumadocs 的文档管理
- 支持 MDX 格式
- 文档搜索功能
- **带毛玻璃效果的内容区域与目录**
- **导航栏添加 GitHub 仓库链接**

### 🖼️ 相册功能
- 瀑布流布局展示
- **图片灯箱查看器 (支持键盘导航)**
- 支持高清图片与图片懒加载
- 响应式设计

### 🦶 全局页脚
- 显示版权和相关链接

## 🛠️ 技术栈

- **框架**: Next.js 15.3.1
- **UI 组件**: Fumadocs UI 15.2.12
- **样式**: TailwindCSS 4.1.4
- **文档**: Fumadocs MDX 11.6.1
- **图标**: Lucide React 0.503.0, **Simple Icons (品牌 SVG 图标库)**
- **类型检查**: TypeScript 5.8.3
- **状态管理**: **React Context API (用于主题和音乐播放器)**

## 📦 项目结构

```
my-personal-docs/
├── app/                   # Next.js 应用目录
│   ├── (home)/            # 主页相关组件
│   ├── api/               # API 路由
│   ├── docs/              # 文档系统
│   ├── gallery/           # 相册功能
│   └── components/        # 共享组件
├── content/               # 内容文件
│   └── docs/              # 文档内容
├── public/                # 静态资源
│   ├── music/             # 音乐文件
│   ├── photos/            # 图片文件
│   └── logos/             # Logo 文件
├── lib/                   # 工具函数和配置
└── .source/               # 源文件目录
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/yukito0209/my-personal-docs.git

# 进入项目目录
cd my-personal-docs

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 🔧 配置说明

### 音乐播放器

将音乐文件放置在 `public/music` 目录下，支持的格式：
- MP3
- WAV
- OGG
- FLAC

### 相册

将图片文件放置在 `public/photos` 目录下，建议进行适当的图片压缩以提升加载性能。

### 文档

文档使用 MDX 格式，放置在 `content/docs` 目录下。

## 📝 开发注意事项

1. 图片优化
   - 使用 Next.js 的 Image 组件进行图片优化
   - 大图片建议使用 CDN 加速
   - 实现图片懒加载

2. 性能优化
   - 组件适当拆分
   - 使用 React.memo() 优化渲染性能
   - 图片和音频文件进行合理压缩
   - 使用 Next.js 的 Turbo 模式进行开发

3. 安全性
   - API 路由添加适当的验证
   - 避免敏感信息泄露
   - 使用环境变量管理敏感配置

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。
