import { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import {
  useFloating,
  offset,
  flip,
  size,
  autoUpdate,
  FloatingPortal,
} from "@floating-ui/react";
import clsx from "clsx";

type ListboxFloatingProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  renderButton: (args: { open: boolean }) => React.ReactNode;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  matchWidth?: boolean;
  maxHeight?: number;
  optionsClassName?: string;
  optionClassName?: string;
  variant?: "dark" | "glass";
};

export const ListboxFloating = <T extends string>({
  value,
  onChange,
  options,
  renderButton,
  placement = "bottom-start",
  matchWidth = true,
  maxHeight = 280,
  optionsClassName,
  optionClassName,
  variant = "dark",
}: ListboxFloatingProps<T>) => {
  const { refs, floatingStyles } = useFloating({
    placement,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: ["bottom-start", "bottom-end", "top-start", "top-end"],
      }),
      size({
        apply({ rects, elements }) {
          if (matchWidth) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          }
          Object.assign(elements.floating.style, {
            maxHeight: `${maxHeight}px`,
          });
        },
      }),
    ],
  });

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Button as={Fragment}>
            <div ref={refs.setReference}>{renderButton({ open })}</div>
          </Listbox.Button>

          <FloatingPortal>
            {open && (
              <Listbox.Options
                ref={refs.setFloating}
                static
                style={{
                  ...floatingStyles,
                  outline: 'none',
                  borderColor: variant === "glass" ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }}
                className={clsx(
                  "z-[1000] overflow-auto nice-scroll pt-2 pb-2 px-1.5",
                  "focus:outline-none focus:ring-0 focus-visible:outline-none",
                  "[&:focus]:outline-none [&:focus]:ring-0 [&:focus-visible]:outline-none",
                  variant === "glass"
                    ? "bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl text-primary-background [&:focus]:border-white/30 [&:focus-visible]:border-white/30"
                    : "bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-primary-background",
                  optionsClassName
                )}
              >
                {options.map((opt) => (
                  <Listbox.Option
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                      clsx(
                        "relative cursor-pointer select-none py-2 px-3 rounded-lg transition-colors",
                        active
                          ? "bg-white/20 text-white"
                          : "text-white",
                        optionClassName
                      )
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={clsx(
                          "block truncate",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {opt.label}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </FloatingPortal>
        </>
      )}
    </Listbox>
  );
};
