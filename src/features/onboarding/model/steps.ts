import { OnboardingStep, OnboardingStepsCfg } from "./types";

interface GetOnboardingPathProps {
  step: OnboardingStep;
  type: "back" | "next";
}
export const ONBOARDING_STEPS: OnboardingStepsCfg[] = [
  { id: OnboardingStep.WELCOME, path: "", title: "Welcome" },
  { id: OnboardingStep.CURRENCY, path: "currency", title: "Currency" },
  { id: OnboardingStep.INCOMES, path: "incomes", title: "Incomes" },
  { id: OnboardingStep.EXPENSES, path: "expenses", title: "Expenses" },
  { id: OnboardingStep.BANK_DEBT, path: "debts", title: "Debts" },
  {
    id: OnboardingStep.INSTALLMENTS,
    path: "installments",
    title: "Installments",
  },
];

export const getOnboardingPath = (props: GetOnboardingPathProps) => {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.id === props.step);
  const next = ONBOARDING_STEPS[props.type === "next" ? idx + 1 : idx - 1];
  return next ? `/onboarding/${next.path}`.replace(/\/$/, "") : "/profile";
};
