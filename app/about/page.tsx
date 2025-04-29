import { Github, GitBranch, GitCommit, GitPullRequest, Star } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/app/components/Footer';

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function TimelineItem({ date, title, description, icon }: TimelineItemProps) {
  return (
    <div className="relative flex gap-6">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card">
          {icon}
        </div>
        <div className="flex-1 w-px bg-border/60" />
      </div>
      <div className="flex flex-col pb-8">
        <span className="text-sm text-muted-foreground">{date}</span>
        <span className="text-lg font-medium">{title}</span>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const timelineItems = [
    {
      date: '2025-04',
      title: '项目启动',
      description: '基于 Next.js 14 和 Fumadocs UI 开始构建个人文档网站，选择了现代化的技术栈和优雅的UI框架。',
      icon: <GitBranch className="h-5 w-5 text-primary" />,
    },
    {
      date: '2025-05',
      title: '基础功能实现',
      description: '完成了主页设计、文档系统搭建、深色模式支持等基础功能，注重用户体验和界面美观。',
      icon: <GitCommit className="h-5 w-5 text-primary" />,
    },
    {
      date: '2024-06 至今',
      title: '功能完善',
      description: '添加了教育经历展示、兴趣爱好卡片、邮箱联系方式等功能，丰富了网站内容。',
      icon: <GitPullRequest className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">关于本站</h1>
            <p className="text-muted-foreground mb-6">
              这是一个基于 Next.js 14 构建的个人文档网站，旨在分享技术文档和个人经历。
              项目采用了现代化的技术栈，包括 Tailwind CSS 进行样式设计，
              Fumadocs UI 提供文档系统支持。
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="https://github.com/yukito0209/my-personal-docs"
                target="_blank"
                className="inline-flex items-center space-x-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary/50"
              >
                <Github className="h-4 w-4" />
                <span>查看源码</span>
              </Link>
              <Link
                href="https://github.com/yukito0209/my-personal-docs"
                target="_blank"
                className="inline-flex items-center space-x-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary/50"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                <span>欢迎 Star</span>
              </Link>
            </div>

            <h2 className="text-xl font-semibold mb-6">开发历程</h2>
            <div className="space-y-4">
              {timelineItems.map((item, index) => (
                <TimelineItem key={index} {...item} />
              ))}
            </div>

            <div className="mt-8 rounded-lg border bg-primary/5 p-4">
              <h3 className="font-medium mb-2">技术栈</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Next.js 14 - React 框架</li>
                <li>Tailwind CSS - 样式框架</li>
                <li>Fumadocs UI - 文档系统</li>
                <li>TypeScript - 类型安全</li>
                <li>Lucide Icons - 图标库</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 