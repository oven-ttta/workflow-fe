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
    <div className="mx-auto bg-[#FCC360] p-8 rounded-[40px] shadow-md min-h-screen font-sans">
      {/* Header: ชื่อหน้า */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">โปรไฟล์</h1>
        <p className="text-black/70 mt-1 text-lg">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ฝั่งซ้าย: Profile Card & Logout */}
        <div className="space-y-4">
          {/* Card ข้อมูลพื้นฐาน */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <UserIcon className="w-6 h-6" />
              <span className="text-xl font-bold">ข้อมูลพื้นฐาน</span>
            </div>

            {/* Avatar ส่วนตัว */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center mb-4 text-white">
                <UserIcon size={64} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black italic uppercase">{profile?.firstName}</h3>
                <p className="text-gray-500 tracking-widest text-xs">{profile?.customId}</p>
              </div>
            </div>

            {/* รายละเอียด (Label + Value) */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex  text-sm text-black/70">
                <span className="text-gray-400 mr-[10px]">ชื่อผู้ใช้</span>
                <span className="font-bold text-gray-700">{profile?.username}</span>
              </div>
              <div className="flex text-sm">
                <span className="text-gray-400 mr-[10px]">ชั้นปี</span>
                <span className="font-bold text-gray-700">{profile?.yearLevel}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">ความถนัด</p>
                <div className="w-full py-2 bg-[#FFF3D6] text-[#D97706] rounded-full text-center font-bold text-sm">
                  {profile?.specialty || 'ไม่ได้ระบุ'}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">สถานะ</p>
                <div className={`w-full py-2 rounded-full text-center font-bold text-sm uppercase ${
                  profile?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-400 text-white'
                }`}>
                  {profile?.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">บทบาท</p>
                <div className="w-full py-2 bg-[#E9D5FF] text-[#7C3AED] rounded-full text-center font-bold text-sm uppercase">
                  {profile?.role || '-'}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed">
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">เป็นสมาชิกตั้งแต่</p>
              <p className="font-bold text-xs text-gray-600">
                {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* ปุ่มออกจากระบบ */}
          <button 
            onClick={() =>  authService.logout()}
            className="w-full bg-white h-16 rounded-[20px] shadow-sm flex items-center px-6 gap-4 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="font-bold text-lg">ออกจากระบบ</span>
          </button>
        </div>

        {/* ฝั่งขวา: ฟอร์มแก้ไข */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[35px] p-10 shadow-sm h-[735px] flex flex-col mb-[-30px] rounded-br-none">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">แก้ไขข้อมูล</h2>
              <p className="text-gray-400 text-sm">อัพเดตข้อมูลส่วนตัวของคุณ</p>
            </div>

            {/* กล่องไฮไลท์สีเหลืองนวล */}
            <div className="bg-[#FFF3D6] rounded-[25px] w-full h-40 mb-8 flex items-center justify-center">
               <Info className="text-orange-300 w-12 h-12" />
            </div>

            {/* Form Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-grow">
              <div className="space-y-2">
                <label className="font-bold flex gap-1">ชื่อจริง <span className="text-red-500">*</span></label>
                <Input 
                  {...register('firstName', { required: 'กรุณากรอกชื่อจริง' })}
                  className="w-full h-12 border rounded-xl px-4" 
                  disabled={isSaving}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold flex gap-1">ชั้นปี <span className="text-red-500">*</span></label>
                <Input 
                  {...register('yearLevel', { required: 'กรุณากรอกชั้นปี' })}
                  className="w-full h-12 border rounded-xl px-4" 
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold flex gap-1">ความถนัด <span className="text-red-500">*</span></label>
                <select 
                  {...register('specialty', { required: 'กรุณาเลือกความถนัด' })}
                  className="w-full h-12 border rounded-xl px-4 bg-gray-50/50 outline-none focus:ring-2 ring-orange-400"
                  disabled={isSaving}
                >
                  <option value="">เลือกความถนัด</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold flex gap-1">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
                <Input 
                  {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                  className="w-full h-12 border rounded-xl px-4" 
                  disabled={isSaving}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <Input 
                  {...register('password')}
                  type="password" 
                  placeholder="กรอกรหัสผ่านเพื่อยืนยัน" 
                  className="w-full h-12 border rounded-xl px-4"
                  disabled={isSaving}
                />
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold mt-1">
                  <Info className="w-3 h-5" />
                  กรอกรหัสผ่านปัจจุบันเพื่อยืนยัน หรือกรอกรหัสผ่านใหม่ถ้าต้องการเปลี่ยน
                </p>
            </div>

            
          </form>

          {/* Footer Actions */}
<div className="flex flex-col md:flex-row gap-0 mt-0 items-stretch">
  <div className="bg-white border border-gray-100 rounded-bl-[35px] px-6 py-4 flex-1">
    <p className="text-[10px] text-gray-400 uppercase font-bold">อัปเดตล่าสุด</p>
    <p className="text-xs font-bold text-gray-600">
      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString('th-TH') : '-'}
    </p>
  </div>

  <div className="flex gap-3 bg-white px-6 py-4 rounded-br-[35px] items-center">
    <button
      type="button"
      onClick={() => reset()}
      className="h-14 px-8 rounded-[20px] font-bold text-gray-500 hover:bg-gray-100 transition-colors border border-gray-300"
      disabled={isSaving}
    >
      ยกเลิก
    </button>
    <Button
      type="submit"
      className="h-14 px-8 rounded-[20px] bg-[#FCC360] hover:bg-[#fbb33d] font-bold text-black shadow-md flex items-center gap-2"
      disabled={isSaving}
    >
      <Save className="w-5 h-5" />
      {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
    </Button>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
