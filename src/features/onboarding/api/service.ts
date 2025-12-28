import { createUserOnboardingCurrency, deleteDebt } from "./index";

export interface OnboardingStore {
  setCurrencyLocally: (currency: string) => void;
  removeDebtLocally: (id: string) => void;
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
    // This logic should be moved to the component level or handled differently
    // For now, we'll just call the API and update the store
    await deleteDebt(id);
    store.removeDebtLocally(id);
  } catch (error) {
    console.error("Failed to delete debt:", error);
    throw error;
  }
};

