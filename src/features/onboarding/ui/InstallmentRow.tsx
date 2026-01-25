import { TrashIcon } from "@heroicons/react/24/outline";
import { Input, useToast } from "@/shared/ui";
import { Installment } from "@/features/onboarding/model/types";
import { calcMonthlyInstallmentPayment } from "../lib/calcMonthlyInstallmentPayment";
import { useOnboarding } from "../model/store";
import { deleteInstallment } from "../api";
import { useState, useEffect } from "react";

const numRe = /^-?\d*(\.\d*)?$/;

// Helper function to format date to DD.MM.YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
};

// Helper function to convert DD.MM.YYYY to ISO string
const parseDDMMYYYYToISO = (dateString: string): string => {
  const parts = dateString.split('.');
  if (parts.length !== 3) {
    return "";
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
};

// Helper function to validate date (not more than 50 years in the future)
const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
  if (!dateString || dateString.length !== 10) {
    return { isValid: false };
  }
  
  const parts = dateString.split('.');
  if (parts.length !== 3) {
    return { isValid: false };
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Basic validation
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { isValid: false };
  }
  
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { isValid: false, error: "Invalid date" };
  }
  
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Invalid date" };
  }
  
  // Check if date is not more than 50 years in the future
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 50);
  
  if (date > maxDate) {
    return { isValid: false, error: "Date cannot be more than 50 years in the future" };
  }
  
  return { isValid: true };
};

// Helper function to format input with mask
const formatDateInput = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Apply mask DD.MM.YYYY
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
  }
};

export const InstallmentRow = ({
  row,
  onUpdate,
}: {
  row: Installment;
  onUpdate: (id: string, key: string, value: string) => void;
}) => {
  const { removeInstallment, originalData } = useOnboarding();
  const { addToast } = useToast();
  const [dateDisplay, setDateDisplay] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  // Initialize date display from row.startDate
  useEffect(() => {
    if (row.startDate) {
      // If it's already in ISO format, convert to DD.MM.YYYY
      if (row.startDate.includes('T') || row.startDate.includes('-')) {
        setDateDisplay(formatDateToDDMMYYYY(row.startDate));
      } else {
        // If it's already in DD.MM.YYYY format, use it as is
        setDateDisplay(row.startDate);
      }
    } else {
      setDateDisplay("");
    }
  }, [row.startDate]);

  if (!row.id) {
    return null;
  }

  const handleRemoveInstallment = async () => {
    try {
      const installmentExistsOnServer = originalData.installments?.some((inst) => inst.id === row.id);
      
      // Remove locally first for immediate UI update
      removeInstallment(row.id!);
      
      // Then delete from server if it exists there
      if (installmentExistsOnServer) {
        await deleteInstallment(row.id!);
      }
      
      addToast("success", "Installment deleted", "Installment successfully deleted");
    } catch (error) {
      addToast("error", "Error", "Failed to delete installment");
      console.error("Failed to delete installment:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDateInput(value);
    setDateDisplay(formatted);
    
    // Clear error when user is typing
    if (dateError) {
      setDateError("");
    }
    
    if (row.id) {
      // Validate date if format is complete (10 characters)
      if (formatted.length === 10) {
        const validation = validateDate(formatted);
        if (!validation.isValid) {
          setDateError(validation.error || "Invalid date");
          return;
        }
        
        // Convert to ISO format for storage
        const isoDate = parseDDMMYYYYToISO(formatted);
        if (isoDate) {
          onUpdate(row.id, "startDate", isoDate);
          setDateError("");
        } else {
          setDateError("Invalid date");
        }
      } else if (formatted.length < 10) {
        // Allow partial input while typing
        // Don't update the store until date is complete
        setDateError("");
      }
    }
  };

  const handleDateBlur = () => {
    // Validate on blur if date is complete
    if (dateDisplay.length === 10 && row.id) {
      const validation = validateDate(dateDisplay);
      if (!validation.isValid) {
        setDateError(validation.error || "Invalid date");
      }
    } else if (dateDisplay.length > 0 && dateDisplay.length < 10) {
      // If user started typing but didn't complete, show error
      setDateError("Please enter a complete date");
    }
  };

  return (
    <div className="grid min-h-[44px] mt-2 grid-cols-1 gap-2 w-full md:grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1fr_auto] md:items-center items-stretch">
      <Input
        placeholder="Description"
        value={row.description}
        onChange={(e) => {
          if (row.id) {
            onUpdate(row.id, "description", e.target.value);
          }
        }}
        containerClassName="h-11"
        className="h-full"
      />

      <Input
        type="text"
        placeholder="dd.mm.yyyy"
        value={dateDisplay}
        onChange={handleDateChange}
        onBlur={handleDateBlur}
        containerClassName="h-11"
        className="h-full"
        maxLength={10}
        error={dateError}
      />

      <Input
        placeholder="Total amount"
        inputMode="decimal"
        value={row.totalAmount}
        onChange={(e) => {
          const v = e.target.value;
          if ((v === "" || numRe.test(v)) && row.id) {
            onUpdate(row.id, "totalAmount", v);
          }
        }}
        containerClassName="h-11"
        className="h-full"
      />

      <Input
        placeholder="Total payments"
        type="number"
        value={row.totalPayments}
        onChange={(e) => {
          if (row.id) {
            onUpdate(row.id, "totalPayments", e.target.value);
          }
        }}
        containerClassName="h-11"
        className="h-full"
      />

      <div className="text-sm text-primary-background/80 self-center order-5 md:order-none">
        {row.totalAmount && row.totalPayments
          ? `${calcMonthlyInstallmentPayment(
              row.totalAmount,
              row.totalPayments
            )}/mo`
          : "-"}
      </div>

      <div className="order-6 md:order-none flex justify-start md:justify-center items-center flex-shrink-0">
        <button
          type="button"
          aria-label="Remove installment"
          onClick={handleRemoveInstallment}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors flex-shrink-0"
          title="Delete installment"
        >
          <TrashIcon className="h-5 w-5 text-primary-background/70" />
        </button>
      </div>
    </div>
  );
};
