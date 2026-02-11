// @TASK P3-S3-T1 - Work Item Modal - Activity Log Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-activity-log
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, GitBranch, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getComments, createComment } from '@/lib/supabase/queries/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CommentType } from '@/types/database';

export interface TabActivityLogProps {
  workItemId: string;
}

const COMMENT_TYPE_ICONS: Record<CommentType, React.ReactNode> = {
  comment: <MessageSquare className="h-4 w-4 text-slate-400" />,
  status_change: <GitBranch className="h-4 w-4 text-blue-400" />,
  system: <Settings className="h-4 w-4 text-slate-500" />,
};

export function TabActivityLog({ workItemId }: TabActivityLogProps) {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('User'); // TODO: Get from auth context

  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', workItemId],
    queryFn: () => getComments(supabase, workItemId),
    enabled: !!workItemId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createComment(supabase, {
        work_item_id: workItemId,
        author_name: authorName,
        content: newComment,
        comment_type: 'comment',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workItemId] });
      setNewComment('');
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
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
      {/* Comment List */}
      {comments && comments.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`
                p-3 rounded-lg border
                ${
                  comment.comment_type === 'status_change'
                    ? 'bg-blue-900/20 border-blue-700/50'
                    : comment.comment_type === 'system'
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-800 border-slate-700'
                }
              `}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">{COMMENT_TYPE_ICONS[comment.comment_type]}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {comments && comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">활동 로그가 없습니다</p>
        </div>
      )}

      {/* Add Comment Form */}
      <div className="space-y-2 pt-4 border-t border-slate-700">
        <Label htmlFor="new-comment" className="text-sm font-medium text-slate-100">
          코멘트 추가
        </Label>
        <Textarea
          id="new-comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="코멘트를 입력하세요..."
          rows={3}
          className="bg-slate-800"
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || createMutation.isPending}
          size="sm"
        >
          {createMutation.isPending ? '추가 중...' : '추가'}
        </Button>
      </div>
    </div>
  );
}
