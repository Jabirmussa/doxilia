'use client';

import React, { useState } from 'react';
import TaskTable from "@/components/TaskTable";
import Sidebar from '@/components/SidebarTemp';
import AddClient from '@/components/AddClient';
import Allclients from '@/components/Allclients';
import "@/components/TaskTable.css";
import "@/components/Sidebar.css";
import AddTask from '@/components/AddTask';
import AllFiles from '@/components/AllFiles';

const AccountantDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<string>('dashboard')

  const renderMainContent = () => {
      switch (activeScreen) {
          case 'dashboard':
          return <h1>Bem-vindo ao Painel do Contador</h1>;
          case 'documents':
          return <AllFiles />;
          case 'add-client':
          return <AddClient />;
          case 'all-clients':
          return <Allclients />;
          case 'clients':
          return <Allclients />;
          case 'tasks':
          return (<div className="client-dashboard"><TaskTable type="accountant"/></div>);
          case 'add-tasks':
          return <AddTask />;
          case 'all-tasks':
          return (<div className="client-dashboard"><TaskTable type="accountant"/></div>);
          default:
          return <div className='not-selected'><h1>Selecione uma opção no sub-menu</h1></div>;
      }
  };

  return (
    <section className="dashboard">
        <Sidebar
            role="accountant"
            onSelect={(screen) => setActiveScreen(screen)} 
        />

        <main className='dashboard-content'>
            {renderMainContent()}
        </main>
    </section>
  );
};

export default AccountantDashboard;
