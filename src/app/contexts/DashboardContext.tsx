"use client";
import React, { createContext, useContext, useState } from "react";

type DashboardContextType = {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<string>("dashboard");

  return (
    <DashboardContext.Provider value={{ activeScreen, setActiveScreen }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
