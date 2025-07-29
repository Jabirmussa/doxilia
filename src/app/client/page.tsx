'use client'
import React, { useState} from "react";
import TaskTable from "@/components/TaskTable";
import "@/components/TaskTable.css";
import Sidebar from "@/components/SidebarTemp";
import "@/components/Sidebar.css";
import AllFiles from "@/components/AllFiles";

const ClientDashboard = () => {

  const [activeScreen, setActiveScreen] = useState<string>('dashboard');

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
      default:
        return <div className='not-selected'><h1>Selecione uma opção no sub-menu</h1></div>;
    }
  };

  return (
    <div className="dashboard">
      <section className="dashboard">
        <Sidebar role="client" onSelect={(screen) => setActiveScreen(screen)} />
        <main className='dashboard-content'>
          {renderMainContent()}
        </main>
      </section>
    </div>
  );
};

export default ClientDashboard;
