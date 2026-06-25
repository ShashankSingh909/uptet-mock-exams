# UPTET Mock Exams

Two mobile-first UPTET Paper 2 practice exams built from the supplied mock
papers.

## Use Online

Open the GitHub Pages site, choose Paper 1 or Paper 2, and begin the exam.
Opening a paper starts its 2 hour 30 minute timer.

## Use Offline

Download `paper1.html` or `paper2.html` and open the file in a modern browser.
Each paper is self-contained and does not require internet access.

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

The generated `index.html`, `paper1.html`, and `paper2.html` are the published
artifacts.
