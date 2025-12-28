import { OnboardingStep } from "@/features/onboarding";
import { Incomes } from "@/features/onboarding/ui/Incomes";
import { OnboardingFrame } from "@/widgets/onboarding";

export const OnboardingIncomes = () => {
  const widgetData = {
    title: "Monthly income",
    body: `Please, indicate your monthly income`,
    step: OnboardingStep.INCOMES,
  };

  return (
    <div className="flex justify-center item-center">
      <OnboardingFrame {...widgetData}>
        <Incomes />
      </OnboardingFrame>
    </div>
  );
};
