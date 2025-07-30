/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SidebarTemp';
import AddClient from '@/components/AddClient';
import Allclients from '@/components/Allclients';
import AllAccountants from '@/components/Allacc';
import "@/components/TaskTable.css";
import "@/components/Sidebar.css";
import AddAccountant from '@/components/Addacc';
import AddTask from '@/components/AddTask';
import TaskTable from '@/components/TaskTable';
import AllFiles from '@/components/AllFiles';
import Account from '@/components/Account';

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    if (activeScreen === 'logout') {
      handleLogout();
    }
  }, [activeScreen]);

  const renderMainContent = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Allclients />;
      case 'add-client':
        return <AddClient />;
      case 'documents':
        return <AllFiles />;
      case 'all-clients':
      case 'clients':
        return <Allclients />;
      case 'account':
      case 'settings':
        return <Account />;
      case 'accountants':
      case 'all-accountants':
        return <AllAccountants />;
      case 'add-accountant':
        return <AddAccountant />;
      case 'tasks':
      case 'all-tasks':
        return (
          <div className="client-dashboard">
            <TaskTable type="accountant" />
          </div>
        );
      case 'add-tasks':
        return <AddTask />;
      default:
        return (
          <div className="not-selected">
            <h1>Select an option from the submenu</h1>
          </div>
        );
    }
  };

  return (
    <section className="dashboard">
      <Sidebar
        role="admin"
        onSelect={(screen) => setActiveScreen(screen)}
      />
      <main className="dashboard-content">
        {renderMainContent()}
      </main>
    </section>
  );
};

export default AdminDashboard;
