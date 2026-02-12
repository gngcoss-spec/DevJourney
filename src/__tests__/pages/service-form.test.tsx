// @TASK P2-S3-T1 - Service Form UI TDD
// @SPEC docs/planning/TASKS.md#service-form
// @TEST Service 등록/편집 폼 컴포넌트 테스트

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceForm, type ServiceFormValues } from '@/components/service/service-form';

describe('ServiceForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('생성 모드 (mode: create)', () => {
    it('빈 폼을 렌더링한다', () => {
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      );

      // 기본 필드 존재 확인
      expect(screen.getByLabelText(/서비스명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/설명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/목표/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/대상 사용자/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/현재 단계/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/현재 서버/i)).toBeInTheDocument();
      expect(screen.getByText(/기술 스택/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/AI 역할/i)).toBeInTheDocument();

      // 기술 스택 카테고리 확인
      expect(screen.getByLabelText('Frontend')).toBeInTheDocument();
      expect(screen.getByLabelText('Backend')).toBeInTheDocument();
      expect(screen.getByLabelText('AI Engine')).toBeInTheDocument();
      expect(screen.getByLabelText('Deployment')).toBeInTheDocument();

      // 제출 버튼
      expect(screen.getByRole('button', { name: /생성/i })).toBeInTheDocument();
    });

    it('필수 필드(서비스명) 미입력 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /생성/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/서비스명을 입력해주세요/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('폼 제출 시 올바른 데이터로 onSubmit을 호출한다', async () => {
      const user = userEvent.setup();
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      );

      // 필수 필드 입력
      const nameInput = screen.getByLabelText(/서비스명/i);
      await user.type(nameInput, 'Test Service');

      // 선택 필드 입력
      const descriptionTextarea = screen.getByLabelText(/설명/i);
      await user.type(descriptionTextarea, 'Test description');

      // 제출
      const submitButton = screen.getByRole('button', { name: /생성/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Service',
            description: 'Test description',
            current_stage: 'idea', // 기본값
            tech_stack: expect.objectContaining({
              frontend: [],
              backend: [],
            }),
          })
        );
      });
    });
  });

  describe('편집 모드 (mode: edit)', () => {
    const defaultValues: Partial<ServiceFormValues> = {
      name: 'Existing Service',
      description: 'Existing description',
      goal: 'Existing goal',
      target_users: 'Developers',
      current_stage: 'development',
      current_server: 'https://example.com',
      tech_stack: { frontend: ['React'], backend: ['Node.js'] },
      ai_role: 'Code assistant',
    };

    it('기존 데이터로 폼을 프리필한다', () => {
      render(
        <ServiceForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByDisplayValue('Existing Service')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing goal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Developers')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Code assistant')).toBeInTheDocument();

      // 기술 스택 태그 확인
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();

      // 버튼 텍스트 확인
      expect(screen.getByRole('button', { name: /수정/i })).toBeInTheDocument();
    });
  });

  describe('기술 스택 카테고리별 태그 입력', () => {
    it('Frontend 카테고리에 쉼표로 태그를 추가할 수 있다', async () => {
      const user = userEvent.setup();
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      );

      const frontendInput = screen.getByLabelText('Frontend');
      await user.type(frontendInput, 'React,');

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });

    it('Backend 카테고리에 엔터키로 태그를 추가할 수 있다', async () => {
      const user = userEvent.setup();
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
        />
      );

      const backendInput = screen.getByLabelText('Backend');
      await user.type(backendInput, 'Supabase{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Supabase')).toBeInTheDocument();
      });
    });

    it('태그의 X 버튼으로 삭제할 수 있다', async () => {
      const user = userEvent.setup();
      render(
        <ServiceForm
          mode="edit"
          defaultValues={{ tech_stack: { frontend: ['React', 'Vue'], backend: [] } }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Vue')).toBeInTheDocument();

      // 첫 번째 삭제 버튼 클릭 (React)
      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Vue')).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('isLoading이 true일 때 버튼이 비활성화된다', () => {
      render(
        <ServiceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /생성 중/i });
      expect(submitButton).toBeDisabled();
    });
  });
});
