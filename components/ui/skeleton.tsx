import { cn } from '@/lib/utils';

// Guard against iOS Safari speculative parser buffering stall (requires >= 1KB chunk)
const SAFARI_PARSER_GUARD = '<!-- safari-speculative-parser-buffer-guard-padding-min-1kb-safari-skeleton-stream-optimization -->'.repeat(12);

function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted relative overflow-hidden', className)}
      {...props}
    >
      <span
        className="sr-only opacity-0 pointer-events-none select-none inline-block h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        {SAFARI_PARSER_GUARD}
      </span>
      {children}
    </div>
  );
}

export { Skeleton };
