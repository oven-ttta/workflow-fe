'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/admin.service';
import { authService } from '@/lib/auth.service';
import { ProjectStatusOverview, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { FolderKanban, Users, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<ProjectStatusOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await adminService.getProjectStatusOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  const stats = {
    total: overview?.allProjects.length || 0,
    dueSoon: overview?.projectsDueSoon.length || 0,
    overdue: overview?.overdueProjects.length || 0,
    needHelp: overview?.projectsNeedingHelp.length || 0,
    completed: overview?.allProjects.filter(p => p.status === 'DONE').length || 0,
    inProgress: overview?.allProjects.filter(p => p.status === 'IN_PROCESS').length || 0,
  };

  return (
    <div className="space-y-6 bg-orange-50 p-6 rounded-lg shadow-md shadow-gray-400/50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-gray-500/50 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard 🔒
        </h1>
        <p className="text-blue-100">
          ภาพรวมระบบจัดการน้องนักเรียน Part-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายการโปรเจคทั้งหมด</CardTitle>
            <FolderKanban className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-blue-100">ทั้งระบบ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใกล้ Deadline</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dueSoon}</div>
            <p className="text-xs text-yellow-100">ภายใน 7 วัน</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เลย Deadline</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-red-100">ต้องเร่งด่วน</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องการช่วยเหลือ</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.needHelp}</div>
            <p className="text-xs text-orange-100">HELP!!!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-purple-100">In Process</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสมบูรณ์</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-green-100">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>เมนูด่วน</CardTitle>
        </CardHeader>
        <CardContent className='shadow-lg shadow-gray-300/50 rounded-lg'>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
            <Link className='shadow-lg shadow-gray-300/50 rounded-lg' href="/admin/projects">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <FolderKanban className="h-8 w-8 text-blue-600" />
                <span className="font-medium">จัดการโปรเจค</span>
              </Button>
            </Link>
            <Link className='shadow-lg shadow-gray-300/50 rounded-lg' href="/admin/users">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-purple-600" />
                <span className="font-medium">จัดการผู้ใช้</span>
              </Button>
            </Link>
            <Link className='shadow-lg shadow-gray-300/50 rounded-lg' href="/admin/dashboard">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="font-medium">รายงานสรุป</span>
              </Button>
            </Link>
            <Link className='shadow-lg shadow-gray-300/50 rounded-lg' href="/student/profile">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-gray-600" />
                <span className="font-medium">โปรไฟล์</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {(stats.needHelp > 0 || stats.overdue > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {stats.needHelp > 0 && overview?.projectsNeedingHelp && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  โปรเจคต้องการความช่วยเหลือ ({stats.needHelp})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview.projectsNeedingHelp.slice(0, 3).map((project) => (
                    <Link key={project.id} href={`/admin/projects`}>
                      <div className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{project.projectName}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              PM: {project.pmUser?.firstName || 'ไม่มี PM'}
                            </p>
                          </div>
                          <span className="text-xs text-red-600 font-medium">ต้องการช่วยเหลือ</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.overdue > 0 && overview?.overdueProjects && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  โปรเจคเลย Deadline ({stats.overdue})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview.overdueProjects.slice(0, 3).map((project) => {
                    const daysOverdue = Math.abs(getDaysUntilDeadline(project.deadline));
                    return (
                      <Link key={project.id} href={`/admin/projects`}>
                        <div className="p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">{project.projectName}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Deadline: {formatDate(project.deadline)}
                              </p>
                            </div>
                            <span className="text-xs text-orange-600 font-medium">
                              เลย {daysOverdue} วัน
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Projects Due Soon */}
      {stats.dueSoon > 0 && overview?.projectsDueSoon && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              โปรเจคใกล้ Deadline ({stats.dueSoon})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.projectsDueSoon.slice(0, 5).map((project) => {
                const daysUntil = getDaysUntilDeadline(project.deadline);
                return (
                  <div
                    key={project.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{project.projectName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          PM: {project.pmUser?.firstName || 'ไม่มี PM'} • 
                          สมาชิก: {project.members.length} คน
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                        <p className="text-xs text-yellow-600 font-medium mt-2">
                          เหลือ {daysUntil} วัน
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Deadline: {formatDate(project.deadline)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
