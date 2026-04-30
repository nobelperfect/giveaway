/**
 * src/ValidatorLogic.js
 */
function validateSettingsLogic(settingsData, availableHeaders) {
    const errors = [];
    const seenKeys = {}; 

    // 1. Grab the Header Row (Row 0)
    const headerRow = settingsData[0];
    
    // 2. Identify Column Indexes carefully
    const keyIdx = headerRow.indexOf("Internal Key");
    const sheetIdx = headerRow.indexOf("Sheet Name");
    const headerIdx = headerRow.indexOf("Sheet Header");

    // Safety: If column names are missing from the Settings sheet itself
    if (keyIdx === -1 || sheetIdx === -1 || headerIdx === -1) {
        return {
            isValid: false,
            errors: ["Settings sheet is missing required columns: 'Internal Key', 'Sheet Name', or 'Sheet Header'"]
        };
    }

    // 3. Loop through rows (skip the header row)
    for (let i = 1; i < settingsData.length; i++) {
        const row = settingsData[i];
        const internalKey = row[keyIdx];
        const sheetName = row[sheetIdx];
        const targetHeader = row[headerIdx];

        if (!internalKey) continue; 

        // --- A. Namespaced Duplicate Check ---
        if (!seenKeys[sheetName]) seenKeys[sheetName] = [];
        if (seenKeys[sheetName].includes(internalKey)) {
            errors.push(`Duplicate Internal Key: "${internalKey}" in sheet "${sheetName}"`);
        }
        seenKeys[sheetName].push(internalKey);

        // --- B. Header Existence Check ---
        // We trim both to avoid white-space ghosts
        const cleanHeader = targetHeader ? String(targetHeader).trim() : "";
        
        if (!cleanHeader || !availableHeaders.includes(cleanHeader)) {
            const displayHeader = cleanHeader || "EMPTY";
            errors.push(`Header "${displayHeader}" for key "${internalKey}" not found`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

if (typeof module !== 'undefined') {
    module.exports = { validateSettingsLogic };
}
