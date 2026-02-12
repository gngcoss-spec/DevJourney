'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import type { TeamMember, TeamRole, MemberStatus } from '@/types/database';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

const roleVariants: Record<TeamRole, 'purple' | 'info' | 'neutral'> = {
  owner: 'purple',
  contributor: 'info',
  viewer: 'neutral',
};

const roleLabels: Record<TeamRole, string> = {
  owner: 'Owner',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

const statusVariants: Record<MemberStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  invited: 'warning',
  inactive: 'neutral',
};

const statusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
};

export function TeamMemberCard({ member, onEdit, onDelete }: TeamMemberCardProps) {
  return (
    <div className="bento-glass p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[hsl(var(--surface-overlay))] flex items-center justify-center text-sm font-semibold text-[hsl(var(--text-secondary))]">
            {member.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))]">{member.display_name}</h3>
            {member.email && (
              <p className="text-xs text-[hsl(var(--text-quaternary))]">{member.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(member)}
            aria-label="수정"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(member.id)}
            aria-label="삭제"
            className="hover:text-[hsl(var(--status-danger-text))]"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <StatusBadge variant={roleVariants[member.role]}>
          {roleLabels[member.role]}
        </StatusBadge>
        <StatusBadge variant={statusVariants[member.status]}>
          {statusLabels[member.status]}
        </StatusBadge>
      </div>
    </div>
  );
}
