// src/libs/audio/__tests__/callbacks.test.ts
import { createCallbackRegistry } from '../callbacks';

describe('CallbackRegistry', () => {
  it('registers and fires callbacks', () => {
    const registry = createCallbackRegistry<[string, number]>();
    const handler = jest.fn();
    registry.subscribe(handler);
    registry.fire('A', 0);
    expect(handler).toHaveBeenCalledWith('A', 0);
  });

  it('returns unsubscribe function', () => {
    const registry = createCallbackRegistry<[string]>();
    const handler = jest.fn();
    const unsub = registry.subscribe(handler);
    unsub();
    registry.fire('A');
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers', () => {
    const registry = createCallbackRegistry<[number]>();
    const h1 = jest.fn();
    const h2 = jest.fn();
    registry.subscribe(h1);
    registry.subscribe(h2);
    registry.fire(42);
    expect(h1).toHaveBeenCalledWith(42);
    expect(h2).toHaveBeenCalledWith(42);
  });

  it('clearAll removes all subscribers', () => {
    const registry = createCallbackRegistry<[number]>();
    const handler = jest.fn();
    registry.subscribe(handler);
    registry.clearAll();
    registry.fire(1);
    expect(handler).not.toHaveBeenCalled();
  });
});
