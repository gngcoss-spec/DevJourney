'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    <div className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden">
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
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-200 truncate">{decision.title}</h3>
            <p className="text-xs text-slate-500">{formatDate(decision.created_at)}</p>
          </div>
          {decision.selected_option && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 flex-shrink-0">
              {decision.selected_option}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(decision.id); }}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
          {decision.background && (
            <div className="pt-3">
              <p className="text-xs font-medium text-slate-500 mb-1">배경</p>
              <p className="text-sm text-slate-300">{decision.background}</p>
            </div>
          )}

          {decision.options && decision.options.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">검토 옵션</p>
              <ul className="space-y-1">
                {decision.options.map((opt, idx) => (
                  <li key={idx} className={cn(
                    'text-sm px-2 py-1 rounded',
                    (opt as Record<string, unknown>).name === decision.selected_option
                      ? 'bg-green-500/10 text-green-400'
                      : 'text-slate-400'
                  )}>
                    {(opt as Record<string, unknown>).name as string}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decision.reason && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">선택 이유</p>
              <p className="text-sm text-slate-300">{decision.reason}</p>
            </div>
          )}

          {decision.impact && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">영향</p>
              <p className="text-sm text-slate-300">{decision.impact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
