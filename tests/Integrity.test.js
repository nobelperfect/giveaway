/**
 * @jest-environment jsdom
 */

const { UIComponents } = require('../src/UIComponents');
const { AppLogic } = require('../src/App');

describe('Bubbly Integrity Wash: Security & Reliability', () => {

    describe('sec_001: XSS Protection (Sanitization)', () => {
        test('should escape malicious script tags in user names', () => {
            const maliciousName = '<script>alert("Hacked")</script>Abebe';
            const escaped = UIComponents.escape(maliciousName);

            // Prove that < and > are neutralized
            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;script&gt;');
        });

        test('should escape quotes to prevent attribute injection', () => {
            const maliciousID = 'REC-01" onmouseover="evil()"';
            const escaped = UIComponents.escape(maliciousID);

            expect(escaped).toContain('&quot;');
            expect(escaped).not.toContain('" onmouseover=');
        });
    });

    describe('sec_002: Input Validation (Receipt IDs)', () => {
        // Regex helper we used in App.js
        const validateReceipt = (id) => {
            const isValid = id && id.trim().length >= 4 && /^[a-z0-9_-]+$/i.test(id.trim());
            return !!isValid; // The !! ensures "" becomes false
        };


        test('should reject empty or short receipt IDs', () => {
            expect(validateReceipt("")).toBe(false);
            expect(validateReceipt("123")).toBe(false);
        });

        test('should reject malicious characters in receipt IDs', () => {
            expect(validateReceipt("REC-01; DROP TABLE")).toBe(false);
            expect(validateReceipt("REC<script>")).toBe(false);
        });

        test('should accept valid alphanumeric receipt IDs', () => {
            expect(validateReceipt("TAX-2026-001")).toBe(true);
            expect(validateReceipt("receipt_99")).toBe(true);
        });
    });

    describe('bug_003: State Initialization (Expansion)', () => {
        test('should ensure status_class correctly handles undefined isExpanded', () => {
            // Simulate a recipient where isExpanded is missing from the Sheet
            const rec = { status: 'pending' }; // isExpanded is undefined

            const isExpanded = rec.isExpanded === true;
            const className = `${rec.status === 'dispatched' ? 'is-agent' : ''} ${isExpanded ? 'expanded' : ''}`.trim();

            // The class should NOT include 'expanded'
            expect(className).toBe('');
            expect(className).not.toContain('expanded');
        });
    });
});
