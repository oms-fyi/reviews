export const avg = (items: number[]): number | undefined => {
  return items.length
    ? items.reduce((sum, el) => el + sum) / items.length
    : undefined;
};
