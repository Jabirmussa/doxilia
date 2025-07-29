'use client';

import React, { useState } from 'react';
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

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState<string>('dashboard')

    const renderMainContent = () => {
        switch (activeScreen) {
            case 'dashboard':
            return <Allclients />;
            case 'add-client':
            return <AddClient />;
            case 'documents':
            return <AllFiles />;
            case 'all-clients':
            return <Allclients />;
            case 'clients':
            return <Allclients />;
            case 'accountants':
            return <AllAccountants />;
            case 'tasks':
            return (<div className="client-dashboard"><TaskTable type="accountant"/></div>);
            case 'add-tasks':
            return <AddTask />;
            case 'all-tasks':
            return (<div className="client-dashboard"><TaskTable type="accountant"/></div>);
            case 'add-accountant':
            return <AddAccountant />;
            case 'all-accountants':
            return <AllAccountants />;
            default:
            return <div className='not-selected'><h1>Selecione uma opção no sub-menu</h1></div>;
        }
    };

  return (
    <section className="dashboard">
        <Sidebar
            role="admin"
            onSelect={(screen) => setActiveScreen(screen)} 
        />

        <main className='dashboard-content'>
            {renderMainContent()}
        </main>
    </section>
  );
};

export default AdminDashboard;
