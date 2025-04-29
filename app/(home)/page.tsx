import Link from 'next/link';
import Image from 'next/image';
import { Github, Mail } from 'lucide-react';
import { siBilibili } from 'simple-icons';
import EducationCard from './components/EducationCard';
import InterestsSection from './components/InterestCard';
import Footer from '@/app/components/Footer';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg glass-effect">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="https://avatars.githubusercontent.com/u/76610895?v=4"
              alt="Yukito's Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold">Yukito (Kerwin Wang)</h1>
            <p className="text-center text-muted-foreground">
              热爱编程的开发者，专注于前端开发和用户体验
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/yukito0209"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300"
                target="_blank"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Link>
              <Link
                href="https://space.bilibili.com/13845177"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300"
                target="_blank"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  dangerouslySetInnerHTML={{ __html: siBilibili.svg }}
                />
                Bilibili
              </Link>
              <Link
                href="mailto:yukitoqaq@gmail.com"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                Gmail
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-2xl">
          <h2 className="mb-4 text-xl font-semibold">教育经历</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <EducationCard
              logo="/logos/cityu-logo.svg"
              school="香港城市大学(东莞)"
              department="商学院 | 资讯系统学系"
              degree="理学硕士 - 商务资讯系统 (MSc BIS)"
              period="2024-2026"
              schoolUrl="https://www.cityu.edu.hk/"
              detailUrl="https://www.cb.cityu.edu.hk/is/postgraduate-degrees/taught-postgraduate/msc-business-information-systems"
              detailText="课程大纲"
            />
            <EducationCard
              logo="/logos/nuist-logo.svg"
              school="南京信息工程大学"
              department="计算机学院、网络空间安全学院"
              degree="工学学士 - 计算机科学与技术 (BEng CS)"
              period="2020-2024"
              schoolUrl="https://www.nuist.edu.cn/"
              detailUrl="http://scs.nuist.edu.cn/"
              detailText="学院官网"
            />
          </div>
        </div>

        <InterestsSection />
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            你可以访问{' '}
            <Link
              href="/docs"
              className="text-foreground font-semibold underline hover:text-primary transition-colors duration-300"
            >
              /docs
            </Link>{' '}
            查看文档。
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
