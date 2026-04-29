/**
 * src/App.js - Pure Logic
 */

// 1. Helpers
const _t = (key) => {
    const translations = {
        'pending': 'Pending',
        'dispatched': 'Dispatched',
        'wallet': 'Agent Wallet',
        'purpose': 'Purpose',
        'enter_receipt_id': 'Enter Receipt ID',
        'confirm_dispatch': 'Confirm Payout'
    };
    return translations[key] || key;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'ETB'
    }).format(amount || 0);
};

/**
 * 2. BROWSER-ONLY CONDUCTOR
 * Wrapped in a check so it only runs in a browser, not during Jest tests.
 */
if (typeof document !== 'undefined') {
    (function () {
        console.log("!!! APP STARTING !!!");
        const bridge = document.getElementById('state-bridge');
        if (!bridge || !bridge.dataset.state) return;

        const INITIAL_STATE = JSON.parse(bridge.dataset.state);

        const getTpl = (id) => {
            const el = document.getElementById(id);
            if (!el) {
                console.error("FAILED TO FIND TEMPLATE:", id);
                return "";
            }
            return el.innerHTML;
        };

        const TPL_CARD = getTpl('tpl-recipient-card');
        const TPL_HEADER = getTpl('tpl-agent-summary');
        const TPL_ANALYTICS = getTpl('tpl-admin-analytics');

        const store = createStore(appReducer, INITIAL_STATE, [securityInterceptor]);

        function renderApp(state) {
            const container = document.getElementById('card-container');
            if (container) {
                const htmlOutput = state.recipients.map(rec => {
                    return UIComponents.render(TPL_CARD, {
                        id: rec.id,
                        name: rec.name,
                        status_class: `status-${rec.status}`,
                        amount_formatted: formatCurrency(rec.amount)
                    });
                }).join('');
                container.innerHTML = htmlOutput;
            }
        }

        // Global Actions attached to window
        window.toggleCard = (id) => {
            const el = document.getElementById(`card-${id}`);
            if (el) el.classList.toggle('expanded');
        };

        window.handleConfirm = (id) => {
            const input = document.getElementById(`input-${id}`);
            const receiptId = input ? input.value : '';
            const success = store.dispatch({ type: 'CONFIRM_DISPATCH', payload: id });
            if (!success) return;

            if (typeof google === 'undefined') {
                console.log("DEV MODE: processDispatch called for", id);
                return;
            }

            google.script.run
                .withSuccessHandler(() => console.log('Sync complete'))
                .withFailureHandler(err => alert('Sync failed: ' + err))
                .processDispatch(id, receiptId);
        };

        store.subscribe(renderApp);
        renderApp(store.getState());
    })();
}

/**
 * 3. LOGIC EXPORTS FOR JEST (TDD)
 */
const AppLogic = {
    getSeverityClass: (percent) => percent > 20 ? 'critical' : 'stable',
    getStatusClass: (status) => `status-${status}`
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppLogic };
}
