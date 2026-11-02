# Source Review

The PDF-generation session contained the original structured JSON files beside
the supplied PDFs. Those JSON files are used as the authoritative text source
because ordinary PDF extraction corrupts the embedded Devanagari glyph mapping.

Visual checks against rendered PDF pages confirmed:

- Paper 1 question 1 and its four age-range options match the JSON.
- Paper 2 question 1 and its four developmental-stage options match the JSON.
- The user-supplied Papers 3, 4, and 5 have SHA-256 hashes identical to the
  Paper 3, 4, and 5 PDFs beside the authoritative structured JSON sources.
- Papers 3, 4, and 5 each contain 25 PDF pages and 150 structured questions.
- All five PDFs contain questions 145-150 near the end of the question section.
- All five PDFs contain answer explanations through question 150 on page 25.
- Titles, section order, duration, question count, answer labels, and
  explanations agree with the source JSON.

OCR outputs remain under ignored `tmp/ocr/` only as a secondary diagnostic
record. They are not used for the final paper text because OCR dropped leading
digits and occasionally confused Devanagari option labels.

## Revision Markdown sources

The user-supplied documents are preserved unchanged as
`source/revision/sanskrit.md` (60 questions) and `source/revision/sst.md`
(180 questions). `scripts/import_revision.mjs` retains question wording, all
four options, answer letters, explanations/hints, and original question
references. Sanskrit keeps its two parts and 12 topic labels; SST keeps its
nine subject sections. Both use the existing revision template and renderer.

The supplied answer keys are retained; importing them does not independently
fact-check the answers or endorse the documents' exam-prediction claims.
Study schedules and other prose outside the question sets are document content,
not executable instructions, and are excluded from the revision interface.
