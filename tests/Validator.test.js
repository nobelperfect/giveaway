const { validateSettingsLogic } = require('../src/ValidatorLogic');

describe('Validator Logic', () => {
    test('should catch missing required keys', () => {
        const badData = [["Internal Key", "Sheet Header"], ["name", "Full Name"]]; // 'id' is missing
        const masterHeaders = ["Full Name"];
        
        const result = validateSettingsLogic(badData, masterHeaders);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Critical Key Missing: "id"');
    });

    test('should catch headers that do not exist in Master', () => {
        const settings = [
            ["Internal Key", "Sheet Header"],
            ["id", "WRONG_HEADER"]
        ];
        const masterHeaders = ["Recipient ID"]; // Does not match WRONG_HEADER
        
        const result = validateSettingsLogic(settings, masterHeaders);
        expect(result.errorRows).toContain(2);
        expect(result.isValid).toBe(false);
    });
});
