const { validateSettingsLogic } = require('../src/ValidatorLogic');

describe('Validator Logic: Namespaced Strategy', () => {
    
    const mockAvailableHeaders = [
        "Recipient ID", "Full Name", "Status", 
        "Agent ID", "Email Address", "Current Wallet"
    ];

    test('should pass when both sheets have valid unique internal keys', () => {
        const mockSettings = [
            ["Internal Key", "Sheet Name", "Sheet Header"],
            ["id", "Distribution_Master", "Recipient ID"],
            ["id", "User_Directory", "Agent ID"] // Same internal key, different sheet
        ];

        const result = validateSettingsLogic(mockSettings, mockAvailableHeaders);
        expect(result.isValid).toBe(true);
    });

    test('should catch duplicate internal keys within the SAME sheet', () => {
        const mockSettings = [
            ["Internal Key", "Sheet Name", "Sheet Header"],
            ["id", "Distribution_Master", "Recipient ID"],
            ["id", "Distribution_Master", "Full Name"] // DUPLICATE for this sheet
        ];

        const result = validateSettingsLogic(mockSettings, mockAvailableHeaders);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Duplicate Internal Key: "id" in sheet "Distribution_Master"');
    });

    test('should catch headers that do not exist in the spreadsheet', () => {
        const mockSettings = [
            ["Internal Key", "Sheet Name", "Sheet Header"],
            ["id", "Distribution_Master", "Ghost Column"] // Does not exist in mockAvailableHeaders
        ];

        const result = validateSettingsLogic(mockSettings, mockAvailableHeaders);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Header "Ghost Column" for key "id" not found');
    });

    test('should handle empty or missing headers in config', () => {
        const mockSettings = [
            ["Internal Key", "Sheet Name", "Sheet Header"],
            ["id", "Distribution_Master", ""] // Empty header
        ];

        const result = validateSettingsLogic(mockSettings, mockAvailableHeaders);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Header "EMPTY"');
    });
});
