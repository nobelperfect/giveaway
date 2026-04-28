/**
 * src/SetupLogic.js
 */
const SetupLogic = {
  /**
   * Returns the configuration array for the Settings sheet.
   */
  getSettingsConfig: () => {
    return [
      ["Internal Key", "Sheet Header", "Description / Notes"],
      ["id", "Recipient ID", "Unique identifier for every record"],
      ["name", "Full Name", "Used for display on Bubbly cards"],
      ["status", "Status", "Current state (pending, dispatched)"],
      ["amount", "Principal Amount", "Calculated ETB value"],
      ["fixedETBAmount", "Fixed ETB Base", "The family's predictable baseline"],
      ["targetUSD", "Target USD Value", "USD value for inflation safety"],
      ["referenceRate", "Reference Rate", "Rate when baseline was set"],
      ["isAdjusted", "Is Adjusted", "Trigger for 55% threshold"],
      ["receiptId", "Receipt ID", "Drive File ID"],
      ["receiptUrl", "Receipt Link", "Drive URL"],
      ["email", "Email Address", "Agent login"],
      ["role", "User Role", "admin, agent, or recipient"],
      ["wallet", "Current Wallet", "Lump sum balance"]
    ];
  },

  /**
   * Validates that the config contains all required keys.
   */
  verifyConfigIntegrity: (config) => {
    const required = ["id", "amount", "status", "referenceRate", "targetUSD"];
    const keys = config.map(row => row[0]);
    return required.every(key => keys.includes(key));
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SetupLogic };
}
