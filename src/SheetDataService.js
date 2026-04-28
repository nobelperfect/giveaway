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

        const dataHeaders = dataValues[0] || [];
        const mapping = {};
        const errorDetails = [];

        internalKeys.forEach((key) => {
            const configRowIndex = configData.findIndex(r => r[0] === key);
            const configRow = configData[configRowIndex];

            if (!configRow) {
                errorDetails.push(`Missing config entry for key "${key}"`);
                return;
            }

            const sheetHeader = configRow[1];

            if (!sheetHeader || !String(sheetHeader).trim()) {
                errorDetails.push(
                    `Missing config header for key "${configRow[0]}" (Row ${configRowIndex + 1})`
                );

                this.configSheet
                    .getRange(configRowIndex + 1, 2)
                    .setBackground("#f4cccc");

                return;
            }

            const colIndex = dataHeaders.findIndex(
                h => this._normalize(h) === this._normalize(sheetHeader)
            );

            if (colIndex === -1) {
                errorDetails.push(
                    `Missing mapping for key "${key}" → expected header "${sheetHeader}" (Config Row: ${configRowIndex + 1})`
                );

                this.configSheet
                    .getRange(configRowIndex + 1, 2)
                    .setBackground("#f4cccc");

                return;
            }

            mapping[key] = colIndex;
        });

        if (errorDetails.length > 0) {
            const sheetName = this.dataSheet.getName
                ? this.dataSheet.getName()
                : "Data";

            throw new Error(
                `Mapping Failed in sheet "${sheetName}":\n${errorDetails.join("\n")}`
            );
        }

        if (mapping["id"] === undefined) {
            throw new Error(
                "Critical Mapping Failure: The internal key 'id' must be mapped to a column in the Settings sheet."
            );
        }

        return mapping;
    }

    getRows() {
        const data = this._getDataValues().slice(1);

        return data.map(row => {
            const record = {};

            Object.keys(this._mapping).forEach(key => {
                record[key] = row[this._mapping[key]];
            });

            return record;
        });
    }

    updateCellById(id, key, newValue) {
        const data = this._getDataValues();

        const idColIndex = this._mapping["id"];
        const targetColIndex = this._mapping[key];

        if (idColIndex === undefined) {
            throw new Error("Update Failed: 'id' internal key is not mapped.");
        }

        if (targetColIndex === undefined) {
            throw new Error(`Update Failed: Internal key "${key}" is not mapped.`);
        }

        for (let i = 1; i < data.length; i++) {
            if (String(data[i][idColIndex]) === String(id)) {
                this.dataSheet
                    .getRange(i + 1, targetColIndex + 1)
                    .setValue(newValue);

                return true;
            }
        }

        return false;
    }
}

if (typeof module !== "undefined") {
    module.exports = { SheetService };
}