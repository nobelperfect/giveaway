const { calculatePayableAmount } = require('../src/FinanceLogic');

test('should stay at fixed amount when inflation is low', () => {
  // Scenario: 5000 ETB, 100 USD target, current rate 60, ref rate 50
  // Ratio: 50/60 = 0.83 (Higher than 0.55)
  const result = calculatePayableAmount(5000, 100, 60, 50);
  expect(result).toBe(5000); 
});

test('should reinstate to USD value when inflation crosses 55% threshold', () => {
  // Scenario: 5000 ETB, 100 USD target, current rate 100, ref rate 50
  // Ratio: 50/100 = 0.50 (Lower than 0.55 - TRIGGER!)
  const result = calculatePayableAmount(5000, 100, 100, 50);
  expect(result).toBe(10000); // 100 USD * 100 Rate
});
