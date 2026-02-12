'use client';

import { FileText, Database, Code, Lightbulb, LayoutGrid, Layers, File, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { IconWrapper } from '@/components/common/icon-wrapper';
import { Button } from '@/components/ui/button';
import type { Document, DocType } from '@/types/database';

interface DocumentCardProps {
  document: Document;
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const docTypeIcons: Record<DocType, React.ElementType> = {
  planning: FileText,
  database: Database,
  api: Code,
  prompt: Lightbulb,
  erd: LayoutGrid,
  architecture: Layers,
  other: File,
};

const docTypeLabels: Record<DocType, string> = {
  planning: '기획',
  database: 'DB',
  api: 'API',
  prompt: '프롬프트',
  erd: 'ERD',
  architecture: '아키텍처',
  other: '기타',
};

const docTypeColors: Record<DocType, 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'cyan' | 'slate'> = {
  planning: 'blue',
  database: 'green',
  api: 'purple',
  prompt: 'yellow',
  erd: 'orange',
  architecture: 'cyan',
  other: 'slate',
};

const docTypeBadgeVariants: Record<DocType, 'info' | 'success' | 'purple' | 'warning' | 'danger' | 'neutral'> = {
  planning: 'info',
  database: 'success',
  api: 'purple',
  prompt: 'warning',
  erd: 'danger',
  architecture: 'info',
  other: 'neutral',
};

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const Icon = docTypeIcons[document.doc_type];
  const hasLink = document.external_url || document.file_url;

  return (
    <div className="bento-glass-hover p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <IconWrapper icon={Icon} color={docTypeColors[document.doc_type]} size="md" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))] truncate">{document.title}</h3>
            {document.description && (
              <p className="text-xs text-[hsl(var(--text-quaternary))] mt-1 line-clamp-2">{document.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge variant={docTypeBadgeVariants[document.doc_type]}>
                {docTypeLabels[document.doc_type]}
              </StatusBadge>
              <span className="text-xs text-[hsl(var(--text-quaternary))]">v{document.version}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {hasLink && (
            <Button
              variant="ghost"
              size="icon-xs"
              asChild
            >
              <a
                href={document.external_url || document.file_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="외부 링크"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(document)}
            aria-label="수정"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(document.id)}
            aria-label="삭제"
            className="hover:text-[hsl(var(--status-danger-text))]"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { docTypeLabels };
