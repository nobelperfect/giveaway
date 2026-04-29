
/**
 * System architecture
SETTINGS SHEET (truth)
        ↓
SheetService builds mapping ONLY
        ↓
RAW DATA SHEET stays untouched
        ↓
SheetService translates raw → structured objects

Key rule:

SheetService NEVER assumes headers are final. It always depends on Settings mapping.
*/
/**
 * System architecture:
 * SETTINGS SHEET (truth) -> builds mapping -> translates raw data to objects.
 */
class SheetService {
    constructor(dataSheetName, configSheetName, requiredKeys = []) {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        this._dataSheet = ss.getSheetByName(dataSheetName);
        this._configSheet = ss.getSheetByName(configSheetName);

        if (!this._dataSheet || !this._configSheet) {
            throw new Error("Sheet not found");
        }

        this.requiredKeys = requiredKeys;
        this._mapping = this._loadMapping();
    }

    _loadMapping() {
        const values = this._configSheet.getDataRange().getValues();

        // 1. BASIC VALIDATION
        if (!values || values.length <= 1) {
            throw new Error("Mapping Failed");
        }

        const headers = values[0];
        const rows = values.slice(1);

        const keyIdx = headers.indexOf("Internal Key");
        const sheetIdx = headers.indexOf("Sheet Name");
        const headerIdx = headers.indexOf("Sheet Header");

        const hasSheetName = sheetIdx !== -1;
        const targetSheetName = this._dataSheet.getName();

        // 2. BUILD RAW MAPPING + ROW ERRORS
        const mapping = {};
        const rowErrors = [];

        rows.forEach((row, i) => {
            const internalKey = row[keyIdx];
            const sheetHeader = row[headerIdx];
            const sheetName = hasSheetName ? row[sheetIdx] : targetSheetName;

            // Only track errors if the row is meant for THIS sheet (or generic if no sheet name column)
            if (sheetName === targetSheetName) {
                if (!internalKey || !sheetHeader) {
                    rowErrors.push(i + 2);
                    return;
                }
                mapping[internalKey] = sheetHeader;
            }
        });

        // 3. ROW ERROR HAS HIGHEST PRIORITY
        if (rowErrors.length > 0) {
            throw new Error(`Config Row: ${rowErrors.join(", ")}`);
        }

        // 4. EMPTY MAPPING → CONTEXTUAL ERROR
        if (Object.keys(mapping).length === 0) {
            throw new Error(`No keys found for sheet ${targetSheetName}`);
        }

        // 5. REQUIRED KEYS CHECK
        if (this.requiredKeys.includes("id") && !mapping["id"]) {
            throw new Error("Critical Mapping Failure: id not mapped");
        }

        // 6. DATA SHEET VALIDATION (Compare Config mapping vs Actual Headers)
        const dataValues = this._dataSheet.getDataRange().getValues();
        const dataHeaders = dataValues[0].map(h => String(h).trim());

        const keysToValidate = this.requiredKeys.length > 0
            ? this.requiredKeys
            : Object.keys(mapping);

        const missingHeaders = keysToValidate.filter(key => {
            const header = mapping[key];
            return !header || !dataHeaders.includes(String(header).trim());
        });

        if (missingHeaders.length > 0) {
            this._highlightErrors();
            throw new Error("Mapping Failed");
        }

        return mapping;
    }

    _highlightErrors() {
        this._configSheet.getRange(1, 1).setBackground("#f4cccc");
    }

    /**
     * Translates raw sheet rows into structured JavaScript objects
     */
    getRows() {
        const dataValues = this._dataSheet.getDataRange().getValues();
        const headers = dataValues[0];
        const rows = dataValues.slice(1);

        const headerIndexMap = {};
        headers.forEach((h, i) => { headerIndexMap[h] = i; });

        return rows.map(row => {
            const obj = {};
            Object.entries(this._mapping).forEach(([key, sheetHeader]) => {
                const idx = headerIndexMap[sheetHeader];
                obj[key] = idx !== undefined ? row[idx] : undefined;
            });
            return obj;
        });
    }

    /**
     * Updates a single cell in the data sheet by looking up the record ID
     */
    updateCellById(id, key, value) {
        const sheetHeader = this._mapping[key];
        if (!sheetHeader) {
            throw new Error(`${key} not mapped`);
        }

        const dataValues = this._dataSheet.getDataRange().getValues();
        const headers = dataValues[0];

        const idHeader = this._mapping["id"];
        const idIndex = headers.indexOf(idHeader);
        const targetIndex = headers.indexOf(sheetHeader);

        for (let i = 1; i < dataValues.length; i++) {
            // String comparison to prevent numeric type mismatches
            if (String(dataValues[i][idIndex]) === String(id)) {
                this._dataSheet
                    .getRange(i + 1, targetIndex + 1)
                    .setValue(value);
                return true;
            }
        }
        return false;
    }
}

if (typeof module !== 'undefined') {
    module.exports = { SheetService };
}
