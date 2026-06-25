import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createWorker } from "tesseract.js";

const root = path.resolve(import.meta.dirname, "..");
const paperFlag = process.argv.indexOf("--paper");
const paper = paperFlag >= 0 ? process.argv[paperFlag + 1] : "";

if (!["paper1", "paper2"].includes(paper)) {
  throw new Error("Usage: node scripts/ocr_pages.mjs --paper paper1|paper2");
}

const inputDir = path.join(root, "tmp", "rendered", paper);
const outputDir = path.join(root, "tmp", "ocr", paper);
await mkdir(outputDir, { recursive: true });

const pages = (await readdir(inputDir))
  .filter((name) => name.endsWith(".png"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (pages.length !== 25) {
  throw new Error(`Expected 25 rendered pages, found ${pages.length}`);
}

const worker = await createWorker(["hin", "eng"], 1, {
  logger(message) {
    if (message.status === "recognizing text") {
      process.stdout.write(
        `\r${paper}: ${Math.round((message.progress ?? 0) * 100)}%`,
      );
    }
  },
});

await worker.setParameters({
  preserve_interword_spaces: "1",
  user_defined_dpi: "240",
});

for (const [index, page] of pages.entries()) {
  const result = await worker.recognize(path.join(inputDir, page));
  const outputName = `page-${String(index + 1).padStart(2, "0")}.txt`;
  await writeFile(path.join(outputDir, outputName), result.data.text, "utf8");
  process.stdout.write(`\r${paper}: page ${index + 1}/${pages.length} complete\n`);
}

await worker.terminate();
