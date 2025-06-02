'use client';

import { Github, Mail } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import { siBilibili, siAfdian, siAlipay } from 'simple-icons/icons';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm glass-effect mb-8">
            <h1 className="text-2xl font-bold mb-4">关于本站</h1>
            <p className="text-muted-foreground mb-6">
              欢迎来到我的个人空间！这是一个基于 Next.js 15 和 Fumadocs UI 构建，并经过深度定制的个人网站。
              它不仅是一个展示平台，也是我探索现代 Web 技术、实践前沿设计理念的创新实验室。
              这里融合了个人主页、技术文档、音乐播放、摄影作品、AI 助手聊天等多元化功能，
              致力于为各位访客营造一个集知识分享、技术交流、审美享受于一体的独特数字体验空间。
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">核心功能</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>现代化响应式个人主页，展示教育背景与个人信息</li>
                <li>基于 Fumadocs 的 MDX 文档系统，支持数学公式、代码高亮与全文搜索</li>
                <li>唱片机风格音乐播放器，支持本地音乐文件播放、专辑封面展示与播放列表管理</li>
                <li>瀑布流布局相册画廊，采用鼠标追踪 3D 倾斜效果，提供沉浸式图片浏览体验</li>
                <li>AI 智能助手聊天系统，内置阿米娅（明日方舟）和喜多郁代（孤独摇滚）两个角色助手</li>
                <li>基于 Bangumi API 的动画追番功能，实时展示「今日放送」和「我的收藏」列表</li>
                <li>Live2D 角色展示系统，支持动态交互式虚拟角色（阿米娅、喜多等）</li>
                <li>智能主题系统：支持浅色/深色模式无缝切换，配备独立的背景图片与平滑过渡动画</li>
                <li>霞鹜文楷 (LXGW WenKai) 全站字体应用，营造优雅的中文阅读体验</li>
                <li>毛玻璃质感 UI 设计语言，多层次视觉效果与现代化交互体验</li>
                <li>导航栏视觉增强系统，集成水波纹点击效果、磁性悬停变形、渐变下划线等多种交互动画</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">技术架构</h2>
              <div className="rounded-lg border bg-primary/5 p-4 glass-effect">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>前端框架：</strong>Next.js 15.3.1 (App Router) + React 19.1.0</li>
                  <li><strong>文档系统：</strong>Fumadocs UI 15.2.12 + MDX 11.6.1</li>
                  <li><strong>样式系统：</strong>TailwindCSS 4.1.4 (原子化 CSS) + 自定义 CSS 动画</li>
                  <li><strong>类型安全：</strong>TypeScript 5.8.3 (严格模式)</li>
                  <li><strong>图标库：</strong>Lucide React 0.503.0 + Simple Icons 14.12.3</li>
                  <li><strong>交互动画：</strong>Pixi.js 6.5.9 + pixi-live2d-display 0.4.0</li>
                  <li><strong>音频处理：</strong>music-metadata 11.2.1 (元数据解析)</li>
                  <li><strong>内容渲染：</strong>React Markdown + rehype-katex + rehype-highlight</li>
                  <li><strong>状态管理：</strong>React Context API (主题、音乐播放器、AI 助手)</li>
                  <li><strong>图像优化：</strong>Next.js Image + Sharp 0.34.1</li>
                  <li><strong>部署优化：</strong>静态资源 CDN + 响应式图片压缩</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">特别鸣谢</h2>
              <div className="bg-card p-6 rounded-lg border glass-effect space-y-4">
                <div>
                  <p className="text-muted-foreground mb-4">
                    本网站基于优秀的开源框架 Fumadocs 构建，该框架为现代化文档网站提供了强大的 MDX 支持和精美的 UI 组件。
                    在此基础上，我进行了全方位的定制开发：从零构建了唱片机风格音乐播放器、3D 倾斜效果相册系统、
                    AI 角色助手聊天面板、Live2D 虚拟角色交互、Bangumi 动画追番功能等核心模块。
                    同时深度定制了主题系统、导航栏交互动画、毛玻璃 UI 效果等视觉体验，
                    使整个网站形成了独特的技术风格与交互美学。感谢 Fumadocs 团队提供的优秀技术基础！
                  </p>
                  <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
                    <Link
                      href="https://fumadocs.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border border-black dark:border-[hsl(var(--border))] rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 180 180" className="mr-2 h-4 w-4">
                        <defs>
                          <linearGradient id="fumadocsIconGradientAbout" gradientTransform="rotate(45)">
                            <stop offset="45%" stopColor="currentColor" stopOpacity="0.2" /> 
                            <stop offset="100%" stopColor="currentColor" />
                          </linearGradient>
                        </defs>
                        <circle cx="90" cy="90" r="89" fill="url(#fumadocsIconGradientAbout)" stroke="currentColor" strokeWidth="2"></circle>
                      </svg>
                      Fumadocs 官网
                    </Link>
                    <Link
                      href="https://github.com/fuma-nama/fumadocs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border border-black dark:border-[hsl(var(--border))] rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Fumadocs GitHub
                    </Link>
                  </div>
                </div>
                
                <hr className="border-t border-black dark:border-[hsl(var(--border))]" />

                <div>
                  <p className="text-muted-foreground mb-4">
                    本站的全局字体采用了优秀的开源字体「霞鹜文楷 / LXGW WenKai」。其温润优雅的字形极大地提升了网站的阅读体验。
                    十分感谢字体作者 <Link href="https://github.com/lxgw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lxgw</Link> 的无私奉献。
                  </p>
                  <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
                    <Link
                      href="https://github.com/lxgw/LxgwWenKai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border border-black dark:border-[hsl(var(--border))] rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      LXGW WenKai GitHub
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">支持本站</h2>
              <div className="bg-card p-6 rounded-lg border glass-effect">
                <p className="text-muted-foreground mb-4">
                  如果您欣赏这个网站的技术实现、设计理念或内容分享，欢迎通过以下方式给予支持。
                  您的每一份鼓励都是我持续探索前沿技术、优化用户体验、分享优质内容的重要动力！
                  无论是技术交流、功能建议还是资金支持，都将助力网站不断进化完善。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="https://afdian.com/a/yukiweb?tab=home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 glass-effect"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <svg
                          className="h-9 w-9 text-primary"
                          role="img"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          dangerouslySetInnerHTML={{ __html: siAfdian.svg }}
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="font-medium group-hover:text-primary transition-colors duration-300">爱发电</p>
                        <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">支持我的创作</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 glass-effect"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <svg
                          className="h-9 w-9 text-primary"
                          role="img"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          dangerouslySetInnerHTML={{ __html: siAlipay.svg }}
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="font-medium group-hover:text-primary transition-colors duration-300">支付宝</p>
                        <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">扫码支持 (暂未开放)</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">联系方式</h2>
              <p className="text-muted-foreground mb-4">
                欢迎与我交流技术实现细节、分享创意想法或讨论前端开发心得。
                无论是关于 Web 技术栈选型、交互动画设计，还是个人网站搭建经验，我都乐于分享和探讨。
                也欢迎对网站功能提出建议或发现问题时及时反馈！
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="mailto:yukitoqaq@gmail.com"
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 glass-effect"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">Email</p>
                      <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">yukitoqaq@gmail.com</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="https://github.com/yukito0209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 glass-effect"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Github className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">GitHub</p>
                      <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">yukito0209</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="https://space.bilibili.com/13845177"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 glass-effect"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <svg
                        className="h-5 w-5 text-primary"
                        role="img"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        dangerouslySetInnerHTML={{ __html: siBilibili.svg }}
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">Bilibili</p>
                      <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">YukitoOwO</p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 