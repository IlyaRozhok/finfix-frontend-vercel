import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchSummary } from "@/features/onboarding/api";
import { OnboardingWelcome } from "@/pages/onboarding";
import { OnboardingStep } from "@/features/onboarding";

interface OnboardingSummary {
  currency: string | null;
  incomes: number | null;
  isOnboarded: boolean;
  expenses: unknown[];
  debts?: unknown[];
  installments?: unknown[];
  installmnets?: unknown[];
}

export const OnboardingWrapper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const determineNextStep = useCallback(
    (summary: OnboardingSummary): string | null => {
      if (summary.isOnboarded) {
        navigate("/profile", { replace: true });
        return null;
      }

      const currentPath = location.pathname;

      // If user is on welcome page, don't redirect
      if (currentPath === "/onboarding" || currentPath === "/onboarding/") {
        return null;
      }

      // If user is already on a specific step, let them continue (unless they need to go back)
      // Determine which step user should be on based on completed data
      if (!summary.currency) {
        // If on currency page, stay there
        if (currentPath.includes("/currency")) return null;
        return "/onboarding/currency";
      }

      if (!summary.incomes || summary.incomes <= 0) {
        // If on incomes page, stay there
        if (currentPath.includes("/incomes")) return null;
        return "/onboarding/incomes";
      }

      // Expenses are required
      if (!summary.expenses || summary.expenses.length === 0) {
        // If on expenses page, stay there
        if (currentPath.includes("/expenses")) return null;
        return "/onboarding/expenses";
      }

      // Debts and installments are optional
      // If user is already on debts/installments page, let them continue
      if (currentPath.includes("/debts")) {
        return null; // Stay on debts page
      }
      if (currentPath.includes("/installments")) {
        return null; // Stay on installments page
      }

      // If all required steps are done, go to debts (optional step)
      // User can skip it, but we'll show it first
      return "/onboarding/debts";
    },
    [navigate, location.pathname]
  );

  const loadOnboardingSummary = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // If user is on welcome page, don't load summary - just show the page
    const currentPath = location.pathname;
    if (currentPath === "/onboarding" || currentPath === "/onboarding/") {
      setLoading(false);
      return;
    }

    try {
      const summaryData = await fetchSummary(user.id);
      const nextStep = determineNextStep(summaryData);
      
      // Only redirect if there's a next step and user is not already on the correct page
      if (nextStep && !location.pathname.includes(nextStep)) {
        navigate(`/onboarding${nextStep}`, { replace: true });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load onboarding summary:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingSummary();
  }, [user?.id, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-primary-background">Loading...</div>
      </div>
    );
  }

  // Show welcome page for new users or if on root onboarding path
  if (location.pathname === "/onboarding" || location.pathname === "/onboarding/") {
    return <OnboardingWelcome />;
  }

  return null;
};
