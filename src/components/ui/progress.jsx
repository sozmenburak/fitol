import { cn } from '../../lib/utils';

export function Progress({ value = 0, max = 100, className, indicatorClassName }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className={cn('h-full rounded-full bg-foreground progress-bar', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
