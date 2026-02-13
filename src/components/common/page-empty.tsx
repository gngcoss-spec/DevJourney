'use client';

import { Inbox, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageEmptyProps {
  icon?: LucideIcon;
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageEmpty({
  icon: Icon = Inbox,
  message,
  description,
  actionLabel,
  onAction,
}: PageEmptyProps) {
  return (
    <div data-testid="page-empty" className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center space-y-3">
        <Icon className="h-16 w-16 text-[hsl(var(--text-quaternary))] mx-auto" />
        <p className="text-[hsl(var(--text-tertiary))] text-lg">{message}</p>
        {description && (
          <p className="text-sm text-[hsl(var(--text-quaternary))]">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
