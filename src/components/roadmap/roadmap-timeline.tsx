'use client';

import { StageCard, STAGE_ORDER } from '@/components/roadmap/stage-card';
import type { Stage, ServiceStage } from '@/types/database';

interface RoadmapTimelineProps {
  stages: Stage[];
  currentStage: ServiceStage;
  onEditStage: (stageName: ServiceStage, existing?: Stage) => void;
  onDeleteStage?: (stageName: ServiceStage) => void;
}

export function RoadmapTimeline({ stages, currentStage, onEditStage, onDeleteStage }: RoadmapTimelineProps) {
  const stageMap = new Map<ServiceStage, Stage>();
  stages.forEach((s) => stageMap.set(s.stage_name, s));

  return (
    <div className="space-y-6">
      {/* Horizontal connector line (desktop) */}
      <div className="hidden md:block relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stageName) => (
            <div key={stageName} className="relative flex-shrink-0">
              <StageCard
                stage={stageMap.get(stageName) || null}
                stageName={stageName}
                currentStage={currentStage}
                onEdit={onEditStage}
                onDelete={onDeleteStage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Vertical layout (mobile) */}
      <div className="md:hidden space-y-3">
        {STAGE_ORDER.map((stageName) => (
          <StageCard
            key={stageName}
            stage={stageMap.get(stageName) || null}
            stageName={stageName}
            currentStage={currentStage}
            onEdit={onEditStage}
            onDelete={onDeleteStage}
          />
        ))}
      </div>
    </div>
  );
}
