'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg';
}

const badgeVariants = {
  default: 'bg-white/10 text-white',
  secondary: 'bg-white/[0.05] text-zinc-400',
  destructive: 'bg-red-500/20 text-red-400 border border-red-500/20',
  outline: 'border border-white/10 bg-transparent',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/20',
};

const sizeVariants = {
  default: 'px-2.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-[10px]',
  lg: 'px-3 py-1 text-sm',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          badgeVariants[variant],
          sizeVariants[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };