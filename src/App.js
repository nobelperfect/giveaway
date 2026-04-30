/**
 * src/App.js - Pure Logic
 */

// 1. GLOBAL HELPERS (Defined once, outside everything)
const _t = (key, lang = 'en') => {
    const dict = {
        en: { dash: "My Dispatches", wallet: "Wallet", confirm: "Confirm Payout", purpose: "Purpose", pending: "Pending", dispatched: "Dispatched", done: "Done" },
        am: { dash: "የእኔ ክፍያዎች", wallet: "ካፒታል", confirm: "ክፍያውን አረጋግጥ", purpose: "አላማ", pending: "በተጠባባቂ", dispatched: "ተከፍሏል", done: "ተከናውኗል" }
    };
    // Support both simple key lookup and language-based lookup
    const currentDict = dict[lang] || dict['en'];
    return currentDict[key] || key;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'ETB'
    }).format(amount || 0);
};

/**
 * 2. BROWSER CONDUCTOR
 */
if (typeof document !== 'undefined') {
    (function () {
        console.log("!!! APP STARTING !!!");

        const bridge = document.getElementById('state-bridge');
        if (!bridge || !bridge.dataset.state) {
            console.error("Data bridge missing");
            return;
        }

        const INITIAL_STATE = JSON.parse(bridge.dataset.state);

        // Template Loader Helper
        const getTpl = (id) => {
            const el = document.getElementById(id);
            if (!el) return null;
            return el.innerHTML;
        };

        // Initialize Store
        const store = createStore(appReducer, INITIAL_STATE, [securityInterceptor]);

        /**
         * THE RENDERER
         */
        function renderApp(state) {
            console.log("Rendering UI...");

            // Re-capture templates every render in case fetch() finished late
            const TPL_CARD = getTpl('tpl-recipient-card');
            const TPL_HEADER = getTpl('tpl-agent-summary');
            const TPL_ANALYTICS = getTpl('tpl-admin-analytics');

            if (!TPL_CARD || !TPL_HEADER) {
                console.warn("Waiting for templates to load...");
                return;
            }

            const lang = (state.ui && state.ui.language) ? state.ui.language : 'en';
            const body = document.getElementById('ui-body');

            // --- A. SYNC THE SHELL ---
            const dashTitle = document.getElementById('t-dash');
            const langBtn = document.getElementById('t-lang-btn');
            if (dashTitle) dashTitle.innerText = _t('dash', lang);
            if (langBtn) langBtn.innerText = lang === 'en' ? 'አማርኛ' : 'English';
            if (body) {
                lang === 'am' ? body.classList.add('lang-am') : body.classList.remove('lang-am');
            }

            // --- B. RENDER HEADER ---
            const headerEl = document.getElementById('header-component');
            if (headerEl) {
                headerEl.innerHTML = UIComponents.render(TPL_HEADER, {
                    agent_name: state.user.name,
                    balance_formatted: formatCurrency(state.wallet.remaining)
                });
            }

            // --- C. RENDER ADMIN ANALYTICS ---
            const adminContainer = document.getElementById('admin-oversight-container');
            if (adminContainer) {
                if (state.user.role === 'admin' && state.analytics) {
                    const percent = Number(state.analytics.percentIncrease) || 0;
                    let severity = percent > 25 ? 'critical' : (percent > 10 ? 'warning' : 'stable');
                    adminContainer.innerHTML = UIComponents.render(TPL_ANALYTICS, {
                        total_fixed: formatCurrency(state.analytics.totalFixed),
                        total_actual: formatCurrency(state.analytics.totalActual),
                        variance_etb: formatCurrency(state.analytics.variance),
                        percent_increase: percent.toFixed(1),
                        severity_class: severity
                    });
                    adminContainer.style.display = 'block';
                } else {
                    adminContainer.style.display = 'none';
                }
            }

            // --- D. RENDER CARDS ---
            const container = document.getElementById('card-container');
            if (container) {
                container.innerHTML = state.recipients.map(rec => {
                    const isExpanded = rec.isExpanded === true;
                    return UIComponents.render(TPL_CARD, {
                        id: rec.id,
                        name: rec.name,
                        amount_formatted: formatCurrency(rec.amount),
                        status_class: `${rec.status === 'dispatched' ? 'is-agent' : ''} ${isExpanded ? 'expanded' : ''}`,
                        expand_icon: isExpanded ? '-' : '+',
                        label_purpose: _t('purpose', lang),
                        label_confirm: rec.status === 'pending' ? _t('confirm', lang) : _t('done', lang) 
                    });
                }).join('');
            }
        }

        // --- GLOBAL ACTIONS ---
        window.toggleLanguage = () => {
            const currentState = store.getState();
            const newLang = (currentState.ui && currentState.ui.language === 'en') ? 'am' : 'en';
            store.dispatch({ type: 'SET_LANGUAGE', payload: newLang });
        };

        window.toggleCard = (id) => {
            store.dispatch({ type: 'TOGGLE_EXPAND', payload: id });
        };

        window.handleConfirm = (id) => {
            const input = document.getElementById(`input-${id}`);
            const receiptId = input ? input.value : '';
            const success = store.dispatch({ type: 'CONFIRM_DISPATCH', payload: id });
            if (!success) return;

            if (typeof google === 'undefined') {
                console.log("DEV MODE: Sync simulated for", id);
                return;
            }
            google.script.run.processDispatch(id, receiptId);
        };

        // Bootstrap
        store.subscribe(renderApp);
        renderApp(store.getState());

    })();
}
/**
 * 3. LOGIC EXPORTS FOR JEST (TDD)
 */


const AppLogic = {
    getSeverityClass: (percent) => {
        if (percent >= 25) return 'critical'; // Changed to >= to match your test intent
        if (percent > 10) return 'warning';
        return 'stable';
    },
    getStatusClass: (status) => `status-${status}`,
    _t: _t // Adding it here makes it accessible via AppLogic._t
};

if (typeof module !== 'undefined' && module.exports) {
    // Export both the object and the standalone function for flexibility
    module.exports = { AppLogic, _t }; 
}

