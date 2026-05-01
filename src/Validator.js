/**
 * src/Validator.gs
 */
function validateSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("Settings");
  const masterSheet = ss.getSheetByName("Distribution_Master");
  const userSheet = ss.getSheetByName("User_Directory");

  if (!settingsSheet || !masterSheet || !userSheet) {
    throw new Error("Critical Sheets Missing. Run Setup.");
  }

  // 1. Get the Settings Data
  const settingsData = settingsSheet.getDataRange().getValues();
  
  // 2. GET HEADERS (Safe Way)
  // .getValues()[0] grabs the first row as a 1D array
  const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
  const userHeaders = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];

  // 3. FLATTEN AND CLEAN
  // Ensure we have actual arrays and no nulls/undefineds
  const allAvailableHeaders = [
    ...(masterHeaders || []), 
    ...(userHeaders || [])
  ].map(h => String(h).trim());

  // 4. CALL THE BRAIN
  const result = validateSettingsLogic(settingsData, allAvailableHeaders);

  if (!result.isValid) {
    settingsSheet.getRange(1, 1).setBackground("#f4cccc");
    throw new Error(result.errors.join("\n"));
  }

  settingsSheet.getRange(1, 1).setBackground("#007AFF");
}
