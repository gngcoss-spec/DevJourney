'use client';

import { useState } from 'react';
import { useTeamMembers, useDeleteTeamMember } from '@/lib/hooks/use-team';
import { TeamMemberCard } from '@/components/team/team-member-card';
import { InviteForm } from '@/components/team/invite-form';
import type { TeamMember } from '@/types/database';

export default function TeamPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined);

  const { data: members, isLoading, isError } = useTeamMembers();
  const deleteTeamMember = useDeleteTeamMember();

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTeamMember.mutate(id);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingMember(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-slate-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-400">에러가 발생했습니다</p>
          <p className="text-sm text-slate-500 mt-2">팀 목록을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-50">팀 관리</h1>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          멤버 초대
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <InviteForm
              onClose={handleClose}
              existingMember={editingMember}
            />
          </div>
        </div>
      )}

      {!members || members.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-slate-400 text-lg">아직 팀 멤버가 없습니다</p>
            <p className="text-sm text-slate-500 mt-2">
              팀 멤버를 초대하여 함께 작업하세요.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
