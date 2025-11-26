'use client';

import { useEffect, useState } from 'react';
import { studentService } from '@/lib/student.service';
import { ProjectResponse, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { FolderKanban, Users, Calendar } from 'lucide-react';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await studentService.getMyProjects();
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
      <h1 className="text-3xl font-bold">โปรเจคของฉัน</h1>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">คุณยังไม่มีโปรเจคที่เข้าร่วม</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => {
            const daysUntil = getDaysUntilDeadline(project.deadline);
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{project.projectName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        PM: {project.pmUser?.firstName || 'ยังไม่มี PM'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">ระดับความยาก</p>
                      <p className="font-semibold">{project.difficultyLevel}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ระยะเวลา</p>
                      <p className="font-semibold">{project.durationDays} วัน</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">วันเริ่มต้น</p>
                      <p className="font-semibold">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className={`font-semibold ${daysUntil < 0 ? 'text-red-600' : daysUntil < 7 ? 'text-yellow-600' : ''}`}>
                        {formatDate(project.deadline)}
                        {daysUntil >= 0 && <span className="text-xs ml-1">({daysUntil} วัน)</span>}
                        {daysUntil < 0 && <span className="text-xs ml-1">(เลยกำหนด)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium">สมาชิกในทีม ({project.members.length})</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.members.map((member) => (
                        <span
                          key={member.id}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {member.firstName} ({member.specialty})
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
