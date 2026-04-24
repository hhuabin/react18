import { escapeHTML, safeEscapeHTML } from '@/utils/stringUtils/inputUtils'

describe('inputUtils', () => {
    test('safeEscapeHTML escapes ampersands and HTML-sensitive characters', () => {
        expect(safeEscapeHTML('&<>"\'`=/')).toBe('&amp;&lt;&gt;&quot;&#039;&#x60;&#x3D;&#x2F;')
    })

    test('safeEscapeHTML preserves supported entities and escapes unknown ampersands', () => {
        expect(safeEscapeHTML('&amp;&lt;&gt;&quot;&#039;&#x60;&#x3D;&#x2F;&copy;')).toBe(
            '&amp;&lt;&gt;&quot;&#039;&#x60;&#x3D;&#x2F;&amp;copy;',
        )
    })

    test('escapeHTML escapes HTML-sensitive characters without escaping ampersands', () => {
        expect(escapeHTML('&<>"\'`=/')).toBe('&&lt;&gt;&quot;&#039;&#x60;&#x3D;&#x2F;')
    })
})
