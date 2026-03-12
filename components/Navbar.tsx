'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { Button } from './ui/Button';
import { User as UserIcon, Home, FolderKanban, Users, LayoutDashboard, LogOutIcon } from 'lucide-react';
import { AuthResponse } from '@/lib/types';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser()); // ← โหลดเฉพาะ client
  }, []);

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
      { href: '/student/profile', label: 'โปรไฟล์', icon: UserIcon }
    );
  }

  // PM navigation
  if (user.role === 'PM') {
    navItems.push(
      { href: '/pm', label: 'หน้าหลัก', icon: Home },
      { href: '/pm/projects', label: 'โปรเจคที่ดูแล', icon: FolderKanban },
      { href: '/pm/students', label: 'รายชื่อนักเรียน', icon: Users },
      { href: '/student/profile', label: 'โปรไฟล์', icon: UserIcon }
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
    <nav className="bg-[#fcc360] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${user.role.toLowerCase()}`} className="text-2xl font-bold text-orange-600">
                <Image src="/logo.svg" alt="Logo" width={60} height={60} />
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
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md m-2 ${isActive
                      ? 'text-black border border-black'
                      : 'text-black hover:border-black hover:border'
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
            <div className="flex text-sm justify-items-center items-center space-x-2">
              <p className="font-medium">{user.firstName}</p>

              <Image src="/user-profile-icon.svg" alt="Avatar" width={32} height={32} className="rounded-full" />
            </div>

            <Button className='bg-transparent hover:bg-red-500' size="sm" onClick={handleLogout}>
              <LogOutIcon size={16} color="#ff0000" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
