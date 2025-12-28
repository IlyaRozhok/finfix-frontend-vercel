export const calcMonthlyInstallmentPayment = (
  totalAmount: string,
  totalPayments: string
) => {
  const interes = (Number(totalAmount) / 100) * 1.9;
  const res = (Number(totalAmount) / Number(totalPayments)).toFixed(2);

  console.log("interes", interes);
  console.log("res", res + interes);
  return Number(res) + interes;
};
