import { Button } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import { getOnboardingPath } from "../model/steps";
import {
  OnboardingStep,
  ReqCreateUserExpense,
  ReqUserExpense,
} from "../model/types";
import { useOnboarding } from "../model/store";
import {
  createDebts,
  createUserExpenses,
  createUserOnboardingIncomes,
  updateDebt,
  createInstallments,
  completeOnboarding,
} from "../api";
import { useAuth } from "@/app/providers/AuthProvider";
import { newInstallmentPayload } from "../lib/newInstallmentPayload";
import { prepareNewDebtsForApi } from "../lib/prepareNewDebtsForApi";

const prepareExpensesForApi = (
  expenses: ReqUserExpense[],
  userId?: string
): ReqCreateUserExpense[] => {
  return expenses.map((expense) => {
    const { id, userId: expenseUserId, ...rest } = expense;
    return {
      ...rest,
      userId: userId ?? expenseUserId ?? "",
      ...(id && { id }),
    };
  });
};

interface OnboardingNextButtonProps {
  step: OnboardingStep;
}

export const OnboardingBackButton: React.FC<OnboardingNextButtonProps> = ({
  step,
}) => {
  const navigate = useNavigate();
  
  // Don't show back button on welcome page
  if (step === OnboardingStep.WELCOME) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={() => navigate(getOnboardingPath({ step, type: "back" }))}
      className="w-full sm:w-auto"
    >
      Back
    </Button>
  );
};

export const OnboardingNextButton: React.FC<OnboardingNextButtonProps> = ({
  step,
}) => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const {
    data,
    originalData,
    setIncomesError,
    validateExpenses,
    validateDebts,
    hasExpensesChanged,
    hasDebtsChanged,
    validateInstallments,
  } = useOnboarding();
  const handleNext = () => {
    if (step === OnboardingStep.INCOMES) {
      if (!data.incomes) {
        return setIncomesError("Please, enter amount of your incomes");
      }
      if (user?.id) {
        createUserOnboardingIncomes({
          uid: user.id as string,
          incomes: data.incomes,
        });
      }
    }
    if (step === OnboardingStep.EXPENSES) {
      const ok = validateExpenses();
      if (!ok) return;

      if (hasExpensesChanged() && user?.id) {
        const expensesPayload = prepareExpensesForApi(data.expenses, user.id);
        createUserExpenses(expensesPayload);
      }
    }

    if (step === OnboardingStep.BANK_DEBT) {
      // Only validate if there are debts to validate
      if (data.debts.length > 0) {
        const ok = validateDebts();
        if (!ok) return;
      }
      
      if (hasDebtsChanged() && user?.id) {
        const newDebtsPayload = prepareNewDebtsForApi(
          data.debts,
          user.id,
          originalData.debts
        );
        if (newDebtsPayload.length > 0) {
          createDebts(newDebtsPayload);
        }

        const originalIds = new Set(originalData.debts.map((debt) => debt.id));
        const existingDebts = data.debts.filter((debt) =>
          debt.id ? originalIds.has(debt.id) : false
        );
        for (const debt of existingDebts) {
          const debtPayload = {
            userId: user.id,
            totalDebt: debt.totalDebt,
            interest: debt.interest,
            description: debt.description || "",
          };
          updateDebt(debt.id, debtPayload);
        }
      }
    }

    if (step === OnboardingStep.INSTALLMENTS) {
      // Only validate and save if there are installments
      if (data.installments && data.installments.length > 0) {
        const ok = validateInstallments();
        if (!ok) return;

        const payload = newInstallmentPayload(
          data.installments,
          user?.id as string
        );
        createInstallments(payload);
      }

      // Navigate to completion page
      navigate("/onboarding/complete", { replace: false });
      return;
    }
    navigate(getOnboardingPath({ step, type: "next" }));
  };


  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Button 
        variant="glass-primary" 
        size="lg"
        onClick={handleNext}
        className="w-full sm:w-auto flex-1"
      >
        Next
      </Button>
    </div>
  );
};
