/**
 * src/testUtils/sheetMocks.js
 */
function createRange() {
    return {
        setBackground: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
    };
}

// WASHED: Default data now includes all keys needed by both test suites
function createDataSheet(data = [
    ["Recipient ID", "Full Name", "Status", "Principal Amount", "Agent ID", "Reference Rate", "Target USD Value", "Fixed ETB Base"],
    ["REC-01", "Abebe", "pending", 5000, "AGT-01", 50, 100, 5000],
    ["REC-02", "John", "done", 2000, "AGT-01", 50, 40, 2000]
]) {
    const range = createRange();

    return {
        getName: jest.fn(() => "Distribution_Master"),
        getLastRow: jest.fn(() => data.length),
        getLastColumn: jest.fn(() => data[0].length),

        getDataRange: jest.fn(() => ({
            getValues: jest.fn(() => data),
        })),

        getRange: jest.fn(() => range),
        __range: range
    };
}

// WASHED: Default config now includes both Recipient and Agent keys
function createConfigSheet(config = [
    ["Internal Key", "Sheet Name", "Sheet Header"],

    ["id", "Distribution_Master", "Recipient ID"],
    ["name", "Distribution_Master", "Full Name"],
    ["status", "Distribution_Master", "Status"],
    ["amount", "Distribution_Master", "Principal Amount"],
    ["agentId", "Distribution_Master", "Agent ID"],
    ["referenceRate", "Distribution_Master", "Reference Rate"],
    ["targetUSD", "Distribution_Master", "Target USD Value"],
    ["fixedETBAmount", "Distribution_Master", "Fixed ETB Base"],

    ["id", "User_Directory", "Agent ID"],
    ["name", "User_Directory", "Full Name"],
    ["email", "User_Directory", "Email Address"],
    ["role", "User_Directory", "User Role"],
    ["wallet", "User_Directory", "Current Wallet"]
]) {
    const range = createRange();

    return {
        getName: jest.fn(() => "Settings"),
        getLastRow: jest.fn(() => config.length),

        getDataRange: jest.fn(() => ({
            getValues: jest.fn(() => config),
        })),

        getRange: jest.fn(() => range),
        __range: range
    };
}
module.exports = { createRange, createDataSheet, createConfigSheet };
