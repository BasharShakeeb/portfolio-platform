import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        botanical:
          'border-transparent bg-botanicalMint text-botanicalGreen hover:bg-botanicalMint/80 dark:bg-emerald-950/60 dark:text-emerald-400',
        sale:
          'border-transparent bg-saleCrimson text-white hover:bg-saleCrimson/90',
        citrus:
          'border-transparent bg-citrusAmber text-white hover:bg-citrusAmber/90',
        brand:
          'border-transparent bg-brandPrimary text-white hover:bg-brandPrimaryHover',
        pill:
          'border-[#e5e7eb] bg-white text-[#374151] hover:bg-gray-100 dark:bg-card dark:border-border dark:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
