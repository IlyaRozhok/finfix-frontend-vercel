import {
  OnboardingNextButton,
  OnboardingBackButton,
  OnboardingStep,
} from "@/features/onboarding";
import React, { ReactNode, useEffect, useRef } from "react";
import { useOnboarding } from "@/features/onboarding/model/store";
import useOnboardingSummary from "@/features/onboarding/lib/useOnboardingSummary";
import { OnboardingProgress } from "./OnboardingProgress";
import clsx from "clsx";

type OnboardingFrame = {
  title: string;
  body: string;
  children?: ReactNode;
  step: OnboardingStep;
  showProgress?: boolean;
  headerAction?: ReactNode;
  containerHeight?: string;
  allStepsCompleted?: boolean;
  hideNavigation?: boolean;
};
export const OnboardingFrame: React.FC<OnboardingFrame> = ({
  title,
  body,
  children,
  step,
  showProgress = true,
  headerAction,
  containerHeight,
  allStepsCompleted = false,
  hideNavigation = false,
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

  const heightClass = containerHeight || "max-h-[85vh] h-[28rem] sm:h-[30rem] md:h-[32rem] lg:h-[35rem] xl:h-[38rem]";
  
  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-2 pt-0 sm:pt-0 md:pt-0 lg:pt-0 xl:pt-0 2xl:pt-0">
      <div className={`bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-xl p-3 sm:p-4 md:p-5 lg:p-6 ${heightClass} flex flex-col overflow-hidden`}>
        {/* Progress indicator */}
        {showProgress && (
          <div className="mb-4 sm:mb-5 md:mb-6 flex-shrink-0">
            <OnboardingProgress currentStep={step} allCompleted={allStepsCompleted} />
          </div>
        )}

        {/* Header */}
        <div className={clsx(showProgress ? "mb-4 sm:mb-5 md:mb-6" : "mb-6 sm:mb-7 md:mb-8", "flex-shrink-0")}>
          <div className="relative flex items-center justify-center mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-primary-background tracking-tight text-center">
              {title}
            </h2>
            {headerAction && (
              <div className="absolute right-0">
                {headerAction}
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-primary-background/95 leading-relaxed px-1 sm:px-2 font-light text-center">
            {body}
          </p>
        </div>

        {/* Content */}
        {children && (
          <div className="mb-3 sm:mb-4 md:mb-6 flex-1 flex flex-col min-h-0 overflow-y-auto nice-scroll">
            {children}
          </div>
        )}

        {/* Navigation buttons */}
        {!hideNavigation && step !== OnboardingStep.WELCOME && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-white/10 mt-auto flex-shrink-0">
            <OnboardingBackButton step={step} />
            <OnboardingNextButton step={step} />
          </div>
        )}
      </div>
    </div>
  );
};
