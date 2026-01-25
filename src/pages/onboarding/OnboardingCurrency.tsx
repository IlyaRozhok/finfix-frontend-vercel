import { OnboardingStep } from "@/features/onboarding";
import { CurrencyListbox } from "@/features/onboarding/";
import { OnboardingFrame } from "@/widgets/onboarding";

export const OnboardingCurrency = () => {
  const widgetData = {
    title: "Base Currency",
    body: "Select your preferred currency for using in the app",
    step: OnboardingStep.CURRENCY,
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        <div className="flex justify-center">
          <CurrencyListbox />
        </div>
      </OnboardingFrame>
    </div>
  );
};
