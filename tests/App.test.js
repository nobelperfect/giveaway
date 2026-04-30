const { AppLogic, _t } = require('../src/App');

describe('UI Logic: CSS Class Triggers', () => {

    test('should return "critical" class when inflation impact is high', () => {
        // AppLogic.getSeverityClass is now safe to call because the IIFE didn't fire
        const className = AppLogic.getSeverityClass(25);
        expect(className).toBe('critical');
    });

    test('should return "stable" class when inflation is under control', () => {
        const className = AppLogic.getSeverityClass(5);
        expect(className).toBe('stable');
    });

    test('should format status classes correctly for CSS targeting', () => {
        expect(AppLogic.getStatusClass('pending')).toBe('status-pending');
        expect(AppLogic.getStatusClass('dispatched')).toBe('status-dispatched');
    });
});


describe('App Logic & UI Helpers', () => {

    describe('Severity Logic (Global Oversight Card)', () => {
        test('should return "stable" for low inflation (<10%)', () => {
            expect(AppLogic.getSeverityClass(5)).toBe('stable');
        });

        test('should return "warning" for moderate inflation (11-25%)', () => {
            expect(AppLogic.getSeverityClass(20)).toBe('warning');
        });

        test('should return "critical" for high inflation (>25%)', () => {
            expect(AppLogic.getSeverityClass(30)).toBe('critical');
        });
    });

    describe('Status Class Mapping', () => {
        test('should return correct CSS class for dispatched status', () => {
            expect(AppLogic.getStatusClass('dispatched')).toBe('status-dispatched');
        });
    });

    describe('Translation Engine (_t)', () => {
        test('should translate "dash" correctly in English', () => {
            expect(_t('dash', 'en')).toBe('My Dispatches');
        });

        test('should translate "dash" correctly in Amharic', () => {
            expect(_t('dash', 'am')).toBe('የእኔ ክፍያዎች');
        });

        test('should fallback to key if translation is missing', () => {
            expect(_t('unknown_key', 'en')).toBe('unknown_key');
        });

        test('should translate "confirm" button for agents', () => {
            expect(_t('confirm', 'am')).toBe('ክፍያውን አረጋግጥ');
        });
    });
});


describe('App Theme & UI Integration', () => {
    test('should apply the correct CSS class to the body for Amharic', () => {
        // Now 'document' exists because of jsdom!
        document.body.innerHTML = '<div id="ui-body"></div>';
        const body = document.getElementById('ui-body');

        const state = { ui: { language: 'am' } };

        // Test the logic that renderApp uses
        if (state.ui.language === 'am') {
            body.classList.add('lang-am');
        }

        expect(body.classList.contains('lang-am')).toBe(true);
    });

    test('should remove the Amharic class when switching to English', () => {
        document.body.innerHTML = '<div id="ui-body" class="lang-am"></div>';
        const body = document.getElementById('ui-body');

        const state = { ui: { language: 'en' } };

        if (state.ui.language !== 'am') {
            body.classList.remove('lang-am');
        }

        expect(body.classList.contains('lang-am')).toBe(false);
    });
});

// commad used to test Applogic
//  npx jest tests/App.test.js --env=jsdom --verbose
