'use client';

import { cn } from '@/lib/utils';

type IconColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'orange' | 'slate';
type IconSize = 'sm' | 'md' | 'lg';

interface IconWrapperProps {
  icon: React.ElementType;
  color?: IconColor;
  size?: IconSize;
  className?: string;
}

const colorStyles: Record<IconColor, string> = {
  blue: 'bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]',
  green: 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]',
  yellow: 'bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning-text))]',
  red: 'bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger-text))]',
  purple: 'bg-[hsl(var(--status-purple-bg))] text-[hsl(var(--status-purple-text))]',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  orange: 'bg-orange-500/10 text-orange-400',
  slate: 'bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-tertiary))]',
};

const sizeConfig: Record<IconSize, { container: string; icon: string }> = {
  sm: { container: 'p-1.5', icon: 'size-3.5' },
  md: { container: 'p-2', icon: 'size-4' },
  lg: { container: 'p-2.5', icon: 'size-5' },
};

export function IconWrapper({ icon: Icon, color = 'blue', size = 'md', className }: IconWrapperProps) {
  const { container, icon: iconSize } = sizeConfig[size];

  return (
    <div className={cn('rounded-lg flex-shrink-0', container, colorStyles[color], className)}>
      <Icon className={iconSize} />
    </div>
  );
}
