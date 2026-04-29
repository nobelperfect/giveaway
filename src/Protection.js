function lockSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");

  if (!sheet) {
    throw new Error("Settings sheet not found");
  }

  const lastRow = sheet.getLastRow();

  // Protect entire sheet first
  const protection = sheet.protect();
  protection.setDescription("SYSTEM LOCK - Settings Integrity");

  // Only script owner can edit by default
  protection.removeEditors(protection.getEditors());

  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }

  const me = Session.getEffectiveUser();
  protection.addEditor(me);

  // 🔒 LOCK SYSTEM COLUMNS (A:B)
  const systemRange = sheet.getRange(1, 1, lastRow, 2); // A:B

  // ✏️ ALLOW EDIT ON UI COLUMNS (C:D)
  const editableRange = sheet.getRange(2, 3, lastRow - 1, 2); // C:D (skip header row)

  protection.setUnprotectedRanges([editableRange]);

  Logger.log("Settings sheet locked: Internal system fields protected, UI fields editable.");
}

/**
 * Jest-compatible export (GAS-safe)
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { lockSettingsSheet };
}