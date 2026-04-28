/**
 * src/Interceptors.js
 */
const securityInterceptor = (store, action) => {
  const state = store.getState();
  
  // Rule: Only 'admin' can update the wallet directly
  if (action.type === 'UPDATE_WALLET') {
    if (!state.user || state.user.role !== 'admin') {
      return false; // BLOCKED
    }
  }

  // Rule: Only 'agent' or 'admin' can confirm a dispatch
  if (action.type === 'CONFIRM_DISPATCH') {
    if (state.user.role === 'recipient') {
      return false; // BLOCKED
    }
  }

  return true; // ALLOWED
};

if (typeof module !== 'undefined') {
  module.exports = { securityInterceptor };
}
