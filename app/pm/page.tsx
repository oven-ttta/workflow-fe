'use client';

import { useEffect, useState } from 'react';
import { pmService } from '@/lib/pm.service';
import { authService } from '@/lib/auth.service';
import { ProjectResponse, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { FolderKanban, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function PMDashboard() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

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

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROCESS').length,
    needHelp: projects.filter(p => p.status === 'HELP').length,
    completed: projects.filter(p => p.status === 'DONE').length,
    dueSoon: projects.filter(p => {
      const days = getDaysUntilDeadline(p.deadline);
      return days >= 0 && days <= 7 && p.status !== 'DONE';
    }).length
  };

  return (
    <div className="space-y-6 bg-orange-50 p-6 rounded-lg shadow-md shadow-gray-400/50">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6 shadow-gray-400/50">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ยินดีต้อนรับ {currentUser?.firstName}! 👨‍💼
        </h1>
        <p className="text-gray-600">
          คุณกำลังดูแล <span className="font-semibold">{projects.length}</span> โปรเจค
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className='shadow-gray-400/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โปรเจคทั้งหมด</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">ที่คุณดูแล</p>
          </CardContent>
        </Card>

        <Card className='shadow-gray-400/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Process</p>
          </CardContent>
        </Card>

        <Card className='shadow-gray-400/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใกล้ Deadline</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">ภายใน 7 วัน</p>
          </CardContent>
        </Card>

        <Card className='shadow-gray-400/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องการความช่วยเหลือ</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.needHelp}</div>
            <p className="text-xs text-muted-foreground">HELP!!!</p>
          </CardContent>
        </Card>

        <Card className='shadow-gray-400/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสมบูรณ์</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='shadow-gray-400/50'>
        <CardHeader>
          <CardTitle>เมนูด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/pm/projects">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <FolderKanban className="h-6 w-6 mb-2" />
                <span>จัดการโปรเจค</span>
              </Button>
            </Link>
            <Link href="/pm/students">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span>รายชื่อนักเรียน</span>
              </Button>
            </Link>
            <Link href="/student/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span>โปรไฟล์</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card className='shadow-gray-400/50'>
        <CardHeader>
          <CardTitle>โปรเจคที่ดูแล</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <p className="text-gray-600">คุณยังไม่มีโปรเจคที่ต้องดูแล</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const daysUntil = getDaysUntilDeadline(project.deadline);
                const isOverdue = daysUntil < 0;
                const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <Link key={project.id} href={`/pm/projects/${project.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{project.projectName}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span>ระดับความยาก: {project.difficultyLevel}/5</span>
                            <span>•</span>
                            <span>ระยะเวลา: {project.durationDays} วัน</span>
                            <span>•</span>
                            <span>สมาชิก: {project.members.length} คน</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${PROJECT_STATUS_COLORS[project.status]}`}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">เริ่ม: </span>
                            <span className="font-medium">{formatDate(project.startDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Deadline: </span>
                            <span className={`font-medium ${
                              isOverdue ? 'text-red-600' : 
                              isDueSoon ? 'text-yellow-600' : 
                              'text-gray-900'
                            }`}>
                              {formatDate(project.deadline)}
                              {isOverdue && ' (เลยกำหนด)'}
                              {isDueSoon && !isOverdue && ` (${daysUntil} วัน)`}
                            </span>
                          </div>
                        </div>

                        {project.status === 'HELP' && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            ต้องการความช่วยเหลือ
                          </span>
                        )}
                      </div>

                      {project.members.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-600 mb-2">สมาชิกในทีม:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.members.map((member) => (
                              <span
                                key={member.id}
                                className="px-2 py-1 bg-gray-100 rounded text-xs"
                              >
                                {member.firstName} ({member.specialty})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
