import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  strong?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  shimmer = false,
  strong = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl',
        strong
          ? 'bg-white/30 backdrop-blur-xl border border-white/40'
          : 'bg-white/20 backdrop-blur-xl border border-white/30',
        shimmer && 'shimmer-bar',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;