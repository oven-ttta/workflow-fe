'use client';

import { useEffect, useState } from 'react';
import { studentService } from '@/lib/student.service';
import { authService } from '@/lib/auth.service';
import { User, ProjectResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Calendar, FolderKanban, User as UserIcon, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function StudentDashboard() {
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, projectsData] = await Promise.all([
        studentService.getProfile(),
        studentService.getMyProjects()
      ]);
      setProfile(profileData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (

<div className="mx-auto bg-[#FCC360] p-8 rounded-[40px] shadow-md shadow-gray-400/50 min-h-full">
  
  

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <div className="md:col-span-2 space-y-6">

      <div className="flex gap-4 mb-6 w-full">
    <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-center shadow-gray-500/50">
      <h1 className="text-2xl font-bold text-gray-900">
        👋 สวัสดี {currentUser?.firstName}!
      </h1>
      <p className="text-gray-500 text-sm">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คุณกำลังดูแล {projects.length} โปรเจค
      </p>
    </div>
    
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center w-24 shadow-gray-500/50">

       <img src="./Vector-1.svg" className="w-13 h-13" alt="profile" />
    </div>
  </div>

      <Card className="rounded-[30px] border-none shadow-sm shadow-gray-500/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold">เมนูด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 ">
            <Link href="/student/timetable" className="bg-[#FFF3D6] rounded-2xl h-40 flex flex-col items-center justify-center hover:bg-orange-200 transition-colors">
              <Calendar className="h-10 w-10 mb-2 text-orange-400" />
              <p>ตารางเรียน</p>
            </Link>
            <Link href="/student/projects" className="bg-[#FFF3D6] rounded-2xl h-40 flex flex-col items-center justify-center hover:bg-orange-200 transition-colors">
              <FolderKanban className="h-10 w-10 mb-2 text-orange-400" />
              <p>โปรเจค</p>
            </Link>
            <Link href="/student/profile" className="bg-[#FFF3D6] rounded-2xl h-40 flex flex-col items-center justify-center hover:bg-orange-200 transition-colors">
              <UserIcon className="h-10 w-10 mb-2 text-orange-400" />
              <p>โปรไฟล์</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="flex flex-col gap-4 bg-white rounded-2xl p-6 shadow-sm shadow-gray-500/50">
      <div className="bg-[#FFF3D6] rounded-2xl p-6 flex-1 shadow-sm shadow-gray-500/50">
        <p className="text-sm font-medium text-orange-800">โปรเจคทั้งหมด</p>
        <div className="text-3xl font-bold">{projects.length}</div>
      </div>
      <div className="bg-[#FFF3D6] rounded-2xl p-6 flex-1 shadow-sm shadow-gray-500/50">
        <p className="text-sm font-medium text-orange-800">กำลังทำ</p>
        <div className="text-3xl font-bold">{projects.filter(p => p.status === 'IN_PROCESS').length}</div>
      </div>
      <div className="bg-[#FFF3D6] rounded-2xl p-6 flex-1 shadow-sm shadow-gray-500/50">
        <p className="text-sm font-medium text-orange-800">ความถนัด</p>
        <div className="text-xl font-bold truncate">{profile?.specialty || '-'}</div>
      </div>
    </div>
  </div>

  <div className="mt-6 ">
    <Card className="rounded-[30px] border-none shadow-sm shadow-gray-500/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold">โปรเจคที่ดูแล</CardTitle>
      </CardHeader>
      <CardContent>

        {projects.length === 0 ? (
           <div className="h-40 flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
        ) : (
           <div className="space-y-3">

           </div>
        )}
      </CardContent>
    </Card>
  </div>
</div>
  );
}
