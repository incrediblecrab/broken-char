const emojiRegex = require('emoji-regex');

// Comprehensive ASCII art and box drawing patterns
const asciiArtPatterns = [
  // Box Drawing (U+2500-U+257F)
  /[\u2500-\u257F]/,
  // Block Elements (U+2580-U+259F)
  /[\u2580-\u259F]/,
  // Geometric Shapes (U+25A0-U+25FF)
  /[\u25A0-\u25FF]/,
  // Miscellaneous Symbols (U+2600-U+26FF)
  /[\u2600-\u26FF]/,
  // Dingbats (U+2700-U+27BF)
  /[\u2700-\u27BF]/,
  // Miscellaneous Mathematical Symbols-A (U+27C0-U+27EF)
  /[\u27C0-\u27EF]/,
  // Supplemental Arrows-A (U+27F0-U+27FF)
  /[\u27F0-\u27FF]/,
  // Braille Patterns (U+2800-U+28FF)
  /[\u2800-\u28FF]/,
  // Miscellaneous Mathematical Symbols-B (U+2980-U+29FF)
  /[\u2980-\u29FF]/,
  // Supplemental Mathematical Operators (U+2A00-U+2AFF)
  /[\u2A00-\u2AFF]/,
  // Miscellaneous Symbols and Arrows (U+2B00-U+2BFF)
  /[\u2B00-\u2BFF]/,
  // Replacement Character
  /\uFFFD/,
  // Private Use Area (often used for custom icons)
  /[\uE000-\uF8FF]/,
  // Specials
  /[\uFFF0-\uFFFF]/
];

function detectEmojis(text, filePath, lineNumber) {
  const issues = [];
  const regex = emojiRegex();
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    issues.push({
      type: 'emoji',
      char: match[0],
      index: match.index,
      line: lineNumber,
      file: filePath,
      message: `Emoji found: ${match[0]}`
    });
  }
  
  return issues;
}

// Detect ALL non-ASCII characters (anything above 0x7F)
function detectAllNonAscii(text, filePath, lineNumber) {
  const issues = [];
  
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    let char = text[i];
    
    // Skip basic ASCII (0x00-0x7F)
    if (code <= 0x7F) continue;
    
    // Skip if it's a control character (will be caught by control char detector)
    if (code >= 0x80 && code <= 0x9F) continue;
    
    // Handle surrogate pairs for characters outside BMP
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xDC00 && low <= 0xDFFF) {
        // Calculate the actual code point
        code = ((code - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
        char = text.substring(i, i + 2);
        i++; // Skip the low surrogate
      }
    }
    let category = 'unknown';
    
    // Categorize the character
    if (code >= 0x00A0 && code <= 0x00FF) category = 'Latin-1 Supplement';
    else if (code >= 0x0100 && code <= 0x017F) category = 'Latin Extended-A';
    else if (code >= 0x0180 && code <= 0x024F) category = 'Latin Extended-B';
    else if (code >= 0x0250 && code <= 0x02AF) category = 'IPA Extensions';
    else if (code >= 0x02B0 && code <= 0x02FF) category = 'Spacing Modifier Letters';
    else if (code >= 0x0300 && code <= 0x036F) category = 'Combining Diacritical Marks';
    else if (code >= 0x0370 && code <= 0x03FF) category = 'Greek and Coptic';
    else if (code >= 0x0400 && code <= 0x04FF) category = 'Cyrillic';
    else if (code >= 0x0500 && code <= 0x052F) category = 'Cyrillic Supplement';
    else if (code >= 0x0530 && code <= 0x058F) category = 'Armenian';
    else if (code >= 0x0590 && code <= 0x05FF) category = 'Hebrew';
    else if (code >= 0x0600 && code <= 0x06FF) category = 'Arabic';
    else if (code >= 0x0700 && code <= 0x074F) category = 'Syriac';
    else if (code >= 0x0750 && code <= 0x077F) category = 'Arabic Supplement';
    else if (code >= 0x1000 && code <= 0x109F) category = 'Myanmar';
    else if (code >= 0x10A0 && code <= 0x10FF) category = 'Georgian';
    else if (code >= 0x1100 && code <= 0x11FF) category = 'Hangul Jamo';
    else if (code >= 0x1200 && code <= 0x137F) category = 'Ethiopic';
    else if (code >= 0x1380 && code <= 0x139F) category = 'Ethiopic Supplement';
    else if (code >= 0x13A0 && code <= 0x13FF) category = 'Cherokee';
    else if (code >= 0x1400 && code <= 0x167F) category = 'Canadian Aboriginal Syllabics';
    else if (code >= 0x1680 && code <= 0x169F) category = 'Ogham';
    else if (code >= 0x16A0 && code <= 0x16FF) category = 'Runic';
    else if (code >= 0x1700 && code <= 0x171F) category = 'Tagalog';
    else if (code >= 0x1720 && code <= 0x173F) category = 'Hanunoo';
    else if (code >= 0x1740 && code <= 0x175F) category = 'Buhid';
    else if (code >= 0x1760 && code <= 0x177F) category = 'Tagbanwa';
    else if (code >= 0x1780 && code <= 0x17FF) category = 'Khmer';
    else if (code >= 0x1800 && code <= 0x18AF) category = 'Mongolian';
    else if (code >= 0x1900 && code <= 0x194F) category = 'Limbu';
    else if (code >= 0x1950 && code <= 0x197F) category = 'Tai Le';
    else if (code >= 0x1980 && code <= 0x19DF) category = 'New Tai Lue';
    else if (code >= 0x1A00 && code <= 0x1A1F) category = 'Buginese';
    else if (code >= 0x1B00 && code <= 0x1B7F) category = 'Balinese';
    else if (code >= 0x1C00 && code <= 0x1C4F) category = 'Lepcha';
    else if (code >= 0x1C50 && code <= 0x1C7F) category = 'Ol Chiki';
    else if (code >= 0x1D00 && code <= 0x1D7F) category = 'Phonetic Extensions';
    else if (code >= 0x1D80 && code <= 0x1DBF) category = 'Phonetic Extensions Supplement';
    else if (code >= 0x1DC0 && code <= 0x1DFF) category = 'Combining Diacritical Marks Supplement';
    else if (code >= 0x1E00 && code <= 0x1EFF) category = 'Latin Extended Additional';
    else if (code >= 0x1F00 && code <= 0x1FFF) category = 'Greek Extended';
    else if (code >= 0x2000 && code <= 0x206F) category = 'General Punctuation';
    else if (code >= 0x2070 && code <= 0x209F) category = 'Superscripts and Subscripts';
    else if (code >= 0x20A0 && code <= 0x20CF) category = 'Currency Symbols';
    else if (code >= 0x2100 && code <= 0x214F) category = 'Letterlike Symbols';
    else if (code >= 0x2150 && code <= 0x218F) category = 'Number Forms';
    else if (code >= 0x2190 && code <= 0x21FF) category = 'Arrows';
    else if (code >= 0x2200 && code <= 0x22FF) category = 'Mathematical Operators';
    else if (code >= 0x2300 && code <= 0x23FF) category = 'Miscellaneous Technical';
    else if (code >= 0x2400 && code <= 0x243F) category = 'Control Pictures';
    else if (code >= 0x2440 && code <= 0x245F) category = 'Optical Character Recognition';
    else if (code >= 0x2460 && code <= 0x24FF) category = 'Enclosed Alphanumerics';
    else if (code >= 0x2500 && code <= 0x257F) category = 'Box Drawing';
    else if (code >= 0x2580 && code <= 0x259F) category = 'Block Elements';
    else if (code >= 0x25A0 && code <= 0x25FF) category = 'Geometric Shapes';
    else if (code >= 0x2600 && code <= 0x26FF) category = 'Miscellaneous Symbols';
    else if (code >= 0x2700 && code <= 0x27BF) category = 'Dingbats';
    else if (code >= 0x27C0 && code <= 0x27EF) category = 'Miscellaneous Mathematical Symbols-A';
    else if (code >= 0x27F0 && code <= 0x27FF) category = 'Supplemental Arrows-A';
    else if (code >= 0x2800 && code <= 0x28FF) category = 'Braille Patterns';
    else if (code >= 0x2900 && code <= 0x297F) category = 'Supplemental Arrows-B';
    else if (code >= 0x2980 && code <= 0x29FF) category = 'Miscellaneous Mathematical Symbols-B';
    else if (code >= 0x2A00 && code <= 0x2AFF) category = 'Supplemental Mathematical Operators';
    else if (code >= 0x2B00 && code <= 0x2BFF) category = 'Miscellaneous Symbols and Arrows';
    else if (code >= 0x2C00 && code <= 0x2C5F) category = 'Glagolitic';
    else if (code >= 0x2C60 && code <= 0x2C7F) category = 'Latin Extended-C';
    else if (code >= 0x2C80 && code <= 0x2CFF) category = 'Coptic';
    else if (code >= 0x2D00 && code <= 0x2D2F) category = 'Georgian Supplement';
    else if (code >= 0x2D30 && code <= 0x2D7F) category = 'Tifinagh';
    else if (code >= 0x2D80 && code <= 0x2DDF) category = 'Ethiopic Extended';
    else if (code >= 0x2E00 && code <= 0x2E7F) category = 'Supplemental Punctuation';
    else if (code >= 0x2E80 && code <= 0x2EFF) category = 'CJK Radicals Supplement';
    else if (code >= 0x2F00 && code <= 0x2FDF) category = 'Kangxi Radicals';
    else if (code >= 0x2FF0 && code <= 0x2FFF) category = 'Ideographic Description Characters';
    else if (code >= 0x3000 && code <= 0x303F) category = 'CJK Symbols and Punctuation';
    else if (code >= 0x3040 && code <= 0x309F) category = 'Hiragana';
    else if (code >= 0x30A0 && code <= 0x30FF) category = 'Katakana';
    else if (code >= 0x3100 && code <= 0x312F) category = 'Bopomofo';
    else if (code >= 0x3130 && code <= 0x318F) category = 'Hangul Compatibility Jamo';
    else if (code >= 0x3190 && code <= 0x319F) category = 'Kanbun';
    else if (code >= 0x31A0 && code <= 0x31BF) category = 'Bopomofo Extended';
    else if (code >= 0x31C0 && code <= 0x31EF) category = 'CJK Strokes';
    else if (code >= 0x31F0 && code <= 0x31FF) category = 'Katakana Phonetic Extensions';
    else if (code >= 0x3200 && code <= 0x32FF) category = 'Enclosed CJK Letters and Months';
    else if (code >= 0x3300 && code <= 0x33FF) category = 'CJK Compatibility';
    else if (code >= 0x3400 && code <= 0x4DBF) category = 'CJK Unified Ideographs Extension A';
    else if (code >= 0x4DC0 && code <= 0x4DFF) category = 'Yijing Hexagram Symbols';
    else if (code >= 0x4E00 && code <= 0x9FFF) category = 'CJK Unified Ideographs';
    else if (code >= 0xA000 && code <= 0xA48F) category = 'Yi Syllables';
    else if (code >= 0xA490 && code <= 0xA4CF) category = 'Yi Radicals';
    else if (code >= 0xAC00 && code <= 0xD7AF) category = 'Hangul Syllables';
    else if (code >= 0xE000 && code <= 0xF8FF) category = 'Private Use Area';
    else if (code >= 0xF900 && code <= 0xFAFF) category = 'CJK Compatibility Ideographs';
    else if (code >= 0xFB00 && code <= 0xFB4F) category = 'Alphabetic Presentation Forms';
    else if (code >= 0xFB50 && code <= 0xFDFF) category = 'Arabic Presentation Forms-A';
    else if (code >= 0xFE00 && code <= 0xFE0F) category = 'Variation Selectors';
    else if (code >= 0xFE10 && code <= 0xFE1F) category = 'Vertical Forms';
    else if (code >= 0xFE20 && code <= 0xFE2F) category = 'Combining Half Marks';
    else if (code >= 0xFE30 && code <= 0xFE4F) category = 'CJK Compatibility Forms';
    else if (code >= 0xFE50 && code <= 0xFE6F) category = 'Small Form Variants';
    else if (code >= 0xFE70 && code <= 0xFEFF) category = 'Arabic Presentation Forms-B';
    else if (code >= 0xFF00 && code <= 0xFFEF) category = 'Halfwidth and Fullwidth Forms';
    else if (code >= 0xFFF0 && code <= 0xFFFF) category = 'Specials';
    else if (code >= 0x10000 && code <= 0x1007F) category = 'Linear B Syllabary';
    else if (code >= 0x10080 && code <= 0x100FF) category = 'Linear B Ideograms';
    else if (code >= 0x10100 && code <= 0x1013F) category = 'Aegean Numbers';
    else if (code >= 0x10140 && code <= 0x1018F) category = 'Ancient Greek Numbers';
    else if (code >= 0x10190 && code <= 0x101CF) category = 'Ancient Symbols';
    else if (code >= 0x101D0 && code <= 0x101FF) category = 'Phaistos Disc';
    else if (code >= 0x10280 && code <= 0x1029F) category = 'Lycian';
    else if (code >= 0x102A0 && code <= 0x102DF) category = 'Carian';
    else if (code >= 0x10300 && code <= 0x1032F) category = 'Old Italic';
    else if (code >= 0x10330 && code <= 0x1034F) category = 'Gothic';
    else if (code >= 0x10380 && code <= 0x1039F) category = 'Ugaritic';
    else if (code >= 0x103A0 && code <= 0x103DF) category = 'Old Persian';
    else if (code >= 0x10400 && code <= 0x1044F) category = 'Deseret';
    else if (code >= 0x10450 && code <= 0x1047F) category = 'Shavian';
    else if (code >= 0x10480 && code <= 0x104AF) category = 'Osmanya';
    else if (code >= 0x10800 && code <= 0x1083F) category = 'Cypriot Syllabary';
    else if (code >= 0x10900 && code <= 0x1091F) category = 'Phoenician';
    else if (code >= 0x10920 && code <= 0x1093F) category = 'Lydian';
    else if (code >= 0x10A00 && code <= 0x10A5F) category = 'Kharoshthi';
    else if (code >= 0x12000 && code <= 0x123FF) category = 'Cuneiform';
    else if (code >= 0x12400 && code <= 0x1247F) category = 'Cuneiform Numbers and Punctuation';
    else if (code >= 0x1D000 && code <= 0x1D0FF) category = 'Byzantine Musical Symbols';
    else if (code >= 0x1D100 && code <= 0x1D1FF) category = 'Musical Symbols';
    else if (code >= 0x1D200 && code <= 0x1D24F) category = 'Ancient Greek Musical Notation';
    else if (code >= 0x1D300 && code <= 0x1D35F) category = 'Tai Xuan Jing Symbols';
    else if (code >= 0x1D360 && code <= 0x1D37F) category = 'Counting Rod Numerals';
    else if (code >= 0x1D400 && code <= 0x1D7FF) category = 'Mathematical Alphanumeric Symbols';
    else if (code >= 0x1F000 && code <= 0x1F02F) category = 'Mahjong Tiles';
    else if (code >= 0x1F030 && code <= 0x1F09F) category = 'Domino Tiles';
    else if (code >= 0x1F100 && code <= 0x1F1FF) category = 'Enclosed Alphanumeric Supplement';
    else if (code >= 0x1F200 && code <= 0x1F2FF) category = 'Enclosed Ideographic Supplement';
    else if (code >= 0x1F300 && code <= 0x1F5FF) category = 'Miscellaneous Symbols and Pictographs';
    else if (code >= 0x1F600 && code <= 0x1F64F) category = 'Emoticons';
    else if (code >= 0x1F650 && code <= 0x1F67F) category = 'Ornamental Dingbats';
    else if (code >= 0x1F680 && code <= 0x1F6FF) category = 'Transport and Map Symbols';
    else if (code >= 0x1F700 && code <= 0x1F77F) category = 'Alchemical Symbols';
    else if (code >= 0x1F780 && code <= 0x1F7FF) category = 'Geometric Shapes Extended';
    else if (code >= 0x1F800 && code <= 0x1F8FF) category = 'Supplemental Arrows-C';
    else if (code >= 0x1F900 && code <= 0x1F9FF) category = 'Supplemental Symbols and Pictographs';
    else if (code >= 0x20000 && code <= 0x2A6DF) category = 'CJK Unified Ideographs Extension B';
    else if (code >= 0x2A700 && code <= 0x2B73F) category = 'CJK Unified Ideographs Extension C';
    else if (code >= 0x2B740 && code <= 0x2B81F) category = 'CJK Unified Ideographs Extension D';
    else if (code >= 0x2F800 && code <= 0x2FA1F) category = 'CJK Compatibility Ideographs Supplement';
    else if (code >= 0xE0000 && code <= 0xE007F) category = 'Tags';
    else if (code >= 0xE0100 && code <= 0xE01EF) category = 'Variation Selectors Supplement';
    else if (code >= 0xF0000 && code <= 0xFFFFF) category = 'Supplementary Private Use Area-A';
    else if (code >= 0x100000 && code <= 0x10FFFF) category = 'Supplementary Private Use Area-B';
    
    issues.push({
      type: 'non-ascii',
      char: char,
      charCode: code,
      index: i,
      line: lineNumber,
      file: filePath,
      category: category,
      message: `Non-ASCII character from ${category}: ${char} (U+${code.toString(16).toUpperCase().padStart(4, '0')})`
    });
  }
  
  return issues;
}

function detectUnicodeSymbols(text, filePath, lineNumber) {
  // This now specifically detects Unicode symbols/punctuation that might be problematic
  const issues = [];
  const unicodeRanges = [
    { start: 0x2000, end: 0x206F, name: 'General Punctuation' },
    { start: 0x2070, end: 0x209F, name: 'Superscripts and Subscripts' },
    { start: 0x20A0, end: 0x20CF, name: 'Currency Symbols' },
    { start: 0x2100, end: 0x214F, name: 'Letterlike Symbols' },
    { start: 0x2150, end: 0x218F, name: 'Number Forms' },
    { start: 0x2190, end: 0x21FF, name: 'Arrows' },
    { start: 0x2200, end: 0x22FF, name: 'Mathematical Operators' },
    { start: 0x2300, end: 0x23FF, name: 'Miscellaneous Technical' },
    { start: 0x2400, end: 0x243F, name: 'Control Pictures' },
    { start: 0x2440, end: 0x245F, name: 'Optical Character Recognition' },
    { start: 0x2460, end: 0x24FF, name: 'Enclosed Alphanumerics' }
  ];
  
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    
    for (const range of unicodeRanges) {
      if (code >= range.start && code <= range.end) {
        issues.push({
          type: 'unicode-symbol',
          char: text[i],
          charCode: code,
          index: i,
          line: lineNumber,
          file: filePath,
          message: `Unicode symbol from ${range.name}: ${text[i]} (U+${code.toString(16).toUpperCase()})`
        });
        break;
      }
    }
  }
  
  return issues;
}

function detectAsciiArt(text, filePath, lineNumber) {
  const issues = [];
  
  for (const pattern of asciiArtPatterns) {
    let match;
    const regex = new RegExp(pattern, 'g');
    
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'ascii-art',
        char: match[0],
        index: match.index,
        line: lineNumber,
        file: filePath,
        message: `ASCII art character found: ${match[0]}`
      });
    }
  }
  
  return issues;
}

module.exports = {
  detectEmojis,
  detectUnicodeSymbols,
  detectAsciiArt,
  detectAllNonAscii
};