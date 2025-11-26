'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authService } from '@/lib/auth.service';
import { LoginRequest } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      toast.success('เข้าสู่ระบบสำเร็จ!');
      
      // Redirect based on role
      if (response.role === 'ADMIN') {
        router.push('/admin');
      } else if (response.role === 'PM') {
        router.push('/pm');
      } else {
        router.push('/student');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <LogIn className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-center">
            ระบบจัดการน้องนักเรียน Part-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">ยังไม่มีบัญชี? </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                ลงทะเบียน
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium mb-1">บัญชีทดสอบ:</p>
              <p>Admin: admin / admin123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
