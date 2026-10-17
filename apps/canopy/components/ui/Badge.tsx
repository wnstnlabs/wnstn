'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg';
}

const badgeVariants = {
  default: 'bg-rose-500/15 text-rose-300 border border-rose-500/20',
  secondary: 'bg-white/[0.06] text-slate-400 border border-white/[0.06]',
  destructive: 'bg-red-500/15 text-red-400 border border-red-500/25',
  outline: 'border border-white/10 bg-transparent text-slate-300',
  success: 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

const sizeVariants = {
  default: 'px-2 py-0.5 text-[11px]',
  sm: 'px-1.5 py-0.5 text-[10px]',
  lg: 'px-2.5 py-1 text-xs',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md font-medium mono tracking-tight',
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