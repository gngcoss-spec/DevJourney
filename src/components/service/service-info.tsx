// @TASK P2-S4-T1 - Service Info Component
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST src/__tests__/pages/service-overview.test.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Service } from '@/types/database';

interface ServiceInfoProps {
  service: Service;
}

export function ServiceInfo({ service }: ServiceInfoProps) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          {service.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
              <p className="text-white">{service.description}</p>
            </div>
          )}

          {/* Goal */}
          {service.goal && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">Goal</h3>
              <p className="text-white">{service.goal}</p>
            </div>
          )}

          {/* Target Users */}
          {service.target_users && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">Target Users</h3>
              <p className="text-white">{service.target_users}</p>
            </div>
          )}

          {/* Tech Stack */}
          {service.tech_stack && service.tech_stack.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {service.tech_stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="bg-slate-800/50 text-slate-300 border-slate-700"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Role */}
          {service.ai_role && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">AI Role</h3>
              <p className="text-white">{service.ai_role}</p>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Progress</h3>
              <span className="text-sm font-medium text-white">{service.progress}%</span>
            </div>
            <Progress value={service.progress} aria-valuenow={service.progress} />
          </div>

          {/* Next Action */}
          {service.next_action && (
            <div className="pt-2">
              <h3 className="text-sm font-medium text-slate-400 mb-1">Next Action</h3>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-white font-medium">{service.next_action}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Decisions Placeholder */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Phase 3에서 구현 예정</p>
        </CardContent>
      </Card>
    </div>
  );
}
