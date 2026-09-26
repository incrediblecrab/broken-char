# broken-char

![npm version](https://img.shields.io/npm/v/broken-char) ![MLoT](https://img.shields.io/badge/MLoT-ai-blue)

Broken Char is a Node.js CLI and CommonJS library for finding characters that can make source files hard to read, render or parse. It is published on npm as [`broken-char`](https://www.npmjs.com/package/broken-char) version 1.5.1, matching this repository.

![Demo](https://raw.githubusercontent.com/incrediblecrab/mlot-developer-media/main/gifs/broken-char.gif)

**Objective:** help maintainers audit a repository for control characters, emoji, decorative Unicode, ASCII art and punctuation patterns before those characters surprise an editor, parser or review process.

**Inputs:** Node.js, files or directories on disk, and optional glob include and ignore patterns passed to the CLI.

**Files:**

- [`bin/`](bin/): the `broken-char` executable
- [`src/`](src/): scanner, detectors and the CommonJS package entry point
- [`test/`](test/): Jest coverage for detectors and scanner behavior
- [`CHANGELOG.md`](CHANGELOG.md): release notes
- [`SECURITY.md`](SECURITY.md): security reporting policy
- [`package.json`](package.json): npm metadata, scripts and the `broken-char` bin mapping

**Try it:** `npm install -g broken-char`, then `broken-char . --summary`, or run the checked-out copy with `node bin/broken-char.js --help`.

## CLI reference

`broken-char [path] [options]` scans a file or directory, using `.` when no path is supplied.

Options verified against `bin/broken-char.js`:

- `-p, --pattern <pattern>` sets the glob for files to include; the default is `**/*`.
- `-i, --ignore <patterns...>` adds ignored globs; the defaults skip `node_modules`, `.git`, `dist`, `build`, minified JavaScript and source maps.
- `--no-emoji`, `--no-unicode`, `--no-ascii-art`, `--no-punctuation` and `--no-control-chars` disable detector groups.
- `--all-non-ascii` reports every non-ASCII character instead of only the more targeted Unicode checks.
- `--severity <level>` accepts `all` or `high`; `all` is the default.
- `--json` writes JSON to stdout.
- `--summary` prints only the summary.
- `--max-issues <number>` caps displayed issues; the default is `100`.

The CLI exits `0` when no issues are found and exits `1` when it finds issues or encounters an error.

## What it detects

### Emojis and Unicode

- All emoji characters, using `emoji-regex` detection.
- Unicode symbols such as arrows, mathematical operators and currency symbols.
- The replacement character.

### ASCII art

- Box drawing characters such as `╔`, `╗`, `╚`, `╝`, `║`, `═`, `╠`, `╣`, `╦`, `╩` and `╬`.
- Block elements such as `▀`, `▁`, `▂`, `▃`, `▄`, `▅`, `▆`, `▇` and `█`.
- Geometric shapes such as `■`, `□`, `▢`, `▣`, `▤`, `▥`, `▦`, `▧`, `▨` and `▩`.
- Braille patterns, mathematical symbols and Private Use Area characters.

### Excessive punctuation

- Em dashes and en dashes.
- Multiple consecutive hyphens.
- Excessive exclamation marks or question marks.
- Decorative quote pairs and high punctuation density.

### Control characters

- C0 control characters from `0x00` to `0x1F`, excluding common whitespace such as tab, LF and CR by default.
- C1 control characters from `0x80` to `0x9F`.
- DEL, `0x7F`.
- Control-character findings are high severity except tab, LF and CR.

### Comprehensive non-ASCII detection

When `--all-non-ascii` is enabled, Broken Char reports every character above ASCII range, including Latin Extended, Greek, Cyrillic, Hebrew, Arabic, CJK characters, mathematical symbols, emoji, pictographs and any character with a code point above 127.

## Exit codes

- `0`: no issues found.
- `1`: issues found or an error occurred.

## Library use

```javascript
const { scanFiles, detectEmojis, detectControlCharacters, detectAllNonAscii } = require('broken-char');

const results = await scanFiles('./src', {
  checkEmoji: true,
  checkControlChars: true,
  severity: 'high'
});

console.log(`Found ${results.totalIssues} issues in ${results.fileCount} files`);
```

## Development

```bash
npm install
npm test
npm run lint
```

`npm run lint` checks `src` and `bin` with ESLint. `npm test` runs the Jest tests under `test/`.

## Links

- [npm package](https://www.npmjs.com/package/broken-char)
- [Demo video](https://youtu.be/apuLruNqoIw)
- [MLoT product page](https://mlot.ai/broken-char/)
- [Privacy policy](https://mlot.ai/privacy)
- [Issues](https://github.com/incrediblecrab/broken-char/issues)
- Publisher: [Max's Lab of Things](https://mlot.ai/)

## License

MIT. See [`LICENSE`](LICENSE).
