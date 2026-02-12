'use client';

import { useState } from 'react';
import { useTeamMembers, useDeleteTeamMember } from '@/lib/hooks/use-team';
import { TeamMemberCard } from '@/components/team/team-member-card';
import { InviteForm } from '@/components/team/invite-form';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@/components/common/page-loading';
import { Modal } from '@/components/common/modal';
import { BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
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
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-[hsl(var(--status-danger-text))]">에러가 발생했습니다</p>
          <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">팀 목록을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="팀 관리">
        <Button onClick={() => setIsFormOpen(true)}>
          멤버 초대
        </Button>
      </PageHeader>

      <Modal isOpen={isFormOpen} onClose={handleClose} size="md">
        <InviteForm
          onClose={handleClose}
          existingMember={editingMember}
        />
      </Modal>

      {!members || members.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-[hsl(var(--text-tertiary))] text-lg">아직 팀 멤버가 없습니다</p>
            <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">
              팀 멤버를 초대하여 함께 작업하세요.
            </p>
          </div>
        </div>
      ) : (
        <BentoGrid columns={3}>
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </BentoGrid>
      )}
    </div>
  );
}
