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
              它不仅是一个展示平台，也是我探索 Web 技术、实践设计理念的实验田。
              这里融合了个人主页、技术文档、音乐播放、照片墙等多种功能，希望能为你带来独特的浏览体验。
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">主要功能</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>响应式设计的个人主页，展示个人信息和教育经历</li>
                <li>基于 Fumadocs 的文档系统，支持 MDX 格式与搜索</li>
                <li>定制化本地音乐播放器，支持专辑封面显示</li>
                <li>瀑布流布局的相册画廊</li>
                <li>支持浅色/深色模式切换，并带有平滑过渡动画</li>
                <li>全局应用霞鹜文楷 (LXGW WenKai) 字体，提升阅读体验</li>
                <li>多处采用毛玻璃 (Frosted Glass) UI 效果，增强视觉层次感</li>
                <li>实时公告栏（首页右侧），展示网站动态</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">技术栈</h2>
              <div className="rounded-lg border bg-primary/5 p-4 glass-effect">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Next.js 15.3.1 - React 应用框架</li>
                  <li>Fumadocs UI 15.2.12 & MDX 11.6.1 - 文档系统核心</li>
                  <li>TailwindCSS 4.1.4 - 原子化 CSS 框架</li>
                  <li>TypeScript 5.8.3 - 强类型 JavaScript 超集</li>
                  <li>Lucide React 0.503.0 - 图标库</li>
                  <li>Simple Icons - 品牌 SVG 图标库</li>
                  <li>React Context API - 用于状态管理（如主题、音乐播放器）</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">特别鸣谢</h2>
              <div className="bg-card p-6 rounded-lg border glass-effect space-y-4">
                <div>
                  <p className="text-muted-foreground mb-4">
                    本网站的文档系统基于强大的 Fumadocs 框架构建。Fumadocs 提供了优秀的 MDX 文档管理和 UI 组件。
                    在此基础上，我进行了大量的定制开发，添加了主页、音乐播放、相册等功能模块，并统一了全局样式与交互体验。
                    衷心感谢 Fumadocs 的开发者和贡献者们。
                  </p>
                  <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
                    <Link
                      href="https://fumadocs.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                    >
                      访问 Fumadocs 官网
                    </Link>
                    <Link
                      href="https://github.com/fuma-nama/fumadocs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Fumadocs GitHub
                    </Link>
                  </div>
                </div>
                
                <hr className="border-border/50" />

                <div>
                  <p className="text-muted-foreground mb-4">
                    本站的全局中文字体采用了优秀的开源字体「霞鹜文楷 / LXGW WenKai」。其温润优雅的字形极大地提升了网站的阅读体验。
                    感谢字体作者 <Link href="https://github.com/lxgw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lxgw</Link> 的无私奉献。
                  </p>
                  <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4">
                    <Link
                      href="https://github.com/lxgw/LxgwWenKai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
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
                  如果你喜欢这个网站或它对你有所帮助，欢迎通过以下方式支持我。你的鼓励是我持续改进和分享的动力！
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="https://afdian.net/@yukito0209"
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
                有任何问题、建议或合作想法？欢迎通过以下方式联系我：
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