// function doGet() {
//   return HtmlService.createTemplateFromFile('Index')
//     .evaluate()
//     .setTitle('Fund Dispatch Dashboard')
//     .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')
//     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
// }

/**
 * src/Code.gs
 */
function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  
  // Fetch the data using your SheetService
  const initialData = getInitialAppData(); 
  
  // Inject the entire state as a JSON string
  // This is faster than calling google.script.run on load
  template.initialState = JSON.stringify(initialData);
  
  return template.evaluate()
    .setTitle('Fund Distribution Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * src/Code.gs
 */
function getInitialAppData() {
  try {
    // 1. Initialize Services
    const recipientService = new SheetService("Distribution_Master", HeaderStrategies.RECIPIENTS);
    const agentService = new SheetService("User_Directory", HeaderStrategies.AGENTS);
    
    // 2. Fetch Data
    const allRecipients = recipientService.getRows();
    const allAgents = agentService.getRows();
    
    // 3. Identify Logged-in User (Agent or Admin)
    const activeEmail = Session.getActiveUser().getEmail();
    const agentData = allAgents.find(a => a.email === activeEmail);
    
    if (!agentData) {
      throw new Error(`User ${activeEmail} not found in Directory.`);
    }

    // 4. Return the object the Store expects
    return {
      user: {
        id: agentData.id,
        name: agentData.name,
        role: agentData.role, // 'admin' or 'agent'
        email: agentData.email
      },
      wallet: {
        remaining: agentData.wallet, // The "Lump Sum" balance
        currency: "ETB"
      },
      // Only show recipients assigned to this specific agent (unless they are Admin)
      recipients: agentData.role === 'admin' 
        ? allRecipients 
        : allRecipients.filter(r => r.agentId === agentData.id),
      
      exchangeRates: { current: 58.5, reference: 50.0 },
      ui: { language: 'en', displayCurrency: 'ETB' }
    };

  } catch (e) {
    Logger.log("Error in getInitialAppData: " + e.message);
    throw e;
  }
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
