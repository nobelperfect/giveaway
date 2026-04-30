/**
 * src/App.js - Pure Logic
 */
// 1. Security Helper: Prevents XSS by escaping <, >, &, etc.
const escapeHTML = (str) => {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

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
        // JEST SAFETY: Don't cry if the bridge is missing during a unit test
        if (!bridge || !bridge.dataset.state) {
            if (typeof jest === 'undefined') {
                console.error("Data bridge missing");
            }
            return;
        }

        const INITIAL_STATE = JSON.parse(bridge.dataset.state);
        const getTpl = (id) => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Template ${id} missing, using fallback.`);
                return `<div class="error">Template ${id} not found</div>`;
            }
            return el.innerHTML;
        };


        // Initialize Store
        const store = createStore(appReducer, INITIAL_STATE, [securityInterceptor]);

        /**
         * THE RENDERER
         */
        function renderApp(state) {
            console.log("Rendering UI...");
            // FIX bug_002: Use document.body to ensure theme works in BOTH Prod and Dev
            const body = document.getElementById('ui-body') || document.body;

            const lang = (state.ui && state.ui.language) ? state.ui.language : 'en';

            // Re-capture templates every render in case fetch() finished late
            const TPL_CARD = getTpl('tpl-recipient-card');
            const TPL_HEADER = getTpl('tpl-agent-summary');
            const TPL_ANALYTICS = getTpl('tpl-admin-analytics');

            if (!TPL_CARD || !TPL_HEADER) {
                console.warn("Waiting for templates to load...");
                return;
            }

            // const lang = (state.ui && state.ui.language) ? state.ui.language : 'en';
            // const body = document.getElementById('ui-body');

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
                        // FIX: Ensure 'expanded' is added as a class only when true
                        status_class: `${rec.status === 'dispatched' ? 'is-agent' : ''} ${isExpanded ? 'expanded' : ''}`.trim(),
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

        // FIX sec_002: Restore Failure Handlers and Validate Inputs
        window.handleConfirm = (id) => {
            // 1. Grab value from the card's specific input field
            const inputEl = document.getElementById(`input-${id}`);
            const receiptId = inputEl ? inputEl.value : "";

            // 2. Validation (Still solving sec_002)
            if (!receiptId || receiptId.trim().length < 4 || !/^[a-z0-9_-]+$/i.test(receiptId.trim())) {
                // Since alert() might also be blocked in Live Preview, use console.error or a UI message
                console.error("Invalid Receipt ID format");
                if (inputEl) inputEl.style.border = "2px solid var(--danger)";
                return;
            }

            // 3. Local UI Update
            const success = store.dispatch({ type: 'CONFIRM_DISPATCH', payload: id });
            if (!success) return;

            // 4. Server Sync
            if (typeof google !== 'undefined' && google.script) {
                google.script.run
                    .withSuccessHandler(() => console.log('Sync complete'))
                    .withFailureHandler(err => console.error('Sync failed:', err))
                    .processDispatch(id, receiptId.trim());
            } else {
                console.log("DEV MODE: Confirmed", id, "with Receipt:", receiptId.trim());
            }
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

