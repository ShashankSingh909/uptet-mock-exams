# UPTET Offline Exam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce two faithful, self-contained UPTET HTML exams from the supplied PDFs and publish a verified paper selector plus both exams on GitHub Pages.

**Architecture:** Render and OCR both PDFs into reviewed JSON data, validate all 300 question records, and generate two standalone HTML files from one shared exam engine. The runtime stores a versioned active attempt and one latest completed attempt per paper in `localStorage`, calculates time from an immutable start timestamp, and renders active, result, and review states from the same embedded data.

**Tech Stack:** Node.js built-in test runner, vanilla HTML/CSS/JavaScript, Python/PDF rendering and Hindi OCR for source extraction, browser automation for functional and responsive verification, GitHub CLI and GitHub Pages.

---

## File Map

- `source/paper1.pdf`, `source/paper2.pdf`: local source copies used for repeatable extraction; excluded from the published site if repository size or copyright scope makes that preferable.
- `scripts/render_pdfs.py`: render PDF pages into deterministic PNG files.
- `scripts/ocr_pages.py`: run Hindi/English OCR and retain page-level raw text.
- `scripts/parse_paper.py`: convert OCR text into structured question and explanation records.
- `scripts/build.mjs`: validate and embed paper JSON, CSS, and runtime JavaScript into standalone HTML.
- `data/paper1.json`, `data/paper2.json`: reviewed source records.
- `src/exam-core.mjs`: pure state, timer, scoring, attempt, and storage logic.
- `src/exam-ui.mjs`: DOM rendering and interaction wiring.
- `src/exam.css`: selected Fast Navigator visual system.
- `src/index-template.html`, `src/paper-template.html`: generation templates.
- `tests/data.test.mjs`: structural and fidelity checks for extracted paper records.
- `tests/exam-core.test.mjs`: timer, submission, scoring, history, and reset tests.
- `tests/build.test.mjs`: self-contained output and answer-visibility checks.
- `tests/browser-smoke.mjs`: phone and desktop interaction checks.
- `index.html`, `paper1.html`, `paper2.html`: final GitHub Pages artifacts.
- `design-qa.md`: visual comparison and QA gate.

### Task 1: Establish extraction and test harness

**Files:**
- Create: `package.json`
- Create: `scripts/render_pdfs.py`
- Create: `scripts/ocr_pages.py`
- Create: `tests/data.test.mjs`
- Create: `source/.gitkeep`

- [ ] **Step 1: Copy the two supplied PDFs into `source/`**

Use `Copy-Item -LiteralPath` with the exact user-provided paths and verify both copies have 25 pages with `pypdf`.

- [ ] **Step 2: Write the initial failing data test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const paper of ["paper1", "paper2"]) {
  test(`${paper} contains 150 complete questions`, async () => {
    const data = JSON.parse(await readFile(new URL(`../data/${paper}.json`, import.meta.url)));
    assert.equal(data.questions.length, 150);
    assert.deepEqual(data.questions.map((q) => q.number), Array.from({ length: 150 }, (_, i) => i + 1));
    for (const question of data.questions) {
      assert.equal(question.options.length, 4);
      assert.match(question.answer, /^[abcd]$/);
      assert.ok(question.explanation.trim().length > 10);
    }
  });
}
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```powershell
node --test tests/data.test.mjs
```

Expected: FAIL because `data/paper1.json` and `data/paper2.json` do not exist.

- [ ] **Step 4: Implement deterministic page rendering and OCR commands**

`render_pdfs.py` must render every page at a fixed 240 DPI into `tmp/rendered/<paper>/page-NN.png`.

`ocr_pages.py` must produce `tmp/ocr/<paper>/page-NN.txt` using Hindi plus English recognition and UTF-8 output. It must fail clearly if the OCR engine or Hindi language data is unavailable.

- [ ] **Step 5: Render and OCR both papers**

Run both papers independently, allowing the two render/OCR commands to execute in parallel. Preserve raw OCR output for later comparison.

- [ ] **Step 6: Commit the harness**

```powershell
git add package.json scripts tests source/.gitkeep
git commit -m "test: add PDF extraction harness"
```

### Task 2: Parse and review Paper 1

**Files:**
- Create: `scripts/parse_paper.py`
- Create: `data/paper1.json`
- Create: `notes/paper1-ocr-review.md`
- Test: `tests/data.test.mjs`

- [ ] **Step 1: Implement the parser for numbered questions, four labeled options, answer key, and explanation**

The parser must output this stable schema:

```json
{
  "id": "paper1",
  "title": "UPTET 2026 - पूर्ण अभ्यास प्रश्न-पत्र - 1",
  "durationSeconds": 9000,
  "questions": [
    {
      "number": 1,
      "section": "बाल विकास एवं शिक्षाशास्त्र",
      "text": "…",
      "options": [
        {"id": "a", "label": "अ", "text": "…"},
        {"id": "b", "label": "ब", "text": "…"},
        {"id": "c", "label": "स", "text": "…"},
        {"id": "d", "label": "द", "text": "…"}
      ],
      "answer": "d",
      "explanation": "…"
    }
  ]
}
```

- [ ] **Step 2: Generate Paper 1 JSON and run the structural test**

Run:

```powershell
python scripts/parse_paper.py --paper paper1
node --test tests/data.test.mjs
```

Expected: Paper 1 may fail initially on OCR ambiguities; Paper 2 remains missing.

- [ ] **Step 3: Resolve every Paper 1 validation failure against rendered source pages**

Record each manual correction in `notes/paper1-ocr-review.md` with question number, rendered page, OCR value, and corrected value. Do not infer missing content from general knowledge.

- [ ] **Step 4: Add fidelity assertions**

Add assertions for section ranges `1-30`, `31-60`, `61-90`, and `91-150`, plus representative exact strings from the beginning, middle, and end of the paper.

- [ ] **Step 5: Run Paper 1 checks**

Expected: Paper 1 has 150 sequential questions, 600 options, 150 answers, and 150 non-empty explanations.

- [ ] **Step 6: Commit Paper 1 data**

```powershell
git add scripts/parse_paper.py data/paper1.json notes/paper1-ocr-review.md tests/data.test.mjs
git commit -m "data: extract UPTET paper 1"
```

### Task 3: Parse and review Paper 2

**Files:**
- Create: `data/paper2.json`
- Create: `notes/paper2-ocr-review.md`
- Modify: `tests/data.test.mjs`

- [ ] **Step 1: Generate Paper 2 JSON with the same parser**

Run:

```powershell
python scripts/parse_paper.py --paper paper2
```

- [ ] **Step 2: Run the structural test and verify failures identify concrete OCR gaps**

Run:

```powershell
node --test tests/data.test.mjs
```

- [ ] **Step 3: Resolve every Paper 2 validation failure against rendered source pages**

Record corrections in `notes/paper2-ocr-review.md`; never copy corresponding Paper 1 content because the papers differ.

- [ ] **Step 4: Add Paper 2 fidelity assertions**

Check section boundaries and representative exact strings from questions and explanations across the paper.

- [ ] **Step 5: Run complete data checks**

Expected: both papers pass with 300 questions, 1,200 options, 300 answers, and 300 explanations.

- [ ] **Step 6: Commit Paper 2 data**

```powershell
git add data/paper2.json notes/paper2-ocr-review.md tests/data.test.mjs
git commit -m "data: extract UPTET paper 2"
```

### Task 4: Build the exam state engine with TDD

**Files:**
- Create: `src/exam-core.mjs`
- Create: `tests/exam-core.test.mjs`

- [ ] **Step 1: Write failing timer and resume tests**

Test that a new attempt lasts 9,000 seconds, reopening uses the original `startedAt`, and an expired attempt returns a timeout-submission transition.

- [ ] **Step 2: Run tests and verify RED**

```powershell
node --test tests/exam-core.test.mjs
```

- [ ] **Step 3: Implement minimal attempt creation and time calculation**

Use absolute timestamps:

```js
export const DURATION_SECONDS = 9000;
export function remainingSeconds(attempt, now) {
  return Math.max(0, DURATION_SECONDS - Math.floor((now - attempt.startedAt) / 1000));
}
```

- [ ] **Step 4: Write failing answer, manual-submit, timeout-submit, scoring, latest-review, and reset tests**

Tests must prove:

- selection persists by question number
- manual submit rejects incomplete attempts
- timeout submit accepts incomplete attempts
- scoring handles correct, incorrect, and unanswered
- completing a second attempt replaces the first latest record
- new attempt clears active state but preserves latest review

- [ ] **Step 5: Implement the minimal pure functions**

Keep browser storage behind a small adapter so state logic remains directly testable.

- [ ] **Step 6: Run and refactor**

```powershell
node --test tests/exam-core.test.mjs
```

Expected: all state-engine tests pass with no warnings.

- [ ] **Step 7: Commit the engine**

```powershell
git add src/exam-core.mjs tests/exam-core.test.mjs
git commit -m "feat: add persistent exam state engine"
```

### Task 5: Implement the selected Fast Navigator interface

**Files:**
- Create: `src/exam-ui.mjs`
- Create: `src/exam.css`
- Create: `src/paper-template.html`
- Create: `src/index-template.html`
- Create: `scripts/build.mjs`
- Create: `tests/build.test.mjs`

- [ ] **Step 1: Write failing build tests**

Check that generated outputs:

- exist
- contain embedded paper data
- contain no external script, stylesheet, font, or image dependency
- do not render answer/explanation containers in active mode
- include a disabled manual-submit state until all answers are present

- [ ] **Step 2: Run build tests and verify RED**

```powershell
node --test tests/build.test.mjs
```

- [ ] **Step 3: Implement the selector and paper generator**

Generate `index.html`, `paper1.html`, and `paper2.html`. Opening the selector must not create an attempt; loading a paper must create or resume one.

- [ ] **Step 4: Implement active exam UI**

Match the selected concept with:

- sticky teal header
- visible `HH:MM:SS` countdown
- answered, remaining, and review counts
- nearby number strip
- full numbered palette
- long Hindi question and four large options
- Previous, Mark for Review, Save & Next
- completion-gated Submit

- [ ] **Step 5: Implement result, latest review, and reset confirmation**

Review must display the selected answer, correct answer, explanation, and status for all 150 questions. Reset confirmation must preserve latest completed review.

- [ ] **Step 6: Add accessibility and responsive behavior**

Use semantic radios, modal focus management, visible focus rings, status text plus color, 44-pixel targets, 360-pixel phone support, desktop layout, and reduced-motion handling.

- [ ] **Step 7: Build and run all unit checks**

```powershell
node scripts/build.mjs
node --test tests/*.test.mjs
```

- [ ] **Step 8: Commit the UI**

```powershell
git add src scripts/build.mjs tests/build.test.mjs index.html paper1.html paper2.html
git commit -m "feat: build offline UPTET exam interface"
```

### Task 6: Browser verification and Product Design QA

**Files:**
- Create: `tests/browser-smoke.mjs`
- Create: `design-qa.md`

- [ ] **Step 1: Write the browser smoke test before fixing browser-specific behavior**

Cover:

- paper load starts timer
- answer selection survives reload
- palette opens and jumps to a question
- answers/explanations are absent during active mode
- incomplete manual submit stays disabled
- simulated timeout shows results and explanations
- latest review reopens
- new attempt preserves latest review

- [ ] **Step 2: Run against a local HTTP server**

Use phone `390 x 844` and desktop `1440 x 1024` viewports.

- [ ] **Step 3: Capture reference and implementation at the same phone viewport**

Compare the selected generated concept with the active exam state. The implementation may omit the concept's decorative or invented icons, but hierarchy, density, color roles, controls, and spacing must remain faithful.

- [ ] **Step 4: Write `design-qa.md` and fix P0/P1/P2 defects**

Repeat capture and comparison until the report contains:

```text
final result: passed
```

- [ ] **Step 5: Run the full verification set**

```powershell
node scripts/build.mjs
node --test tests/*.test.mjs
git diff --check
```

- [ ] **Step 6: Commit verification**

```powershell
git add tests/browser-smoke.mjs design-qa.md
git commit -m "test: verify UPTET exam experience"
```

### Task 7: Publish and verify GitHub Pages

**Files:**
- Create or modify: `.github/workflows/pages.yml` only if branch-root Pages cannot be enabled directly.
- Modify: `README.md`

- [ ] **Step 1: Repair GitHub CLI authentication context**

The environment currently has an invalid `GH_TOKEN` masking a valid keyring login. For GitHub commands, remove only the process-level `GH_TOKEN`, activate the `ShashankSingh909` keyring account if needed, and rerun `gh auth status`.

- [ ] **Step 2: Create the GitHub repository and push the completed branch**

Use a public repository named `uptet-mock-exams` unless that name already exists. Push the implementation after all checks pass.

- [ ] **Step 3: Make the verified branch the published default**

Merge or fast-forward the completed branch into `main`, push `main`, then configure GitHub Pages from the root or deploy through the Pages workflow.

- [ ] **Step 4: Verify the public site**

Open the Pages URL and confirm:

- selector loads
- both papers open
- no missing assets
- a selected answer persists after reload
- active mode still hides answers

- [ ] **Step 5: Record deployment details**

Update `README.md` with the public URL, local-use instructions, offline limitations, and the fact that browser progress does not sync across devices.

- [ ] **Step 6: Run final repository verification**

```powershell
git status -sb
git log --oneline -5
```

Expected: clean `main`, public Pages URL responding successfully, and no uncommitted files.

