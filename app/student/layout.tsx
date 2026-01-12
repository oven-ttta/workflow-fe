'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { Navbar } from '@/components/Navbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'STUDENT') {
      // อนุญาตให้ PM และ ADMIN เข้าถึงหน้า profile ได้
      const isProfilePage = pathname === '/student/profile';
      const allowedRoles = ['PM', 'ADMIN'];

      if (!(isProfilePage && allowedRoles.includes(user.role))) {
        router.push(`/${user.role.toLowerCase()}`);
      }
    }
  }, [router, pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
