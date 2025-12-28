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
    <div className="relative w-full max-w-md">
      <ListboxFloating
        value={currency!}
        onChange={handleCurrencyChange}
        options={CURRENCIES}
        placement="bottom-start"
        renderButton={() => (
          <button
            className={clsx(
              "relative w-full h-10 rounded-xl px-3 pr-9 text-sm text-slate-200",
              "bg-black/90 backdrop-blur-md ring-1 ring-slate-400/25 hover:ring-slate-400/40"
            )}
          >
            <span className="block truncate">{currency || "UAH"}</span>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200/80" />
          </button>
        )}
      />
    </div>
  );
}
