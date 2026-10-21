import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const [css, paperTemplate, indexTemplate, coreSource, uiSource] =
  await Promise.all([
    readFile(path.join(root, "src", "exam.css"), "utf8"),
    readFile(path.join(root, "src", "paper-template.html"), "utf8"),
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
]) {
  const data = JSON.parse(
    await readFile(path.join(root, "data", `${paperName}.json`), "utf8"),
  );
  if (data.questions.length !== 150) {
    throw new Error(`${paperName} does not contain 150 questions`);
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
    .replace("{{DATA}}", encoded)
    .replace("{{CORE}}", browserCore)
    .replace("{{UI}}", uiSource);
  await writeFile(path.join(root, `${paperName}.html`), html, "utf8");
}
