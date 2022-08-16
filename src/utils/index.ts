export function formatNumber(value: number | undefined): string {
  return Number.isNaN(value) || typeof value === "undefined"
    ? "N/A"
    : value.toFixed(2);
}
