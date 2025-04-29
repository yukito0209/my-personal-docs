'use client';

import { Github, Mail } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import { siBilibili } from 'simple-icons/icons';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">关于本站</h1>
            <p className="text-muted-foreground mb-6">
              这是一个基于 Next.js 15 和 Fumadocs UI 构建的个人网站，集成了个人主页、文档系统、音乐播放器和相册功能。
              网站采用现代化的设计理念，注重用户体验和性能优化。
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">主要功能</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>响应式设计的个人主页，展示个人信息和教育经历</li>
                <li>基于 Fumadocs 的文档系统，支持 MDX 格式</li>
                <li>本地音乐播放器，支持专辑封面显示和播放控制</li>
                <li>瀑布流布局的相册展示（开发中）</li>
                <li>实时公告栏，展示网站更新动态</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">技术栈</h2>
              <div className="rounded-lg border bg-primary/5 p-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Next.js 15.3.1 - React 框架</li>
                  <li>Fumadocs UI 15.2.12 - 文档系统框架</li>
                  <li>TailwindCSS 4.1.4 - 样式解决方案</li>
                  <li>TypeScript 5.8.3 - 类型检查</li>
                  <li>Lucide React 0.503.0 - 图标库</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">特别鸣谢</h2>
              <div className="bg-card p-6 rounded-lg border">
                <p className="text-muted-foreground mb-4">
                  本网站基于 Fumadocs 模板构建。Fumadocs 是一个优秀的文档框架，提供了美观的界面和强大的功能。
                  在此特别感谢 Fumadocs 的开发者和贡献者们为开源社区做出的贡献。
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="https://fumadocs.dev/"
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                  >
                    访问 Fumadocs 官网
                  </Link>
                  <Link
                    href="https://github.com/fuma-nama/fumadocs"
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Fumadocs GitHub
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">联系方式</h2>
              <p className="text-muted-foreground mb-4">
                如果你有任何问题或建议，欢迎通过以下方式联系我：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="mailto:yukitoqaq@gmail.com"
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50"
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
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50"
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
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50"
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