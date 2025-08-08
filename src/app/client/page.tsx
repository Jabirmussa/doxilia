'use client';
import React, { useEffect } from "react";
import TaskTable from "@/components/TaskTable";
import "@/components/TaskTable.css";
import Sidebar from "@/components/SidebarTemp";
import "@/components/Sidebar.css";
import AllFiles from "@/components/AllFiles";
import Account from "@/components/Account";
import { useRouter } from "next/navigation"; 
import AddDocument from "@/components/AddDocument";
import { useDashboard } from "@/src/app/contexts/DashboardContext";

const ClientDashboard = () => {
  const { activeScreen, setActiveScreen } = useDashboard();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/'); 
  };

  useEffect(() => {
    if (activeScreen === 'logout') {
      handleLogout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case 'add-document':
        return <AddDocument onClose={() => setActiveScreen("documents")} />;
      case 'all-documents':
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
        <Sidebar role="client" onSelect={setActiveScreen} />
        <main className="dashboard-content">
          {renderMainContent()}
        </main>
      </section>
    </div>
  );
};

export default ClientDashboard;