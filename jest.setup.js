// Mocking the Google SpreadsheetApp so tests can run locally
global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      appendRow: jest.fn(),
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ["ID", "Name", "Amount"], // Mocked Header
          ["REC-001", "John Doe", 5000] // Mocked Data
        ])
      }))
    }))
  }))
};

global.Logger = {
  log: jest.fn()
};
moduleDirectories: ["node_modules", "tests"]
