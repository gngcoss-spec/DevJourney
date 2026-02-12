'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageErrorProps {
  message: string;
  onRetry?: () => void;
}

export function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <div data-testid="page-error" className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <p className="text-red-400">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
