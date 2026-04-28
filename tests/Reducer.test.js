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

        jest.spyOn(console, 'warn').mockImplementation(() => { });

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

    test('should update recipient with success story URL', () => {
        const action = {
            type: 'SET_SUCCESS_STORY',
            payload: { id: 'REC-01', url: 'https://google.com' }
        };
        const newState = appReducer(initialState, action);
        const target = newState.recipients.find(r => r.id === 'REC-01');

        expect(target.successStoryUrl).toBe(action.payload.url);
    });

    test('should handle missing recipient gracefully in CONFIRM_DISPATCH', () => {
        const action = { type: 'CONFIRM_DISPATCH', payload: 'NON_EXISTENT_ID' };
        const newState = appReducer(initialState, action);
        // Should return state unchanged instead of crashing
        expect(newState).toEqual(initialState);
        expect(console.warn).toHaveBeenCalled();
    });

    test('should prevent division by zero in UPDATE_EXCHANGE_RATE', () => {
        const action = { type: 'UPDATE_EXCHANGE_RATE', payload: 0 };
        const newState = appReducer(initialState, action);
        // Should not result in Infinity or NaN
        expect(newState.recipients[0].amount).toBe(initialState.recipients[0].fixedETBAmount);
    });

    test('should handle missing referenceRate by defaulting to fixed amount', () => {
        // Scenario: Agent forgot to put a reference rate in the sheet for this recipient
        const stateWithBadData = {
            ...initialState,
            recipients: [{ ...initialState.recipients[0], referenceRate: undefined }]
        };

        const action = { type: 'UPDATE_EXCHANGE_RATE', payload: 100 };
        const newState = appReducer(stateWithBadData, action);

        // Should NOT adjust, should stay at fixedETBAmount (5000)
        expect(newState.recipients[0].amount).toBe(5000);
        expect(newState.recipients[0].isAdjusted).toBe(false);
    });




});
