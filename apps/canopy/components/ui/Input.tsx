'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-white/[0.09] bg-[#0d1017] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600',
          'transition-all duration-150',
          'hover:border-white/[0.14] hover:bg-[#12151d]',
          'focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400/40 focus:bg-[#12151d]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };