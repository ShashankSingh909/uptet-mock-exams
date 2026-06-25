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
