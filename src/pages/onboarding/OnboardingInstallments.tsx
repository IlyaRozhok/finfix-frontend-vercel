import { OnboardingStep, Installment } from "@/features/onboarding/model/types";
import { OnboardingFrame } from "@/widgets/onboarding";
import { Button } from "@/shared/ui";
import { useMemo } from "react";
import { InstallmentRow } from "@/features/onboarding/ui/InstallmentRow";
import { useOnboarding } from "@/features/onboarding/model/store";

export const OnboardingInstallments = () => {
  const { data, addInstallment, updateInstallment } = useOnboarding();

  const handleUpdate = (id: string, key: string, value: string) => {
    updateInstallment(id, key as keyof Installment, value);
  };

  const handleAdd = () => {
    addInstallment();
  };

  const widgetData = {
    title: "Installments",
    body: `Add your installment purchases (if any). You can skip this step.`,
    step: OnboardingStep.INSTALLMENTS,
    headerAction: (
      <Button
        variant="glass"
        size="md"
        onClick={handleAdd}
        className="border-white/30 bg-white/15 hover:bg-white/25 hover:border-white/40 font-semibold w-11 h-11 p-0 flex items-center justify-center rounded-xl"
        title="Add installment"
      >
        <span className="text-xl font-light">+</span>
      </Button>
    ),
  };

  const installments = useMemo(
    () => data.installments || [],
    [data.installments]
  );
  const total = useMemo(() => {
    return installments.reduce(
      (sum, inst) => sum + (Number(inst.totalAmount) || 0),
      0
    );
  }, [installments]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto nice-scroll space-y-3 pr-2 pb-2">
            <div className="min-w-fit">
              {installments.map((inst) => (
                <InstallmentRow
                  key={inst.id}
                  row={inst}
                  onUpdate={handleUpdate}
                />
              ))}
              {installments.length === 0 && (
                <div className="text-center py-8 text-primary-background/80 text-sm sm:text-base px-2 font-extralight">
                  No installments added. You can skip this step if you don't have any installment purchases.
                </div>
              )}
            </div>
          </div>
          {installments.length > 0 && (
            <div className="text-sm text-primary-background/90 text-center sm:text-right font-medium mt-4 pt-4 border-t border-white/10">
              Total estimation:
              <span className="ml-2 font-bold text-primary-background">
                {total.toFixed(2)} {data.baseCurrency || "UAH"}
              </span>
            </div>
          )}
        </div>
      </OnboardingFrame>
    </div>
  );
};
