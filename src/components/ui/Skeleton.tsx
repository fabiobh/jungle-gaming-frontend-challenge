import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-lg bg-surface-card',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
};
