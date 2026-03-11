'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth.service';
import { Navbar } from '@/components/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push(`/${user.role.toLowerCase()}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#FFF3D0] rounded-[25px] m-3 shadow-lg shadow-gray-300/50">
        {children}
      </main>
    </div>
  );
}
