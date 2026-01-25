import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui";
import {
  createAccount,
  Account,
  AccountType,
  AccountAssetType,
  AccountProvider,
} from "@/features/accounts/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AccountFormData {
  name: string;
  description: string;
  type: AccountType;
  assetType: AccountAssetType;
  assetCode: string;
  provider: AccountProvider;
  externalId: string;
}

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  initialData?: AccountFormData;
  isEditing?: boolean;
  accountId?: string;
  editingAccount?: Account;
  userId: string;
}

const ACCOUNT_TYPES = [
  { value: AccountType.CARD, label: "Card" },
  { value: AccountType.CASH, label: "Cash" },
  { value: AccountType.WALLET, label: "Wallet" },
];

const ACCOUNT_ASSET_TYPES = [
  { value: AccountAssetType.FIAT, label: "Fiat" },
  { value: AccountAssetType.CRYPTO, label: "Crypto" },
];


const FIAT_CURRENCIES = [
  { value: "UAH", label: "UAH" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

const CRYPTO_COINS = [
  { value: "USDT", label: "USDT" },
  { value: "USDC", label: "USDC" },
  { value: "BTC", label: "BTC" },
  { value: "ETH", label: "ETH" },
  { value: "SOL", label: "SOL" },
  { value: "BNB", label: "BNB" },
  { value: "XRP", label: "XRP" },
];

export function AccountForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  accountId,
  editingAccount,
  userId,
}: AccountFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<AccountFormData>(
    initialData || {
      name: "",
      description: "",
      type: AccountType.CARD,
      assetType: AccountAssetType.FIAT,
      assetCode: "UAH",
      provider: AccountProvider.MANUAL,
      externalId: "",
    }
  );

  // Update form data when initialData or editingAccount changes (for editing)
  useEffect(() => {
    if (editingAccount && isEditing) {
      const newData: AccountFormData = {
        name: editingAccount.name || "",
        description: editingAccount.description || "",
        type: editingAccount.type || AccountType.CARD,
        assetType: editingAccount.assetType || AccountAssetType.FIAT,
        assetCode: editingAccount.assetCode || "UAH",
        provider: editingAccount.provider || AccountProvider.MANUAL,
        externalId: editingAccount.externalId || "",
      };
      setFormData(newData);
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [editingAccount, initialData, isEditing]);

  // Reset assetCode when assetType changes
  useEffect(() => {
    if (formData.assetType === AccountAssetType.FIAT) {
      setFormData((prev) => ({
        ...prev,
        assetCode: prev.assetCode && FIAT_CURRENCIES.some((c) => c.value === prev.assetCode)
          ? prev.assetCode
          : "UAH",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        assetCode: prev.assetCode && CRYPTO_COINS.some((c) => c.value === prev.assetCode)
          ? prev.assetCode
          : "USDT",
      }));
    }
  }, [formData.assetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!userId) {
        addToast(
          "error",
          "Missing user",
          "Please sign in again and try to save the account."
        );
        return;
      }

      // Create new account (update not implemented in backend yet)
      // Provider is always MANUAL for manually created accounts
      await createAccount({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        assetType: formData.assetType,
        assetCode: formData.assetCode,
        provider: AccountProvider.MANUAL,
        externalId: undefined,
      });
      addToast("success", "Account Added", `Successfully added new account`);

      await onSubmit();
    } catch (error) {
      console.error("Failed to save account:", error);
      addToast(
        "error",
        "Failed to Add Account",
        "Please check your input and try again"
      );
      return;
    }

    setFormData({
      name: "",
      description: "",
      type: AccountType.CARD,
      assetType: AccountAssetType.FIAT,
      assetCode: "UAH",
      provider: AccountProvider.MANUAL,
      externalId: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: AccountType.CARD,
      assetType: AccountAssetType.FIAT,
      assetCode: "UAH",
      provider: AccountProvider.MANUAL,
      externalId: "",
    });
    onClose();
  };

  const availableAssetCodes =
    formData.assetType === AccountAssetType.FIAT ? FIAT_CURRENCIES : CRYPTO_COINS;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Enhanced backdrop with better blur */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xl" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
          {/* Header with glassmorphism close button */}
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-2xl font-bold text-primary-background tracking-tight">
              {isEditing ? "Edit" : "Add"} Account
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group"
            >
              <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="Enter account name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="Enter description"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Account Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as AccountType })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                required
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Asset Type *
              </label>
              <select
                value={formData.assetType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assetType: e.target.value as AccountAssetType,
                  })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                required
              >
                {ACCOUNT_ASSET_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                {formData.assetType === AccountAssetType.FIAT
                  ? "Currency"
                  : "Crypto Coin"}{" "}
                *
              </label>
              <select
                value={formData.assetCode}
                onChange={(e) =>
                  setFormData({ ...formData, assetCode: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                required
              >
                {availableAssetCodes.map((asset) => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </div>


            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glass-primary"
                size="lg"
                className="flex-1"
              >
                {isEditing ? "Update" : "Add"} Account
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
