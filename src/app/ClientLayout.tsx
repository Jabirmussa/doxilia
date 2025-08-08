'use client';

import UploadBtn from '@/components/UploadBtn';
import GlobalFileDrop from '@/components/GlobalFileDrop';
import { LanguageProvider } from './contexts/LanguageContext';
import { DashboardProvider } from './contexts/DashboardContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <DashboardProvider>
        {children}
        <UploadBtn />
        <GlobalFileDrop /> {/* drag & drop global */}
      </DashboardProvider>
    </LanguageProvider>
  );
}
