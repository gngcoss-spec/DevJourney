// @TASK P3-S3-T1 - Work Item Modal - AI Sessions Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-ai-sessions
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getAISessions, createAISession, deleteAISession } from '@/lib/supabase/queries/ai-sessions';
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
  { value: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
  { value: 'gemini', label: 'Gemini', icon: '💎' },
  { value: 'claude', label: 'Claude', icon: '🧠' },
  { value: 'other', label: 'Other', icon: '🔧' },
] as const;

export function TabAISessions({ workItemId }: TabAISessionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    session_url: '',
    provider: 'chatgpt' as AIProvider,
    summary: '',
  });

  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['ai-sessions', workItemId],
    queryFn: () => getAISessions(supabase, workItemId),
    enabled: !!workItemId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAISession(supabase, {
        work_item_id: workItemId,
        title: newSession.title,
        session_url: newSession.session_url || undefined,
        provider: newSession.provider,
        summary: newSession.summary || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions', workItemId] });
      setIsAdding(false);
      setNewSession({
        title: '',
        session_url: '',
        provider: 'chatgpt',
        summary: '',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => deleteAISession(supabase, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions', workItemId] });
    },
  });

  const handleAdd = () => {
    if (!newSession.title) {
      return;
    }
    createMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-400">로딩 중...</p>
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
                className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{providerOption?.icon}</span>
                    <h4 className="font-medium text-slate-100">{session.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteMutation.mutate(session.id)}
                    aria-label="삭제"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>

                {session.session_url && (
                  <a
                    href={session.session_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {session.session_url}
                  </a>
                )}

                {session.summary && (
                  <p className="text-sm text-slate-300">{session.summary}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {sessions && sessions.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">AI 세션이 없습니다</p>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="space-y-2">
            <Label htmlFor="session-title" className="text-sm font-medium text-slate-100">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-title"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              placeholder="세션 제목"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-url" className="text-sm font-medium text-slate-100">
              URL
            </Label>
            <Input
              id="session-url"
              type="url"
              value={newSession.session_url}
              onChange={(e) => setNewSession({ ...newSession, session_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-provider" className="text-sm font-medium text-slate-100">
              제공자
            </Label>
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
                    {option.icon} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-summary" className="text-sm font-medium text-slate-100">
              요약
            </Label>
            <Textarea
              id="session-summary"
              value={newSession.summary}
              onChange={(e) => setNewSession({ ...newSession, summary: e.target.value })}
              placeholder="세션 요약"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!newSession.title || createMutation.isPending}>
              {createMutation.isPending ? '추가 중...' : '추가'}
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
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
