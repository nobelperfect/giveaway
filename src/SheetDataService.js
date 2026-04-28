class SheetService {
    constructor(dataSheetName, configSheetName, internalKeys) {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        this.dataSheet = ss.getSheetByName(dataSheetName);
        this.configSheet = ss.getSheetByName(configSheetName);

        if (!this.dataSheet || !this.configSheet) {
            throw new Error(
                `Critical Error: Sheets "${dataSheetName}" or "${configSheetName}" not found.`
            );
        }

        this._mapping = this._loadMapping(internalKeys);
    }

    _getDataValues() {
        return this.dataSheet.getDataRange().getValues();
    }

    _getConfigValues() {
        return this.configSheet.getDataRange().getValues();
    }

    _normalize(v) {
        return String(v ?? "").trim().toLowerCase();
    }

    _loadMapping(internalKeys) {
        const dataValues = this._getDataValues();
        const configData = this._getConfigValues();

        const headers = dataValues[0] || [];
        const mapping = {};
        const errors = [];

        internalKeys.forEach((key) => {
            const rowIndex = configData.findIndex(r => r[0] === key);
            const row = configData[rowIndex];

            if (!row) {
                errors.push(`Missing config entry for key "${key}"`);
                return;
            }

            const sheetHeader = row[1];

            if (!sheetHeader || !String(sheetHeader).trim()) {
                errors.push(`Missing config header for key "${key}" (Row ${rowIndex + 1})`);
                this.configSheet.getRange(rowIndex + 1, 2).setBackground("#f4cccc");
                return;
            }

            const colIndex = headers.findIndex(
                h => this._normalize(h) === this._normalize(sheetHeader)
            );

            if (colIndex === -1) {
                errors.push(
                    `Missing mapping for key "${key}" → expected header "${sheetHeader}" (Config Row: ${rowIndex + 1})`
                );

                this.configSheet.getRange(rowIndex + 1, 2).setBackground("#f4cccc");
                return;
            }

            mapping[key] = colIndex;
        });

        if (errors.length > 0) {
            throw new Error(
                `Mapping Failed in sheet "${this.dataSheet.getName()}":\n${errors.join("\n")}`
            );
        }

        if (mapping.id === undefined) {
            throw new Error(
                "Critical Mapping Failure: 'id' must be mapped"
            );
        }

        return mapping;
    }

    getRows() {
        const data = this._getDataValues().slice(1);

        return data.map(row => {
            const obj = {};

            Object.keys(this._mapping).forEach(k => {
                obj[k] = row[this._mapping[k]];
            });

            return obj;
        });
    }

    updateCellById(id, key, value) {
        const data = this._getDataValues();

        const idIndex = this._mapping.id;
        const colIndex = this._mapping[key];

        if (idIndex === undefined) {
            throw new Error("Missing id mapping");
        }

        if (colIndex === undefined) {
            throw new Error(`Key not mapped: ${key}`);
        }

        for (let i = 1; i < data.length; i++) {
            if (String(data[i][idIndex]) === String(id)) {
                this.dataSheet
                    .getRange(i + 1, colIndex + 1)
                    .setValue(value);

                return true;
            }
        }

        return false;
    }
}

if (typeof module !== "undefined") {
    module.exports = { SheetService };
}