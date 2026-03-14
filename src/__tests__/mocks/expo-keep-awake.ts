const useKeepAwake = jest.fn();
const activateKeepAwake = jest.fn();
const deactivateKeepAwake = jest.fn();
const activateKeepAwakeAsync = jest.fn().mockResolvedValue(undefined);
const deactivateKeepAwakeAsync = jest.fn().mockResolvedValue(undefined);

export {
  useKeepAwake,
  activateKeepAwake,
  deactivateKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwakeAsync,
};
