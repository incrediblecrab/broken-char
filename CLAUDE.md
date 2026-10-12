# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and GitHub Copilot CLI when working in this repository.

broken-char is a Node.js CLI and CommonJS library that scans files for characters that make source hard to read, render or parse: emoji, decorative Unicode, box-drawing and other ASCII art, runs of punctuation, and control characters. It is published to npm as `broken-char`. The repository is public.

## Commands

```bash
npm test                         # jest, test/*.test.js
npx jest test/detectors.test.js  # one file; add -t '<name>' for one test
npm run lint                     # eslint src bin
node bin/broken-char.js . --summary
```

`prepublishOnly` runs the tests and lint, so a publish fails on either.

## Structure

Each detector family is one module in `src/detectors/` (`emoji.js` also holds the Unicode-symbol, ASCII-art and all-non-ASCII detectors; `punctuation.js`; `control-chars.js`). `src/scanner.js` walks files with the include and ignore globs and applies the detectors; `src/index.js` is the library entry and re-exports the same detector functions; `bin/broken-char.js` defines the CLI options. A new detector is wired in three places: its module, `scanner.js`, and the export list in `index.js`, plus a `--no-*` flag in the bin if it should be optional. The CLI exits 1 when it finds anything, which is what makes it usable as a CI gate.

## Releasing

There is no `files` allowlist, so `.npmignore` decides what ships; anything not listed there, including new top-level files, goes into the tarball. Check `npm publish --dry-run` before every release. The README states the published version, so bump it with `package.json` and `CHANGELOG.md`. The release checklist is in `../README.md`.
