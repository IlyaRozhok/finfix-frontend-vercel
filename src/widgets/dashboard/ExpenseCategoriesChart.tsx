import React from "react";
import { Expense } from "@/features/dashboard/model/types";
import { ThreePieChart } from "./ThreePieChart";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
];

interface ExpenseCategoriesChartProps {
  expenses: Expense[];
}

export function ExpenseCategoriesChart({
  expenses,
}: ExpenseCategoriesChartProps) {
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = parseFloat(expense.amount);
    const categoryName = expense.category.name;
    acc[categoryName] = (acc[categoryName] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const totalExpenses = Object.values(categoryTotals).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg">
      <h3 className="text-sm font-semibold text-primary-background mb-3 text-center">
        Top Expense Categories
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories on the left */}
        <div className="space-y-2 overflow-y-auto">
          {sortedCategories.map(([categoryName, total], index) => {
            const percentage = ((total / totalExpenses) * 100).toFixed(1);
            return (
              <div
                key={categoryName}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/10"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      boxShadow: `0 2px 4px ${COLORS[index % COLORS.length]}40`,
                    }}
                  />
                  <span className="text-sm text-primary-background font-medium truncate">
                    {categoryName}
                  </span>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-bold text-primary-background">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-disable">{percentage}%</div>
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-center">
              <div className="text-sm font-bold text-primary-background">
                Total: {totalExpenses.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Chart on the right */}
        <div className="flex items-center justify-center">
          <ThreePieChart expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
