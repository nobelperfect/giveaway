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

// // giveaway/jest.setup.js
// global.SpreadsheetApp = {
//   getActive: jest.fn(() => ({
//     getSheetByName: jest.fn(() => ({
//       getRange: jest.fn(() => ({
//         getValue: jest.fn(() => "Mock Value"),
//         setValue: jest.fn()
//       }))
//     })),
//     getName: jest.fn(() => "Mock Spreadsheet")
//   })),
//   getUi: jest.fn(() => ({
//     alert: jest.fn()
//   }))
// };

// global.Logger = {
//   log: jest.fn((msg) => console.log('GAS Logger:', msg))
// };
