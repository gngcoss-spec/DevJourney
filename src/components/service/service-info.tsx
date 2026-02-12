'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle } from '@/components/ui/bento-grid';
import type { Service } from '@/types/database';
import { arrayToTechStack } from '@/lib/utils/tech-stack';

const TECH_STACK_LABELS = [
  { key: 'frontend' as const, label: 'Frontend' },
  { key: 'backend' as const, label: 'Backend' },
  { key: 'ai_engine' as const, label: 'AI Engine' },
  { key: 'visualization' as const, label: 'Visualization' },
  { key: 'security' as const, label: 'Security' },
  { key: 'integration' as const, label: 'Integration' },
  { key: 'deployment' as const, label: 'Deployment' },
];

interface ServiceInfoProps {
  service: Service;
}

export function ServiceInfo({ service }: ServiceInfoProps) {
  return (
    <div className="space-y-6">
      <BentoGrid columns={2}>
        {/* Description + Goal */}
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle className="text-subheading">Overview</BentoCardTitle>
          </BentoCardHeader>
          <div className="space-y-4">
            {service.description && (
              <div>
                <h3 className="text-caption mb-1">Description</h3>
                <p className="text-body">{service.description}</p>
              </div>
            )}
            {service.goal && (
              <div>
                <h3 className="text-caption mb-1">Goal</h3>
                <p className="text-body">{service.goal}</p>
              </div>
            )}
            {service.target_users && (
              <div>
                <h3 className="text-caption mb-1">Target Users</h3>
                <p className="text-body">{service.target_users}</p>
              </div>
            )}
            {service.ai_role && (
              <div>
                <h3 className="text-caption mb-1">AI Role</h3>
                <p className="text-body">{service.ai_role}</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Progress + Next Action + Tech Stack */}
        <BentoCard>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-caption">Progress</h3>
                <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{service.progress}%</span>
              </div>
              <Progress value={service.progress} aria-valuenow={service.progress} />
            </div>

            {/* Next Action */}
            {service.next_action && (
              <div>
                <h3 className="text-caption mb-1">Next Action</h3>
                <div className="bg-[hsl(var(--status-info-bg))] border border-[hsl(var(--status-info-border))] rounded-[var(--radius-lg)] p-3">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{service.next_action}</p>
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {service.tech_stack && service.tech_stack.length > 0 && (() => {
              const categorized = arrayToTechStack(service.tech_stack);
              return (
                <div>
                  <h3 className="text-caption mb-2">Tech Stack</h3>
                  <div className="space-y-2">
                    {TECH_STACK_LABELS.map(({ key, label }) => {
                      const items = categorized[key];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={key}>
                          <span className="text-xs text-[hsl(var(--text-quaternary))] mr-2">{label}</span>
                          <div className="inline-flex flex-wrap gap-1.5">
                            {items.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="bg-[hsl(var(--surface-overlay))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border-default))]"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Recent Decisions Placeholder */}
      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle className="text-subheading">Recent Decisions</BentoCardTitle>
        </BentoCardHeader>
        <p className="text-caption">Phase 3에서 구현 예정</p>
      </BentoCard>
    </div>
  );
}
