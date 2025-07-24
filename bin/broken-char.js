#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { scanFiles } = require('../src/scanner');
const packageJson = require('../package.json');

program
  .name('broken-char')
  .description('CLI tool to detect problematic characters and writing style issues in codebases')
  .version(packageJson.version);

program
  .argument('[path]', 'Path to scan (file or directory)', '.')
  .option('-p, --pattern <pattern>', 'Glob pattern for files to include', '**/*')
  .option('-i, --ignore <patterns...>', 'Glob patterns for files to ignore', [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.min.js',
    '**/*.map'
  ])
  .option('--no-emoji', 'Disable emoji detection')
  .option('--no-unicode', 'Disable unicode symbol detection')
  .option('--no-ascii-art', 'Disable ASCII art detection')
  .option('--no-punctuation', 'Disable excessive punctuation detection')
  .option('--no-control-chars', 'Disable control character detection')
  .option('--all-non-ascii', 'Enable comprehensive non-ASCII character detection')
  .option('--severity <level>', 'Minimum severity level (all, high)', 'all')
  .option('--json', 'Output results as JSON')
  .option('--summary', 'Show summary only')
  .option('--max-issues <number>', 'Maximum number of issues to display', parseInt, 100)
  .action(async (path, options) => {
    try {
      const config = {
        checkEmoji: options.emoji,
        checkUnicode: options.unicode,
        checkAsciiArt: options.asciiArt,
        checkPunctuation: options.punctuation,
        checkControlChars: options.controlChars,
        checkNonAscii: options.allNonAscii,
        severity: options.severity,
        ignore: options.ignore,
        pattern: options.pattern,
        maxIssues: options.maxIssues
      };

      if (!options.json) {
        console.log(chalk.bold.blue('Broken Char - Scanning for problematic characters...\n'));
      }

      const results = await scanFiles(path, config);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      displayResults(results, options.summary);

      if (results.totalIssues > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

function displayResults(results, summaryOnly) {
  const { issues, totalIssues, fileCount, statistics } = results;

  if (!summaryOnly && totalIssues > 0) {
    console.log(chalk.bold('Issues found:\n'));

    for (const issue of issues) {
      const location = `${issue.file}:${issue.line}:${issue.index}`;
      const typeColor = getTypeColor(issue.type);
      
      console.log(
        chalk.dim(location),
        typeColor(`[${issue.type}]`),
        issue.message
      );

      if (issue.context) {
        console.log(chalk.dim('  Context:'), issue.context);
      }
      console.log();
    }
  }

  console.log(chalk.bold('\nSummary:'));
  console.log(`Files scanned: ${fileCount}`);
  console.log(`Total issues: ${totalIssues}`);
  
  if (statistics) {
    console.log('\nIssues by type:');
    for (const [type, count] of Object.entries(statistics)) {
      if (count > 0) {
        console.log(`  ${type}: ${count}`);
      }
    }
  }

  if (totalIssues === 0) {
    console.log(chalk.green('\nNo problematic characters found!'));
  } else {
    console.log(chalk.yellow(`\nFound ${totalIssues} issue(s)`));
  }
}

function getTypeColor(type) {
  const colors = {
    'emoji': chalk.yellow,
    'unicode-symbol': chalk.cyan,
    'ascii-art': chalk.magenta,
    'control-character': chalk.red,
    'excessive-punctuation': chalk.blue,
    'punctuation-density': chalk.blue,
    'non-ascii': chalk.green
  };
  
  return colors[type] || chalk.white;
}

program.parse();