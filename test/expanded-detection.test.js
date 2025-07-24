const { 
  detectAllNonAscii 
} = require('../src/detectors/emoji');
const { 
  detectControlCharacters 
} = require('../src/detectors/control-chars');

describe('Expanded Control Character Detection', () => {
  test('detects all C0 control characters', () => {
    let allControlChars = '';
    // Add all C0 controls except tab, LF, CR
    for (let i = 0x00; i <= 0x1F; i++) {
      if (i !== 0x09 && i !== 0x0A && i !== 0x0D) {
        allControlChars += String.fromCharCode(i);
      }
    }
    
    const issues = detectControlCharacters(allControlChars, 'test.js', 1);
    expect(issues.length).toBe(29); // 32 total - 3 whitespace = 29
    expect(issues.every(i => i.severity === 'high')).toBe(true);
  });

  test('detects all C1 control characters', () => {
    let c1ControlChars = '';
    for (let i = 0x80; i <= 0x9F; i++) {
      c1ControlChars += String.fromCharCode(i);
    }
    
    const issues = detectControlCharacters(c1ControlChars, 'test.js', 1);
    expect(issues.length).toBe(32); // All 32 C1 controls
    expect(issues.every(i => i.severity === 'high')).toBe(true);
  });

  test('detects DEL character', () => {
    const text = 'Test\x7FDel';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('delete');
    expect(issues[0].severity).toBe('high');
  });

  test('allows common whitespace by default', () => {
    const text = 'Tab\tLF\nCR\rCRLF\r\n';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(0);
  });

  test('detects common whitespace when includeCommonWhitespace is true', () => {
    const text = 'Tab\tLF\nCR\r';
    const issues = detectControlCharacters(text, 'test.js', 1, { includeCommonWhitespace: true });
    expect(issues.length).toBeGreaterThan(0);
    const subtypes = issues.map(i => i.subtype);
    expect(subtypes).toContain('horizontal-tab');
    expect(subtypes).toContain('line-feed');
    expect(subtypes).toContain('carriage-return');
  });
});

describe('Comprehensive Non-ASCII Detection', () => {
  test('detects Latin-1 Supplement characters', () => {
    const text = 'Café résumé';
    const issues = detectAllNonAscii(text, 'test.js', 1);
    expect(issues.length).toBe(3); // é, é, é
    expect(issues.every(i => i.category === 'Latin-1 Supplement')).toBe(true);
  });

  test('detects various Unicode blocks', () => {
    const text = 'Greek: α, Cyrillic: я, Hebrew: א, Arabic: ع, CJK: 中, Emoji: 🙂';
    const issues = detectAllNonAscii(text, 'test.js', 1);
    expect(issues.length).toBeGreaterThan(5);
    
    const categories = new Set(issues.map(i => i.category));
    expect(categories.has('Greek and Coptic')).toBe(true);
    expect(categories.has('Cyrillic')).toBe(true);
    expect(categories.has('Hebrew')).toBe(true);
    expect(categories.has('Arabic')).toBe(true);
    expect(categories.has('CJK Unified Ideographs')).toBe(true);
  });

  test('detects high Unicode planes', () => {
    const text = '𝕳𝖊𝖑𝖑𝖔'; // Mathematical Alphanumeric Symbols
    const issues = detectAllNonAscii(text, 'test.js', 1);
    // Each character might be represented as surrogate pairs
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.category === 'Mathematical Alphanumeric Symbols')).toBe(true);
  });

  test('detects Private Use Area characters', () => {
    const text = 'Custom: \uE000\uF8FF';
    const issues = detectAllNonAscii(text, 'test.js', 1);
    expect(issues.length).toBe(2);
    expect(issues.every(i => i.category === 'Private Use Area')).toBe(true);
  });

  test('skips control characters', () => {
    const text = 'Test\x00\x1F\x80\x9F';
    const issues = detectAllNonAscii(text, 'test.js', 1);
    expect(issues).toHaveLength(0); // Control chars are handled by control char detector
  });

  test('detects replacement character', () => {
    const text = 'Error: \uFFFD';
    const issues = detectAllNonAscii(text, 'test.js', 1);
    expect(issues.length).toBe(1);
    expect(issues[0].category).toBe('Specials');
    expect(issues[0].charCode).toBe(0xFFFD);
  });
});