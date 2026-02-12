'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'lg', maxWidth }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(
        'bg-[hsl(var(--surface-overlay))] border border-[hsl(var(--border-default))] rounded-[var(--radius-xl)] p-6 w-full mx-4 max-h-[90vh] overflow-y-auto',
        maxWidth || sizeClasses[size]
      )}>
        {title && (
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
