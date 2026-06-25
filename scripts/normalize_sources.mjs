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
        passage: usesPassage ? activePassage : "",
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
