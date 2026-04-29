const { SetupLogic } = require('../src/SetupLogic');

describe('Setup Configuration Integrity', () => {
  test('should provide a non-empty configuration array', () => {
    const config = SetupLogic.getSettingsConfig();
    expect(config.length).toBeGreaterThan(5);
    expect(config[0]).toEqual([
      "Internal Key",
      "Sheet Name",
      "Sheet Header",
      "Description / Notes"
    ]);
  });

  test('should contain all required keys for the App Logic', () => {
    const config = SetupLogic.getSettingsConfig();
    const isIntegritySafe = SetupLogic.verifyConfigIntegrity(config);

    expect(isIntegritySafe).toBe(true);
  });

  test('should not have duplicate internal keys', () => {
    const config = SetupLogic.getSettingsConfig().slice(1); // Skip header
    const pairs = config.slice(1).map(row => `${row[0]}::${row[1]}`);
    const uniquePairs = new Set(pairs);

    expect(pairs.length).toBe(uniquePairs.size);
  });
});


describe('Setup Source of Truth Verification', () => {
  test('Distribution_Master should contain all 55% threshold keys', () => {
    const headers = SetupLogic.getDataSheetHeaders("Distribution_Master");

    // Critical headers for your inflation math
    expect(headers).toContain("Reference Rate");
    expect(headers).toContain("Target USD Value");
    expect(headers).toContain("Fixed ETB Base");
  });

  test('User_Directory should have auth and wallet keys', () => {
    const headers = SetupLogic.getDataSheetHeaders("User_Directory");
    expect(headers).toContain("Email Address");
    expect(headers).toContain("Current Wallet");
  });
});
