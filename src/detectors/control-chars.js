// Generate all control characters dynamically
const problematicControlChars = [];

// C0 control characters (0x00-0x1F) - These often display as red blocks
for (let i = 0x00; i <= 0x1F; i++) {
  const names = {
    0x00: 'null-byte',
    0x01: 'start-of-heading',
    0x02: 'start-of-text',
    0x03: 'end-of-text',
    0x04: 'end-of-transmission',
    0x05: 'enquiry',
    0x06: 'acknowledge',
    0x07: 'bell',
    0x08: 'backspace',
    0x09: 'horizontal-tab',
    0x0A: 'line-feed',
    0x0B: 'vertical-tab',
    0x0C: 'form-feed',
    0x0D: 'carriage-return',
    0x0E: 'shift-out',
    0x0F: 'shift-in',
    0x10: 'data-link-escape',
    0x11: 'device-control-1',
    0x12: 'device-control-2',
    0x13: 'device-control-3',
    0x14: 'device-control-4',
    0x15: 'negative-acknowledge',
    0x16: 'synchronous-idle',
    0x17: 'end-of-transmission-block',
    0x18: 'cancel',
    0x19: 'end-of-medium',
    0x1A: 'substitute',
    0x1B: 'escape',
    0x1C: 'file-separator',
    0x1D: 'group-separator',
    0x1E: 'record-separator',
    0x1F: 'unit-separator'
  };

  const descriptions = {
    0x00: 'Null byte - terminates strings in C/C++ - displays as red block',
    0x01: 'Start of Heading - displays as red block',
    0x02: 'Start of Text - displays as red block',
    0x03: 'End of Text - displays as red block',
    0x04: 'End of Transmission - displays as red block',
    0x05: 'Enquiry - displays as red block',
    0x06: 'Acknowledge - displays as red block',
    0x07: 'Bell (BEL) - may trigger system beep',
    0x08: 'Backspace - may cause display issues',
    0x09: 'Horizontal Tab',
    0x0A: 'Line Feed (newline)',
    0x0B: 'Vertical Tab - displays as red block',
    0x0C: 'Form Feed - displays as red block',
    0x0D: 'Carriage Return',
    0x0E: 'Shift Out - displays as red block',
    0x0F: 'Shift In - displays as red block',
    0x10: 'Data Link Escape - displays as red block',
    0x11: 'Device Control 1 (XON) - displays as red block',
    0x12: 'Device Control 2 - displays as red block',
    0x13: 'Device Control 3 (XOFF) - displays as red block',
    0x14: 'Device Control 4 - displays as red block',
    0x15: 'Negative Acknowledge - displays as red block',
    0x16: 'Synchronous Idle - displays as red block',
    0x17: 'End of Transmission Block - displays as red block',
    0x18: 'Cancel - displays as red block',
    0x19: 'End of Medium - displays as red block',
    0x1A: 'Substitute (EOF in Windows) - displays as red block',
    0x1B: 'Escape - ANSI escape sequences',
    0x1C: 'File Separator - displays as red block',
    0x1D: 'Group Separator - displays as red block',
    0x1E: 'Record Separator - displays as red block',
    0x1F: 'Unit Separator - displays as red block'
  };

  problematicControlChars.push({
    name: names[i] || `control-${i}`,
    code: i,
    char: String.fromCharCode(i),
    display: `\\x${i.toString(16).padStart(2, '0').toUpperCase()}`,
    description: descriptions[i] || `Control character ${i} - may display as red block`
  });
}

// DEL character
problematicControlChars.push({
  name: 'delete',
  code: 0x7F,
  char: '\x7F',
  display: '\\x7F',
  description: 'Delete - displays as red block'
});

// C1 control characters (0x80-0x9F) - Extended control characters that often display as red blocks
for (let i = 0x80; i <= 0x9F; i++) {
  const names = {
    0x80: 'padding-character',
    0x81: 'high-octet-preset',
    0x82: 'break-permitted-here',
    0x83: 'no-break-here',
    0x84: 'index',
    0x85: 'next-line',
    0x86: 'start-of-selected-area',
    0x87: 'end-of-selected-area',
    0x88: 'character-tabulation-set',
    0x89: 'character-tabulation-with-justification',
    0x8A: 'line-tabulation-set',
    0x8B: 'partial-line-forward',
    0x8C: 'partial-line-backward',
    0x8D: 'reverse-line-feed',
    0x8E: 'single-shift-two',
    0x8F: 'single-shift-three',
    0x90: 'device-control-string',
    0x91: 'private-use-one',
    0x92: 'private-use-two',
    0x93: 'set-transmit-state',
    0x94: 'cancel-character',
    0x95: 'message-waiting',
    0x96: 'start-of-guarded-area',
    0x97: 'end-of-guarded-area',
    0x98: 'start-of-string',
    0x99: 'single-graphic-character-introducer',
    0x9A: 'single-character-introducer',
    0x9B: 'control-sequence-introducer',
    0x9C: 'string-terminator',
    0x9D: 'operating-system-command',
    0x9E: 'privacy-message',
    0x9F: 'application-program-command'
  };

  problematicControlChars.push({
    name: names[i] || `c1-control-${i}`,
    code: i,
    char: String.fromCharCode(i),
    display: `\\x${i.toString(16).padStart(2, '0').toUpperCase()}`,
    description: 'C1 control character - displays as red block'
  });
}

function detectControlCharacters(text, filePath, lineNumber, options = {}) {
  const issues = [];
  const { 
    includeCommonWhitespace = false,
    severity = 'all'
  } = options;

  // High severity: All C0/C1 control chars except common whitespace (tab, LF, CR)
  // These typically display as red blocks or cause display issues
  const highSeverityChars = new Set();
  
  // Add all C0 control characters (0x00-0x1F) except tab, LF, CR
  for (let i = 0x00; i <= 0x1F; i++) {
    if (i !== 0x09 && i !== 0x0A && i !== 0x0D) {
      highSeverityChars.add(i);
    }
  }
  
  // Add DEL
  highSeverityChars.add(0x7F);
  
  // Add all C1 control characters (0x80-0x9F)
  for (let i = 0x80; i <= 0x9F; i++) {
    highSeverityChars.add(i);
  }

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    if (!includeCommonWhitespace && [0x09, 0x0A, 0x0D].includes(charCode)) {
      continue;
    }

    const controlChar = problematicControlChars.find(cc => cc.code === charCode);
    
    if (controlChar) {
      if (severity === 'high' && !highSeverityChars.has(charCode)) {
        continue;
      }

      issues.push({
        type: 'control-character',
        subtype: controlChar.name,
        char: controlChar.char,
        charCode: charCode,
        display: controlChar.display,
        index: i,
        line: lineNumber,
        file: filePath,
        message: `Control character found: ${controlChar.display} - ${controlChar.description}`,
        severity: highSeverityChars.has(charCode) ? 'high' : 'medium'
      });
    }
  }

  return issues;
}

function getControlCharInfo(charCode) {
  return problematicControlChars.find(cc => cc.code === charCode);
}

module.exports = {
  detectControlCharacters,
  getControlCharInfo,
  problematicControlChars
};