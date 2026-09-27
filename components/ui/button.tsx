import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#10B981] text-white hover:bg-[#22C55E] shadow-sm font-semibold',
        destructive: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm font-medium',
        outline: 'border border-[#343A40] bg-[#191C1F] text-[#F5F7F8] hover:bg-[#25292D] hover:text-[#FFFFFF]',
        secondary: 'bg-[#202428] text-[#F5F7F8] border border-[#343A40] hover:bg-[#2B3035] hover:text-white',
        ghost: 'text-[#A7ADB4] hover:bg-[#25292D] hover:text-[#F5F7F8]',
        link: 'text-[#10B981] underline-offset-4 hover:underline hover:text-[#22C55E]',
        brand: 'bg-[#10B981] text-white hover:bg-[#22C55E] shadow-sm font-semibold',
        pill: 'rounded-xl bg-[#202428] text-[#A7ADB4] border border-[#343A40] hover:bg-[#25292D] hover:text-[#F5F7F8] shadow-xs',
        pillActive: 'rounded-xl bg-[#10B981] text-white hover:bg-[#22C55E] border border-[#10B981] shadow-xs font-semibold',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
        pill: 'h-9 px-4 text-xs font-medium rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
