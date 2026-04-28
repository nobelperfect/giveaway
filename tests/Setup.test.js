const { SetupLogic } = require('../src/SetupLogic');

describe('Setup Configuration Integrity', () => {
  test('should provide a non-empty configuration array', () => {
    const config = SetupLogic.getSettingsConfig();
    expect(config.length).toBeGreaterThan(5);
    expect(config[0]).toEqual(["Internal Key", "Sheet Header", "Description / Notes"]);
  });

  test('should contain all required keys for the App Logic', () => {
    const config = SetupLogic.getSettingsConfig();
    const isIntegritySafe = SetupLogic.verifyConfigIntegrity(config);
    
    expect(isIntegritySafe).toBe(true);
  });

  test('should not have duplicate internal keys', () => {
    const config = SetupLogic.getSettingsConfig().slice(1); // Skip header
    const keys = config.map(row => row[0]);
    const uniqueKeys = new Set(keys);
    
    expect(keys.length).toBe(uniqueKeys.size);
  });
});
