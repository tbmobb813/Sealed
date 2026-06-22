interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function MoneyDisplay({
  amount,
  currency = "USD",
  className = "",
}: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  return <span className={className}>{formatted}</span>;
}
