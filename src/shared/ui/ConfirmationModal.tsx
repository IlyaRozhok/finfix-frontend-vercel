import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ConfirmationModalProps = {
  title: string;
  action: () => void;
  cancel: () => void;
  isOpen?: boolean;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  action,
  cancel,
  isOpen = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancel();
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing on backdrop click - only allow closing via buttons
    e.stopPropagation();
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    // Prevent clicks inside panel from bubbling up
    e.stopPropagation();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onMouseDown={handleBackdropClick}
    >
      {/* Enhanced backdrop with better blur */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xl" />

      {/* Modal Panel */}
      <div
        onClick={handlePanelClick}
        onMouseDown={handlePanelClick}
        className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8"
      >
        {/* Header with warning icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-400/30">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-300" />
            </div>
            <h2 className="text-xl font-bold text-primary-background tracking-tight">
              Confirm Action
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group"
          >
            <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-primary-background/90 text-center leading-relaxed">
            {title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="glass-primary"
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );

  // Render modal in a portal to avoid z-index and click handler conflicts
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
