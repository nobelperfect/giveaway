/**
 * src/Setup.js
 */
function setupSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = ss.getSheetByName("Settings") || ss.insertSheet("Settings");
  settingsSheet.clear();

  // CALL THE VERIFIED LOGIC
  const configData = SetupLogic.getSettingsConfig();

  // WRITE DATA
  settingsSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);

  // STYLING (Bubbly)
  settingsSheet.setFrozenRows(1);
  settingsSheet.getRange("A1:C1").setBackground("#007AFF").setFontColor("white");
  
  Logger.log("Settings Sheet created with verified configuration.");
}
