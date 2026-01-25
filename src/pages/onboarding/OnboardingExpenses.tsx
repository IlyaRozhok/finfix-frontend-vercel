import { OnboardingStep } from "@/features/onboarding/model/types";
import { useOnboarding } from "@/features/onboarding/model/store";
import { OnboardingFrame } from "@/widgets/onboarding";

import { Button } from "@/shared/ui";
import { useEffect, useState } from "react";
import { ExpenseRow } from "@/features/onboarding/";
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
    headerAction: (
      <Button
        variant="glass"
        size="md"
        onClick={() => addExpense(categories?.[0]?.value)}
        className="border-white/30 bg-white/15 hover:bg-white/25 hover:border-white/40 font-semibold w-11 h-11 p-0 flex items-center justify-center rounded-xl"
        title="Add expense"
      >
        <span className="text-xl font-light">+</span>
      </Button>
    ),
  };


  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto nice-scroll space-y-3 pr-2">
            {categories &&
              data.expenses.length > 0 &&
              data.expenses.map((r) => (
                <ExpenseRow key={r.id} categories={categories} row={r} />
              ))}
            {(!categories || data.expenses.length === 0) && (
              <div className="text-center py-2 text-primary-background/80 text-sm sm:text-base font-extralight">
                No expenses added yet. Click "+" to get started. You can skip this step.
              </div>
            )}
          </div>
        </div>
      </OnboardingFrame>
    </div>
  );
};
