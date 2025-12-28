import React from "react";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="bg-primary-blue">
      <Outlet />
    </div>
  );
}
