function validateSettings() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName("Settings");
    const masterSheet = ss.getSheetByName("Distribution_Master");

    const settingsData = settingsSheet.getDataRange().getValues();
    const masterHeaders = masterSheet.getDataRange().getValues()[0]; // Get first row

    // CALL THE LOGIC
    const result = validateSettingsLogic(settingsData, masterHeaders);

    // ACTION: Highlight or Clear
    settingsSheet.getRange(2, 2, settingsSheet.getLastRow(), 1).setBackground(null);
    if (!result.isValid) {
        result.errorRows.forEach(row => {
            settingsSheet.getRange(row, 2).setBackground("#f4cccc");
        });
        throw new Error(result.errors.join("\n"));
    }
    return true;
}
