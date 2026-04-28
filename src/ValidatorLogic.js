/**
 * src/ValidatorLogic.js
 */
function validateSettingsLogic(settingsData, masterHeaders) {
    const data = [...settingsData];
    data.shift(); // Remove header row
    
    const requiredKeys = ["id", "amount", "status", "referenceRate", "targetUSD"];
    const errors = [];
    const errorRows = [];
    const foundKeys = [];

    data.forEach((row, index) => {
        const key = String(row[0]).trim();
        const headerName = String(row[1]).trim();
        const rowNum = index + 2; 

        if (!key) return;

        if (foundKeys.includes(key)) {
            errors.push(`Duplicate Internal Key: "${key}" at Row ${rowNum}`);
            errorRows.push(rowNum);
        }
        foundKeys.push(key);

        const headerExists = masterHeaders.includes(headerName);
        if (!headerName || headerName === "undefined" || !headerExists) {
            errors.push(`Header "${headerName}" not found or empty for key "${key}"`);
            errorRows.push(rowNum);
        }
    });

    requiredKeys.forEach(req => {
        if (!foundKeys.includes(req)) {
            errors.push(`Critical Key Missing: "${req}"`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors,
        errorRows: errorRows
    };
}

if (typeof module !== 'undefined') {
    module.exports = { validateSettingsLogic };
}
