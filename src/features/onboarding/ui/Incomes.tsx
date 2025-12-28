import { Input } from "@/shared/ui";
import React, { useEffect, useState } from "react";
import { useOnboarding } from "../model/store";
import useOnboardingSummary from "../lib/useOnboardingSummary";

export const Incomes = () => {
  const { errors, data, clearIncomesError, setIncomes } = useOnboarding();
  const { incomes } = useOnboardingSummary();

  const changeIncomes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incomes = e.target.value;
    setIncomes(incomes);
    if (incomes !== "" && errors.incomes) {
      clearIncomesError();
    }
  };

  useEffect(() => {
    if (incomes !== undefined) {
      setIncomes(String(incomes));
    }
  }, [incomes]);

  return (
    <Input
      value={data.incomes}
      onChange={(e) => changeIncomes(e)}
      type="number"
      error={errors.incomes}
    />
  );
};
