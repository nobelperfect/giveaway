// This is the "Brain" - Pure JavaScript
function calculatePayableAmount(fixedETB, targetUSD, currentRate, referenceRate) {
  const valueRatio = referenceRate / currentRate;
  
  // If currency value drops to 55% or lower
  if (valueRatio <= 0.55) {
    return targetUSD * currentRate; // Reinstated amount
  }
  
  return fixedETB; // Predictable fixed amount
}

// Logic to export for Jest, but hide from Google Apps Script
if (typeof module !== 'undefined') {
  module.exports = { calculatePayableAmount };
}
