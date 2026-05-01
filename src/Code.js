function include(filename) {
  // Use try/catch to see if a specific file is failing
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return "/* Error loading " + filename + ": " + e.message + " */";
  }
}

/**
 * src/Code.js
 */
function doGet() {
  try {
    // 1. Create the template
    const template = HtmlService.createTemplateFromFile('Index');

    // 2. Inject initial state
    const data = getInitialAppData();
    template.initialState = JSON.stringify(data || {});

    // 3. Evaluate template
    const output = template.evaluate();

    // 4. Manual Configuration (Isolating the Mode)
    output.setTitle('Fund Distribution Dashboard');
    output.addMetaTag('viewport', 'width=device-width, initial-scale=1');

    // THE ULTIMATE FIX: 
    // If the Enum constant is returning null, we handle it defensively.
    const mode = HtmlService.XFrameOptionsMode.SAMEORIGIN;

    if (mode !== null && mode !== undefined) {
      output.setXFrameOptionsMode(mode);
    } else {
      // Fallback for weird V8 engine glitches
      console.warn("XFrameOptionsMode Enum was null, skipping to prevent crash.");
    }

    return output;

  } catch (e) {
    // This will now show the REAL error if getInitialAppData is failing
    return HtmlService.createHtmlOutput("<b>Initialization Error:</b> " + e.message);
  }
}



/**
 * src/Code.gs
 */
function getInitialAppData() {
  try {
    validateSettings();
    const currentRate = 58.5; // For now, this is hardcoded

    const recipientKeys = [
      "id", "name", "status", "amount",
      "agentId", "referenceRate",
      "targetUSD", "fixedETBAmount"
    ];

    const agentKeys = [
      "id", "email", "name", "role", "wallet"
    ];

    // LOAD USERS FIRST (IMPORTANT FIX)
    const agentService = new SheetService(
      "User_Directory",
      "Settings",
      agentKeys
    );
    const allAgents = agentService.getRows();

    const activeEmail = Session.getActiveUser().getEmail();
    const agentData = allAgents.find(a => a.email === activeEmail);

    if (!agentData) {
      throw new Error(
        `User ${activeEmail} not found in User_Directory. Run setupFullSystem.`
      );
    }

    // LOAD RECIPIENTS AFTER AUTH
    const recipientService = new SheetService(
      "Distribution_Master",
      "Settings",
      recipientKeys
    );
    const allRecipients = recipientService.getRows();
    // FIX: Map through the recipients to initialize the UI state
    const hydratedRecipients = allRecipients.map(rec => ({
      ...rec,
      isExpanded: false // 1. Guaranteed starting point for every card
    }));

    return {
      user: {
        id: agentData.id,
        name: agentData.name,
        role: agentData.role,
        email: agentData.email
      },
      wallet: {
        remaining: Number(agentData.wallet) || 0,
        currency: "ETB"
      },
      recipients: agentData.role === "admin"
        ? hydratedRecipients
        : hydratedRecipients.filter(r => r.agentId === agentData.id),

      exchangeRates: { current: currentRate, reference: 50.0 },
      ui: { language: "en", displayCurrency: "ETB" }
    };

  } catch (e) {
    Logger.log("Error in getInitialAppData: " + e.message);
    throw e;
  }
}

/**
 * Creates a custom menu in the Google Sheet UI.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Bubbly Admin')
    .addItem('✅ Validate Settings', 'validateSettings')
    .addSeparator()
    .addItem('🛠️ Re-Run Initial Setup', 'setupSettingsSheet')
    .addToUi();
}


/**
 * Handles the Base64 image upload from the mobile dashboard.
 */
function uploadSuccessStory(recipientId, base64Data, fileName) {
  try {
    // 1. Save to Google Drive
    const folder = DriveApp.getFoldersByName("Success_Stories").next();
    const contentType = base64Data.substring(5, base64Data.indexOf(';'));
    const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
    const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
    const fileUrl = file.getUrl();

    // 2. Update the Sheet using our Strategy-Based Service
    const service = new SheetService("Distribution_Master", HeaderStrategies.RECIPIENTS);
    service.updateCellById(recipientId, "successStoryUrl", fileUrl);

    // 3. Return the URL so the Store can update the UI instantly
    return { id: recipientId, url: fileUrl };
  } catch (e) {
    throw new Error("Upload failed: " + e.message);
  }
}
// Bottom of src/Code.js
if (typeof module !== 'undefined') {
  module.exports = { getInitialAppData };
}
