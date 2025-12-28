import { MonoTransaction } from "../api";

interface TransactionsListProps {
  transactions: MonoTransaction[];
  currencyCode: number;
  isLoading?: boolean;
}

const CURRENCY_SYMBOLS: Record<number, string> = {
  980: "₴", // UAH
  840: "$", // USD
  978: "€", // EUR
};

const formatAmount = (amount: number, currencyCode: number): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  const formatted = Math.abs(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${symbol}${formatted}`;
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TransactionsList = ({
  transactions,
  currencyCode,
  isLoading,
}: TransactionsListProps) => {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="text-center text-gray-400">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="text-center text-gray-400">
          No transactions found for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-primary-background">
          Transactions ({transactions.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/10">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.time)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="truncate">{transaction.description}</div>
                  {transaction.comment && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {transaction.comment}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-semibold ${
                      transaction.amount >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatAmount(transaction.amount, currencyCode)}
                  </div>
                  {transaction.hold && (
                    <div className="text-xs text-gray-500 mt-1">Hold</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatAmount(transaction.balance, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
