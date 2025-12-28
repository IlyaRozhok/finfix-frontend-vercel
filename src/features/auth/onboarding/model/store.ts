
import { OnboardingData } from "@/features/onboarding";
import { create } from "zustand";

type OnboardingState = {
  data: OnboardingData;
  setCurrency: (currencyId: string) => void;
  resetCurrency: () => void;
};

export const useOnboarding = create<OnboardingState>((set) => ({
  data: {
    baseCurrency: "",
    incomes: "",
    expenses: [],
    debts: [],
  },
  setCurrency: (currencyId: string) =>
    set((state) => ({
      data: { ...state.data, baseCurrency: currencyId },
    })),
  resetCurrency: () =>
    set((state) => ({
      data: { ...state.data, baseCurrency: "" },
    })),
}));
