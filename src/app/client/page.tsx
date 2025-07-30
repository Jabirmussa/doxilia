/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect } from "react";
import TaskTable from "@/components/TaskTable";
import "@/components/TaskTable.css";
import Sidebar from "@/components/SidebarTemp";
import "@/components/Sidebar.css";
import AllFiles from "@/components/AllFiles";
import Account from "@/components/Account";
import { useRouter } from "next/navigation"; 

const ClientDashboard = () => {
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
            <TaskTable type="client" />
          </div>
        );
      case 'documents':
        return <AllFiles />;
      case 'account':
      case 'settings':
        return <Account />;
      default:
        return (
          <div className="not-selected">
            <h1>Select an option from the submenu</h1>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <section className="dashboard">
        <Sidebar role="client" onSelect={(screen) => setActiveScreen(screen)} />
        <main className="dashboard-content">
          {renderMainContent()}
        </main>
      </section>
    </div>
  );
};

export default ClientDashboard;
