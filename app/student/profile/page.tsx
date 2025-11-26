'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { studentService } from '@/lib/student.service';
import { authService } from '@/lib/auth.service';
import { User, RegisterRequest, SPECIALTIES } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { User as UserIcon, Save, Lock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentUser = authService.getCurrentUser();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<RegisterRequest>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      
      // Set form values
      reset({
        firstName: data.firstName,
        yearLevel: data.yearLevel,
        specialty: data.specialty,
        username: data.username,
        password: ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterRequest) => {
    setIsSaving(true);
    try {
      // ถ้าไม่ได้กรอก password ให้ใช้ password เดิม
      if (!data.password) {
        toast.error('กรุณากรอกรหัสผ่านเพื่อยืนยันการแก้ไข');
        setIsSaving(false);
        return;
      }

      const updatedProfile = await studentService.updateProfile(data);
      setProfile(updatedProfile);
      
      // Update user info in cookies
      const user = authService.getCurrentUser();
      if (user) {
        user.firstName = updatedProfile.firstName;
        user.username = updatedProfile.username;
        import('js-cookie').then(({ default: Cookies }) => {
          Cookies.set('user', JSON.stringify(user), { expires: 1 });
        });
      }

      toast.success('บันทึกข้อมูลสำเร็จ!');
      
      // Clear password field
      reset({
        ...data,
        password: ''
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">โปรไฟล์</h1>
        <p className="text-gray-600 mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              ข้อมูลพื้นฐาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile?.firstName}</h3>
                <p className="text-sm text-gray-600">{profile?.customId}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 mb-1">ชื่อผู้ใช้</p>
                <p className="font-medium">{profile?.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ชั้นปี</p>
                <p className="font-medium">{profile?.yearLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ความถนัด</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {profile?.specialty}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">บทบาท</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {profile?.role}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">สมาชิกตั้งแต่</p>
              <p className="text-sm">
                {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>แก้ไขข้อมูล</CardTitle>
            <CardDescription>
              อัพเดตข้อมูลส่วนตัวของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Warning Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">คำแนะนำ:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>กรอกรหัสผ่านเพื่อยืนยันการแก้ไขข้อมูล</li>
                    <li>ถ้าต้องการเปลี่ยนรหัสผ่าน ให้กรอกรหัสผ่านใหม่ในช่องรหัสผ่าน</li>
                    <li>ข้อมูลที่แก้ไขจะมีผลทันที</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('firstName', { required: 'กรุณากรอกชื่อจริง' })}
                    placeholder="สมชาย"
                    disabled={isSaving}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Year Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ชั้นปี <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('yearLevel', { required: 'กรุณากรอกชั้นปี' })}
                    placeholder="ปี 3"
                    disabled={isSaving}
                  />
                  {errors.yearLevel && (
                    <p className="text-sm text-red-600">{errors.yearLevel.message}</p>
                  )}
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ความถนัด <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('specialty', { required: 'กรุณาเลือกความถนัด' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <option value="">เลือกความถนัด</option>
                    {SPECIALTIES.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                  {errors.specialty && (
                    <p className="text-sm text-red-600">{errors.specialty.message}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ชื่อผู้ใช้ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                    placeholder="username"
                    disabled={isSaving}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('password', { 
                      required: 'กรุณากรอกรหัสผ่านเพื่อยืนยัน',
                      minLength: { 
                        value: 6, 
                        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
                      }
                    })}
                    type="password"
                    placeholder="กรอกรหัสผ่านเพื่อยืนยันการแก้ไข หรือรหัสผ่านใหม่"
                    disabled={isSaving}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    ⚠️ กรอกรหัสผ่านปัจจุบันเพื่อยืนยัน หรือกรอกรหัสผ่านใหม่ถ้าต้องการเปลี่ยน
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset({
                      firstName: profile?.firstName,
                      yearLevel: profile?.yearLevel,
                      specialty: profile?.specialty,
                      username: profile?.username,
                      password: ''
                    });
                    toast.success('ยกเลิกการแก้ไข');
                  }}
                  disabled={isSaving}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">รหัสนักเรียน</p>
              <p className="font-mono font-semibold text-lg">{profile?.customId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">อัพเดตล่าสุด</p>
              <p className="font-medium">
                {profile?.updatedAt && new Date(profile.updatedAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
