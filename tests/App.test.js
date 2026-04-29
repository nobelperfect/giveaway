const { AppLogic } = require('../src/App');

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

