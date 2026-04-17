import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

export default function StatCard({ icon, label, value, highlight }: StatCardProps) {
  return (
    <div className={cn('p-6', highlight ? 'bg-bronze text-white' : 'bg-white')}>
      <div className={cn('mb-3', highlight ? 'text-white/80' : 'text-bronze')}>
        {icon}
      </div>
      <div
        className={cn(
          'text-[10px] tracking-[0.3em] uppercase',
          highlight ? 'text-white/70' : 'text-mocha'
        )}
      >
        {label}
      </div>
      <div className="font-serif text-3xl mt-1">{value}</div>
    </div>
  );
}
