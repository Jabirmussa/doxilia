/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskTable from "@/components/TaskTable";
import Sidebar from '@/components/SidebarTemp';
import AddClient from '@/components/AddClient';
import Allclients from '@/components/Allclients';
import "@/components/TaskTable.css";
import "@/components/Sidebar.css";
import AddTask from '@/components/AddTask';
import AllFiles from '@/components/AllFiles';
import Account from '@/components/Account';

const AccountantDashboard = () => {
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
        return (
          <div className="client-dashboard">
            <h1>Dashboard</h1>
            <TaskTable type="accountant" />
          </div>
        );
      case 'documents':
        return <AllFiles />;
      case 'add-client':
        return <AddClient />;
      case 'account':
      case 'settings':
      return <Account />;
      case 'all-clients':
      case 'clients':
        return <Allclients />;
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
        role="accountant"
        onSelect={(screen) => setActiveScreen(screen)}
      />

      <main className="dashboard-content">
        {renderMainContent()}
      </main>
    </section>
  );
};

export default AccountantDashboard;
