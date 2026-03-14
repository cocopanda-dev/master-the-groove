// src/data-access/stores/store-reset.ts
type ResetFn = () => void;
const resetFns: ResetFn[] = [];

export const registerResetFn = (fn: ResetFn): void => {
  resetFns.push(fn);
};

export const resetAllStores = (): void => {
  resetFns.forEach((fn) => fn());
};
