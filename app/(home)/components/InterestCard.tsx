'use client';

import { Camera, History, Tv, Languages } from 'lucide-react';

interface InterestCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InterestCard({ icon, title, description }: InterestCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        {icon}
      </div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function InterestsSection() {
  const interests = [
    {
      icon: <Camera className="h-6 w-6 text-primary" />,
      title: '摄影',
      description: '用镜头记录生活，探索光影艺术',
    },
    {
      icon: <History className="h-6 w-6 text-primary" />,
      title: '历史',
      description: '研究古代文明，探索人类发展轨迹',
    },
    {
      icon: <Tv className="h-6 w-6 text-primary" />,
      title: '动漫',
      description: '欣赏动画艺术，感受二次元文化',
    },
    {
      icon: <Languages className="h-6 w-6 text-primary" />,
      title: '语言学',
      description: '探索语言奥秘，研究语言演变',
    },
  ];

  return (
    <div className="mt-8 w-full max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold">兴趣爱好</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {interests.map((interest, index) => (
          <InterestCard
            key={index}
            icon={interest.icon}
            title={interest.title}
            description={interest.description}
          />
        ))}
      </div>
    </div>
  );
} 