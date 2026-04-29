const { getInitialAppData } = require('../src/Code');
const { SheetService } = require('../src/SheetDataService');
const { createDataSheet, createConfigSheet } = require('./testUtils/sheetMocks');

describe('getInitialAppData Integration', () => {
    let mockDataSheet, mockUserSheet, mockConfigSheet;

    const wireSpreadsheet = () => {
        global.SpreadsheetApp = {
            getActiveSpreadsheet: () => ({
                getSheetByName: (name) => {
                    if (name === 'Distribution_Master') return mockDataSheet;
                    if (name === 'User_Directory') return mockUserSheet;
                    if (name === 'Settings') return mockConfigSheet;
                    return null;
                }
            })
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();

        global.SheetService = SheetService;
        global.validateSettings = jest.fn(() => true);
        global.Logger = { log: jest.fn() };
        global.Session = {
            getActiveUser: () => ({ getEmail: () => 'admin@test.com' })
        };

        global.HeaderStrategies = {
            RECIPIENTS: {
                id: "Recipient ID",
                name: "Full Name",
                status: "Status",
                amount: "Principal Amount",
                agentId: "Agent ID",
                referenceRate: "Reference Rate",
                targetUSD: "Target USD Value",
                fixedETBAmount: "Fixed ETB Base"
            },
            AGENTS: {
                email: "Email Address",
                name: "Full Name",
                role: "User Role",
                wallet: "Current Wallet",
                id: "Agent ID"
            }
        };

        // RESET SHEETS FRESH EVERY TIME (IMPORTANT FIX)
        mockDataSheet = createDataSheet([
            ['Recipient ID', 'Full Name', 'Status', 'Principal Amount', 'Agent ID', 'Reference Rate', 'Target USD Value', 'Fixed ETB Base'],
            ['REC-01', 'Abebe', 'pending', 5000, 'AGT-01', 50, 100, 5000]
        ]);
        mockDataSheet.getName = jest.fn(() => "Distribution_Master");

        mockUserSheet = createDataSheet([
            ['Email Address', 'Full Name', 'User Role', 'Current Wallet', 'Agent ID'],
            ['admin@test.com', 'Admin User', 'admin', 100000, 'AGT-ADMIN']
        ]);
        mockUserSheet.getName = jest.fn(() => "User_Directory");

        mockConfigSheet = createConfigSheet([
            ["Internal Key", "Sheet Name", "Sheet Header", "Description / Notes"],

            // =========================
            // Distribution_Master
            // =========================
            ["id", "Distribution_Master", "Recipient ID", ""],
            ["name", "Distribution_Master", "Full Name", ""],
            ["status", "Distribution_Master", "Status", ""],
            ["amount", "Distribution_Master", "Principal Amount", ""],
            ["agentId", "Distribution_Master", "Agent ID", ""],
            ["referenceRate", "Distribution_Master", "Reference Rate", ""],
            ["targetUSD", "Distribution_Master", "Target USD Value", ""],
            ["fixedETBAmount", "Distribution_Master", "Fixed ETB Base", ""],

            // =========================
            // User_Directory
            // IMPORTANT: THIS WAS MISSING "name"
            // =========================
            ["id", "User_Directory", "Agent ID", ""],
            ["name", "User_Directory", "Full Name", ""],   // ✅ THIS FIXES YOUR ERROR
            ["email", "User_Directory", "Email Address", ""],
            ["role", "User_Directory", "User Role", ""],
            ["wallet", "User_Directory", "Current Wallet", ""]
        ]);

        wireSpreadsheet();
    });

    test('should correctly hydrate state for a logged-in admin', () => {
        const state = getInitialAppData();

        expect(state.user.role).toBe('admin');
        expect(state.user.name).toBe('Admin User');
        expect(state.recipients[0].id).toBe('REC-01');
    });

    test('should only return assigned recipients for a regular agent', () => {
        global.Session.getActiveUser = () => ({ getEmail: () => 'agent@test.com' });

        // REAL agent user
        mockUserSheet = createDataSheet([
            ['Email Address', 'Full Name', 'User Role', 'Current Wallet', 'Agent ID'],
            ['agent@test.com', 'Agent Joe', 'agent', 500, 'AGT-01']
        ]);
        mockUserSheet.getName = jest.fn(() => "User_Directory");

        wireSpreadsheet();

        const state = getInitialAppData();

        expect(state.user.role).toBe('agent');
        expect(state.recipients.length).toBe(1);
        expect(state.recipients[0].agentId).toBe('AGT-01');
    });

    test('should throw error if user is not in the directory', () => {
        global.Session.getActiveUser = () => ({ getEmail: () => 'intruder@test.com' });
        expect(() => getInitialAppData()).toThrow(/not found/i);
    });


});
