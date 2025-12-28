import { OnboardingStep } from "@/features/onboarding/model/types";
import { useOnboarding } from "@/features/onboarding/model/store";
import { OnboardingFrame } from "@/widgets/onboarding";

import { Button } from "@/shared/ui";
import { useEffect, useMemo, useState } from "react";
import { ExpenseRow } from "@/features/onboarding/";
import { ReqUserExpense as Row } from "@/features/onboarding/model/types";
import { fetchCategories } from "@/features/onboarding/api";
import { useAuth } from "@/app/providers/AuthProvider";

export const OnboardingExpenses = () => {
  const { data, addExpense, updateExpense } = useOnboarding();
  const { user } = useAuth();
  const [categories, setCategories] = useState<
    {
      value: string;
      label: string;
    }[]
  >();

  const getCategories = async () => {
    try {
      const categories = await fetchCategories();
      if (categories.length) {
        const formattedCategories = categories?.map((category) => {
          return { value: category.id, label: category.name };
        });
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      data.expenses.forEach((expense) => {
        if (!expense.categoryId) {
          updateExpense(
            expense.id,
            "categoryId",
            categories[0].value,
            user?.id as string
          );
        }
      });
    }
  }, [categories, data.expenses, updateExpense, user?.id]);

  const widgetData = {
    title: "Monthly expenses",
    body: `Add your typical expenses in ${
      data.baseCurrency || "…"
    }. You can edit later.`,
    step: OnboardingStep.EXPENSES,
  };

  const monthlyTotal = useMemo(() => {
    const toMonthly = (r: Row) => {
      const n = Number(r.amount);
      if (!Number.isFinite(n)) return 0;
      return n / 12;
    };
    return data.expenses.reduce((acc, r) => acc + toMonthly(r), 0);
  }, [data.expenses]);

  return (
    <div className="flex justify-center item-center">
      <OnboardingFrame {...widgetData}>
        <div className="mt-2 space-y-3">
          <div className="custom-scroll max-h-[45vh] md:max-h-72 overflow-y-auto space-y-3 px-5">
            {categories &&
              data.expenses.length > 0 &&
              data.expenses.map((r) => (
                <ExpenseRow key={r.id} categories={categories} row={r} />
              ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1 items-center mb-3">
            <Button
              variant="ghost"
              onClick={() => addExpense(categories?.[0]?.value)}
              className="w-full sm:w-auto"
            >
              + Add expense
            </Button>
            <div className="text-sm text-slate-300 text-right">
              Est. monthly total:
              <span className="ml-2 font-semibold">
                {monthlyTotal.toFixed(2)} {data.baseCurrency}
              </span>
            </div>
          </div>
        </div>
      </OnboardingFrame>
    </div>
  );
};
