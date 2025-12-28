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
    title: "Bank debts",
    body: `Add active loans in ${
      data.baseCurrency || "…"
    } (if any). You can skip this step.`,
    step: OnboardingStep.BANK_DEBT,
  };

  const total = useMemo(() => {
    return data.debts.reduce((sum, d) => sum + (Number(d.totalDebt) || 0), 0);
  }, [data.debts]);

  return (
    <div className="flex justify-center item-center">
      <OnboardingFrame {...widgetData}>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-slate-300 py-8">
              Loading debts...
            </div>
          ) : (
            <>
              <div className="custom-scroll max-h-[50vh] md:max-h-72 overflow-y-auto pr-2 pb-4 space-y-3">
                {data.debts.map((r) => (
                  <BankDebtRow key={r.id} row={r} />
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
                <Button
                  variant="ghost"
                  onClick={addDebt}
                  className="w-full sm:w-auto"
                >
                  + Add debt
                </Button>
                <div className="text-sm text-slate-300 text-right">
                  Total estimation:
                  <span className="ml-2 font-semibold">
                    {total.toFixed(2)} {data.baseCurrency}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </OnboardingFrame>
    </div>
  );
};
