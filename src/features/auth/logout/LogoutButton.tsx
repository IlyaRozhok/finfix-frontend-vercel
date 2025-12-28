import { useAuth } from "@/app/providers/AuthProvider";
import { ConfirmationModal } from "@/shared/ui";
import { Button } from "@/shared/ui";
import React, { useState } from "react";

export const LogoutButton = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { logout } = useAuth();
  return (
    <>
      {!openModal && (
        <div className="grid">
          <Button onClick={() => setOpenModal(true)} variant="glass">
            Sign Out
          </Button>
        </div>
      )}
      {openModal && (
        <ConfirmationModal
          title="Are you sure you want to leave?"
          action={logout}
          cancel={() => setOpenModal(false)}
        />
      )}
    </>
  );
};

export default LogoutButton;
