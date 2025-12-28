import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/widgets/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/widgets/header/DashboardHeader";
import bg from "@/assets/bank-card.avif";

export default function DashboardLayout() {
  return (
    <div
      className="flex h-screen bg-cover bg-transparent bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
