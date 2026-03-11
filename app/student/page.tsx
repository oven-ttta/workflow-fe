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
    <div className="mx-auto space-y-6 bg-[#FCC360] p-6 rounded-lg shadow-md shadow-gray-400/50">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6 shadow-gray-500/50 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ยินดีต้อนรับ {currentUser?.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Your code : <span className="font-semibold">{currentUser?.customId}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6  ">
        <Card className="shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โปรเจคทั้งหมด</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">โปรเจคที่เข้าร่วม</p>
          </CardContent>
        </Card>

        <Card className="shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โปรเจคที่กำลังทำ</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'IN_PROCESS').length}
            </div>
            <p className="text-xs text-muted-foreground">อยู่ระหว่างดำเนินการ</p>
          </CardContent>
        </Card>

        <Card className="shadow-gray-500/50 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความถนัด</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.specialty}</div>
            <p className="text-xs text-muted-foreground">สาขาที่เชี่ยวชาญ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-gray-500/50 rounded-lg">
        <CardHeader>
          <CardTitle>เมนูด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/student/timetable" className='shadow-lg shadow-gray-300/50'>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span>จัดการตารางเรียน</span>
              </Button>
            </Link>
            <Link href="/student/projects" className='shadow-lg shadow-gray-300/50'>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <FolderKanban className="h-6 w-6 mb-2" />
                <span>ดูโปรเจค</span>
              </Button>
            </Link>
            <Link href="/student/profile" className='shadow-lg shadow-gray-300/50'>
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <UserIcon className="h-6 w-6 mb-2" />
                <span>แก้ไขโปรไฟล์</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card className="shadow-gray-500/50 rounded-lg">
        <CardHeader>
          <CardTitle>โปรเจคล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              คุณยังไม่มีโปรเจคที่เข้าร่วม
            </p>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{project.projectName}</h3>
                    <p className="text-sm text-gray-600">
                      ระดับความยาก: {project.difficultyLevel}/5
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'DONE' ? 'bg-green-100 text-green-800' :
                      project.status === 'IN_PROCESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
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
