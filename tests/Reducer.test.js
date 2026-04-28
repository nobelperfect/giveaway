const { appReducer } = require('../src/Reducer');

describe('Reducer: Inflation & Threshold Logic', () => {
    // Define a fresh state for every test to prevent data leaking
    let initialState;

    beforeEach(() => {
        initialState = {
            exchangeRates: { current: 50 },
            wallet: { remaining: 50000 },
            recipients: [{
                id: 'REC-01',
                name: 'Test Family',
                fixedETBAmount: 5000,
                targetUSD: 100,
                referenceRate: 50,
                amount: 5000,
                status: 'pending'
            }]
        };
    });

    test('should keep fixed ETB when rate is stable (Ratio > 0.55)', () => {
        const action = { type: 'UPDATE_EXCHANGE_RATE', payload: 60 };
        const newState = appReducer(initialState, action);

        expect(newState.recipients[0].amount).toBe(5000);
        expect(newState.recipients[0].isAdjusted).toBe(false);
    });

    test('should reinstate USD value when threshold is crossed (Ratio <= 0.55)', () => {
        const action = { type: 'UPDATE_EXCHANGE_RATE', payload: 100 };
        const newState = appReducer(initialState, action);

        // 100 USD * 100 Rate = 10,000 ETB
        expect(newState.recipients[0].amount).toBe(10000);
        expect(newState.recipients[0].isAdjusted).toBe(true);
    });

    test('should decrease wallet balance correctly upon dispatch', () => {
        const action = { type: 'CONFIRM_DISPATCH', payload: 'REC-01' };
        const newState = appReducer(initialState, action);

        expect(newState.wallet.remaining).toBe(45000);
        expect(newState.recipients[0].status).toBe('dispatched');
    });

    test('should link receipt URL and ID to the correct recipient card', () => {
        const payload = {
            id: 'REC-01',
            url: 'https://google.com',
            fileId: 'FILE_123'
        };

        const action = { type: 'SET_RECEIPT_DATA', payload: payload };
        const newState = appReducer(initialState, action);

        const target = newState.recipients.find(r => r.id === 'REC-01');

        expect(target.receiptUrl).toBe(payload.url);
        expect(target.receiptId).toBe(payload.fileId);
        expect(newState.wallet.remaining).toBe(initialState.wallet.remaining);
    });
});
