'use client';

import { usePathname } from 'next/navigation';
import UploadBtn from '@/components/UploadBtn';
import GlobalFileDrop from '@/components/GlobalFileDrop';
import { LanguageProvider } from './contexts/LanguageContext';
import { DashboardProvider } from './contexts/DashboardContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  return (
    <LanguageProvider>
      <DashboardProvider>
        {children}
        {!isLoginPage && <UploadBtn />}
        {!isLoginPage && <GlobalFileDrop />}
      </DashboardProvider>
    </LanguageProvider>
  );
}
