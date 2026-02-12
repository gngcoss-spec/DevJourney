'use client';

import { FileText, Database, Code, Lightbulb, LayoutGrid, Layers, File, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

const docTypeColors: Record<DocType, string> = {
  planning: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  database: 'bg-green-500/10 text-green-400 border-green-500/30',
  api: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  prompt: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  erd: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  architecture: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const Icon = docTypeIcons[document.doc_type];
  const hasLink = document.external_url || document.file_url;

  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
            <Icon size={20} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-200 truncate">{document.title}</h3>
            {document.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{document.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={docTypeColors[document.doc_type]}>
                {docTypeLabels[document.doc_type]}
              </Badge>
              <span className="text-xs text-slate-600">v{document.version}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {hasLink && (
            <a
              href={document.external_url || document.file_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
              aria-label="외부 링크"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={() => onEdit(document)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { docTypeLabels };
