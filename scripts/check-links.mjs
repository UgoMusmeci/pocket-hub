import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const DIST_DIR = "dist";
const TIMEOUT = 5000;
const RETRIES = 2;

console.log("🔍 Controllo link esterni (PRO MODE)\n");

// ===== UTILS =====
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith(".html") || file.endsWith(".js")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function extractLinks(files) {
  const linkRegex = /https?:\/\/[a-zA-Z0-9./?=_\-&%]+/g;
  const links = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const matches = content.match(linkRegex);
    if (matches) {
      matches.forEach(link => links.add(link));
    }
  }

  return Array.from(links);
}

async function fetchWithRetry(url) {
  for (let i = 0; i <= RETRIES; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT);

      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal
      });

      clearTimeout(timeout);

      return { status: res.status, ok: res.ok };
    } catch (err) {
      if (i === RETRIES) {
        return { error: err.message };
      }
    }
  }
}

// ===== MAIN =====
const files = getAllFiles(DIST_DIR);
const links = extractLinks(files);

console.log(`Trovati ${links.length} link\n`);

let stats = {
  ok: 0,
  httpError: 0,
  timeout: 0,
  failed: 0
};

let report = [];

for (const link of links) {

  if (
    link.includes("w3.org") ||
    link.includes("localhost") ||
    link.includes("react.dev/errors")
  ) {
    continue;
  }

  const result = await fetchWithRetry(link);

  if (result?.ok) {
    stats.ok++;
    console.log(`✅ OK       ${link}`);
  } else if (result?.status) {
    stats.httpError++;
    console.log(`❌ HTTP ${result.status}  ${link}`);
    report.push(`HTTP ${result.status} - ${link}`);
  } else if (result?.error?.includes("aborted")) {
    stats.timeout++;
    console.log(`⏱ TIMEOUT  ${link}`);
    report.push(`TIMEOUT - ${link}`);
  } else {
    stats.failed++;
    console.log(`❌ FAIL     ${link}`);
    report.push(`FAIL - ${link}`);
  }
}

// ===== REPORT =====
console.log("\n=========================");
console.log(`Totali: ${links.length}`);
console.log(`OK: ${stats.ok}`);
console.log(`HTTP Error: ${stats.httpError}`);
console.log(`Timeout: ${stats.timeout}`);
console.log(`Fail: ${stats.failed}`);
console.log("=========================");

// salva file
const reportFile = "link-report.txt";
fs.writeFileSync(
  reportFile,
  report.join("\n") || "Nessun errore trovato"
);

console.log(`\n📄 Report salvato in: ${reportFile}`);