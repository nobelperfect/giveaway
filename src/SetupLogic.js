/**
 * src/SetupLogic.js
 */
const SetupLogic = {
  /**
   * Settings sheet schema (context-aware mapping system)
   */
  getSettingsConfig: () => {
    return [
      ["Internal Key", "Sheet Name", "Sheet Header", "Description / Notes"],

      // =========================
      // Distribution_Master (Recipients)
      // =========================
      ["id", "Distribution_Master", "Recipient ID", "Unique identifier for every record"],
      ["name", "Distribution_Master", "Full Name", "Display name"],
      ["status", "Distribution_Master", "Status", "pending | dispatched"],
      ["amount", "Distribution_Master", "Principal Amount", "ETB value"],
      ["fixedETBAmount", "Distribution_Master", "Fixed ETB Base", "Baseline amount"],
      ["targetUSD", "Distribution_Master", "Target USD Value", ""],
      ["referenceRate", "Distribution_Master", "Reference Rate", ""],
      ["isAdjusted", "Distribution_Master", "Is Adjusted", ""],
      ["receiptId", "Distribution_Master", "Receipt ID", ""],
      ["receiptUrl", "Distribution_Master", "Receipt Link", ""],
      ["agentId", "Distribution_Master", "Agent ID", "Assigned agent"],

      // =========================
      // User_Directory (Agents / Users)
      // =========================
      ["id", "User_Directory", "Agent ID", "Unique person ID"],
      ["name", "User_Directory", "Full Name", ""],
      ["email", "User_Directory", "Email Address", "Login email"],
      ["role", "User_Directory", "User Role", "admin | agent"],
      ["wallet", "User_Directory", "Current Wallet", "Balance"]
    ];
  },

  /**
   * Data sheet headers (actual sheet structure, NOT admin-editable)
   */
  getDataSheetHeaders: (sheetName) => {
    const headers = {
      "Distribution_Master": [
        "Recipient ID", "Full Name", "Status", "Principal Amount",
        "Fixed ETB Base", "Target USD Value", "Reference Rate",
        "Is Adjusted", "Receipt ID", "Receipt Link", "Agent ID",
        "Success Story Photo", "Success Story Description"
      ],
      "User_Directory": [
        "Agent ID", "Full Name", "Email Address", "User Role", "Current Wallet"
      ]
    };

    return headers[sheetName] || [];
  },

  /**
   * Validates required internal keys exist in config
   */
  verifyConfigIntegrity: (config) => {
    const required = ["id", "name", "status", "email", "role"];
    const keys = config.map(row => row[0]);
    return required.every(key => keys.includes(key));
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SetupLogic };
}