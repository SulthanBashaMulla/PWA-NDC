import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  strong?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, shimmer = false, strong = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg p-5 transition-all duration-300 hover:shadow-lg',
        strong ? 'glass-strong' : 'glass',
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
