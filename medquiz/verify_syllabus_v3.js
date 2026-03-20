/**
 * SYLLABUS VERIFIER v3
 *
 * Key fixes over v2:
 *  1. Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS, faster)
 *  2. Queries subject-by-subject to avoid statement timeout
 *  3. Uses book_name + chapter_name columns (after fix_book_chapters.sql)
 *  4. Correctly identifies MMLU_* as extra datasets
 *
 * Setup:
 *   Add to your .env:  SUPABASE_SERVICE_KEY=your_service_role_key
 *   (Find it in Supabase → Project Settings → API → service_role)
 *
 * Run: node verify_syllabus_v3.js
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync }  from "fs";
import * as dotenv        from "dotenv";
dotenv.config();

// Use service role key to bypass RLS and avoid timeouts
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn("⚠️  SUPABASE_SERVICE_KEY not set — using anon key (may timeout on large tables)");
  console.warn("   Add SUPABASE_SERVICE_KEY=your_service_role_key to .env for best results\n");
}

// ── Known dataset topics ──────────────────────────────────────
const DATASET_TOPICS = new Set([
  "MEDMCQA","PATH_VQA","VQA_RAD","Flashcards",
  "USMLE Step 1","MEDQA_USMLE","HEADQA","BioASQ",
]);

// MMLU and other extra datasets
const MMLU_PREFIXES = ["MMLU_","PUBMED_QA","MMLU_VIROLOGY"];
const isExtraDataset = (s) => MMLU_PREFIXES.some(p => s?.startsWith(p));

const DATASET_LABELS = {
  "MEDMCQA":      { label:"MedMCQA (NEET/AIIMS)",    icon:"🗃️" },
  "USMLE Step 1": { label:"USMLE Step 1",             icon:"🏥" },
  "MEDQA_USMLE":  { label:"MedQA (USMLE)",            icon:"🏥" },
  "HEADQA":       { label:"HeadQA (Spain)",            icon:"🎓" },
  "BioASQ":       { label:"BioASQ (PubMed)",           icon:"🔬" },
  "Flashcards":   { label:"Medical Flashcards (Anki)", icon:"🃏" },
  "PATH_VQA":     { label:"PathVQA — Histology",      icon:"🔬" },
  "VQA_RAD":      { label:"VQA-RAD — Radiology",      icon:"🩻" },
  "MMLU_ANATOMY":          { label:"MMLU Anatomy",          icon:"🎓" },
  "MMLU_COLLEGE_BIOLOGY":  { label:"MMLU College Biology",  icon:"🎓" },
  "MMLU_CLINICAL_KNOWLEDGE":{ label:"MMLU Clinical Knowledge",icon:"🎓"},
  "MMLU_COLLEGE_MEDICINE": { label:"MMLU College Medicine", icon:"🎓" },
  "MMLU_MEDICAL_GENETICS": { label:"MMLU Medical Genetics", icon:"🎓" },
  "MMLU_VIROLOGY":         { label:"MMLU Virology",         icon:"🎓" },
  "PUBMED_QA":             { label:"PubMed QA",             icon:"🔬" },
};

// Subject visual config
const META = {
  anatomy:                   { icon:"🦴", color:"#EF4444", bg:"#3B0A0A", desc:"Gross, micro & neuro anatomy" },
  physiology:                { icon:"⚡", color:"#F59E0B", bg:"#3B2500", desc:"Body systems & homeostasis" },
  pathology:                 { icon:"🔬", color:"#8B5CF6", bg:"#1E0A3B", desc:"Disease mechanisms & slides" },
  pharmacology:              { icon:"💉", color:"#10B981", bg:"#0A2A1E", desc:"Drugs, mechanisms & side effects" },
  microbiology:              { icon:"🦠", color:"#06B6D4", bg:"#0A1E2A", desc:"Bugs, viruses & immunology" },
  biochemistry:              { icon:"🧪", color:"#F97316", bg:"#3B1500", desc:"Pathways & molecular biology" },
  genetics:                  { icon:"🧬", color:"#EC4899", bg:"#3B0A1E", desc:"Inheritance & genomics" },
  nutrition:                 { icon:"🥗", color:"#84CC16", bg:"#1A2A0A", desc:"Vitamins, minerals & dietetics" },
  psychiatry:                { icon:"🧠", color:"#A855F7", bg:"#1E0A3B", desc:"Mental health & psychopharm" },
  radiology:                 { icon:"🩻", color:"#94A3B8", bg:"#1A1A2A", desc:"X-ray, CT, MRI · image MCQs" },
  obgyn:                     { icon:"👶", color:"#F472B6", bg:"#3B0A1E", desc:"Obstetrics & gynaecology" },
  internal_medicine:         { icon:"🫀", color:"#EF4444", bg:"#3B0A0A", desc:"Cardiology, nephrology & more" },
  clinical_medicine:         { icon:"🩺", color:"#3B82F6", bg:"#0A1A3B", desc:"Clinical reasoning & cases" },
  general_medicine:          { icon:"💊", color:"#6366F1", bg:"#0A0A3B", desc:"Broad clinical & preventive" },
  surgery:                   { icon:"🔪", color:"#DC2626", bg:"#3B0A0A", desc:"Operative & post-op care" },
  pediatrics:                { icon:"🧒", color:"#FBBF24", bg:"#3B2500", desc:"Child health & development" },
  anaesthesia:               { icon:"😴", color:"#67E8F9", bg:"#0A2A2A", desc:"Anaesthetic agents & critical care" },
  forensic_medicine:         { icon:"⚖️", color:"#9CA3AF", bg:"#1A1A1A", desc:"Legal medicine & toxicology" },
  social_preventive_medicine:{ icon:"🏥", color:"#34D399", bg:"#0A2A1A", desc:"Epidemiology & biostatistics" },
  ophthalmology:             { icon:"👁️", color:"#60A5FA", bg:"#0A1A3B", desc:"Eye diseases & optics" },
  ent:                       { icon:"👂", color:"#A78BFA", bg:"#1E0A3B", desc:"Ear, nose & throat" },
  dermatology:               { icon:"🩹", color:"#FDE68A", bg:"#3B2A00", desc:"Skin disorders & image Dx" },
  biology:                   { icon:"🌱", color:"#22C55E", bg:"#0A2A0A", desc:"Cell biology & life sciences" },
  dental:                    { icon:"🦷", color:"#E2E8F0", bg:"#1A1A2A", desc:"Oral medicine & surgery" },
  orthopaedics:              { icon:"🦴", color:"#FB923C", bg:"#3B1500", desc:"Fractures & musculoskeletal" },
  research_medicine:         { icon:"📊", color:"#818CF8", bg:"#0A0A3B", desc:"Biostatistics & EBM" },
};

// ── Step 1: Get all distinct subjects ────────────────────────
async function getSubjects() {
  const { data, error } = await supabase.rpc("get_distinct_subjects");
  if (!error && data?.length) return data.map(r => r.subject).filter(Boolean).sort();

  // Fallback: manual distinct
  const { data: rows } = await supabase.from("questions").select("subject").limit(10000);
  const seen = new Set();
  (rows||[]).forEach(r => { if(r.subject && r.subject!=="unknown") seen.add(r.subject); });
  return [...seen].sort();
}

// ── Step 2: Per-subject query — much faster than full scan ────
async function getSubjectData(subject) {
  const result = {
    books:      {},   // bookName → Set<chapterName>
    datasets:   {},   // topic → count
    imageCount: 0,
    types:      {},
  };

  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("topic, book_name, chapter_name, type, image")
      .eq("subject", subject)
      .range(from, from + PAGE - 1);

    if (error) {
      console.error(`  ❌ ${subject}: ${error.message}`);
      break;
    }
    if (!data?.length) break;

    data.forEach(row => {
      const topic   = row.topic   || "";
      const book    = row.book_name || "";
      const chapter = row.chapter_name || "";
      const type    = row.type || "mcq";
      const hasImg  = row.image && row.image !== "NULL" && row.image !== "" && row.image?.startsWith("http");

      // Types
      result.types[type] = (result.types[type]||0) + 1;
      if (hasImg) result.imageCount++;

      if (DATASET_TOPICS.has(topic)) {
        // Known dataset
        result.datasets[topic] = (result.datasets[topic]||0) + 1;
      } else if (isExtraDataset(book)) {
        // MMLU_ / PUBMED_QA stored in book_name
        result.datasets[book] = (result.datasets[book]||0) + 1;
      } else if (book && !isExtraDataset(book)) {
        // Real textbook row
        if (!result.books[book]) result.books[book] = new Set();
        if (chapter && chapter !== book) result.books[book].add(chapter);
      }
    });

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return result;
}

function sortChapters(chSet) {
  return [...chSet].sort((a, b) => {
    const n = s => {
      const m = s.match(/(?:chapter|section|part|unit)\s*(\d+)/i) || s.match(/^(\d+)/);
      return m ? parseInt(m[1]) : 999;
    };
    return n(a) - n(b);
  });
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("🔍 Getting subjects...");
  const subjects = await getSubjects();
  console.log(`   Found ${subjects.length} subjects: ${subjects.join(", ")}\n`);

  const allData = {};

  for (const subject of subjects) {
    process.stdout.write(`   Scanning ${subject}...`);
    const d = await getSubjectData(subject);
    allData[subject] = d;
    const bookCount = Object.keys(d.books).length;
    const dsCount   = Object.keys(d.datasets).length;
    const totalQ    = [...Object.values(d.datasets)].reduce((a,b)=>a+b,0);
    console.log(` ✓  ${totalQ} questions | ${bookCount} books | ${dsCount} datasets`);
  }

  // ── Print report ────────────────────────────────────────────
  console.log("\n" + "═".repeat(72));
  subjects.forEach(s => {
    const d = allData[s];
    console.log(`\n📚 ${s.toUpperCase()}`);
    console.log(`   Types: ${JSON.stringify(d.types)}`);
    if (d.imageCount) console.log(`   🩻 ${d.imageCount} image questions`);

    const bookNames = Object.keys(d.books).sort();
    if (bookNames.length) {
      console.log(`   📖 BOOKS (${bookNames.length}):`);
      bookNames.forEach(book => {
        const chs = sortChapters(d.books[book]);
        console.log(`      "${book}" — ${chs.length} chapters`);
        chs.slice(0,4).forEach(c => console.log(`         • ${c}`));
        if (chs.length > 4) console.log(`         ... +${chs.length-4} more`);
      });
    } else {
      console.log(`   📖 No textbook rows (all dataset rows)`);
    }

    const dsEntries = Object.entries(d.datasets).sort((a,b)=>b[1]-a[1]);
    if (dsEntries.length) {
      console.log(`   🗃️  DATASETS:`);
      dsEntries.forEach(([t,cnt]) => console.log(`      "${t}" — ${cnt.toLocaleString()}`));
    }
  });
  console.log("\n" + "═".repeat(72));

  // ── Generate SYLLABUS.js ────────────────────────────────────
  const lines = [];
  lines.push(`/**`);
  lines.push(` * AUTO-GENERATED SYLLABUS — verify_syllabus_v3.js`);
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` * Copy to: src/data/SYLLABUS.js`);
  lines.push(` */\n`);
  lines.push(`export const SYLLABUS = {`);

  subjects.forEach(s => {
    const d = allData[s];
    const m = META[s] ?? { icon:"📚", color:"#6B7280", bg:"#1A1A1A", desc:"" };
    const lbl = s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());

    lines.push(`\n  ${s}: {`);
    lines.push(`    label:${JSON.stringify(lbl)}, icon:${JSON.stringify(m.icon)},`);
    lines.push(`    color:${JSON.stringify(m.color)}, bg:${JSON.stringify(m.bg)},`);
    lines.push(`    desc:${JSON.stringify(m.desc)},`);
    lines.push(`    hasImages:${d.imageCount > 0},`);

    // Books (sorted, with sorted chapters)
    const bookNames = Object.keys(d.books).sort();
    lines.push(`    books: [`);
    bookNames.forEach(book => {
      const chapters = sortChapters(d.books[book]);
      lines.push(`      { name:${JSON.stringify(book)}, chapters:${JSON.stringify(chapters)} },`);
    });
    if (!bookNames.length) lines.push(`      // No textbook data in DB for this subject`);
    lines.push(`    ],`);

    // Datasets (sorted by count desc)
    const dsEntries = Object.entries(d.datasets).sort((a,b)=>b[1]-a[1]);
    lines.push(`    datasets: [`);
    dsEntries.forEach(([topic, count]) => {
      const dl = DATASET_LABELS[topic] ?? { label:topic, icon:"🗃️" };
      lines.push(`      { topic:${JSON.stringify(topic)}, label:${JSON.stringify(dl.label)}, icon:${JSON.stringify(dl.icon)} }, // ${count.toLocaleString()} Qs`);
    });
    lines.push(`    ],`);
    lines.push(`  },`);
  });

  lines.push(`};\n`);
  lines.push(`export const SUBJECT_LIST = Object.keys(SYLLABUS).sort();\n`);
  lines.push(`export function getSubjectMeta(s) {`);
  lines.push(`  return SYLLABUS[s?.toLowerCase()] ?? {`);
  lines.push(`    label:(s||'').replace(/_/g,' '), icon:'📚', color:'#6B7280',`);
  lines.push(`    bg:'#1A1A1A', desc:'', hasImages:false, books:[], datasets:[],`);
  lines.push(`  };`);
  lines.push(`}\n`);
  lines.push(`export function getStaticBooks(s)    { return SYLLABUS[s?.toLowerCase()]?.books    ?? []; }`);
  lines.push(`export function getStaticDatasets(s) { return SYLLABUS[s?.toLowerCase()]?.datasets ?? []; }`);
  lines.push(`export function getStaticChapters(s, bookName) {`);
  lines.push(`  const book = getStaticBooks(s).find(b => b.name === bookName);`);
  lines.push(`  return book?.chapters ?? [];`);
  lines.push(`}`);

  writeFileSync("actual_syllabus.js", lines.join("\n"), "utf8");
  console.log("\n✅ actual_syllabus.js  →  copy to src/data/syllabus.js");

  // ── Summary JSON ────────────────────────────────────────────
  const summary = {};
  subjects.forEach(s => {
    const d = allData[s];
    summary[s] = {
      imageCount: d.imageCount,
      types: d.types,
      books: Object.fromEntries(
        Object.entries(d.books).map(([b,chs]) => [b, sortChapters(chs)])
      ),
      datasets: Object.fromEntries(
        Object.entries(d.datasets).sort((a,b)=>b[1]-a[1])
      ),
    };
  });
  writeFileSync("syllabus_summary.json", JSON.stringify(summary, null, 2), "utf8");
  console.log("✅ syllabus_summary.json  →  human-readable structure\n");

  // ── Quick table ─────────────────────────────────────────────
  console.log("Subject".padEnd(38) + "Books".padEnd(8) + "Datasets".padEnd(12) + "Images");
  console.log("─".repeat(64));
  subjects.forEach(s => {
    const d = allData[s];
    const bc = Object.keys(d.books).length;
    const dc = Object.keys(d.datasets).length;
    console.log(`${s.padEnd(36)}   ${String(bc).padEnd(8)} ${String(dc).padEnd(12)} ${d.imageCount||0}`);
  });
}

main().catch(console.error);
