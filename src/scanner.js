const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const minimatch = require('minimatch');
const { detectEmojis, detectUnicodeSymbols, detectAsciiArt, detectAllNonAscii } = require('./detectors/emoji');
const { detectExcessivePunctuation, analyzePunctuationDensity } = require('./detectors/punctuation');
const { detectControlCharacters } = require('./detectors/control-chars');

async function scanFiles(targetPath, config = {}) {
  const {
    checkEmoji = true,
    checkUnicode = true,
    checkAsciiArt = true,
    checkPunctuation = true,
    checkControlChars = true,
    checkNonAscii = false,  // Off by default as it's very comprehensive
    severity = 'all',
    ignore = ['**/node_modules/**', '**/.git/**'],
    pattern = '**/*',
    maxIssues = 100
  } = config;

  const allIssues = [];
  const statistics = {
    emoji: 0,
    'unicode-symbol': 0,
    'ascii-art': 0,
    'control-character': 0,
    'excessive-punctuation': 0,
    'punctuation-density': 0,
    'non-ascii': 0
  };

  const stat = await fs.stat(targetPath);
  let files = [];

  if (stat.isDirectory()) {
    const globPattern = path.join(targetPath, pattern);
    files = await new Promise((resolve, reject) => {
      glob(globPattern, { ignore, nodir: true }, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });
  } else {
    files = [targetPath];
  }

  const textFileExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.html', '.css', 
    '.scss', '.sass', '.less', '.vue', '.svelte', '.py', '.rb', '.go', 
    '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.swift', '.kt',
    '.rs', '.yaml', '.yml', '.xml', '.toml', '.ini', '.cfg', '.conf',
    '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'
  ];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!textFileExtensions.includes(ext) && ext !== '') {
      continue;
    }

    if (ignore.some(pattern => minimatch(file, pattern))) {
      continue;
    }

    try {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.split('\n');

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const lineNumber = lineIndex + 1;
        const lineIssues = [];

        if (checkEmoji) {
          lineIssues.push(...detectEmojis(line, file, lineNumber));
        }

        if (checkUnicode) {
          lineIssues.push(...detectUnicodeSymbols(line, file, lineNumber));
        }

        if (checkAsciiArt) {
          lineIssues.push(...detectAsciiArt(line, file, lineNumber));
        }

        if (checkPunctuation) {
          lineIssues.push(...detectExcessivePunctuation(line, file, lineNumber));
          const densityIssue = analyzePunctuationDensity(line, file, lineNumber);
          if (densityIssue) {
            lineIssues.push(densityIssue);
          }
        }

        if (checkControlChars) {
          lineIssues.push(...detectControlCharacters(line, file, lineNumber, { severity }));
        }

        if (checkNonAscii) {
          lineIssues.push(...detectAllNonAscii(line, file, lineNumber));
        }

        for (const issue of lineIssues) {
          if (severity === 'high' && issue.severity && issue.severity !== 'high') {
            continue;
          }

          issue.context = getContext(line, issue.index);
          allIssues.push(issue);
          statistics[issue.type]++;

          if (allIssues.length >= maxIssues) {
            break;
          }
        }

        if (allIssues.length >= maxIssues) {
          break;
        }
      }
    } catch (error) {
      if (error.code !== 'EISDIR' && error.code !== 'ENOENT') {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`);
      }
    }

    if (allIssues.length >= maxIssues) {
      break;
    }
  }

  return {
    issues: allIssues,
    totalIssues: allIssues.length,
    fileCount: files.length,
    statistics
  };
}

function getContext(line, index, contextLength = 20) {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(line.length, index + contextLength);
  
  let context = '';
  if (start > 0) context += '...';
  context += line.substring(start, end);
  if (end < line.length) context += '...';
  
  return context;
}

module.exports = {
  scanFiles
};