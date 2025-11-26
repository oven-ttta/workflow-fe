'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { Button } from './ui/Button';
import { LogOut, User, Home, FolderKanban, Users, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    toast.success('ออกจากระบบสำเร็จ');
    router.push('/login');
  };

  if (!user) return null;

  const navItems = [];

  // Student navigation
  if (user.role === 'STUDENT') {
    navItems.push(
      { href: '/student', label: 'หน้าหลัก', icon: Home },
      { href: '/student/timetable', label: 'ตารางเรียน', icon: LayoutDashboard },
      { href: '/student/projects', label: 'โปรเจคของฉัน', icon: FolderKanban },
      { href: '/student/profile', label: 'โปรไฟล์', icon: User }
    );
  }

  // PM navigation
  if (user.role === 'PM') {
    navItems.push(
      { href: '/pm', label: 'หน้าหลัก', icon: Home },
      { href: '/pm/projects', label: 'โปรเจคที่ดูแล', icon: FolderKanban },
      { href: '/pm/students', label: 'รายชื่อนักเรียน', icon: Users },
      { href: '/student/profile', label: 'โปรไฟล์', icon: User }
    );
  }

  // Admin navigation
  if (user.role === 'ADMIN') {
    navItems.push(
      { href: '/admin', label: 'หน้าหลัก', icon: Home },
      { href: '/admin/projects', label: 'จัดการโปรเจค', icon: FolderKanban },
      { href: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${user.role.toLowerCase()}`} className="text-xl font-bold text-primary">
                Student Part-time
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium">{user.firstName}</p>
              <p className="text-gray-500 text-xs">
                {user.customId} - {user.role}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
