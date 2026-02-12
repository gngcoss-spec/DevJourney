'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TeamMember, TeamRole, MemberStatus } from '@/types/database';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

const roleStyles: Record<TeamRole, string> = {
  owner: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  contributor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const roleLabels: Record<TeamRole, string> = {
  owner: 'Owner',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

const statusStyles: Record<MemberStatus, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  invited: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const statusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
};

export function TeamMemberCard({ member, onEdit, onDelete }: TeamMemberCardProps) {
  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300">
            {member.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-200">{member.display_name}</h3>
            {member.email && (
              <p className="text-xs text-slate-500">{member.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(member)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Badge variant="outline" className={roleStyles[member.role]}>
          {roleLabels[member.role]}
        </Badge>
        <Badge variant="outline" className={statusStyles[member.status]}>
          {statusLabels[member.status]}
        </Badge>
      </div>
    </div>
  );
}
