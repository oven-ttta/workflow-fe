'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/admin.service';
import { ProjectResponse, User, ProjectRequest, PROJECT_STATUSES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { FolderKanban, Plus, Edit, Trash2, Users as UsersIcon, Eye, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [managingMembersFor, setManagingMembersFor] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectRequest>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        adminService.getAllProjects(),
        adminService.getAllUsers()
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    reset({
      projectName: '',
      difficultyLevel: 3,
      durationDays: 30,
      pmUserId: undefined,
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleEdit = (project: ProjectResponse) => {
    setEditingProject(project);
    reset({
      projectName: project.projectName,
      difficultyLevel: project.difficultyLevel,
      durationDays: project.durationDays,
      pmUserId: project.pmUser?.id,
      startDate: project.startDate
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบโปรเจค "${name}" หรือไม่?`)) return;

    try {
      await adminService.deleteProject(id);
      toast.success('ลบโปรเจคสำเร็จ!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบโปรเจคได้');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateProjectStatus(id, status);
      toast.success('อัพเดตสถานะสำเร็จ!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดตสถานะได้');
    }
  };

  const onSubmit = async (data: ProjectRequest) => {
    try {
      if (editingProject) {
        await adminService.updateProject(editingProject.id, data);
        toast.success('อัพเดตโปรเจคสำเร็จ!');
      } else {
        await adminService.createProject(data);
        toast.success('สร้างโปรเจคสำเร็จ!');
      }
      setShowForm(false);
      setEditingProject(null);
      reset();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleAddMember = async (projectId: number, userId: number) => {
    try {
      await adminService.addMemberToProject(projectId, userId);
      toast.success('เพิ่มสมาชิกสำเร็จ!');
      await loadData();
      setShowAddMember(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถเพิ่มสมาชิกได้');
    }
  };

  const handleRemoveMember = async (projectId: number, userId: number, userName: string) => {
    if (!confirm(`ต้องการลบ ${userName} ออกจากโปรเจคหรือไม่?`)) return;

    try {
      await adminService.removeMemberFromProject(projectId, userId);
      toast.success('ลบสมาชิกสำเร็จ!');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบสมาชิกได้');
    }
  };

  if (isLoading) return <Loading />;

  const pmUsers = users.filter(u => u.role === 'PM' || u.role === 'STUDENT');
  
  const filteredProjects = selectedFilter === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === selectedFilter);

  const statusCounts = PROJECT_STATUSES.reduce((acc, status) => {
    acc[status] = projects.filter(p => p.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 bg-[#FCC360] p-6 rounded-[25px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการโปรเจค</h1>
          <p className="text-gray-600 mt-1">สร้างและจัดการโปรเจคทั้งหมด</p>
        </div>
        <Button className='bg-[#6AABFF]' onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างโปรเจคใหม่
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <Card className="bg-gradient-to-br from-[#0067EE] to-[#ADCBF2] text-white rounded-lg">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-xs text-blue-100">ทั้งหมด</p>
          </CardContent>
        </Card>
        {PROJECT_STATUSES.map((status) => (
          <Card key={status} className={selectedFilter === status ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
              <p className="text-xs text-gray-600">{PROJECT_STATUS_LABELS[status]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className='rounded-lg'>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button className='bg-gradient-to-br from-[#0067EE] to-[#ADCBF2]'
              variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('ALL')}
            >
              ทั้งหมด ({projects.length})
            </Button>
            {PROJECT_STATUSES.map((status) => (
              <Button
                key={status}
                variant={selectedFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(status)}
              >
                {PROJECT_STATUS_LABELS[status]} ({statusCounts[status] || 0})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle>
              {editingProject ? 'แก้ไขโปรเจค' : 'สร้างโปรเจคใหม่'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">ชื่อโปรเจค *</label>
                  <Input
                    {...register('projectName', { required: 'กรุณากรอกชื่อโปรเจค' })}
                    placeholder="E-Commerce Website"
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-600">{errors.projectName.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">ระดับความยาก (1-5) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    {...register('difficultyLevel', {
                      required: true,
                      min: 1,
                      max: 5,
                      valueAsNumber: true
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ระยะเวลา (วัน) *</label>
                  <Input
                    type="number"
                    min="1"
                    {...register('durationDays', {
                      required: true,
                      min: 1,
                      valueAsNumber: true
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">แต่งตั้ง PM</label>
                  <select
                    {...register('pmUserId', { valueAsNumber: true })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">-- เลือก PM --</option>
                    {pmUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} ({user.customId}) - {user.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">วันเริ่มโปรเจค</label>
                  <Input
                    type="date"
                    {...register('startDate')}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit">
                  {editingProject ? 'บันทึกการแก้ไข' : 'สร้างโปรเจค'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className="text-center py-12">
              {/* <FolderKanban className="w-16 h-16 mx-auto mb-4 text-[#0067EE]" /> */}
              <p className="text-gray-600">ไม่พบโปรเจค</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const daysUntil = getDaysUntilDeadline(project.deadline);
            const isOverdue = daysUntil < 0;

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{project.projectName}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>ระดับ: {project.difficultyLevel}/5</span>
                        <span>{project.durationDays} วัน</span>
                        <span>{project.members.length} สมาชิก</span>
                        <span>PM: {project.pmUser?.firstName || 'ยังไม่มี'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                      {isOverdue && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          เลย {Math.abs(daysUntil)} วัน
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex-1">
                      <p className="text-gray-600">เริ่ม</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">Deadline</p>
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">คงเหลือ</p>
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {isOverdue ? `เลย ${Math.abs(daysUntil)} วัน` : `${daysUntil} วัน`}
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">เปลี่ยนสถานะ:</p>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_STATUSES.map((status) => (
                        <Button
                          key={status}
                          variant={project.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleUpdateStatus(project.id, status)}
                          disabled={project.status === status}
                        >
                          {PROJECT_STATUS_LABELS[status]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">สมาชิกในทีม ({project.members.length})</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddMember(showAddMember === project.id ? null : project.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        เพิ่มสมาชิก
                      </Button>
                    </div>

                    {/* Add Member Section */}
                    {showAddMember === project.id && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium mb-2">เลือกสมาชิกใหม่</p>
                        {(() => {
                          const memberIds = project.members.map(m => m.id);
                          const availableStudents = users.filter(u => !memberIds.includes(u.id) && u.role === 'STUDENT');

                          if (availableStudents.length === 0) {
                            return <p className="text-sm text-gray-600">ไม่มีนักเรียนที่สามารถเพิ่มได้</p>;
                          }

                          return (
                            <div className="grid gap-2 max-h-40 overflow-y-auto">
                              {availableStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-2 bg-white rounded border hover:border-blue-400"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{student.firstName}</p>
                                    <p className="text-xs text-gray-600">
                                      {student.customId} • {student.specialty}
                                    </p>
                                  </div>
                                  <Button size="sm" onClick={() => handleAddMember(project.id, student.id)}>
                                    เพิ่ม
                                  </Button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Current Members List */}
                    {project.members.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">ยังไม่มีสมาชิกในทีม</p>
                    ) : (
                      <div className="grid gap-2">
                        {project.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {member.firstName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{member.firstName}</p>
                                <p className="text-xs text-gray-600">{member.customId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {member.specialty}
                              </span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveMember(project.id, member.id, member.firstName)}
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.projectName)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}