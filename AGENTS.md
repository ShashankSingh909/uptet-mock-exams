# Repository Guidelines

## Project Structure & Module Organization

This static site offers UPTET mock exams, shorter subject tests, and untimed revision sheets.

- `src/`: shared CSS, HTML templates, exam UI (`exam-ui.js`), and state logic (`exam-core.mjs`).
- `source/*.json`: authoritative question banks; `data/*.json`: normalized build inputs. SST part files represent smaller tests.
- `source/revision/`: original Sanskrit and SST Markdown documents, imported into `data/rev-sanskrit60.json` and `data/sst-rev-mock180.json`.
- `scripts/`: normalization, Markdown import, HTML generation, and PDF/OCR utilities.
- `tests/`: state, data, generated-output, and browser checks.
- `docs/superpowers/` and `notes/`: design history and source-validation records.
- Root `index.html`, paper HTML files, and `revision-*.html`: committed GitHub Pages artifacts.

## Build, Test, and Development Commands

Run from the repository root with Node.js and pnpm installed:

- `pnpm install`: install development dependencies using the committed lockfile.
- `node scripts/normalize_sources.mjs`: regenerate normalized data after changing JSON source banks.
- `pnpm build`: rebuild the selector, exams, and revision pages; automatically import revision Markdown.
- `pnpm test`: run Node.js tests and Playwright browser smoke tests.
- `node --test tests/revision.test.mjs`: check the imported revision sets.

Build and open `index.html` directly for local use. No development-server command is configured. Edit source files and rebuild rather than hand-editing generated HTML.

## Coding Style & Naming Conventions

Use JavaScript ES modules, two-space indentation, double quotes, semicolons, camelCase functions, uppercase constants, and descriptive kebab-case filenames. Preserve UTF-8 Hindi and Sanskrit. No formatter or linter is configured; match surrounding code.

## Testing Guidelines

Tests use `node:test`, strict assertions, and `playwright-core`. Name unit tests `tests/*.test.mjs`; browser scenarios live in `tests/browser-smoke.mjs`. Set `CHROME_PATH` when Chrome is outside the default Windows location.

Build before running the suite. Cover persistence, timeout, submission, review, and mobile layouts. Preserve each set's question count, sequential numbering, four options, valid answers, and explanations. Revision sheets must remain offline-capable with working question links. No numeric coverage threshold is configured.

## Commit & Pull Request Guidelines

History uses `feat:`, `fix:`, `docs:`, `chore:`, and `data:` with short imperative summaries. Include regenerated artifacts when inputs change. Describe behavior changes, link relevant issues, report validation results, and include mobile screenshots for UI changes. Fetch current GitHub changes before publishing; preserve existing papers and revision sections.
