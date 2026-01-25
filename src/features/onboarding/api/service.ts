import { createUserOnboardingCurrency, deleteDebt } from "./index";

export interface OnboardingStore {
  setCurrencyLocally: (currency: string) => void;
  removeDebtLocally: (id: string) => void;
  originalData: {
    debts: Array<{ id: string }>;
  };
}

export const updateCurrency = async (
  userId: string,
  currency: string,
  store: OnboardingStore
): Promise<void> => {
  try {
    await createUserOnboardingCurrency({
      uid: userId,
      currency,
    });
    store.setCurrencyLocally(currency);
  } catch (error) {
    console.error("Failed to update currency:", error);
    throw error;
  }
};

export const deleteDebtAndUpdateStore = async (
  id: string,
  store: OnboardingStore
): Promise<void> => {
  try {
    // Check if this debt exists on server (has a real ID, not a temporary one)
    // If debt exists in originalData, it was loaded from server and should be deleted via API
    const debtExistsOnServer = store.originalData.debts.some((debt) => debt.id === id);
    
    if (debtExistsOnServer) {
      // Debt exists on server, delete via API
      await deleteDebt(id);
    }
    // Always remove locally, whether it was on server or just a temporary local debt
    store.removeDebtLocally(id);
  } catch (error) {
    console.error("Failed to delete debt:", error);
    // Even if API call fails, remove locally if it was a temporary debt
    const debtExistsOnServer = store.originalData.debts.some((debt) => debt.id === id);
    if (!debtExistsOnServer) {
      store.removeDebtLocally(id);
    }
    throw error;
  }
};

