// Generator data/guests.json — daftar tamu resmi (EYD, huruf besar/kecil konsisten)
// Jalankan: node _tools/gen-guests.js
const fs = require("fs");
const path = require("path");

const AKAD = [
  "Robby", "Fardhan", "Desta", "Geizka", "Dio", "Rifqy", "Bima", "Nunug",
  "Ryan", "Martha", "Ahya", "Fatma", "Adin", "Pramudya", "Dyah Ayu",
  "Sonia", "Cika", "Zusrina", "Puji", "Fredita", "Ayu P", "Chintya",
  "Lilis", "Sasa", "Rania", "Pramitha", "Shofi", "Alif", "Dhena", "Nafa",
  "Putri", "Ummy", "Shynes", "Nawang", "Aqilla", "Shofa", "Ivantina",
  "Ari", "Inka", "Yuni", "Salsa", "Yanuar", "Kasbon", "Rois", "Yasmin",
  "Imam", "Idat", "Ista", "Sara", "Tari", "Cici", "Dyah", "Zidna",
  "Nurul", "Alvina", "Mayang", "Meylusi", "Tazkia", "Anisa", "Nailil", "Alba",
];

const NM = [
  "Ova", "Andika", "Dika", "Abdullah", "Yudha", "Wahyu", "Ummi", "Fira",
  "Nurul", "Udin", "Angga Riski", "Ndulet", "Fajar P Charisma", "Putri",
  "Rochmach Nor Rosyidah", "Rizqy Prasetya", "Naim", "Ratih", "Lutvia",
  "Erika", "Ilham", "Khadafi", "Vina", "Ayu", "Huda", "Selamet", "Bagos",
  "Adib", "Gaga", "Nadim", "Adit", "Daus", "Nico", "Bayu", "Rangga",
  "Ravy", "Arip", "Ziya", "Bayu 36", "Lutfi", "Heri", "Farez", "Devi",
  "Mimi", "Anisa", "Naufal Alfian", "Romi", "Dito", "Ifan","Arga","Manarul", "Afif", "Zaenal", "Ulin", "Gilang"
];

const OT = [
  "Bp. Witono", "Bp. Yuli", "Bp. Mashadi", "Bp. Purnomo", "Bp. Roni",
  "Bp. Adi", "Bp. Anjar", "Bp. Suwadi", "Bp. Rury Damarjati", "Bp. Jalal",
  "Bp. Jazuli", "Bp. H. Yazid", "Bp. Supri", "Bp. Sugeng", "Bp. Hanafi",
  "Ustad Mustofa", "Ustad Sayfiq", "Bp. Haris Yosodiningrat",
  "Bp. Yanto Bangsri", "Bp. H. Syafiq",
];

function titleCase(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let id = 1;
const guests = [];

function push(list, tp, prefix) {
  list.forEach(function (name, i) {
    guests.push({
      id: id++,
      slug: slugify(name),
      name: titleCase(name),
      phone: "",
      tp: tp,
      code: prefix + String(i + 1).padStart(3, "0"),
    });
  });
}

push(AKAD, "akad", "BP-");
push(NM, "nm", "GP-");
push(OT, "ot", "OT-");

const output = JSON.stringify({ guests: guests }, null, 2) + "\n";
fs.writeFileSync(path.join(__dirname, "..", "data", "guests.json"), output);

const total = guests.length;
console.log(
  "OK — total " +
    total +
    " tamu (akad " +
    AKAD.length +
    ", nm " +
    NM.length +
    ", ot " +
    OT.length +
    ")"
);