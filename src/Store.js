/**
 * src/Store.js
 */
function createStore(reducer, initialState, middlewares = []) {
    let state = initialState;
    const listeners = [];

    return {
        getState: () => state,
        subscribe: (listener) => {
            listeners.push(listener);
            listener(state);
            return () => listeners.splice(listeners.indexOf(listener), 1);
        },
        dispatch: (action) => {
            // IMPORTANT: Check interceptors FIRST
            for (const middleware of middlewares) {
                if (middleware({ getState: () => state }, action) === false) {
                    console.warn(`[Store] Action BLOCKED by Interceptor: ${action.type}`);
                    return false; // STOP EVERYTHING HERE
                }
            }

            // ONLY if all pass, run the reducer
            state = reducer(state, action);

            listeners.forEach(l => l(state));
            return true;
        }
    };
}

if (typeof module !== 'undefined') {
    module.exports = { createStore };
}
