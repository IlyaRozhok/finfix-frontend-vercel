import { useState } from "react";
import { MonoAccount } from "../api";

interface AccountCardProps {
  account: MonoAccount;
  isSelected: boolean;
  onClick: () => void;
}

const CURRENCY_SYMBOLS: Record<number, string> = {
  980: "₴", // UAH
  840: "$", // USD
  978: "€", // EUR
};

const CURRENCY_NAMES: Record<number, string> = {
  980: "UAH",
  840: "USD",
  978: "EUR",
};

const formatAmount = (amount: number, currencyCode: number): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  const formatted = Math.abs(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export const AccountCard = ({
  account,
  isSelected,
  onClick,
}: AccountCardProps) => {
  const [isFlipped, setIsFlipped] = useState(true);
  const currencyName =
    CURRENCY_NAMES[account.currencyCode] || `Code ${account.currencyCode}`;

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    if (isFlipped) {
      onClick();
    }
  };

  return (
    <div className="relative w-full h-48" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <button
          onClick={handleCardClick}
          className={`
            absolute inset-0 w-full h-full text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer
            ${
              isSelected
                ? "bg-white/20 backdrop-blur-md border-white/40 shadow-xl shadow-white/20"
                : "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
            }
          `}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-background">
                {account.type.toUpperCase()}
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={handleCardClick}
          className={`
            absolute inset-0 w-full h-full text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer
            ${
              isSelected
                ? "bg-white/20 backdrop-blur-md border-white/40 shadow-xl shadow-white/20"
                : "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
            }
          `}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">
                  {account.type}
                </div>
                <div className="text-xs text-gray-500 mt-1">{currencyName}</div>
              </div>
              {account.maskedPan && account.maskedPan.length > 0 && (
                <div className="text-xs text-gray-400 font-mono">
                  {account.maskedPan[0]}
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="text-2xl font-bold text-primary-background">
                {formatAmount(account.balance, account.currencyCode)}
              </div>
              {account.creditLimit > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Credit limit:{" "}
                  {formatAmount(account.creditLimit, account.currencyCode)}
                </div>
              )}
            </div>

            {account.iban && (
              <div className="text-xs text-gray-500 font-mono truncate">
                {account.iban}
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
