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
    <div className="space-y-6 p-6 rounded-[25px] bg-[#FCC360]">
      {/* Welcome Section */}
      <div className="bg-white p-6 text-black rounded-xl">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-black/60">
          ภาพรวมระบบจัดการน้องนักเรียน Part-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-[#C1DCFF] text-black rounded-lg border border-[#C1DCFF]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายการโปรเจคทั้งหมด</CardTitle>
            <FolderKanban className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-black">ทั้งระบบ</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFF3D0] text-black rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใกล้ Deadline</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dueSoon}</div>
            <p className="text-xs text-black">ภายใน 7 วัน</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F36F6F] text-black rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เลย Deadline</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-black">ต้องเร่งด่วน</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFE771] text-black rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องการช่วยเหลือ</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.needHelp}</div>
            <p className="text-xs text-black">HELP!!!</p>
          </CardContent>
        </Card>

        <Card className="bg-[#EAAFFF] text-black rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-black">In Process</p>
          </CardContent>
        </Card>

        <Card className="bg-[#8FEEDB] text-black rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสมบูรณ์</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-black">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>เมนูด่วน</CardTitle>
        </CardHeader>
        <CardContent className='rounded-lg'>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link className='' href="/admin/projects">
              <Button variant="outline" className="bg-[#FFF3D0] w-full h-24 flex flex-col items-center justify-center gap-2">
                <FolderKanban className="h-8 w-8 text-black" />
                <span className="font-medium">จัดการโปรเจค</span>
              </Button>
            </Link>
            <Link className='' href="/admin/users">
              <Button variant="outline" className="bg-[#FFF3D0] w-full h-24 flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-black" />
                <span className="font-medium">จัดการผู้ใช้</span>
              </Button>
            </Link>
            <Link className=' ' href="/admin/dashboard">
              <Button variant="outline" className="bg-[#FFF3D0] w-full h-24 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="h-8 w-8 text-black" />
                <span className="font-medium">รายงานสรุป</span>
              </Button>
            </Link>
            <Link className='' href="/student/profile">
              <Button variant="outline" className="bg-[#FFF3D0] w-full h-24 flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-black" />
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
            <Card className="bg-red-50">
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
                      <div className="p-3 bg-white rounded-lg transition-colors cursor-pointer">
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
            <Card className="bg-orange-50">
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
                        <div className="p-3 bg-white rounded-lg transition-colors cursor-pointer">
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
                    className="p-4 rounded-lg hover:bg-gray-50 transition-colors"
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
