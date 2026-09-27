import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[#343A40] bg-[#202428] px-3.5 py-2 text-sm text-[#F5F7F8] placeholder:text-[#737A82] ring-offset-[#111315] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#F5F7F8] focus-visible:outline-none focus-visible:border-[#10B981] focus-visible:ring-1 focus-visible:ring-[#10B981] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
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
