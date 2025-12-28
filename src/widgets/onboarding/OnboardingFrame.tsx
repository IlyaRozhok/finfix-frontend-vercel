import {
  OnboardingNextButton,
  OnboardingBackButton,
  OnboardingStep,
} from "@/features/onboarding";
import React, { ReactNode, useEffect, useRef } from "react";
import { useOnboarding } from "@/features/onboarding/model/store";
import useOnboardingSummary from "@/features/onboarding/lib/useOnboardingSummary";

type OnboardingFrame = {
  title: string;
  body: string;
  children?: ReactNode;
  step: OnboardingStep;
};
export const OnboardingFrame: React.FC<OnboardingFrame> = ({
  title,
  body,
  children,
  step,
}) => {
  const { initializeFromSummary } = useOnboarding();
  const summary = useOnboardingSummary();
  const initializedRef = useRef(false);

  // Initialize data from summary when it's loaded
  useEffect(() => {
    if (
      summary &&
      !summary.loading &&
      !initializedRef.current &&
      (summary.currency ||
        summary.incomes !== undefined ||
        (summary.expenses && summary.expenses.length > 0) ||
        (summary.debts && summary.debts.length > 0) ||
        (summary.installments && summary.installments.length > 0) ||
        (summary.installmnets && summary.installmnets.length > 0))
    ) {
      initializeFromSummary(summary);
      initializedRef.current = true;
    }
  }, [summary, initializeFromSummary]);

  return (
    <div className="relative grid place-content-center w-4xl h-120 pb-10 px-10 rounded-2xl bg-black/60 backdrop-blur-[3px] text-center">
      <h2 className="text-2xl">{title}</h2>
      <h3 className="mb-1 mt-2 text-sm lg:text-base lg:text-white">{body}</h3>
      {children && <div>{children}</div>}
      <div className="w-full absolute bottom-3 flex justify-between px-4">
        <OnboardingBackButton step={step} />
        <OnboardingNextButton step={step} />
      </div>
    </div>
  );
};
