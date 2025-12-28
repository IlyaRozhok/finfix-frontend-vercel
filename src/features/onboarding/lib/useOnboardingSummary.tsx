import { useEffect, useState } from "react";
import { fetchSummary } from "../api";
import { useAuth } from "@/app/providers/AuthProvider";

interface BackendExpense {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  description: string;
}

interface BackendInstallment {
  id: string;
  userId: string;
  description: string;
  startDate: string;
  totalAmount: number;
  totalPayments: number;
  monthlyPayment: number;
  status: string;
}

interface BackendDebt {
  id: string;
  userId: string;
  description: string;
  totalDebt: string;
  interest: string;
}

interface ISummary {
  isOnboarded: boolean;
  incomes: number | string;
  currency: string;
  expenses: BackendExpense[];
  installmnets?: BackendInstallment[];
  installments?: BackendInstallment[];
  debts?: BackendDebt[];
}

export default function useOnboardingSummary() {
  const [summary, setSummary] = useState<ISummary>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getSummary = async (id: string) => {
    try {
      setLoading(true);
      const summary = await fetchSummary(id);
      setSummary(summary);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getSummary(user?.id);
    }
  }, [user?.id]);

  return { ...summary, loading };
}
