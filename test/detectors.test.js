const { 
  detectEmojis, 
  detectUnicodeSymbols, 
  detectAsciiArt 
} = require('../src/detectors/emoji');
const { 
  detectExcessivePunctuation, 
  analyzePunctuationDensity 
} = require('../src/detectors/punctuation');
const { 
  detectControlCharacters 
} = require('../src/detectors/control-chars');

describe('Emoji Detector', () => {
  test('detects emojis', () => {
    const text = 'Hello 👋 World 🌍!';
    const issues = detectEmojis(text, 'test.js', 1);
    expect(issues).toHaveLength(2);
    expect(issues[0].char).toBe('👋');
    expect(issues[1].char).toBe('🌍');
  });

  test('detects no emojis in plain text', () => {
    const text = 'Hello World!';
    const issues = detectEmojis(text, 'test.js', 1);
    expect(issues).toHaveLength(0);
  });
});

describe('Unicode Symbol Detector', () => {
  test('detects unicode symbols', () => {
    const text = 'Price: €100 → $120';
    const issues = detectUnicodeSymbols(text, 'test.js', 1);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.char === '€')).toBe(true);
    expect(issues.some(i => i.char === '→')).toBe(true);
  });

  test('ignores basic ASCII', () => {
    const text = 'Hello World 123!';
    const issues = detectUnicodeSymbols(text, 'test.js', 1);
    expect(issues).toHaveLength(0);
  });
});

describe('ASCII Art Detector', () => {
  test('detects box drawing characters', () => {
    const text = '╔══════╗';
    const issues = detectAsciiArt(text, 'test.js', 1);
    expect(issues.length).toBeGreaterThan(0);
  });

  test('detects replacement character', () => {
    const text = 'Error: �';
    const issues = detectAsciiArt(text, 'test.js', 1);
    // Might match multiple patterns
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some(i => i.char === '\uFFFD')).toBe(true);
  });
});

describe('Punctuation Detector', () => {
  test('detects em dashes', () => {
    const text = 'Hello — World';
    const issues = detectExcessivePunctuation(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('em-dash');
  });

  test('detects en dashes', () => {
    const text = 'Pages 1–10';
    const issues = detectExcessivePunctuation(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('en-dash');
  });

  test('detects multiple hyphens', () => {
    const text = 'Title --- Subtitle';
    const issues = detectExcessivePunctuation(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('multiple-hyphens');
  });

  test('detects excessive exclamation marks', () => {
    const text = 'Wow!!!';
    const issues = detectExcessivePunctuation(text, 'test.js', 1);
    expect(issues).toHaveLength(2); // Matches both excessive-exclamation and mixed-punctuation
    expect(issues.some(i => i.subtype === 'excessive-exclamation')).toBe(true);
  });

  test('detects decorative quotes', () => {
    const text = '"Hello" and \'World\'';
    const issues = detectExcessivePunctuation(text, 'test.js', 1);
    expect(issues).toHaveLength(4);
  });

  test('analyzes punctuation density', () => {
    const text = '!!!...???;;;,,,"""';
    const issue = analyzePunctuationDensity(text, 'test.js', 1);
    expect(issue).not.toBeNull();
    expect(issue.type).toBe('punctuation-density');
    expect(issue.density).toBeGreaterThan(0.15);
  });
});

describe('Control Character Detector', () => {
  test('detects null bytes', () => {
    const text = 'Hello\x00World';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('null-byte');
    expect(issues[0].severity).toBe('high');
  });

  test('detects file separator', () => {
    const text = 'Data\x1CMore Data';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('file-separator');
    expect(issues[0].severity).toBe('high');
  });

  test('detects device control 4', () => {
    const text = 'Text\x14Text';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].subtype).toBe('device-control-4');
    expect(issues[0].severity).toBe('high');
  });

  test('ignores common whitespace by default', () => {
    const text = 'Hello\tWorld\nNew Line\r\n';
    const issues = detectControlCharacters(text, 'test.js', 1);
    expect(issues).toHaveLength(0);
  });

  test('respects severity filter', () => {
    const text = 'Bell\x07Escape\x1B';
    const issues = detectControlCharacters(text, 'test.js', 1, { severity: 'high' });
    // With expanded detection, Bell and Escape are now high severity
    expect(issues).toHaveLength(2);
    expect(issues.every(i => i.severity === 'high')).toBe(true);
  });
});