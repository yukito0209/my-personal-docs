'use client';

import Link from 'next/link';
import Image from 'next/image';

interface EducationCardProps {
  logo: string;
  school: string;
  department: string;
  degree: string;
  period: string;
  schoolUrl: string;
  detailUrl: string;
  detailText: string;
}

export default function EducationCard({
  logo,
  school,
  department,
  degree,
  period,
  schoolUrl,
  detailUrl,
  detailText,
}: EducationCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50">
      <div 
        className="cursor-pointer"
        onClick={() => window.open(schoolUrl, '_blank')}
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 flex items-center justify-center transition-transform duration-300 hover:scale-110">
            <Image
              src={logo}
              alt={`${school} Logo`}
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
          </div>
          <div>
            <h3 className="font-medium transition-colors duration-300 hover:text-primary">{school}</h3>
            <p className="text-sm text-muted-foreground">{department}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="font-medium transition-colors duration-300 hover:text-primary">{degree}</p>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
      </div>
      <Link
        href={detailUrl}
        className="mt-2 inline-block text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-300"
        target="_blank"
      >
        {detailText}
      </Link>
    </div>
  );
} 