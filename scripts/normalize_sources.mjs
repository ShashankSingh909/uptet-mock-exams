import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const labels = ["अ", "ब", "स", "द"];
const ids = ["a", "b", "c", "d"];

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
  "sst1",
  "sst2",
  "sst3",
  "sst4",
  "sst5",
]) {
  const source = JSON.parse(
    await readFile(path.join(root, "source", `${paperName}.json`), "utf8"),
  );

  let number = 0;
  const questions = [];

  for (const section of source.sections) {
    let localNumber = 0;
    let activePassage = "";
    let passageRange = null;

    for (const record of section.questions) {
      if (!record.options) {
        activePassage = record.passage;
        const match = activePassage.match(/प्रश्न\s+(\d+)[–-](\d+)/);
        passageRange = match
          ? { start: Number(match[1]), end: Number(match[2]) }
          : null;
        continue;
      }

      number += 1;
      localNumber += 1;
      const usesPassage =
        passageRange &&
        localNumber >= passageRange.start &&
        localNumber <= passageRange.end;

      questions.push({
        number,
        section: section.name,
        sectionInfo: section.info,
        text: record.q,
        passage: usesPassage ? activePassage : (record.passage ?? ""),
        options: record.options.map((text, index) => ({
          id: ids[index],
          label: labels[index],
          text,
        })),
        answer: ids[record.ans],
        explanation: record.exp,
      });
    }
  }

  const normalized = {
    id: paperName,
    paperNumber: source.paper_no,
    title: source.title,
    subtitle: source.subtitle,
    instructions: source.instructions,
    durationSeconds: 9000,
    questions,
  };

  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(
    path.join(root, "data", `${paperName}.json`),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
}

// Short practice tests: SST 3 split into five 30-question parts, one minute
// per question as in the full paper.
const partSize = 30;
const sst3 = JSON.parse(
  await readFile(path.join(root, "data", "sst3.json"), "utf8"),
);
for (let part = 1; part <= sst3.questions.length / partSize; part += 1) {
  const start = (part - 1) * partSize;
  const questions = sst3.questions
    .slice(start, start + partSize)
    .map((question, index) => ({
      ...question,
      number: index + 1,
      section: question.section.replace(/\s*\(प्र\.[^)]*\)/, ""),
    }));
  const range = `मूल प्रश्न ${start + 1}–${start + partSize}`;
  const normalized = {
    id: `sst3-part${part}`,
    paperNumber: `SST 3 — टेस्ट ${part}`,
    title: `${sst3.title} — टेस्ट ${part} (${range})`,
    subtitle: `${sst3.subtitle} • टेस्ट ${part}: 30 प्रश्न, 30 अंक, 30 मिनट`,
    instructions: sst3.instructions.replace("150", "30"),
    durationSeconds: partSize * 60,
    questions,
  };
  await writeFile(
    path.join(root, "data", `sst3-part${part}.json`),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
}
