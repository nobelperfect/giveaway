const { lockSettingsSheet } = require('../src/Protection');

describe('Settings Sheet Protection', () => {
    let mockSheet;
    let mockProtection;


    beforeEach(() => {
        jest.clearAllMocks();

        mockProtection = {
            setDescription: jest.fn().mockReturnThis(),
            removeEditors: jest.fn().mockReturnThis(),
            getEditors: jest.fn(() => ['someone@test.com']),
            setDomainEdit: jest.fn().mockReturnThis(),
            canDomainEdit: jest.fn(() => false), // ✅ ADD THIS
            addEditor: jest.fn().mockReturnThis(),
            setUnprotectedRanges: jest.fn().mockReturnThis(),
        };

        mockSheet = {
            getLastRow: jest.fn(() => 10),
            protect: jest.fn(() => mockProtection),
            getRange: jest.fn((row, col, numRows, numCols) => ({
                row, col, numRows, numCols
            })),
        };

        global.SpreadsheetApp = {
            getActiveSpreadsheet: () => ({
                getSheetByName: () => mockSheet,
            }),
        };

        global.Session = {
            getEffectiveUser: () => ({
                getEmail: () => 'admin@test.com',
            }),
        };
    });

    test('should protect settings sheet and allow only system rules', () => {
        lockSettingsSheet();

        // 1. Sheet is protected
        expect(mockSheet.protect).toHaveBeenCalled();

        // 2. All editors removed
        expect(mockProtection.removeEditors).toHaveBeenCalled();

        // 3. Current user added
        expect(mockProtection.addEditor).toHaveBeenCalled();

        // 4. Unprotected range set (UI columns C:D)
        expect(mockProtection.setUnprotectedRanges).toHaveBeenCalled();
    });
    test('should only unprotect columns C:D', () => {
        lockSettingsSheet();

        const callArgs = mockProtection.setUnprotectedRanges.mock.calls[0][0];

        expect(callArgs).toHaveLength(1);
        expect(callArgs[0].row).toBe(2);   // starts row 2
        expect(callArgs[0].col).toBe(3);   // column C
        expect(callArgs[0].numCols).toBe(2); // C:D only
    });
});

