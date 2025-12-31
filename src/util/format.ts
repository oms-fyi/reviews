const DEFAULT_LOCALE = "en-US";

export function formatNumber(value?: number | bigint): string {
  if (Number.isNaN(value) || value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatList(list: string[]): string {
  return new Intl.ListFormat(DEFAULT_LOCALE, {
    style: "long",
    type: "conjunction",
  }).format(list);
}
