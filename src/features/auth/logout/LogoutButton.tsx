import { useAuth } from "@/app/providers/AuthProvider";
import React from "react";
import { Button } from "@/shared/ui/Button";

export const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Logout initiated");
      await logout();
    } catch (error) {
      console.error("Logout failed in handleLogout:", error);
      // Even if logout fails, try to redirect
      window.location.replace("/login");
    }
  };

  return (
    <Button
      variant="glass"
      size="md"
      onClick={handleLogout}
      className="w-full"
    >
      Sign Out
    </Button>
  );
};

export default LogoutButton;
