// This will return NaN (of type number) when items == []
export const avg = (items: number[]): number => {
  return items.reduce((sum, el) => el + sum, 0) / items.length;
};
