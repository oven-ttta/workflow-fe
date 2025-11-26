'use client';

import { useEffect, useState } from 'react';
import { pmService } from '@/lib/pm.service';
import { ProjectResponse, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function PMProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await pmService.getMyManagedProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โปรเจคที่ดูแล</h1>
          <p className="text-gray-600 mt-1">จัดการและติดตามความคืบหน้าโปรเจค</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">โปรเจคทั้งหมด</p>
          <p className="text-3xl font-bold">{projects.length}</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">คุณยังไม่มีโปรเจคที่ต้องดูแล</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => {
            const daysUntil = getDaysUntilDeadline(project.deadline);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

            return (
              <Link key={project.id} href={`/pm/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{project.projectName}</CardTitle>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>📊 ระดับ: {project.difficultyLevel}/5</span>
                          <span>⏱️ {project.durationDays} วัน</span>
                          <span>👥 {project.members.length} สมาชิก</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <p className="text-gray-600 mb-1">เริ่มโปรเจค</p>
                          <p className="font-medium">{formatDate(project.startDate)}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 mb-1">Deadline</p>
                          <p className={`font-medium ${
                            isOverdue ? 'text-red-600' : 
                            isDueSoon ? 'text-yellow-600' : 
                            'text-gray-900'
                          }`}>
                            {formatDate(project.deadline)}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 mb-1">เวลาคงเหลือ</p>
                          <p className={`font-medium ${
                            isOverdue ? 'text-red-600' : 
                            isDueSoon ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {isOverdue ? `เลย ${Math.abs(daysUntil)} วัน` : `${daysUntil} วัน`}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>ความคืบหน้า</span>
                          <span>
                            {project.status === 'DONE' ? '100%' :
                             project.status === 'REVIEW' ? '90%' :
                             project.status === 'TEST' ? '75%' :
                             project.status === 'IN_PROCESS' ? '50%' :
                             project.status === 'NOT_STARTED' ? '0%' : '0%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              project.status === 'DONE' ? 'bg-green-500 w-full' :
                              project.status === 'REVIEW' ? 'bg-purple-500 w-[90%]' :
                              project.status === 'TEST' ? 'bg-yellow-500 w-[75%]' :
                              project.status === 'IN_PROCESS' ? 'bg-blue-500 w-1/2' :
                              'bg-gray-400 w-0'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Team Members */}
                      {project.members.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2">👥 สมาชิกในทีม:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.members.map((member) => (
                              <span
                                key={member.id}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {member.firstName} • {member.specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
