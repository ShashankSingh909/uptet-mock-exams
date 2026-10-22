# UPTET Mock Exams

Five mobile-first UPTET Paper 2 practice exams built from the supplied mock
papers, plus Special UPTET 2026 practice sets: two Child Development &
Pedagogy (CDP 1, CDP 2), two Hindi (Hindi 1, Hindi 2), one Sanskrit
(Sanskrit 1), and Social Studies (SST 1).

## Use Online

Open [UPTET Mock Exams](https://shashanksingh909.github.io/uptet-mock-exams/),
choose any paper (Paper 1–5, CDP 1–2, Hindi 1–2, Sanskrit 1, SST 1), and begin
the exam.
Opening a paper starts its 2 hour 30 minute timer.

## Use Offline

Download any generated paper file (`paper1.html` through `paper5.html`,
`cdp1.html`, `cdp2.html`, `hindi1.html`, `hindi2.html`, `sanskrit1.html`, or `sst1.html`)
and open it in a
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

The generated `index.html` and paper HTML files listed above are the published
artifacts.

`source/cdp1.json`, `source/cdp2.json`, `source/hindi1.json`,
`source/hindi2.json`, `source/sanskrit1.json`, and `source/sst1.json` were converted from the
Special UPTET 2026 question-bank docs (150 questions each, with answer keys and
explanations). Set `CHROME_PATH` to run the browser tests outside Windows.
