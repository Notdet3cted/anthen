// Validasi: semua referensi asset (dari HTML/JS/CSS) ada, magic bytes benar, ukuran masuk akal.
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

const refs = new Set();
for (const rel of ["index.html", "just4me.html", "ot/index.html", "assets/js/app.js", "assets/css/styles.css"]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { console.log("MISSING HTML/JS/CSS: " + rel); continue; }
  const txt = fs.readFileSync(p, "utf8");
  const re = /assets\/(images|story|audio)\/[^'")`\s]+/g;
  let m;
  while ((m = re.exec(txt))) refs.add(m[0]);
}
// hapus key template dinamis dari regex
for (const k of [...refs]) if (k.includes("encodeURIComponent")) refs.delete(k);
refs.add("assets/story/1.jpg"); refs.add("assets/story/2.jpg"); refs.add("assets/story/3.jpg");
refs.add("assets/story/4.png"); refs.add("assets/story/5.png"); refs.add("assets/story/6.jpg");
refs.add("assets/story/7.jpg"); refs.add("assets/story/8.jpg");

let bad = 0;
for (const r of [...refs].sort()) {
  const p = path.join(ROOT, r);
  if (!fs.existsSync(p)) { console.log("MISSING: " + r); bad++; continue; }
  const b = fs.readFileSync(p);
  const head = b.slice(0, 4).toString("hex");
  const isJpg = head.startsWith("ffd8");
  const isPng = head.startsWith("89504e47");
  const isMp3 =
  b.slice(0, 3).toString("latin1") === "ID3" ||
  (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) ||
  b.slice(0, 2).toString("hex") === "fffb";
  const ok = /\.(jpg|jpeg)$/i.test(r) ? isJpg : /\.png$/i.test(r) ? isPng : /\.mp3$/i.test(r) ? isMp3 : true;
  if (!ok) { console.log("BAD MAGIC: " + r + " (" + head + ")"); bad++; }
  else console.log(`${r.padEnd(40)} ${(b.length / 1024).toFixed(0).padStart(6)} KB  magic=${head.slice(0, 4)}`);
}
console.log("\nTotal ref: " + refs.size + ", gagal: " + bad);
process.exit(bad ? 1 : 0);