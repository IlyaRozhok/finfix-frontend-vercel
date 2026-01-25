import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { connectMonobank, MonobankConnectResponse } from "../api";
import { AxiosError } from "axios";
import { AccountsListModal } from "./AccountsListModal";

interface MonobankSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonobankSyncModal({ isOpen, onClose }: MonobankSyncModalProps) {
  const [step, setStep] = useState<"description" | "token">("description");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectResponse, setConnectResponse] =
    useState<MonobankConnectResponse | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

  const handleClose = () => {
    setStep("description");
    setToken("");
    setError(null);
    setConnectResponse(null);
    setIsAccountsModalOpen(false);
    onClose();
  };

  const handleCloseAccountsModal = () => {
    setIsAccountsModalOpen(false);
    handleClose();
  };

  const handleNext = () => {
    setStep("token");
  };

  const handleBack = () => {
    setStep("description");
    setError(null);
  };

  const handleSync = async () => {
    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await connectMonobank(token);
      setConnectResponse(response);
      // Закрываем модалку синхронизации и открываем модалку с аккаунтами
      setStep("description");
      setToken("");
      setIsAccountsModalOpen(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.status === 404) {
          return setError("Wrong request. Check server connection");
        }
        return setError(err.response?.data.message);
      }

      console.error("Monobank connect error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xl" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8">
          <div className="flex items-center justify-between mb-6 relative">
            {step === "token" ? (
              <button
                onClick={handleBack}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
              >
                <ArrowLeftIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
              </button>
            ) : (
              <div className="w-9" />
            )}
            <Dialog.Title className="text-xl font-bold text-primary-background tracking-tight absolute left-1/2 transform -translate-x-1/2">
              API Token required
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group ml-auto cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
            </button>
          </div>

          {step === "description" ? (
            <div className="space-y-6">
              <div className="text-primary-background/90 leading-relaxed">
                <p className="mb-4">
                  API for obtaining information about statements and the status
                  of personal accounts and sole proprietor accounts. To grant
                  access, you must log in to your personal account at{" "}
                  <a
                    href="https://api.monobank.ua/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-background underline hover:text-primary-background/80 transition-colors"
                  >
                    https://api.monobank.ua/
                  </a>{" "}
                  and obtain a token for personal use.
                </p>
                <p>Click Next when you will be ready to insert your token</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background font-medium hover:bg-white/20 transition-all duration-200"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary-background/90 mb-2">
                  Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your Monobank API token"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-primary-background placeholder:text-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
              </div>
              {error && <div className="text-red-800 text-sm">{error}</div>}
              <button
                onClick={handleSync}
                disabled={isLoading || !token.trim()}
                className="w-full px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Syncing..." : "Sync"}
              </button>
            </div>
          )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Accounts Modal */}
      {connectResponse && (
        <AccountsListModal
          isOpen={isAccountsModalOpen}
          onClose={handleCloseAccountsModal}
          accounts={connectResponse.accounts}
        />
      )}
    </>
  );
}
