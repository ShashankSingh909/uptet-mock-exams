# UPTET Exam Design QA

## Evidence

- Source visual truth: `docs/superpowers/specs/assets/uptet-fast-navigator-concept.png`
- Implementation screenshot: `tmp/qa/implementation-mobile-final.png`
- Full-view comparison: `tmp/qa/mobile-comparison-final.png`
- Focused question/options comparison: `tmp/qa/question-options-comparison-final.png`
- Viewport: 390 x 844
- State: Paper 1, active attempt, question 1, no selected answers

## Findings

No actionable P0, P1, or P2 findings remain.

### Fonts and typography

The implementation preserves the reference's strong Devanagari hierarchy:
compact exam chrome, large tabular timer, blue question number, readable bold
question stem, and lighter option text. System Devanagari fallbacks are used so
the standalone file remains offline. The implementation's question stem is
slightly heavier than the mock, which improves legibility on inexpensive phone
screens and is acceptable.

### Spacing and layout rhythm

The timer, three status columns, section strip, nearby-question navigation,
question content, option rows, and sticky bottom controls follow the same
vertical order and density as the selected mock. On a 390-pixel phone the
nearby strip intentionally shows four numbers instead of five so the
`सभी प्रश्न` control never clips. Touch targets meet the 44-pixel minimum.

### Colors and visual tokens

Teal, blue, amber, violet, green, and white retain the reference's semantic
roles. Contrast remains strong and status is reinforced by text, borders, and
shape rather than color alone.

### Image quality and asset fidelity

The chosen design contains no required photographic or illustrative assets.
The implementation intentionally omits the mock's invented menu/bookmark
glyphs and uses labeled native controls, avoiding fake official branding and
keeping the exam self-contained.

### Copy and content

All visible copy is exam-specific Hindi. Paper title, question number, section,
timer, status counts, options, navigation, submit gating, result, latest review,
and reset language match the approved behavior. The implementation uses the
authoritative structured source accompanying the PDFs rather than OCR guesses.

## Patches Made Since First Comparison

- Reduced the mobile nearby-question strip from five numbers to four to prevent
  overlap with `सभी प्रश्न`.
- Placed Previous, Review, and Save/Next controls in one sticky row.
- Shortened the mobile review action label while retaining its accessible
  meaning.
- Added a proper visually-hidden legend utility so screen-reader text does not
  consume visible space.
- Added a real-browser smoke suite covering persistence, palette navigation,
  timeout submission, 150 explanations, latest-attempt review, reset behavior,
  and desktop overflow.

## Follow-up Polish

- P3: A custom offline Devanagari webfont could make typography closer to the
  generated mock, but it would substantially enlarge each standalone HTML file
  and is not justified for the exam's functional goal.

## Final Result

final result: passed
