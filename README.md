# UPTET Mock Exams

Five mobile-first UPTET Paper 2 practice exams built from the supplied mock
papers, plus two Child Development & Pedagogy (CDP) practice sets for the
Special UPTET 2026.

## Use Online

Open [UPTET Mock Exams](https://shashanksingh909.github.io/uptet-mock-exams/),
choose Paper 1 through Paper 5 or CDP 1 / CDP 2, and begin the exam.
Opening a paper starts its 2 hour 30 minute timer.

## Use Offline

Download any file from `paper1.html` through `paper5.html`, `cdp1.html`, or
`cdp2.html` and open it in a
modern browser. Each paper is self-contained and does not require internet
access.

## Exam Behavior

- 150 questions and four options per paper
- progress and original start time persist after closing or reloading
- manual submission unlocks only after all 150 questions are answered
- time expiry submits automatically
- answers and explanations remain hidden until submission
- only the latest completed attempt is retained for review
- Start New Attempt preserves the latest completed review

Progress is stored in the current browser. It does not synchronize across
phones, computers, browsers, private browsing sessions, or cleared site data.

## Development

```powershell
pnpm install
pnpm build
pnpm test
```

The generated `index.html`, `paper1.html` through `paper5.html`, `cdp1.html`,
and `cdp2.html` are the published artifacts.

`source/cdp1.json` and `source/cdp2.json` were converted from the two Special
UPTET 2026 CDP question-bank docs (150 questions each, with answer keys and
explanations). Set `CHROME_PATH` to run the browser tests outside Windows.
