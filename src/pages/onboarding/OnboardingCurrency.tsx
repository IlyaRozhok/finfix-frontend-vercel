import { OnboardingStep } from "@/features/onboarding";
import { CurrencyListbox } from "@/features/onboarding/";

import { OnboardingFrame } from "@/widgets/onboarding";

export const OnboardingCurrency = () => {
  const widgetData = {
    title: OnboardingStep.CURRENCY,
    body: `Select prefered currency for using in app`,
    step: OnboardingStep.CURRENCY,
  };


  return (
    <div className="flex justify-center items-center">
      <OnboardingFrame {...widgetData}>
        <CurrencyListbox />
      </OnboardingFrame>
    </div>
  );
};
