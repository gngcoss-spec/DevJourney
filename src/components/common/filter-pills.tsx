'use client';

import { cn } from '@/lib/utils';

interface FilterPillsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <div className={cn('flex gap-2 flex-wrap', className)} role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          aria-selected={value === option.value}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))] border border-[hsl(var(--status-info-border))]'
              : 'bg-[hsl(var(--surface-raised))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border-default))] hover:text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
