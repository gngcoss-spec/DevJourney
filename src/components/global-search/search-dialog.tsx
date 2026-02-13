'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Layers, CheckSquare, Lightbulb, BookOpen, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSearchStore } from '@/stores/search-store';
import { useGlobalSearch } from '@/lib/hooks/use-global-search';
import { useState } from 'react';
import type { SearchResult, SearchResultType } from '@/lib/supabase/queries/search';

const TYPE_CONFIG: Record<SearchResultType, { label: string; icon: typeof Layers }> = {
  service: { label: 'Services', icon: Layers },
  work_item: { label: 'Work Items', icon: CheckSquare },
  decision: { label: 'Decisions', icon: Lightbulb },
  dev_log: { label: 'Dev Logs', icon: BookOpen },
  document: { label: 'Documents', icon: FileText },
};

function getResultUrl(result: SearchResult): string {
  switch (result.type) {
    case 'service':
      return `/services/${result.id}`;
    case 'work_item':
      return `/services/${result.service_id}/work-items`;
    case 'decision':
      return `/services/${result.service_id}/decisions`;
    case 'dev_log':
      return `/services/${result.service_id}/dev-logs`;
    case 'document':
      return `/services/${result.service_id}/documents`;
  }
}

export function SearchDialog() {
  const router = useRouter();
  const { isOpen, close } = useSearchStore();
  const { open: openSearch } = useSearchStore();
  const { inputValue, setInputValue, results, isLoading, reset } = useGlobalSearch();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatResults = useMemo(() => {
    if (!results) return [];
    return [
      ...results.services,
      ...results.workItems,
      ...results.decisions,
      ...results.devLogs,
      ...results.documents,
    ];
  }, [results]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      close();
      reset();
      setSelectedIndex(-1);
      router.push(getResultUrl(result));
    },
    [close, reset, router]
  );

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Keyboard navigation within dialog
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && flatResults[selectedIndex]) {
      e.preventDefault();
      navigateToResult(flatResults[selectedIndex]);
    }
  };

  const handleClose = () => {
    close();
    reset();
    setSelectedIndex(-1);
  };

  // Group results for rendering
  const groups = useMemo(() => {
    if (!results) return [];
    const entries: { type: SearchResultType; items: SearchResult[] }[] = [];
    if (results.services.length > 0) entries.push({ type: 'service', items: results.services });
    if (results.workItems.length > 0) entries.push({ type: 'work_item', items: results.workItems });
    if (results.decisions.length > 0) entries.push({ type: 'decision', items: results.decisions });
    if (results.devLogs.length > 0) entries.push({ type: 'dev_log', items: results.devLogs });
    if (results.documents.length > 0) entries.push({ type: 'document', items: results.documents });
    return entries;
  }, [results]);

  // Calculate flat index offset for each group
  const getFlatIndex = (groupType: SearchResultType, itemIndex: number): number => {
    if (!results) return -1;
    let offset = 0;
    const order: SearchResultType[] = ['service', 'work_item', 'decision', 'dev_log', 'document'];
    for (const type of order) {
      if (type === groupType) return offset + itemIndex;
      const groupItems =
        type === 'service'
          ? results.services
          : type === 'work_item'
            ? results.workItems
            : type === 'decision'
              ? results.decisions
              : type === 'dev_log'
                ? results.devLogs
                : results.documents;
      offset += groupItems.length;
    }
    return -1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[540px] p-0 gap-0"
        onKeyDown={handleDialogKeyDown}
      >
        <DialogTitle className="sr-only">검색</DialogTitle>
        <DialogDescription className="sr-only">서비스, 작업, 의사결정, 개발일지, 문서를 검색합니다</DialogDescription>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border-default))]">
          <Search className="size-4 text-[hsl(var(--text-quaternary))] shrink-0" />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-quaternary))] outline-none"
            autoFocus
          />
          {isLoading && <Loader2 className="size-4 text-[hsl(var(--text-quaternary))] animate-spin shrink-0" />}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--text-quaternary))] bg-[hsl(var(--surface-raised))] rounded border border-[hsl(var(--border-default))]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {inputValue.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-[hsl(var(--text-quaternary))]">
              2자 이상 입력하세요
            </div>
          ) : results && results.total === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[hsl(var(--text-quaternary))]">
              검색 결과가 없습니다
            </div>
          ) : results && results.total > 0 ? (
            groups.map((group) => {
              const config = TYPE_CONFIG[group.type];
              const Icon = config.icon;
              return (
                <div key={group.type}>
                  <div className="px-4 py-2 text-xs font-medium text-[hsl(var(--text-quaternary))] flex items-center gap-2">
                    <Icon className="size-3.5" />
                    {config.label}
                  </div>
                  {group.items.map((item, idx) => {
                    const flatIdx = getFlatIndex(group.type, idx);
                    const isSelected = flatIdx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToResult(item)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--text-primary))]'
                            : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-raised))]'
                        }`}
                      >
                        <div className="font-medium truncate">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-[hsl(var(--text-quaternary))] truncate mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[hsl(var(--border-default))] text-[10px] text-[hsl(var(--text-quaternary))]">
          <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono">↵</kbd> Open</span>
          <span><kbd className="font-mono">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
