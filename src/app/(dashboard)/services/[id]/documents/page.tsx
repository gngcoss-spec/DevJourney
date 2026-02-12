'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDocuments, useDeleteDocument } from '@/lib/hooks/use-documents';
import { DocumentCard } from '@/components/document/document-card';
import { DocumentForm } from '@/components/document/document-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/common/modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { FileText } from 'lucide-react';
import type { Document, DocType } from '@/types/database';

const ALL_DOC_TYPES: DocType[] = ['planning', 'database', 'api', 'prompt', 'erd', 'architecture', 'other'];

export default function DocumentsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>(undefined);
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');

  const { data: documents, isLoading, isError, refetch } = useDocuments(serviceId);
  const deleteDocument = useDeleteDocument(serviceId);

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDocument.mutate(id);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingDocument(undefined);
  };

  const filteredDocuments = documents?.filter(
    (doc) => filterType === 'all' || doc.doc_type === filterType
  );

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <PageError message="문서를 불러올 수 없습니다" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-50">문서</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          새 문서
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          전체
        </button>
        {ALL_DOC_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <Modal isOpen={isFormOpen} onClose={handleClose} maxWidth="max-w-lg">
        <DocumentForm
          serviceId={serviceId}
          onClose={handleClose}
          existingDocument={editingDocument}
        />
      </Modal>

      {!filteredDocuments || filteredDocuments.length === 0 ? (
        <PageEmpty
          icon={FileText}
          message="아직 문서가 없습니다"
          description="프로젝트 문서를 등록해보세요."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
