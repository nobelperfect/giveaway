/**
 * src/Setup.js
 * Run setupFullSystem() to initialize the entire environment.
 */

function setupFullSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Initialize Control Panel (Settings Sheet)
  setupSettingsSheet();

  // 2. Create Data Sheets using Tested Logic from SetupLogic.js
  const masterHeaders = SetupLogic.getDataSheetHeaders("Distribution_Master");
  createSheetWithHeaders(ss, "Distribution_Master", masterHeaders);

  const userHeaders = SetupLogic.getDataSheetHeaders("User_Directory");
  createSheetWithHeaders(ss, "User_Directory", userHeaders);

  // 3. Register YOU as the first Admin so the app can load
  provisionAdmin(ss);

  // 🔥 LOCK INTERNAL KEYS
  lockInternalKeyColumn();

  SpreadsheetApp.getUi().alert("🚀 System Ready", "Headers created and Admin registered. Refresh your Dashboard.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function setupSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = ss.getSheetByName("Settings") || ss.insertSheet("Settings");
  settingsSheet.clear();

  const configData = SetupLogic.getSettingsConfig();
  settingsSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);

  settingsSheet.setFrozenRows(1);
  settingsSheet.getRange("A1:C1").setBackground("#007AFF").setFontColor("white");
  Logger.log("Settings Sheet created.");
}

/**
 * Helper to ensure headers are perfectly aligned with Validator Logic.
 */
function createSheetWithHeaders(ss, name, headers) {
  let sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clear();

  if (!headers || headers.length === 0) {
    throw new Error(`No headers provided for sheet ${name}`);
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setBackground("#E8F0FE")
    .setFontWeight("bold");

  sheet.autoResizeColumns(1, headers.length);
}
/**
 * Ensures the person running the script is added to the User_Directory.
 * This prevents the "User not found" error on first load.
 */
function provisionAdmin(ss) {
  const userSheet = ss.getSheetByName("User_Directory");
  const masterSheet = ss.getSheetByName("Distribution_Master");

  const myEmail = Session.getActiveUser().getEmail();

  // =========================
  // User_Directory row
  // MUST match SetupLogic headers:
  // ["Agent ID", "Full Name", "Email Address", "User Role", "Current Wallet"]
  // =========================
  userSheet.appendRow([
    "AGT-ADMIN",          // Agent ID (ID FIRST - important for your model)
    "Main Admin",         // Full Name
    myEmail,              // Email Address
    "admin",              // User Role
    100000                // Current Wallet
  ]);

  // =========================
  // Distribution_Master row
  // MUST match headers:
  // ["Recipient ID", "Full Name", "Status", "Principal Amount", ...]
  // =========================
  masterSheet.appendRow([
    "REC-001",            // Recipient ID
    "Abebe Family",       // Full Name
    "pending",            // Status
    5000,                 // Principal Amount
    5000,                 // Fixed ETB Base
    100,                  // Target USD Value
    50,                   // Reference Rate
    "No",                 // Is Adjusted
    "",                   // Receipt ID
    "",                   // Receipt Link
    "AGT-ADMIN",         // Agent ID
    "",                   // Success Story Photo
    ""                    // Success Story Description
  ]);
}


