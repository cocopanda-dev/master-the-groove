// src/libs/audio/callbacks.ts
type Callback<TArgs extends unknown[]> = (...args: TArgs) => void;

type CallbackRegistry<TArgs extends unknown[]> = {
  subscribe: (cb: Callback<TArgs>) => () => void;
  fire: (...args: TArgs) => void;
  clearAll: () => void;
};

export const createCallbackRegistry = <TArgs extends unknown[]>(): CallbackRegistry<TArgs> => {
  const callbacks = new Set<Callback<TArgs>>();

  const subscribe = (cb: Callback<TArgs>): (() => void) => {
    callbacks.add(cb);
    return () => {
      callbacks.delete(cb);
    };
  };

  const fire = (...args: TArgs): void => {
    callbacks.forEach((cb) => cb(...args));
  };

  const clearAll = (): void => {
    callbacks.clear();
  };

  return { subscribe, fire, clearAll };
};
