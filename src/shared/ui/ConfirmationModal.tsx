import React from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "./Button";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ConfirmationModalProps = {
  title: string;
  action: () => void;
  cancel: () => void;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  action,
  cancel,
}) => {
  return (
    <Dialog open={true} onClose={cancel} className="relative z-50">
      {/* Enhanced backdrop with better blur */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xl" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8">
          {/* Header with warning icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-400/30">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-300" />
              </div>
              <Dialog.Title className="text-xl font-bold text-primary-background tracking-tight">
                Confirm Action
              </Dialog.Title>
            </div>
            <button
              onClick={cancel}
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
              onClick={cancel}
              variant="ghost"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={action}
              variant="glass-primary"
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
