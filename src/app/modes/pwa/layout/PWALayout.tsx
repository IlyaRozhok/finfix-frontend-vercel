import React from "react";
import { Outlet } from "react-router-dom";
import { PWAHeader } from "@/shared/ui/pwa";
import bg from "@/assets/bg-test.avif";

export default function PWALayout() {
  return (
    <div
      className="min-h-screen bg-cover bg-transparent bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <PWAHeader />
      <main className="max-w-7xl mx-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
