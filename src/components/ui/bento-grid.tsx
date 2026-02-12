'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface BentoGridProps {
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function BentoGrid({ columns = 3, children, className, animate = true }: BentoGridProps) {
  if (animate) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid gap-[var(--bento-gap)]',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          className
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-[var(--bento-gap)]',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

type GlowColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';

interface BentoCardProps {
  colSpan?: 1 | 2 | 'full';
  rowSpan?: 1 | 2;
  interactive?: boolean;
  glow?: GlowColor;
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const glowMap: Record<GlowColor, string> = {
  blue: 'hover:shadow-[var(--glow-blue)]',
  green: 'hover:shadow-[var(--glow-green)]',
  yellow: 'hover:shadow-[var(--glow-yellow)]',
  red: 'hover:shadow-[var(--glow-red)]',
  purple: 'hover:shadow-[var(--glow-purple)]',
  cyan: 'hover:shadow-[var(--glow-cyan)]',
};

export function BentoCard({
  colSpan = 1,
  rowSpan = 1,
  interactive = false,
  glow,
  children,
  className,
  animate = true,
}: BentoCardProps) {
  const cardClasses = cn(
    'bento-glass p-5',
    colSpan === 2 && 'md:col-span-2',
    colSpan === 'full' && 'col-span-full',
    rowSpan === 2 && 'row-span-2',
    interactive && 'bento-glass-hover cursor-pointer',
    glow && glowMap[glow],
    className
  );

  if (animate) {
    return (
      <motion.div
        data-testid="bento-card"
        variants={itemVariants}
        className={cardClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      data-testid="bento-card"
      className={cardClasses}
    >
      {children}
    </div>
  );
}

interface BentoCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardHeader({ children, className }: BentoCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  );
}

interface BentoCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardTitle({ children, className }: BentoCardTitleProps) {
  return (
    <h3 className={cn('text-sm font-medium text-[hsl(var(--text-tertiary))]', className)}>
      {children}
    </h3>
  );
}

interface BentoCardValueProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardValue({ children, className }: BentoCardValueProps) {
  return (
    <div className={cn('text-3xl font-bold text-[hsl(var(--text-primary))]', className)}>
      {children}
    </div>
  );
}
