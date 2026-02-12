'use client';

import { useState } from 'react';
import { Plus, ExternalLink, Trash2, Bot, Sparkles, Brain, Wrench } from 'lucide-react';
import { useAISessions, useCreateAISession, useDeleteAISession } from '@/lib/hooks/use-ai-sessions';
import { IconWrapper } from '@/components/common/icon-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AIProvider } from '@/types/database';

export interface TabAISessionsProps {
  workItemId: string;
}

const PROVIDER_OPTIONS = [
  { value: 'chatgpt' as const, label: 'ChatGPT', icon: Bot, color: 'green' as const },
  { value: 'gemini' as const, label: 'Gemini', icon: Sparkles, color: 'blue' as const },
  { value: 'claude' as const, label: 'Claude', icon: Brain, color: 'purple' as const },
  { value: 'other' as const, label: 'Other', icon: Wrench, color: 'slate' as const },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TabAISessions({ workItemId }: TabAISessionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    session_url: '',
    provider: 'chatgpt' as AIProvider,
    summary: '',
    key_decisions: '',
  });

  const { data: sessions, isLoading } = useAISessions(workItemId);
  const createMutation = useCreateAISession(workItemId);
  const deleteMutation = useDeleteAISession(workItemId);

  const handleAdd = () => {
    if (!newSession.title) return;
    createMutation.mutate(
      {
        work_item_id: workItemId,
        title: newSession.title,
        session_url: newSession.session_url || undefined,
        provider: newSession.provider,
        summary: newSession.summary || undefined,
        key_decisions: newSession.key_decisions || undefined,
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setNewSession({
            title: '',
            session_url: '',
            provider: 'chatgpt',
            summary: '',
            key_decisions: '',
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[hsl(var(--text-quaternary))]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session List */}
      {sessions && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => {
            const providerOption = PROVIDER_OPTIONS.find((p) => p.value === session.provider);
            return (
              <div
                key={session.id}
                className="bento-glass-hover p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {providerOption && (
                      <IconWrapper icon={providerOption.icon} color={providerOption.color} size="sm" />
                    )}
                    <h4 className="font-medium text-[hsl(var(--text-secondary))]">{session.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteMutation.mutate(session.id)}
                    aria-label="삭제"
                    className="hover:text-[hsl(var(--status-danger-text))]"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {session.session_url && (
                  <a
                    href={session.session_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[hsl(var(--status-info-text))] hover:underline transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    {session.session_url}
                  </a>
                )}

                {session.summary && (
                  <p className="text-sm text-[hsl(var(--text-tertiary))]">{session.summary}</p>
                )}

                {session.key_decisions && (
                  <p className="text-sm text-[hsl(var(--text-quaternary))]">
                    <span className="font-medium text-[hsl(var(--text-tertiary))]">핵심 결정:</span>{' '}
                    {session.key_decisions}
                  </p>
                )}

                <p className="text-xs text-[hsl(var(--text-quaternary))]">
                  {formatDate(session.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {sessions && sessions.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <p className="text-[hsl(var(--text-quaternary))] mb-4">AI 세션이 없습니다</p>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bento-glass p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-title">
              제목 <span className="text-[hsl(var(--status-danger-text))]">*</span>
            </Label>
            <Input
              id="session-title"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              placeholder="세션 제목"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-url">URL</Label>
            <Input
              id="session-url"
              type="url"
              value={newSession.session_url}
              onChange={(e) => setNewSession({ ...newSession, session_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-provider">제공자</Label>
            <Select
              value={newSession.provider}
              onValueChange={(value) =>
                setNewSession({ ...newSession, provider: value as AIProvider })
              }
            >
              <SelectTrigger id="session-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-summary">요약</Label>
            <Textarea
              id="session-summary"
              value={newSession.summary}
              onChange={(e) => setNewSession({ ...newSession, summary: e.target.value })}
              placeholder="세션 요약"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-key-decisions">핵심 결정</Label>
            <Textarea
              id="session-key-decisions"
              value={newSession.key_decisions}
              onChange={(e) => setNewSession({ ...newSession, key_decisions: e.target.value })}
              placeholder="이 세션에서 내린 핵심 결정 사항"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!newSession.title || createMutation.isPending}>
              {createMutation.isPending ? '추가 중...' : '추가'}
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          세션 추가
        </Button>
      )}
    </div>
  );
}
