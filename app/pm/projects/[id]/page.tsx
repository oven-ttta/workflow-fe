'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pmService } from '@/lib/pm.service';
import { ProjectResponse, User, PROJECT_STATUSES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, Users, UserPlus, UserMinus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function PMProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const projectId = Number(params.id);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectData, studentsData] = await Promise.all([
        pmService.getProjectDetails(projectId),
        pmService.getAvailableStudents()
      ]);
      setProject(projectData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      const updated = await pmService.updateProjectStatus(projectId, status);
      setProject(updated);
      toast.success('อัพเดตสถานะสำเร็จ!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดตสถานะได้');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      await pmService.addMemberToProject(projectId, userId);
      toast.success('เพิ่มสมาชิกสำเร็จ!');
      await loadData();
      setShowAddMember(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถเพิ่มสมาชิกได้');
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`ต้องการลบ ${userName} ออกจากโปรเจคหรือไม่?`)) return;
    
    try {
      await pmService.removeMemberFromProject(projectId, userId);
      toast.success('ลบสมาชิกสำเร็จ!');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบสมาชิกได้');
    }
  };

  if (isLoading) return <Loading />;
  if (!project) return <div>ไม่พบโปรเจค</div>;

  const daysUntil = getDaysUntilDeadline(project.deadline);
  const isOverdue = daysUntil < 0;
  const memberIds = project.members.map(m => m.id);
  const availableStudents = students.filter(s => !memberIds.includes(s.id) && s.role === 'STUDENT');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pm/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.projectName}</h1>
          <p className="text-gray-600 mt-1">จัดการโปรเจคและทีมงาน</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>รายละเอียดโปรเจค</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                สถานะปัจจุบัน
              </label>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>

            {/* Update Status */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                เปลี่ยนสถานะ
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_STATUSES.map((status) => (
                  <Button
                    key={status}
                    variant={project.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(status)}
                    disabled={isUpdating || project.status === status}
                  >
                    {PROJECT_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">ระดับความยาก</p>
                <p className="font-semibold text-lg">
                  {'⭐'.repeat(project.difficultyLevel)} ({project.difficultyLevel}/5)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ระยะเวลา</p>
                <p className="font-semibold text-lg">{project.durationDays} วัน</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">วันเริ่มต้น</p>
                <p className="font-semibold">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Deadline</p>
                <p className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                  {formatDate(project.deadline)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">เวลาคงเหลือ</p>
                <p className={`font-semibold text-lg ${
                  isOverdue ? 'text-red-600' : daysUntil <= 7 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {isOverdue ? `เลย ${Math.abs(daysUntil)} วัน ⚠️` : `${daysUntil} วัน`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติโปรเจค</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">สมาชิกในทีม</p>
              <p className="text-3xl font-bold text-blue-600">{project.members.length}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">สถานะ</p>
              <p className="text-sm font-semibold">{PROJECT_STATUS_LABELS[project.status]}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ความคืบหน้า</p>
              <p className="text-2xl font-bold text-green-600">
                {project.status === 'DONE' ? '100%' :
                 project.status === 'REVIEW' ? '90%' :
                 project.status === 'TEST' ? '75%' :
                 project.status === 'IN_PROCESS' ? '50%' : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              สมาชิกในทีม ({project.members.length})
            </CardTitle>
            <Button onClick={() => setShowAddMember(!showAddMember)} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              เพิ่มสมาชิก
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Member Section */}
          {showAddMember && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-semibold mb-3">เลือกสมาชิกใหม่</h4>
              {availableStudents.length === 0 ? (
                <p className="text-sm text-gray-600">ไม่มีนักเรียนที่สามารถเพิ่มได้</p>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white rounded border hover:border-blue-400 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{student.firstName}</p>
                        <p className="text-sm text-gray-600">
                          {student.customId} • {student.specialty}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleAddMember(student.id)}>
                        เพิ่ม
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Members */}
          {project.members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีสมาชิกในทีม
            </div>
          ) : (
            <div className="grid gap-3">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{member.firstName}</p>
                      <p className="text-sm text-gray-600">
                        {member.customId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {member.specialty}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id, member.firstName)}
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
