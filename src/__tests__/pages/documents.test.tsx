import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Document } from '@/types/database';

vi.mock('@/lib/hooks/use-documents', () => ({
  useDocuments: vi.fn(),
  useCreateDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import DocumentsPage from '@/app/(dashboard)/services/[id]/documents/page';
import { useDocuments, useDeleteDocument } from '@/lib/hooks/use-documents';

const mockUseDocuments = vi.mocked(useDocuments);
const mockUseDeleteDocument = vi.mocked(useDeleteDocument);

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'API 명세서',
    description: 'REST API 설계 문서',
    doc_type: 'api',
    file_url: null,
    external_url: 'https://docs.example.com',
    version: '2.0',
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'doc-2',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'DB 설계서',
    description: null,
    doc_type: 'database',
    file_url: null,
    external_url: null,
    version: '1.0',
    created_at: '2026-02-11T00:00:00Z',
    updated_at: '2026-02-11T00:00:00Z',
  },
];

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteDocument.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
  });

  it('should show loading state', () => {
    mockUseDocuments.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDocuments.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByTestId('page-error')).toBeInTheDocument();
    expect(screen.getByText(/문서를 불러올 수 없습니다/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseDocuments.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText(/아직 문서가 없습니다/i)).toBeInTheDocument();
  });

  it('should render document cards', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText('API 명세서')).toBeInTheDocument();
    expect(screen.getByText('DB 설계서')).toBeInTheDocument();
  });

  it('should show doc type badges', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('DB')).toBeInTheDocument();
  });

  it('should show version info', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText('v2.0')).toBeInTheDocument();
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });

  it('should show "새 문서" button', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByRole('button', { name: /새 문서/i })).toBeInTheDocument();
  });

  it('should show title "문서"', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText('문서')).toBeInTheDocument();
  });

  it('should show filter buttons', () => {
    mockUseDocuments.mockReturnValue({
      data: mockDocuments, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DocumentsPage />);
    expect(screen.getByText('전체')).toBeInTheDocument();
  });
});
