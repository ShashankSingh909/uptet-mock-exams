import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const [
  css,
  paperTemplate,
  revisionTemplate,
  indexTemplate,
  coreSource,
  uiSource,
] = await Promise.all([
  readFile(path.join(root, "src", "exam.css"), "utf8"),
  readFile(path.join(root, "src", "paper-template.html"), "utf8"),
  readFile(path.join(root, "src", "revision-template.html"), "utf8"),
  readFile(path.join(root, "src", "index-template.html"), "utf8"),
  readFile(path.join(root, "src", "exam-core.mjs"), "utf8"),
  readFile(path.join(root, "src", "exam-ui.js"), "utf8"),
]);

const browserCore = coreSource.replace(/^export\s+/gm, "");
const indexHtml = indexTemplate.replace("{{CSS}}", css);
await writeFile(path.join(root, "index.html"), indexHtml, "utf8");

for (const paperName of [
  "paper1",
  "paper2",
  "paper3",
  "paper4",
  "paper5",
  "cdp1",
  "cdp2",
  "hindi1",
  "hindi2",
  "sanskrit1",
  "sanskrit2",
  "sanskrit2-extra",
  "sst2",
  "sst3-part1",
  "sst3-part2",
  "sst3-part3",
  "sst3-part4",
  "sst3-part5",
  "sst4-part1",
  "sst4-part2",
  "sst4-part3",
  "sst4-part4",
  "sst4-part5",
  "sst-current",
  "sst1-part1",
  "sst1-part2",
  "sst1-part3",
  "sst1-part4",
  "sst1-part5",
]) {
  const data = JSON.parse(
    await readFile(path.join(root, "data", `${paperName}.json`), "utf8"),
  );
  // One minute per question: 150 for a full paper, 30 for a 30-mark test.
  const expectedCount = data.durationSeconds / 60;
  if (data.questions.length !== expectedCount) {
    throw new Error(`${paperName} does not contain ${expectedCount} questions`);
  }
  const encoded = Buffer.from(JSON.stringify(data), "utf8").toString("base64");
  const shortTitle =
    typeof data.paperNumber === "number"
      ? `मॉक पेपर ${data.paperNumber}`
      : data.paperNumber;
  const html = paperTemplate
    .replace("{{TITLE}}", data.title)
    .replace("{{SHORT_TITLE}}", shortTitle)
    .replace("{{CSS}}", css)
    .replace("{{COUNT}}", String(data.questions.length))
    .replace("{{DATA}}", encoded)
    .replace("{{CORE}}", browserCore)
    .replace("{{UI}}", uiSource);
  await writeFile(path.join(root, `${paperName}.html`), html, "utf8");
}

// Revision pages: every question with only its correct answer and व्याख्या,
// grouped by section, with a jump-to-question list and no timer.
function fillTemplate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in values ? values[key] : match,
  );
}

function renderRevision(data) {
  const groups = [];
  for (const question of data.questions) {
    const section = question.section.replace(/\s*\(प्र(?:\.|श्न)[^)]*\)/, "");
    if (groups.at(-1)?.section !== section) {
      groups.push({ section, questions: [] });
    }
    groups.at(-1).questions.push(question);
  }

  const jump = groups
    .map(
      (group) => `
        <div class="jump-group">
          <p>${group.section}</p>
          <div class="jump-numbers">${group.questions
            .map(
              (question) =>
                `<a href="#q-${question.number}">${question.number}</a>`,
            )
            .join("")}</div>
        </div>`,
    )
    .join("");

  let previousPassage = "";
  const body = groups
    .map(
      (group) => `
      <section class="revision-section">
        <h2 class="revision-section-title">${group.section}</h2>
        ${group.questions
          .map((question) => {
            const correct = question.options.find(
              (option) => option.id === question.answer,
            );
            const passage =
              question.passage && question.passage !== previousPassage
                ? `<div class="passage">${question.passage}</div>`
                : "";
            previousPassage = question.passage;
            // Short answer-key hints were stored as "सही उत्तर: … । hint";
            // the answer line already shows that part.
            const explanation = question.explanation
              .replace(`सही उत्तर: ${correct.text.replace(/<[^>]+>/g, "")}।`, "")
              .trim();
            return `
        <article class="revision-card" id="q-${question.number}">
          ${passage}
          <h3>प्रश्न ${question.number}</h3>
          <div class="revision-question-text">${question.text}</div>
          <p class="revision-answer"><strong>सही उत्तर:</strong> (${correct.label}) ${correct.text}</p>
          ${explanation ? `<div class="answer-explanation"><strong>व्याख्या:</strong> ${explanation}</div>` : ""}
        </article>`;
          })
          .join("")}
      </section>`,
    )
    .join("");

  const shortTitle =
    typeof data.paperNumber === "number"
      ? `मॉक पेपर ${data.paperNumber}`
      : data.paperNumber;
  return fillTemplate(revisionTemplate, {
    TITLE: data.title,
    SHORT_TITLE: shortTitle,
    SUBTITLE: data.subtitle,
    CSS: css,
    COUNT: String(data.questions.length),
    JUMP: jump,
    BODY: body,
  });
}

for (const paperName of [
  "cdp1",
  "cdp2",
  "hindi1",
  "hindi2",
  "sanskrit1",
  "sanskrit2",
  "sanskrit2-extra",
  "sst-rev-history",
  "sst-rev-geography",
  "sst-rev-civics",
  "sst-rev-economics",
  "sst-rev-upgk",
  "sst-rev-pe",
  "sst-rev-pedagogy",
  "sst-rev-top100",
]) {
  const data = JSON.parse(
    await readFile(path.join(root, "data", `${paperName}.json`), "utf8"),
  );
  await writeFile(
    path.join(root, `revision-${paperName}.html`),
    renderRevision(data),
    "utf8",
  );
}
