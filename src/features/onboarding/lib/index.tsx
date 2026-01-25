import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export const renderBtn = (label: string) => (
  <button
    type="button"
    className={clsx(
      "relative h-11 w-full rounded-xl px-3 pr-10 text-sm font-medium text-primary-background",
      "bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30",
      "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border focus:border-white/40 focus:shadow-[0_0_8px_rgba(255,255,255,0.15)]"
    )}
  >
    <span className="block truncate text-left">{label}</span>
    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-background/70" />
  </button>
);
