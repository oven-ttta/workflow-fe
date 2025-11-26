'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/admin.service';
import { User, SPECIALTIES, TimeSlot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Users, UserPlus, Edit, Trash2, Shield, Search, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface UserForm {
  firstName: string;
  yearLevel: string;
  specialty: string;
  username: string;
  password: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.customId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      firstName: user.firstName,
      yearLevel: user.yearLevel,
      specialty: user.specialty,
      username: user.username,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบผู้ใช้ ${name} หรือไม่?`)) return;

    try {
      await adminService.deleteUser(id);
      toast.success('ลบผู้ใช้สำเร็จ!');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string, name: string) => {
    const roles = ['STUDENT', 'PM', 'ADMIN'];
    const newRole = prompt(
      `เปลี่ยนบทบาทของ ${name}\nปัจจุบัน: ${currentRole}\n\nเลือกบทบาทใหม่:\n- STUDENT\n- PM\n- ADMIN`,
      currentRole
    );

    if (!newRole || !roles.includes(newRole.toUpperCase())) {
      toast.error('บทบาทไม่ถูกต้อง');
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole.toUpperCase());
      toast.success('เปลี่ยนบทบาทสำเร็จ!');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถเปลี่ยนบทบาทได้');
    }
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, data);
        toast.success('อัพเดตข้อมูลสำเร็จ!');
      }
      setShowForm(false);
      setEditingUser(null);
      reset();
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleViewTimetable = async (user: User) => {
    setSelectedUser(user);
    setShowTimetable(true);
    setLoadingTimetable(true);
    setTimetable([]); // Reset to empty array
    
    try {
      const data = await adminService.getStudentTimetable(user.id);
      
      // Backend returns {slots: [...]} format
      if (data && typeof data === 'object' && 'slots' in data) {
        const slotsArray = (data as any).slots;
        if (Array.isArray(slotsArray)) {
          setTimetable(slotsArray);
        } else {
          console.error('Slots is not an array:', slotsArray);
          toast.error('รูปแบบข้อมูลตารางเรียนไม่ถูกต้อง');
          setTimetable([]);
        }
      } else if (Array.isArray(data)) {
        // Fallback: if backend returns array directly
        setTimetable(data);
      } else {
        console.error('Invalid timetable data format:', data);
        toast.error('รูปแบบข้อมูลตารางเรียนไม่ถูกต้อง');
        setTimetable([]);
      }
    } catch (error: any) {
      console.error('Error loading timetable:', error);
      if (error.response?.status === 404) {
        toast.error('นักเรียนยังไม่ได้อัพโหลดตารางเรียน');
      } else {
        toast.error('ไม่สามารถโหลดตารางเรียนได้');
      }
      setTimetable([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const closeTimetableModal = () => {
    setShowTimetable(false);
    setSelectedUser(null);
    setTimetable([]);
  };

  if (isLoading) return <Loading />;

  const roleCounts = {
    ALL: users.length,
    STUDENT: users.filter(u => u.role === 'STUDENT').length,
    PM: users.filter(u => u.role === 'PM').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-1">ดูแลและจัดการผู้ใช้ทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{roleCounts.ALL}</p>
              <p className="text-sm text-blue-100">ผู้ใช้ทั้งหมด</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{roleCounts.STUDENT}</p>
              <p className="text-sm text-green-100">นักเรียน</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{roleCounts.PM}</p>
              <p className="text-sm text-purple-100">PM</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{roleCounts.ADMIN}</p>
              <p className="text-sm text-red-100">Admin</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, username หรือรหัส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">กรองตามบทบาท</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleCounts).map(([role, count]) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role === 'ALL' ? 'ทั้งหมด' : role} ({count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {showForm && editingUser && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle>แก้ไขข้อมูล: {editingUser.firstName}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ชื่อจริง</label>
                  <Input {...register('firstName', { required: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium">ชั้นปี</label>
                  <Input {...register('yearLevel', { required: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium">ความถนัด</label>
                  <select
                    {...register('specialty', { required: true })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input {...register('username', { required: true })} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">รหัสผ่านใหม่ (ไม่กรอกถ้าไม่เปลี่ยน)</label>
                  <Input type="password" {...register('password')} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">บันทึก</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้ ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    user.role === 'ADMIN' ? 'bg-red-500' :
                    user.role === 'PM' ? 'bg-purple-500' :
                    'bg-blue-500'
                  }`}>
                    {user.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.firstName}</h3>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>{user.customId}</span>
                      <span>•</span>
                      <span>{user.username}</span>
                      <span>•</span>
                      <span>{user.yearLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {user.specialty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'PM' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  
                  {user.role === 'STUDENT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTimetable(user)}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangeRole(user.id, user.role, user.firstName)}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  {user.role !== 'ADMIN' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.firstName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Modal */}
      {showTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    ตารางเรียนของ {selectedUser?.firstName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedUser?.customId} • {selectedUser?.specialty}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={closeTimetableModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingTimetable ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : !Array.isArray(timetable) || timetable.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">นักเรียนยังไม่ได้อัพโหลดตารางเรียน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const daySlots = timetable.filter(slot => slot.dayOfWeek === day);
                    if (daySlots.length === 0) return null;

                    const dayNameThai = {
                      'Monday': 'จันทร์',
                      'Tuesday': 'อังคาร',
                      'Wednesday': 'พุธ',
                      'Thursday': 'พฤหัสบดี',
                      'Friday': 'ศุกร์',
                      'Saturday': 'เสาร์',
                      'Sunday': 'อาทิตย์'
                    }[day];

                    return (
                      <div key={day}>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {dayNameThai}
                        </h3>
                        <div className="grid gap-2 ml-4">
                          {daySlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border-l-4 ${
                                slot.isFree
                                  ? 'bg-green-50 border-green-500'
                                  : 'bg-blue-50 border-blue-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {slot.isFree ? '🟢 ว่าง' : `📚 ${slot.subject || 'เรียน'}`}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  slot.isFree
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {slot.isFree ? 'Available' : 'Busy'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}