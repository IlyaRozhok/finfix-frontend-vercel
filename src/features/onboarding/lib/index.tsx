import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export const renderBtn = (label: string) => (
  <button
    type="button"
    className={clsx(
      "relative h-12 w-full rounded-xl px-3 pr-9 text-sm text-slate-200",
      "bg-black/90 backdrop-blur-md",
      "ring-1 ring-slate-400/25 hover:ring-slate-400/40 transition"
    )}
  >
    <span className="block truncate">{label}</span>
    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200/80" />
  </button>
);
