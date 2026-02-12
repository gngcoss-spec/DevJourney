'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import type { Decision } from '@/types/database';
import { cn } from '@/lib/utils';

interface DecisionCardProps {
  decision: Decision;
  onEdit: (decision: Decision) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function DecisionCard({ decision, onEdit, onDelete }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bento-glass overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(var(--surface-overlay))] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))] truncate">{decision.title}</h3>
            <p className="text-xs text-[hsl(var(--text-quaternary))]">{formatDate(decision.created_at)}</p>
          </div>
          {decision.selected_option && (
            <StatusBadge variant="success" className="flex-shrink-0">
              {decision.selected_option}
            </StatusBadge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
            aria-label="수정"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => { e.stopPropagation(); onDelete(decision.id); }}
            aria-label="삭제"
            className="hover:text-[hsl(var(--status-danger-text))]"
          >
            <Trash2 className="size-3.5" />
          </Button>
          {isExpanded ? <ChevronUp className="size-4 text-[hsl(var(--text-tertiary))]" /> : <ChevronDown className="size-4 text-[hsl(var(--text-tertiary))]" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--border-default))]">
          {decision.background && (
            <div className="pt-3">
              <p className="text-caption mb-1">배경</p>
              <p className="text-body">{decision.background}</p>
            </div>
          )}

          {decision.options && decision.options.length > 0 && (
            <div>
              <p className="text-caption mb-1">검토 옵션</p>
              <ul className="space-y-1">
                {decision.options.map((opt, idx) => (
                  <li key={idx} className={cn(
                    'text-sm px-2 py-1 rounded',
                    (opt as Record<string, unknown>).name === decision.selected_option
                      ? 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success-text))]'
                      : 'text-[hsl(var(--text-tertiary))]'
                  )}>
                    {(opt as Record<string, unknown>).name as string}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decision.reason && (
            <div>
              <p className="text-caption mb-1">선택 이유</p>
              <p className="text-body">{decision.reason}</p>
            </div>
          )}

          {decision.impact && (
            <div>
              <p className="text-caption mb-1">영향</p>
              <p className="text-body">{decision.impact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
