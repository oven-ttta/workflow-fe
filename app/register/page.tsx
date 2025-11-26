'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authService } from '@/lib/auth.service';
import { RegisterRequest, SPECIALTIES } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('ลงทะเบียนสำเร็จ!');
      router.push('/student');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">ลงทะเบียน</CardTitle>
          <CardDescription className="text-center">
            สร้างบัญชีใหม่สำหรับนักเรียน Part-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อจริง</label>
              <Input
                {...register('firstName', { required: 'กรุณากรอกชื่อจริง' })}
                placeholder="สมชาย"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ชั้นปี</label>
              <Input
                {...register('yearLevel', { required: 'กรุณากรอกชั้นปี' })}
                placeholder="ปี 3"
                disabled={isLoading}
              />
              {errors.yearLevel && (
                <p className="text-sm text-red-600">{errors.yearLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ความถนัด</label>
              <select
                {...register('specialty', { required: 'กรุณาเลือกความถนัด' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
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

            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อผู้ใช้</label>
              <Input
                {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                placeholder="username"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รหัสผ่าน</label>
              <Input
                {...register('password', { 
                  required: 'กรุณากรอกรหัสผ่าน',
                  minLength: { value: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
                })}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
