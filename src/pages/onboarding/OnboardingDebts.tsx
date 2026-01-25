import { OnboardingStep } from "@/features/onboarding/model/types";
import { useOnboarding } from "@/features/onboarding/model/store";
import { OnboardingFrame } from "@/widgets/onboarding";
import { Button } from "@/shared/ui";
import { useMemo, useEffect, useState } from "react";
import { BankDebtRow } from "@/features/onboarding";
import { fetchDebts } from "@/features/onboarding/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { Debt } from "@/entities/debts/model";

export const OnboardingDebts = () => {
  const { data, addDebt, setDebts } = useOnboarding();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load existing debts on component mount
  useEffect(() => {
    const loadDebts = async () => {
      if (user?.id) {
        try {
          const debts = await fetchDebts();
          // Transform backend data to frontend format
          const transformedDebts: Debt[] = debts.map((debt) => ({
            id: debt.id || crypto.randomUUID(),
            userId: debt.userId || "",
            description: debt.description || "",
            debtType: "",
            totalDebt: debt.totalDebt,
            monthlyPayment: "",
            interest: debt.interest,
            gracePeriodDays: null,
            startDate: "",
            statementDay: null,
            dueDay: null,
            isClosed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setDebts(transformedDebts);
        } catch (error) {
          console.error("Error loading debts:", error);
          // If there's an error, just set empty array
          setDebts([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadDebts();
  }, [user?.id, setDebts]);

  const widgetData = {
    title: "Debts",
    body: `Add active loans in ${
      data.baseCurrency || "…"
    } (if any). You can skip this step.`,
    step: OnboardingStep.BANK_DEBT,
    headerAction: (
      <Button
        variant="glass"
        size="md"
        onClick={addDebt}
        className="border-white/30 bg-white/15 hover:bg-white/25 hover:border-white/40 font-semibold w-11 h-11 p-0 flex items-center justify-center rounded-xl"
        title="Add debt"
      >
        <span className="text-xl font-light">+</span>
      </Button>
    ),
  };

  const total = useMemo(() => {
    return data.debts.reduce((sum, d) => sum + (Number(d.totalDebt) || 0), 0);
  }, [data.debts]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        {isLoading ? (
          <div className="text-center text-primary-background/60 py-8">
            Loading debts...
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto nice-scroll space-y-3 pr-2">
              {data.debts.map((r) => (
                <BankDebtRow key={r.id} row={r} />
              ))}
              {data.debts.length === 0 && (
                <div className="text-center py-2 text-primary-background/80 text-sm sm:text-base px-2 font-extralight">
                  No debts added. You can skip this step if you don't have any active loans.
                </div>
              )}
            </div>
            {data.debts.length > 0 && (
              <div className="text-sm text-primary-background/90 text-center sm:text-right font-medium mt-4 pt-4 border-t border-white/10">
                Total estimation:
                <span className="ml-2 font-bold text-primary-background">
                  {total.toFixed(2)} {data.baseCurrency}
                </span>
              </div>
            )}
          </div>
        )}
      </OnboardingFrame>
    </div>
  );
};
