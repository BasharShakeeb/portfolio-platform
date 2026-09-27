import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-[#343A40] bg-[#202428] px-3.5 py-2 text-sm text-[#F5F7F8] placeholder:text-[#737A82] ring-offset-[#111315] focus-visible:outline-none focus-visible:border-[#10B981] focus-visible:ring-1 focus-visible:ring-[#10B981] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
