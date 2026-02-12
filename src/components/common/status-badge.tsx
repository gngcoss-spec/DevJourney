'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))] border-[hsl(var(--status-success-border))]',
  warning: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))] border-[hsl(var(--status-warning-border))]',
  danger: 'bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-text))] border-[hsl(var(--status-danger-border))]',
  info: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))] border-[hsl(var(--status-info-border))]',
  neutral: 'bg-[hsl(var(--status-neutral-bg))] text-[hsl(var(--status-neutral-text))] border-[hsl(var(--status-neutral-border))]',
  purple: 'bg-[hsl(var(--status-purple-bg))] text-[hsl(var(--status-purple-text))] border-[hsl(var(--status-purple-border))]',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(variantStyles[variant], className)}
    >
      {children}
    </Badge>
  );
}
