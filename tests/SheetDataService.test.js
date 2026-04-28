const { SheetService } = require('../src/SheetDataService');
const {
    createDataSheet,
    createConfigSheet
} = require('./testUtils/sheetMocks');

describe('SheetService Strategy Pattern', () => {
    let mockDataSheet;
    let mockConfigSheet;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDataSheet = createDataSheet();
        mockConfigSheet = createConfigSheet();

        global.SpreadsheetApp = {
            getActiveSpreadsheet: jest.fn(() => ({
                getSheetByName: jest.fn((name) =>
                    name === "Data" ? mockDataSheet : mockConfigSheet
                )
            }))
        };
    });

    test('should correctly map headers from config sheet', () => {
        const service = new SheetService("Data", "Settings", ["id", "status"]);
        const rows = service.getRows();

        expect(rows[0].id).toBe("REC-01");
    });

    test('should highlight missing headers in red', () => {
        mockDataSheet = createDataSheet([
            ["Status", "Wrong Column"]
        ]);

        mockConfigSheet = createConfigSheet([
            ["Internal Key", "Sheet Header"],
            ["id", "Recipient ID"]
        ]);

        expect(() => {
            new SheetService("Data", "Settings", ["id"]);
        }).toThrow(/Mapping Failed/);

        expect(mockConfigSheet.getRange).toHaveBeenCalled();
        expect(mockConfigSheet.__range.setBackground)
            .toHaveBeenCalledWith("#f4cccc");
    });

    test('should throw with row number in config error', () => {
        mockConfigSheet = createConfigSheet([
            ["Internal Key", "Sheet Header"],
            ["id", "MISSING_COL"]
        ]);

        expect(() => {
            new SheetService("Data", "Settings", ["id"]);
        }).toThrow(/Config Row:/);
    });

    test('should update correct cell by id', () => {
        const service = new SheetService("Data", "Settings", ["id", "status"]);

        service.updateCellById("REC-01", "status", "done");

        expect(mockDataSheet.__range.setValue).toHaveBeenCalledWith("done");
    });

    test('should return false if id not found', () => {
        const service = new SheetService("Data", "Settings", ["id", "status"]);

        const result = service.updateCellById("NOT_EXIST", "status", "done");

        expect(result).toBe(false);
    });

    test('should throw if id mapping missing', () => {
        mockConfigSheet = createConfigSheet([
            ["Internal Key", "Sheet Header"],
            ["status", "Status"]
        ]);

        expect(() => {
            new SheetService("Data", "Settings", ["status"]);
        }).toThrow(/Critical Mapping Failure/i);
    });

    test('should throw if config empty', () => {
        mockConfigSheet = createConfigSheet([
            ["Internal Key", "Sheet Header"]
        ]);

        expect(() => {
            new SheetService("Data", "Settings", ["id"]);
        }).toThrow(/Mapping Failed/i);
    });

    test('should throw on unmapped update key', () => {
        const service = new SheetService("Data", "Settings", ["id", "status"]);

        expect(() => {
            service.updateCellById("REC-01", "unknown", "value");
        }).toThrow(/not mapped/i);
    });

    test('should map multiple rows correctly', () => {
        mockDataSheet = createDataSheet([
            ["Status", "Recipient ID"],
            ["pending", "REC-01"],
            ["done", "REC-02"]
        ]);

        const service = new SheetService("Data", "Settings", ["id", "status"]);
        const rows = service.getRows();

        expect(rows.length).toBe(2);
        expect(rows[1].id).toBe("REC-02");
    });

    test('should not shift columns when new columns added', () => {
        mockDataSheet = createDataSheet([
            ["Extra", "Status", "Recipient ID"],
            ["X", "pending", "REC-01"]
        ]);

        const service = new SheetService("Data", "Settings", ["id", "status"]);
        const rows = service.getRows();

        expect(rows[0].id).toBe("REC-01");
        expect(rows[0].status).toBe("pending");
    });

    test('mock config is valid', () => {
        const values = mockConfigSheet.getDataRange().getValues();
        expect(values[1][0]).toBe("id");
    });
});