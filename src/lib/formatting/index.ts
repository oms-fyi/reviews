export const formatList = (
  items: string[],
  args: Intl.ListFormatOptions = {}
): string => {
  return new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
    ...args,
  }).format(items);
};

// export const formatNumber = (num: number) => {
// }
export function formatNumberReviews(value: number | undefined): string {
  return Number.isNaN(value) || value === undefined ? "N/A" : value.toFixed(2);
}
