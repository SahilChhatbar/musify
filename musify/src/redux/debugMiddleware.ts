import { Middleware } from 'redux';

export const debugMiddleware: Middleware = store => next => action => {
  console.log('dispatching action:', action);
  const result = next(action);
  console.log('next state:', store.getState());
  return result;
};
