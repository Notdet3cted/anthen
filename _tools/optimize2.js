// Fase 2: optimasi JPG galeri + foto pasangan + audio. Log ke _tools/optimize2.log
// File dibaca via Buffer utk menghindari sharing-violation saat libvips buka file.
"use strict";
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LOG = [];
const log = (s) => { LOG.push(s); };

async function jpegOptimizeFromBuffer(srcPath, maxDim, quality) {
  const sharp = require("sharp");
  const before = fs.statSync(srcPath).size;
  const input = fs.readFileSync(srcPath); // Buffer → libvips tidak perlu open file
  const meta = await sharp(input).metadata();
  const buf = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width: meta.width > meta.height ? maxDim : undefined,
      height: meta.height >= meta.width ? maxDim : undefined,
      withoutEnlargement: true,
    })
    .jpeg({ quality, chromaSubsampling: "4:2:0", progressive: true })
    .toBuffer();
  fs.writeFileSync(srcPath, buf);
  return { w: meta.width, h: meta.height, before, after: buf.length };
}

function ffmpegEncode(src) {
  return new Promise((resolve, reject) => {
    const ffmpeg = require("ffmpeg-static");
    const out = src + ".tmp.mp3";
    execFile(
      ffmpeg,
      ["-y", "-hide_banner", "-loglevel", "warning", "-i", src, "-vn", "-ac", "2", "-ar", "44100", "-b:a", "96k", out],
      { maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        try {
          fs.copyFileSync(out, src);
          fs.unlinkSync(out);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

(async () => {
  // ---- JPG galeri + pasangan ----
  const jobs = [
    ["assets/images/g1.JPG", 1440, 76],
    ["assets/images/g3.JPG", 1440, 76],
    ["assets/images/g6.JPG", 1440, 76],
    ["assets/images/g7.JPG", 1440, 76],
    ["assets/images/g8.JPG", 1440, 76],
    ["assets/images/g12.JPG", 1440, 76],
    ["assets/images/g13.JPG", 1440, 76],
    ["assets/images/g14.JPG", 1440, 76],
    ["assets/images/pria.jpeg", 900, 80],
    ["assets/images/wanita.jpeg", 900, 80],
  ];
  for (const [rel, dim, q] of jobs) {
    const full = path.join(ROOT, rel);
    try {
      const bakP = path.join(ROOT, "_bak_images", path.basename(rel));
      if (!fs.existsSync(bakP)) fs.copyFileSync(full, bakP);
      const r = await jpegOptimizeFromBuffer(full, dim, q);
      log(`${rel.padEnd(28)} ${r.w}x${r.h}  ${(r.before / 1024).toFixed(0)}KB -> ${(r.after / 1024).toFixed(0)}KB (${(100 * (1 - r.after / r.before)).toFixed(1)}%)`);
    } catch (e) {
      log(`${rel}  ERROR: ${e.message}`);
    }
  }

  // ---- Audio ----
  for (const rel of ["assets/audio/ot-1.mp3", "assets/audio/background-music-4.mp3"]) {
    const full = path.join(ROOT, rel);
    try {
      const bakP = path.join(ROOT, "_bak_audio", path.basename(rel));
      if (!fs.existsSync(bakP)) fs.copyFileSync(full, bakP);
      const before = fs.statSync(full).size;
      await ffmpegEncode(full);
      const after = fs.statSync(full).size;
      log(`${rel.padEnd(28)} ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${(100 * (1 - after / before)).toFixed(1)}%)`);
    } catch (e) {
      log(`${rel}  ERROR: ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, "optimize2.log"), LOG.join("\n"), "utf8");
  console.log(LOG.join("\n"));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});