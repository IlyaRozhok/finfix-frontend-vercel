import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchSummary } from "@/features/onboarding/api";
import { OnboardingWelcome } from "@/pages/onboarding";

interface OnboardingSummary {
  currency: string | null;
  incomes: number | null;
  isOnboarded: boolean;
  expenses: unknown[];
  debts?: unknown[];
  installments?: unknown[];
}

export const OnboardingWrapper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const determineNextStep = useCallback(
    (summary: OnboardingSummary): string | null => {
      if (summary.isOnboarded) {
        navigate("/dashboard", { replace: true });
        return null;
      }

      // For new users who haven't set incomes yet, don't redirect - show welcome page
      const hasCompletedIncomes = summary.incomes && summary.incomes > 0;
      
      // If user hasn't started onboarding (no incomes), show welcome page
      if (!hasCompletedIncomes) {
        return null; // null means don't redirect, show welcome
      }

      // Once incomes are set, continue with the normal flow
      if (!summary.expenses || summary.expenses.length === 0) {
        return "/expenses";
      }

      // Check if we have debts data, if not go to debts
      if (!summary.debts || summary.debts.length === 0) {
        return "/debts";
      }

      // If all data is complete, go to installments
      return "/installments";
    },
    [navigate]
  );

  const loadOnboardingSummary = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const summaryData = await fetchSummary(user.id);
      const nextStep = determineNextStep(summaryData);
      
      // Only redirect if there's a next step (user has started onboarding)
      if (nextStep) {
        navigate(`/onboarding${nextStep}`, { replace: true });
      } else {
        // User hasn't started onboarding, show welcome page
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load onboarding summary:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingSummary();
  }, [user?.id, navigate, determineNextStep]);

  // Show welcome page for new users
  return <OnboardingWelcome />;
};
