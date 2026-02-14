// @TASK P3-S3-T1 - Work Item Modal Container
// @SPEC docs/planning/TASKS.md#work-item-modal
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabBasicInfo } from './tab-basic-info';
import { TabDecision } from './tab-decision';
import { TabAISessions } from './tab-ai-sessions';
import { TabActivityLog } from './tab-activity-log';
import type { WorkItem, WorkItemStatus } from '@/types/database';
import { useCreateWorkItem, useUpdateWorkItem, useDeleteWorkItem } from '@/lib/hooks/use-work-items';
import { useCreateStatusChangeLog } from '@/lib/hooks/use-comments';
import type { CreateWorkItemInput, UpdateWorkItemInput } from '@/types/database';

export interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem?: WorkItem;
  serviceId: string;
  defaultStatus?: WorkItemStatus;
}

type TabType = 'basic' | 'decision' | 'ai-sessions' | 'activity';

export function WorkItemModal({ isOpen, onClose, workItem, serviceId, defaultStatus }: WorkItemModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<CreateWorkItemInput | UpdateWorkItemInput>>(
    workItem || {
      title: '',
      description: '',
      type: 'feature',
      priority: 'medium',
      status: defaultStatus || 'backlog',
      assignee_name: '',
      due_date: '',
      labels: [],
      assignee_id: '',
      story_points: null,
      parent_id: null,
    }
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditMode = !!workItem;
  const createMutation = useCreateWorkItem();
  const updateMutation = useUpdateWorkItem();
  const deleteMutation = useDeleteWorkItem(serviceId);
  const statusChangeMutation = useCreateStatusChangeLog(workItem?.id ?? '');

  if (!isOpen) {
    return null;
  }

  const handleFormChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error when user types
    if (field === 'title' && value) {
      setValidationError(null);
    }
  };

  const handleSave = () => {
    if (!formData.title || (typeof formData.title === 'string' && !formData.title.trim())) {
      setValidationError('제목을 입력해주세요');
      return;
    }

    if (isEditMode && workItem) {
      // 상태 변경 시 활동 로그 자동 기록
      if (formData.status && formData.status !== workItem.status) {
        statusChangeMutation.mutate({
          fromStatus: workItem.status,
          toStatus: formData.status as string,
        });
      }
      updateMutation.mutate({
        id: workItem.id,
        serviceId: workItem.service_id,
        data: formData as UpdateWorkItemInput,
      });
    } else {
      createMutation.mutate({
        service_id: serviceId,
        title: formData.title,
        ...formData,
      } as CreateWorkItemInput);
    }

    onClose();
  };

  const tabs = [
    { id: 'basic' as TabType, label: '기본정보', disabled: false },
    { id: 'decision' as TabType, label: '의사결정', disabled: false },
    { id: 'ai-sessions' as TabType, label: 'AI 세션', disabled: !isEditMode },
    { id: 'activity' as TabType, label: '활동로그', disabled: !isEditMode },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-[640px] max-h-[80vh] bg-background rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-[hsl(var(--text-primary))]">
            {isEditMode ? '작업 아이템 수정' : '작업 아이템 생성'}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          className="flex border-b border-border bg-[hsl(var(--surface))]"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-disabled={tab.disabled}
              aria-controls={`panel-${tab.id}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-[hsl(var(--text-primary))] border-b-2 border-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--text-quaternary))] hover:text-[hsl(var(--text-secondary))]'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'basic' && (
            <>
              {validationError && (
                <div className="mb-4 p-3 bg-[hsl(var(--status-danger-bg))] border border-[hsl(var(--status-danger-text))]/30 rounded-md">
                  <p className="text-sm text-[hsl(var(--status-danger-text))]">{validationError}</p>
                </div>
              )}
              <TabBasicInfo
                formData={formData}
                onChange={handleFormChange}
                isEditMode={isEditMode}
                serviceId={serviceId}
                workItemId={workItem?.id}
              />
            </>
          )}
          {activeTab === 'decision' && (
            <TabDecision
              formData={formData}
              onChange={handleFormChange}
            />
          )}
          {activeTab === 'ai-sessions' && workItem && (
            <TabAISessions workItemId={workItem.id} />
          )}
          {activeTab === 'activity' && workItem && (
            <TabActivityLog workItemId={workItem.id} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div>
            {isEditMode && workItem && (
              <Button
                variant="ghost"
                className="text-[hsl(var(--status-danger-text))]"
                onClick={() => {
                  if (window.confirm('이 작업 아이템을 삭제하시겠습니까?')) {
                    deleteMutation.mutate(workItem.id, {
                      onSuccess: () => onClose(),
                    });
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            {!isEditMode && (
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? '저장 중...' : '저장'}
              </Button>
            )}
            {isEditMode && (
              <span className="text-sm text-[hsl(var(--text-quaternary))]">
                {updateMutation.isPending ? '저장 중...' : '자동 저장됨'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
