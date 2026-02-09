import { useAuth } from "@/app/providers/AuthProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";

interface LogoutButtonProps {
  onLogoutStart?: () => void;
}

export const LogoutButton = ({ onLogoutStart }: LogoutButtonProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("Logout initiated");
      
      // Start fade-out animation
      setIsFadingOut(true);
      
      // Wait for fade-out animation (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Perform logout
      await logout();
      
      // Navigate using React Router to avoid page reload and loader flickering
      navigate("/login", { replace: true });
      
      // Reset fade-out state after navigation
      setTimeout(() => {
        setIsFadingOut(false);
      }, 50);
    } catch (error) {
      console.error("Logout failed in handleLogout:", error);
      // Reset fade-out state on error
      setIsFadingOut(false);
      // Even if logout fails, try to redirect
      navigate("/login", { replace: true });
    }
  };

  const handleConfirmLogout = () => {
    console.log('confirmed')
    setIsModalOpen(false);
    // Close dropdown menu immediately when logout is confirmed
    if (onLogoutStart) {
      onLogoutStart();
    }
    handleLogout();
  };

  const handleCancelLogout = () => {
    console.log('canceled')
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="glass"
        size="md"
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        Sign Out
      </Button>

      <ConfirmationModal
        title="Are you sure you want to sign out?"
        action={handleConfirmLogout}
        cancel={handleCancelLogout}
        isOpen={isModalOpen}
      />

      {/* Fade-out overlay during logout - appears after modal closes */}
      {isFadingOut && (
        <div 
          className="fixed inset-0 bg-black z-[99999] transition-opacity duration-300 opacity-100"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </>
  );
};

export default LogoutButton;
