export default function formatNumber(value: number): string {
  return Number.isNaN(value) ? 'N/A' : value.toFixed(2);
}
