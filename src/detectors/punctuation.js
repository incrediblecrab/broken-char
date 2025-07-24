const excessivePunctuationPatterns = [
  {
    name: 'em-dash',
    pattern: /—/g,
    char: '—',
    message: 'Em dash (—) found'
  },
  {
    name: 'en-dash',
    pattern: /–/g,
    char: '–',
    message: 'En dash (–) found'
  },
  {
    name: 'multiple-hyphens',
    pattern: /--+/g,
    message: 'Multiple consecutive hyphens found'
  },
  {
    name: 'excessive-exclamation',
    pattern: /!{2,}/g,
    message: 'Multiple exclamation marks found'
  },
  {
    name: 'excessive-question',
    pattern: /\?{2,}/g,
    message: 'Multiple question marks found'
  },
  {
    name: 'mixed-punctuation',
    pattern: /[!?]{2,}/g,
    message: 'Mixed excessive punctuation found'
  },
  {
    name: 'ellipsis-variants',
    pattern: /\.{4,}|…{2,}/g,
    message: 'Excessive ellipsis found'
  },
  {
    name: 'decorative-quotes',
    pattern: /[""''«»]/g,
    message: 'Decorative quote marks found'
  }
];

function detectExcessivePunctuation(text, filePath, lineNumber, options = {}) {
  const issues = [];
  const { 
    checkEmDash = true,
    checkEnDash = true,
    checkMultipleHyphens = true,
    checkExcessiveMarks = true,
    checkDecorativeQuotes = true
  } = options;

  for (const patternDef of excessivePunctuationPatterns) {
    if (!checkEmDash && patternDef.name === 'em-dash') continue;
    if (!checkEnDash && patternDef.name === 'en-dash') continue;
    if (!checkMultipleHyphens && patternDef.name === 'multiple-hyphens') continue;
    if (!checkExcessiveMarks && ['excessive-exclamation', 'excessive-question', 'mixed-punctuation', 'ellipsis-variants'].includes(patternDef.name)) continue;
    if (!checkDecorativeQuotes && patternDef.name === 'decorative-quotes') continue;

    let match;
    while ((match = patternDef.pattern.exec(text)) !== null) {
      issues.push({
        type: 'excessive-punctuation',
        subtype: patternDef.name,
        char: match[0],
        index: match.index,
        line: lineNumber,
        file: filePath,
        message: `${patternDef.message}: "${match[0]}"`
      });
    }
  }

  return issues;
}

function analyzePunctuationDensity(text, filePath, lineNumber) {
  const totalChars = text.length;
  if (totalChars === 0) return null;

  const punctuationCount = (text.match(/[—–\-!?.,;:'""`´''«»…]/g) || []).length;
  const density = punctuationCount / totalChars;

  if (density > 0.15) {
    return {
      type: 'punctuation-density',
      density: density,
      line: lineNumber,
      file: filePath,
      message: `High punctuation density: ${(density * 100).toFixed(1)}% of characters are punctuation`
    };
  }

  return null;
}

module.exports = {
  detectExcessivePunctuation,
  analyzePunctuationDensity,
  excessivePunctuationPatterns
};