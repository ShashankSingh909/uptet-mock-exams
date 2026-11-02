import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sets = {
  sanskrit: { file: "rev-sanskrit60", title: "संस्कृत — 60 चुनिंदा प्रश्न", count: 60 },
  sst: { file: "sst-rev-mock180", title: "सामाजिक अध्ययन — मॉक पेपरों से 180 चुनिंदा प्रश्न", count: 180 },
};

export function parseRevision(markdown, id) {
  const config = sets[id];
  if (!config) throw new Error(`Unknown revision set: ${id}`);
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const topics = new Map();
  const answers = new Map();
  const records = [];
  let section = "";
  let current = null;

  for (const line of lines) {
    const topic = line.match(/^\|\s*([^|]+?)\s*\|\s*\d+\s*\|\s*([\d,\s]+)\s*\|$/);
    if (id === "sanskrit" && topic) {
      for (const number of topic[2].split(",").map(Number)) topics.set(number, topic[1].trim());
    }
    const heading = line.match(/^## भाग \d+:\s*(.+?)\s*\(\d+ प्रश्न\)/);
    if (heading) section = heading[1];
    const sanskritPart = line.match(/^## भाग (\d+) \(प्र\. (\d+)[–-](\d+),/);
    if (id === "sanskrit" && sanskritPart) section = `भाग ${sanskritPart[1]} — प्रश्न ${sanskritPart[2]}–${sanskritPart[3]}`;
    const question = line.match(/^(?:- )?\*\*(\d+)\.\*\*\s*(.+)$/);
    if (question) {
      current = { number: Number(question[1]), section, content: question[2] };
      records.push(current);
    } else if (current && /^\(A\)/.test(line.trim())) {
      current.content += ` ${line.trim()}`;
    }
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length === 4 && /^\d+$/.test(cells[0]) && /^(?:\*\*)?[A-D](?:\*\*)?(?:\s|$)/.test(cells[1])) {
      const number = Number(cells[0]);
      if (answers.has(number)) throw new Error(`Duplicate answer: ${number}`);
      answers.set(number, {
        answer: cells[1].replaceAll("**", "")[0].toLowerCase(),
        explanation: cells[2],
        sourceReference: cells[3],
      });
    }
  }

  if (records.length !== config.count) throw new Error(`Expected ${config.count} questions, found ${records.length}`);
  if (answers.size !== config.count) throw new Error(`Expected ${config.count} answers, found ${answers.size}`);
  const questions = records.map((record, index) => {
    if (record.number !== index + 1) throw new Error(`Nonsequential question: ${record.number}`);
    const optionStart = record.content.indexOf("(A)");
    const optionText = record.content.slice(optionStart);
    const options = [...optionText.matchAll(/\(([A-D])\)\s*([\s\S]*?)(?=\s*\([A-D]\)|$)/g)].map((match) => ({
      id: match[1].toLowerCase(),
      label: match[1],
      text: match[2].replace(/\s*·\s*$/, "").trim(),
    }));
    if (optionStart < 0 || options.map((option) => option.id).join("") !== "abcd" || options.some((option) => !option.text)) {
      throw new Error(`Invalid options: ${record.number}`);
    }
    const answer = answers.get(record.number);
    const topic = id === "sanskrit" ? topics.get(record.number) : record.section;
    if (!answer || !answer.explanation || !answer.sourceReference || !topic) throw new Error(`Incomplete question or answer: ${record.number}`);
    return {
      number: record.number,
      section: record.section,
      ...(id === "sanskrit" ? { topic } : {}),
      text: record.content.slice(0, optionStart).replace(/\s*—\s*$/, "").trim(),
      options,
      ...answer,
    };
  });
  return {
    id: config.file,
    paperNumber: config.title,
    title: config.title,
    subtitle: `${id === "sanskrit" ? "12 टॉपिक" : "9 विषय"} • मूल प्रश्नों के संदर्भ सहित`,
    sourceTitle: lines.find((line) => line.startsWith("# "))?.slice(2) ?? config.title,
    questions,
  };
}

export async function importRevision(root = path.resolve(import.meta.dirname, "..")) {
  await mkdir(path.join(root, "data"), { recursive: true });
  for (const id of Object.keys(sets)) {
    const source = await readFile(path.join(root, "source", "revision", `${id}.md`), "utf8");
    await writeFile(path.join(root, "data", `${sets[id].file}.json`), `${JSON.stringify(parseRevision(source, id), null, 2)}\n`, "utf8");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importRevision();
