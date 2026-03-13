import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Student Part-time Management',
  description: 'ระบบจัดการน้องนักเรียน Part-time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body style={{ fontFamily: 'Sarabun, sans-serif' }}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
