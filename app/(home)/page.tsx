import Link from 'next/link';
import Image from 'next/image';
import { Github, Mail, Bell, Book, Camera, ArrowRight } from 'lucide-react';
import { siBilibili } from 'simple-icons';
import EducationCard from './components/EducationCard';
import InterestsSection from './components/InterestCard';
import Footer from '@/app/components/Footer';
import { CustomMusicPlayer } from '@/app/components/CustomMusicPlayer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 py-8">
          {/* 左侧音乐播放器 */}
          <div className="w-full md:w-[300px] md:sticky md:top-4 md:self-start">
            <div className="rounded-lg border bg-card shadow-sm glass-effect h-[600px]">
              <div className="p-4 h-full">
                <CustomMusicPlayer />
              </div>
            </div>
          </div>

          {/* 中间主要内容 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg glass-effect">
              <div className="flex flex-col items-center space-y-4">
                <Image
                  src="https://avatars.githubusercontent.com/u/76610895?v=4"
                  alt="Yukito's Avatar"
                  width={100}
                  height={100}
                  className="rounded-full"
                  priority
                />
                <h1 className="text-2xl font-bold">Yukito (Kerwin Wang)</h1>
                <p className="text-center text-muted-foreground">
                  詩風禮月，心嶺意海。
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
                  school="香港城市大學(東莞)"
                  department="商學院 | 資訊系統學系"
                  degree="理學碩士 - 商務資訊系統 (MSc BIS)"
                  period="2024-2026"
                  schoolUrl="https://www.cityu-dg.edu.cn/"
                  detailUrl="https://www.cb.cityu.edu.hk/is/postgraduate-degrees/taught-postgraduate/msc-business-information-systems"
                  detailText="課程大綱"
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
            
            <div className="mt-8 w-full max-w-2xl">
              <h2 className="mb-4 text-xl font-semibold">个人作品</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Link 
                  href="/docs" 
                  className="group rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Book className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">技术文档</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        记录我的学习笔记、技术心得和项目经验，包含前端开发、系统设计等多个主题。
                      </p>
                      <div className="flex items-center text-sm text-primary">
                        <span className="group-hover:underline">浏览文档</span>
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/gallery" 
                  className="group rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">摄影作品</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        分享我的摄影作品集，记录生活中的美好瞬间，展现独特的视角和创作理念。
                      </p>
                      <div className="flex items-center text-sm text-primary">
                        <span className="group-hover:underline">查看相册</span>
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 右侧公告栏 */}
          <div className="w-full md:w-[300px] md:sticky md:top-4 md:self-start">
            <div className="rounded-lg border bg-card shadow-sm glass-effect h-[600px]">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">最新公告</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <div className="p-3 rounded-md bg-black/5 hover:bg-black/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🎉 网站更新</p>
                    <p className="text-xs text-muted-foreground">新增音乐播放器功能，支持显示专辑封面和歌词。</p>
                    <p className="text-xs text-muted-foreground mt-1">2024-03-19</p>
                  </div>
                  <div className="p-3 rounded-md bg-black/5 hover:bg-black/10 transition-colors">
                    <p className="text-sm font-medium mb-1">📚 文档系统</p>
                    <p className="text-xs text-muted-foreground">完善了文档系统的搜索功能和导航结构。</p>
                    <p className="text-xs text-muted-foreground mt-1">2024-03-18</p>
                  </div>
                  <div className="p-3 rounded-md bg-black/5 hover:bg-black/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🌟 即将上线</p>
                    <p className="text-xs text-muted-foreground">相册功能开发中，敬请期待。</p>
                    <p className="text-xs text-muted-foreground mt-1">2024-03-17</p>
                  </div>
                  <div className="p-3 rounded-md bg-black/5 hover:bg-black/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🔧 性能优化</p>
                    <p className="text-xs text-muted-foreground">优化了网站加载速度和响应性能。</p>
                    <p className="text-xs text-muted-foreground mt-1">2024-03-16</p>
                  </div>
                  <div className="p-3 rounded-md bg-black/5 hover:bg-black/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🎨 界面更新</p>
                    <p className="text-xs text-muted-foreground">优化了深色模式下的显示效果。</p>
                    <p className="text-xs text-muted-foreground mt-1">2024-03-15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
