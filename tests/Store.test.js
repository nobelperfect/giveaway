const { createStore } = require('../src/Store');
const { securityInterceptor } = require('../src/Interceptors');

describe('Store Engine Logic', () => {
  let mockReducer;
  let initialState;

  beforeEach(() => {
    initialState = { 
      wallet: { remaining: 10000 }, 
      user: { role: 'agent' } 
    };
    
    mockReducer = jest.fn((state, action) => {
      if (action.type === 'UPDATE_WALLET') {
        return { ...state, wallet: { remaining: action.payload } };
      }
      return state;
    });
  });

  test('should initialize with correct state', () => {
    const store = createStore(mockReducer, initialState);
    expect(store.getState()).toEqual(initialState);
  });

  test('should update state via dispatch', () => {
    const store = createStore(mockReducer, initialState);
    const newAmount = 5000;
    store.dispatch({ type: 'UPDATE_WALLET', payload: newAmount });
    expect(store.getState().wallet.remaining).toBe(newAmount);
  });

  test('should notify subscribers when state changes', () => {
    const store = createStore(mockReducer, initialState);
    const listener = jest.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'UPDATE_WALLET', payload: 2000 });
    // Called once on sub, once on dispatch
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('should block actions if an interceptor returns false (Local Security Check)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const customInterceptor = (store, action) => {
      const state = store.getState();
      return action.type === 'UPDATE_WALLET' && state.user.role === 'admin';
    };
    const store = createStore(mockReducer, initialState, [customInterceptor]);
    const success = store.dispatch({ type: 'UPDATE_WALLET', payload: 100 });
    expect(success).toBe(false);
    warnSpy.mockRestore();
  });
});

describe('Store Security Interceptors (Global Interceptor)', () => {
  let mockReducer;

  beforeEach(() => {
    mockReducer = jest.fn((state) => state);
  });

  test('should block wallet update if user is NOT admin', () => {
    const initialState = { 
      user: { role: 'agent' }, 
      wallet: { remaining: 10000 } 
    };
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore(mockReducer, initialState, [securityInterceptor]);
    const success = store.dispatch({ type: 'UPDATE_WALLET', payload: 500 });
    
    expect(success).toBe(false);
    expect(store.getState().wallet.remaining).toBe(10000);
    warnSpy.mockRestore();
  });

  test('should allow wallet update if user IS admin', () => {
    const initialState = { user: { role: 'admin' } };
    const store = createStore(mockReducer, initialState, [securityInterceptor]);
    const success = store.dispatch({ type: 'UPDATE_WALLET', payload: 500 });
    expect(success).toBe(true);
  });
});
