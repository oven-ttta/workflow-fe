'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/admin.service';
import { ProjectStatusOverview, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { 
  FolderKanban, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<ProjectStatusOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminService.getProjectStatusOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!overview) return <div>ไม่สามารถโหลดข้อมูลได้</div>;

  const stats = {
    total: overview.allProjects.length,
    dueSoon: overview.projectsDueSoon.length,
    overdue: overview.overdueProjects.length,
    needHelp: overview.projectsNeedingHelp.length,
    notStarted: overview.allProjects.filter(p => p.status === 'NOT_STARTED').length,
    inProgress: overview.allProjects.filter(p => p.status === 'IN_PROCESS').length,
    testing: overview.allProjects.filter(p => p.status === 'TEST').length,
    review: overview.allProjects.filter(p => p.status === 'REVIEW').length,
    done: overview.allProjects.filter(p => p.status === 'DONE').length,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.done / stats.total) * 100) 
    : 0;

  const inProgressRate = stats.total > 0 
    ? Math.round((stats.inProgress / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 Dashboard & Reports</h1>
            <p className="text-indigo-100">ภาพรวมและรายงานสถานะโปรเจคทั้งหมด</p>
          </div>
          <Activity className="w-16 h-16 text-indigo-200" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โปรเจคทั้งหมด</CardTitle>
            <FolderKanban className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-blue-100 mt-1">ทั้งระบบ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เสร็จสมบูรณ์</CardTitle>
            <CheckCircle className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.done}</div>
            <p className="text-xs text-green-100 mt-1">
              คิดเป็น {completionRate}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <TrendingUp className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-purple-100 mt-1">
              คิดเป็น {inProgressRate}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องการความช่วยเหลือ</CardTitle>
            <AlertCircle className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.needHelp}</div>
            <p className="text-xs text-red-100 mt-1">ต้องดูแลเร่งด่วน!</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="shadow-lg shadow-gray-300/50 rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            สถิติตามสถานะโปรเจค
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              <p className="text-xs text-gray-600 mt-1">ยังไม่เริ่ม</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-blue-600 mt-1">กำลังทำ</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.testing}</p>
              <p className="text-xs text-yellow-600 mt-1">Testing</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.review}</p>
              <p className="text-xs text-purple-600 mt-1">Review</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.done}</p>
              <p className="text-xs text-green-600 mt-1">เสร็จสิ้น</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.needHelp}</p>
              <p className="text-xs text-red-600 mt-1">ต้องการช่วยเหลือ</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">ความคืบหน้ารวม</span>
              <span className="text-gray-600">
                {stats.done} / {stats.total} โปรเจค ({completionRate}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${completionRate}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects Needing Help */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              โปรเจคต้องการความช่วยเหลือ ({stats.needHelp})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview.projectsNeedingHelp.length === 0 ? (
              <p className="text-center py-4 text-gray-600">ไม่มีโปรเจคที่ต้องการความช่วยเหลือ ✅</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {overview.projectsNeedingHelp.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{project.projectName}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          PM: {project.pmUser?.firstName || 'ไม่มี PM'} • 
                          สมาชิก: {project.members.length} คน
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium whitespace-nowrap">
                        HELP!!!
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Deadline: {formatDate(project.deadline)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {stats.needHelp > 0 && (
              <Link href="/admin/projects">
                <Button className="w-full mt-3" variant="destructive">
                  ดูทั้งหมด
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Overdue Projects */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              โปรเจคเลย Deadline ({stats.overdue})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview.overdueProjects.length === 0 ? (
              <p className="text-center py-4 text-gray-600">ไม่มีโปรเจคที่เลย Deadline ✅</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {overview.overdueProjects.map((project) => {
                  const daysOverdue = Math.abs(getDaysUntilDeadline(project.deadline));
                  return (
                    <div
                      key={project.id}
                      className="p-4 bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">{project.projectName}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            PM: {project.pmUser?.firstName || 'ไม่มี PM'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium whitespace-nowrap">
                          เลย {daysOverdue} วัน
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Deadline: {formatDate(project.deadline)}
                        </span>
                        <span className={`px-2 py-1 rounded ${PROJECT_STATUS_COLORS[project.status]}`}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {stats.overdue > 0 && (
              <Link href="/admin/projects">
                <Button className="w-full mt-3" variant="outline">
                  ดูทั้งหมด
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects Due Soon */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            โปรเจคใกล้ Deadline ({stats.dueSoon})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.projectsDueSoon.length === 0 ? (
            <p className="text-center py-4 text-gray-600">ไม่มีโปรเจคที่ใกล้ Deadline</p>
          ) : (
            <div className="space-y-3">
              {overview.projectsDueSoon.slice(0, 5).map((project) => {
                const daysUntil = getDaysUntilDeadline(project.deadline);
                return (
                  <div
                    key={project.id}
                    className="p-4 bg-white rounded-lg border border-yellow-200 hover:border-yellow-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{project.projectName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          PM: {project.pmUser?.firstName || 'ไม่มี PM'} • 
                          สมาชิก: {project.members.length} คน • 
                          ระดับ: {project.difficultyLevel}/5
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                        <p className="text-sm text-yellow-600 font-medium mt-2">
                          เหลือ {daysUntil} วัน
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>เริ่ม: {formatDate(project.startDate)}</span>
                      <span>Deadline: {formatDate(project.deadline)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {stats.dueSoon > 5 && (
            <Link href="/admin/projects">
              <Button className="w-full mt-3" variant="outline">
                ดูทั้งหมด ({stats.dueSoon} โปรเจค)
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg shadow-gray-300/50 rounded-lg">
        <CardHeader>
          <CardTitle>เครื่องมือจัดการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/projects">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FolderKanban className="w-6 h-6" />
                <span className="text-sm">จัดการโปรเจค</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">จัดการผู้ใช้</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">Overview</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" onClick={loadData}>
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">รีเฟรช</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}