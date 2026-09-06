// Satu-kali optimizer asset — jalankan: node _tools/optimize.js
// Backup asli → folder _bak_* (gitignored). Optimasi in-place utk file yg sama.
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");

function bak(src, dir) {
  const target = path.join(ROOT, "_bak_" + dir, path.basename(src));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target)) fs.copyFileSync(src, target);
}

function kb(n) {
  return Math.round(n / 1024) + " KB";
}

function print(label, before, after) {
  const pct = (100 * (1 - after / before)).toFixed(1);
  console.log(`${label.padEnd(36)} ${kb(before).padStart(9)}  ->  ${kb(after).padStart(9)}  (${pct}% turun)`);
}

async function jpegOpt(file, maxDim, quality) {
  bak(file, "images");
  const before = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const buf = await sharp(file, { failOn: "error" })
    .rotate()
    .resize({
      width: meta.width > meta.height ? maxDim : undefined,
      height: meta.height >= meta.width ? maxDim : undefined,
      withoutEnlargement: true,
    })
    .jpeg({ quality, chromaSubsampling: "4:2:0", progressive: true, force: true })
    .toBuffer();
  fs.writeFileSync(file, buf);
  return { file, before, after: buf.length };
}

async function pngOpt(file, maxDim) {
  bak(file, "story");
  const before = fs.statSync(file).size;
  const buf = await sharp(file, { failOn: "error" })
    .rotate()
    .resize({
      width: maxDim,
      height: maxDim,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toBuffer();
  fs.writeFileSync(file, buf);
  return { file, before, after: buf.length };
}

async function main() {
  const report = { images: [], storyConverted: [], storyKept: [], audio: [], errors: [] };

  // ---------- AUDIO ----------
  const ffmpeg = require("ffmpeg-static");
  const audioJobs = [
    ["assets/audio/ot-1.mp3", "assets/audio/ot-1.mp3"],
    ["assets/audio/background-music-4.mp3", "assets/audio/background-music-4.mp3"],
  ];
  for (const [src, out] of audioJobs) {
    const full = path.join(ROOT, src);
    bak(full, "audio");
    const before = fs.statSync(full).size;
    try {
      execFileSync(
        ffmpeg,
        ["-y", "-hide_banner", "-loglevel", "error", "-i", full, "-vn", "-ac", "2", "-ar", "44100", "-b:a", "96k", full],
        { stdio: "ignore" }
      );
      const after = fs.statSync(full).size;
      report.audio.push({ file: src, before, after });
    } catch (e) {
      report.errors.push(src + ": " + e.message.split("\n").pop());
    }
  }

  // ---------- GALLERY / COUPLE JPG ----------
  const jpgs = [
    "assets/images/g1.JPG", "assets/images/g3.JPG", "assets/images/g6.JPG",
    "assets/images/g7.JPG", "assets/images/g8.JPG", "assets/images/g12.JPG",
    "assets/images/g13.JPG", "assets/images/g14.JPG",
    "assets/images/pria.jpeg", "assets/images/wanita.jpeg",
  ];
  for (const f of jpgs) {
    const maxDim = f.toLowerCase().includes("pria") || f.toLowerCase().includes("wanita") ? 900 : 1440;
    const q = maxDim === 900 ? 80 : 76;
    try {
      report.images.push({ result: await jpegOpt(path.join(ROOT, f), maxDim, q), q });
    } catch (e) {
      report.errors.push(f + ": " + e.message);
    }
  }

  // ---------- STORY PNG (1-8) ----------
  for (let i = 1; i <= 8; i++) {
    const file = `assets/story/${i}.png`;
    const full = path.join(ROOT, file);
    const meta = await sharp(full).metadata();
    const { width, height } = meta;
    const opaqueFlat = meta.channels === 3 && meta.hasAlpha === false;
    if (opaqueFlat && Math.max(width, height) > 700) {
      // Foto/ilustrasi penuh warna tanpa transparansi → JPG jauh lebih ringan
      bak(full, "story");
      const before = fs.statSync(full).size;
      try {
        const buf = await sharp(full, { failOn: "error" })
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, chromaSubsampling: "4:2:0", progressive: true })
          .toBuffer();
        fs.writeFileSync(path.join(ROOT, `assets/story/${i}.jpg`), buf);
        report.storyConverted.push({ file, before, after: buf.length, dims: `${width}x${height}` });
      } catch (e) {
        report.errors.push(file + ": " + e.message);
      }
    } else {
      const res = await pngOpt(full, 1600);
      report.storyKept.push({ file: res.file, ...res, dims: `${width}x${height}` });
    }
  }

  // ---------- LAPORAN ----------
  console.log("\n== AUDIO ==");
  for (const a of report.audio) print(a.file, a.before, a.after);
  console.log("\n== JPEG ==");
  for (const r of report.images) print(r.result.file, r.result.before, r.result.after);
  console.log("\n== STORY DIKONVERSI KE JPG ==");
  for (const s of report.storyConverted) { print(s.file, s.before, s.after); console.log(`     (dimensi asli ${s.dims} → .jpg dibuat)`); }
  console.log("\n== STORY TETAP PNG (dioptimasi) ==");
  for (const s of report.storyKept) { print(s.file, s.before, s.after); console.log(`     (dimensi ${s.dims})`); }
  if (report.errors.length) {
    console.log("\n== ERROR ==");
    for (const e of report.errors) console.log("  " + e);
  }
}

main().catch((e) => {
  console.error("GAGAL:", e);
  process.exit(1);
});