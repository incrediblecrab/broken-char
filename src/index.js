const { scanFiles } = require('./scanner');
const { detectEmojis, detectUnicodeSymbols, detectAsciiArt, detectAllNonAscii } = require('./detectors/emoji');
const { detectExcessivePunctuation, analyzePunctuationDensity } = require('./detectors/punctuation');
const { detectControlCharacters, getControlCharInfo } = require('./detectors/control-chars');

module.exports = {
  scanFiles,
  detectEmojis,
  detectUnicodeSymbols,
  detectAsciiArt,
  detectAllNonAscii,
  detectExcessivePunctuation,
  analyzePunctuationDensity,
  detectControlCharacters,
  getControlCharInfo
};