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
  return (
    <Button
      variant="ghost"
      onClick={() => navigate(getOnboardingPath({ step, type: "back" }))}
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
      const ok = validateDebts();
      if (!ok) return;
      console.log("user", user);
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
      if (data.installments && data.installments.length > 0) {
        const ok = validateInstallments();
        if (!ok) return;

        const payload = newInstallmentPayload(
          data.installments,
          user?.id as string
        );
        createInstallments(payload);
      }

      // Complete onboarding and redirect to dashboard
      completeOnboarding()
        .then(() => {
          // Refresh user data to update isOnboarded status
          refresh().then(() => {
            navigate("/dashboard", { replace: true });
          });
        })
        .catch((error) => {
          console.error("Failed to complete onboarding:", error);
        });

      return;
    }
    navigate(getOnboardingPath({ step, type: "next" }));
  };

  const buttonText = step === OnboardingStep.INSTALLMENTS ? "Complete" : "Next";

  return (
    <Button variant="primary" onClick={handleNext}>
      {buttonText}
    </Button>
  );
};
