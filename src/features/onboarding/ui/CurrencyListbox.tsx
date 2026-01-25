import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ListboxFloating } from "@/shared/ui";
import clsx from "clsx";
import { useOnboarding } from "../model/store";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";

const CURRENCIES = [
  {
    value: "UAH",
    label: "UAH",
  },
  {
    value: "USD",
    label: "USD",
  },
  {
    value: "EUR",
    label: "EUR",
  },
];

export function CurrencyListbox() {
  const { user } = useAuth();
  const [currency, setCurr] = useState("");
  const { setCurrency, data } = useOnboarding();

  const handleCurrencyChange = (currency: string) => {
    if (data.baseCurrency && user?.id) {
      setCurrency(user?.id, currency);
      setCurr(currency);
    }
  };

  useEffect(() => {
    if (user?.currency) {
      setCurr(user?.currency);
    }
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <ListboxFloating
        value={currency!}
        onChange={handleCurrencyChange}
        options={CURRENCIES}
        placement="bottom-start"
        variant="glass"
        renderButton={() => (
          <button
            className={clsx(
              "relative w-full h-12 mt-2 rounded-xl px-4 pr-10 text-sm font-medium text-primary-background",
              "bg-white/10 border border-white/20 hover:border-white/30",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border focus:border-white/40 focus:shadow-[0_0_8px_rgba(255,255,255,0.15)]"
            )}
            style={{ backdropFilter: 'none' }}
          >
            <span className="block truncate text-left">{currency || "Select currency"}</span>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-background/70" />
          </button>
        )}
      />
    </div>
  );
}
