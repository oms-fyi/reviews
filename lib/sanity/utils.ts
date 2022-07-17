// Will return NaN if items == [], which gets JSON-serialized to `null`
export const avg = (items: number[]): number => {
  return items.reduce((sum, el) => el + sum, 0) / items.length;
};
