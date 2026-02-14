// @TASK P3-S3-T1 - Work Item Modal - Activity Log Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-activity-log
// @TEST src/__tests__/components/tab-activity-log.test.tsx

'use client';

import { useState } from 'react';
import { MessageSquare, GitBranch, Settings, Pencil, Trash2 } from 'lucide-react';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/lib/hooks/use-comments';
import { IconWrapper } from '@/components/common/icon-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CommentType } from '@/types/database';

export interface TabActivityLogProps {
  workItemId: string;
}

const COMMENT_TYPE_ICON_CONFIG: Record<CommentType, { icon: React.ElementType; color: 'slate' | 'blue' }> = {
  comment: { icon: MessageSquare, color: 'slate' },
  status_change: { icon: GitBranch, color: 'blue' },
  system: { icon: Settings, color: 'slate' },
};

export function TabActivityLog({ workItemId }: TabActivityLogProps) {
  const [newComment, setNewComment] = useState('');
  const [authorName] = useState('User'); // TODO: Get from auth context
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments, isLoading } = useComments(workItemId);
  const createMutation = useCreateComment(workItemId);
  const updateMutation = useUpdateComment(workItemId);
  const deleteMutation = useDeleteComment(workItemId);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      return;
    }
    createMutation.mutate(
      {
        work_item_id: workItemId,
        author_name: authorName,
        content: newComment,
        comment_type: 'comment',
      },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleStartEdit = (commentId: string, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    updateMutation.mutate(
      { commentId: editingId, content: editContent },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent('');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      deleteMutation.mutate(commentId);
    }
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
      {/* Comment List */}
      {comments && comments.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`
                bento-glass p-3
                ${comment.comment_type === 'status_change' ? 'border-l-2 border-l-[hsl(var(--status-info-text))]' : ''}
              `}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  <IconWrapper
                    icon={COMMENT_TYPE_ICON_CONFIG[comment.comment_type].icon}
                    color={COMMENT_TYPE_ICON_CONFIG[comment.comment_type].color}
                    size="sm"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-[hsl(var(--text-quaternary))]">
                      {new Date(comment.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {comment.is_edited && (
                        <span className="ml-1 text-[hsl(var(--text-quaternary))]">(수정됨)</span>
                      )}
                    </span>
                    {/* Edit/Delete buttons for user comments only */}
                    {comment.comment_type === 'comment' && editingId !== comment.id && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment.id, comment.content)}
                          className="text-[hsl(var(--text-quaternary))] hover:text-[hsl(var(--text-secondary))]"
                          aria-label="댓글 수정"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="text-[hsl(var(--text-quaternary))] hover:text-[hsl(var(--status-danger-text))]"
                          aria-label="댓글 삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editContent.trim() || updateMutation.isPending}
                        >
                          {updateMutation.isPending ? '저장 중...' : '저장'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[hsl(var(--text-secondary))] whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {comments && comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[hsl(var(--text-quaternary))] mb-4">활동 로그가 없습니다</p>
        </div>
      )}

      {/* Add Comment Form */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Label htmlFor="new-comment">코멘트 추가</Label>
        <Textarea
          id="new-comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="코멘트를 입력하세요..."
          rows={3}
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
