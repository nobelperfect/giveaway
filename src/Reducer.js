
// /**
// * src/Reducer.js
// * The "Accountant": Pure logic to handle state transitions.
// */

const appReducer = (state, action) => {
    switch (action.type) {

        case 'UPDATE_EXCHANGE_RATE': {
            // Coerce to number and default to 0
            const newRate = Number(action.payload) || 0;

            const updatedRecipients = state.recipients.map(rec => {
                const refRate = Number(rec.referenceRate) || 0;

                // Fix: Defensive Ratio Calculation
                // If either rate is missing or 0, we set ratio to Infinity 
                // so the (ratio <= 0.55) check safely fails.
                const valueRatio = (refRate > 0 && newRate > 0)
                    ? refRate / newRate
                    : Infinity;

                let finalAmount = Number(rec.fixedETBAmount) || 0;
                let isAdjusted = false;

                // Threshold check (Safe from NaN/Infinity)
                if (valueRatio <= 0.55) {
                    const targetUSD = Number(rec.targetUSD) || 0;
                    finalAmount = targetUSD * newRate;
                    isAdjusted = true;
                }

                return { ...rec, amount: finalAmount, isAdjusted: isAdjusted };
            });

            // Inside the UPDATE_EXCHANGE_RATE case
            const totalFixed = updatedRecipients.reduce((sum, r) => sum + (Number(r.fixedETBAmount) || 0), 0);
            const totalActual = updatedRecipients.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
            const variance = totalActual - totalFixed;

            return {
                ...state,
                exchangeRates: { ...state.exchangeRates, current: newRate },
                recipients: updatedRecipients,
                analytics: {
                    totalFixed,
                    totalActual,
                    variance,
                    percentIncrease: totalFixed > 0 ? (variance / totalFixed) * 100 : 0
                }
            };
        }


        case 'CONFIRM_DISPATCH': {
            const recipient = state.recipients.find(r => r.id === action.payload);

            // Fix for rbug_001: Null check
            if (!recipient) {
                console.warn(`Dispatch failed: Recipient ${action.payload} not found.`);
                return state;
            }

            // Fix for rbug_002: Numeric validation and negative check
            const currentWallet = Number(state.wallet.remaining) || 0;
            const amountToSubtract = Number(recipient.amount) || 0;

            // Safety check: Don't allow dispatch if it exceeds wallet
            if (amountToSubtract > currentWallet) {
                console.error("Insufficient funds in wallet.");
                return state;
            }

            const updatedRecipients = state.recipients.map(r =>
                r.id === action.payload ? { ...r, status: 'dispatched' } : r
            );

            return {
                ...state,
                recipients: updatedRecipients,
                wallet: {
                    ...state.wallet,
                    remaining: currentWallet - amountToSubtract
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

        case 'SET_SUCCESS_STORY': {
            const { id, url } = action.payload;
            const updatedRecipients = state.recipients.map(rec =>
                rec.id === id ? { ...rec, successStoryUrl: url } : rec
            );
            return { ...state, recipients: updatedRecipients };
        }
        case 'SET_LANGUAGE': {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    language: action.payload // 'en' or 'am'
                }
            };
        }
        case 'TOGGLE_EXPAND':
            return {
                ...state,
                recipients: state.recipients.map(r =>
                    r.id === action.payload ? { ...r, isExpanded: !r.isExpanded } : r
                )
            };




        default:
            return state;
    }
};

if (typeof module !== 'undefined') {
    module.exports = { appReducer };
}
