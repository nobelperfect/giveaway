/**
 * src/Reducer.js
 * The "Accountant": Pure logic to handle state transitions.
 */
const appReducer = (state, action) => {
    switch (action.type) {

        // Triggered when the Admin updates the global exchange rate
        case 'UPDATE_EXCHANGE_RATE': {
            const newRate = action.payload;

            const updatedRecipients = state.recipients.map(rec => {
                // Calculate current purchasing power ratio
                // (Ref Rate 50 / Current Rate 100) = 0.50
                const valueRatio = rec.referenceRate / newRate;

                let finalAmount = rec.fixedETBAmount;
                let isAdjusted = false;

                // If currency value drops to 55% or lower, reinstate to USD value
                if (valueRatio <= 0.55) {
                    finalAmount = rec.targetUSD * newRate;
                    isAdjusted = true;
                }

                return {
                    ...rec,
                    amount: finalAmount,
                    isAdjusted: isAdjusted
                };
            });

            return {
                ...state,
                exchangeRates: { ...state.exchangeRates, current: newRate },
                recipients: updatedRecipients
            };
        }

        case 'CONFIRM_DISPATCH': {
            const recipient = state.recipients.find(r => r.id === action.payload);
            const updatedRecipients = state.recipients.map(r =>
                r.id === action.payload ? { ...r, status: 'dispatched' } : r
            );

            return {
                ...state,
                recipients: updatedRecipients,
                wallet: {
                    ...state.wallet,
                    remaining: state.wallet.remaining - recipient.amount
                }
            };
        }

        case 'SET_RECEIPT_DATA': {
            const { id, url, fileId } = action.payload;
            const updatedRecipients = state.recipients.map(rec => {
                if (rec.id === id) {
                    return { ...rec, receiptUrl: url, receiptId: fileId };
                }
                return rec;
            });

            return {
                ...state,
                recipients: updatedRecipients
            };
        }

        default:
            return state;
    }
};

if (typeof module !== 'undefined') {
    module.exports = { appReducer };
}
