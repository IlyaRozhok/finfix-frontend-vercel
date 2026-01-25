import React from "react";
import { useNavigate } from "react-router-dom";
import { Account } from "@/features/accounts/api";
import { Card } from "./Card";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/analytics/accounts/${account.id}`);
  };

  return (
    <Card onClick={handleClick} hover className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-primary-background mb-1">
          {account.name}
        </h3>
        {account.description && (
          <p className="text-sm text-primary-background/60">
            {account.description}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-background/60">Type</span>
          <span className="text-sm font-medium text-primary-background capitalize">
            {account.type}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-background/60">Asset</span>
          <span className="text-sm font-medium text-primary-background">
            {account.assetCode.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-background/60">Provider</span>
          <span className="text-sm font-medium text-primary-background capitalize">
            {account.provider}
          </span>
        </div>
      </div>
    </Card>
  );
}
