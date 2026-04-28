function createRange() {
    return {
        setBackground: jest.fn(),
        setValue: jest.fn(),
    };
}

function createDataSheet(data = [
    ["Status", "Recipient ID"],
    ["pending", "REC-01"],
    ["done", "REC-02"]
]) {
    const range = createRange();

    return {
        getName: jest.fn(() => "Data"),

        getDataRange: jest.fn(() => ({
            getValues: jest.fn(() => data),
        })),

        getRange: jest.fn(() => range),

        __range: range
    };
}

function createConfigSheet(config = [
    ["Internal Key", "Sheet Header"],
    ["id", "Recipient ID"],
    ["status", "Status"]
]) {
    const range = createRange();

    return {
        getLastRow: jest.fn(() => config.length),

        getDataRange: jest.fn(() => ({
            getValues: jest.fn(() => config),
        })),

        getRange: jest.fn(() => range),

        __range: range
    };
}

module.exports = {
    createRange,
    createDataSheet,
    createConfigSheet
};