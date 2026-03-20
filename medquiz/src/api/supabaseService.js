import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * CONFIRMED DB VALUES (from your actual data):
 *
 * topic values:  MEDMCQA, PATH_VQA, VQA_RAD, USMLE Step 1,
 * MEDQA_USMLE, Flashcards, HEADQA, BioASQ
 *
 * tags values:   ["medmcqa"]
 * ["path_vqa", "image_based", "image"]
 * ["vqa_rad",  "image_based", "image"]
 * ["usmle", "step1", "medqa"]
 * ["medqa_usmle"]
 * ["flashcard", "fill-in-the-blank"]
 * ["headqa"]
 *
 * image questions = topic IN ('PATH_VQA', 'VQA_RAD')
 * flashcards      = topic = 'Flashcards'
 * fill-in-blank   = topic = 'Flashcards' AND type = 'fill'
 */

// ── Mode → exact query config ────────────────────────────────
export const MODE_CONFIG = {
  books: {
    label:       "Textbooks",
    icon:        "📚",
    description: "Chapter-by-chapter from standard textbooks",
    // queries by book_name + chapter_name — no topic filter
  },
  datasets: {
    label:       "Exam Datasets",
    icon:        "🗃️",
    description: "Real questions from MEDMCQA, USMLE, HeadQA, BioASQ",
    topics:      ["MEDMCQA", "USMLE Step 1", "MEDQA_USMLE", "HEADQA"],
    excludeTags: ["image_based"],
  },
  flashcards: {
    label:       "Flashcards",
    icon:        "🃏",
    description: "Rapid-fire Anki-style memorization cards",
    topics:      ["Flashcards"],
    typeFilter:  "flashcard",
  },
  fill: {
    label:       "Fill-in-Blank",
    icon:        "✏️",
    description: "Complete the sentence — fill-in-the-blank questions",
    topics:      ["Flashcards"],
    typeFilter:  "fill",
  },
  images: {
    label:       "Image MCQ",
    icon:        "🩻",
    description: "Diagnose from real X-rays, CT scans & histology slides",
    topics:      ["PATH_VQA", "VQA_RAD"],
    requireTag:  "image_based",
  },
  pathology_images: {
    label:       "Pathology Slides",
    icon:        "🔬",
    description: "Histology & pathology image questions (PathVQA)",
    topics:      ["PATH_VQA"],
    requireTag:  "image_based",
  },
  radiology_images: {
    label:       "Radiology Scans",
    icon:        "🩻",
    description: "X-rays, CT, MRI image questions (VQA-RAD)",
    topics:      ["VQA_RAD"],
    requireTag:  "image_based",
  },
};

// ── 1. Distinct subjects ─────────────────────────────────────
export async function getAllSubjects() {
  const { data, error } = await supabase.rpc("get_distinct_subjects");
  if (!error && data?.length) return data.map(r => r.subject).filter(Boolean).sort();

  // Fallback: paginate
  const seen = new Set();
  let from = 0;
  while (true) {
    const { data: page, error: e } = await supabase
      .from("questions").select("subject").range(from, from + 999);
    if (e || !page?.length) break;
    page.forEach(r => { if (r.subject && r.subject !== "unknown") seen.add(r.subject); });
    if (page.length < 1000) break;
    from += 1000;
    if (from > 300000) break;
  }
  return [...seen].sort();
}

// ── 2. Books for a subject ───────────────────────────────────
export async function getBooksForSubject(subject) {
  const { data, error } = await supabase.rpc("get_distinct_books", { p_subject: subject });
  if (!error && data?.length) return data.map(r => r.book_name).filter(Boolean).sort();

  const seen = new Set();
  let from = 0;
  while (true) {
    const { data: page, error: e } = await supabase
      .from("questions").select("book_name, topic")
      .eq("subject", subject).range(from, from + 999);
    if (e || !page?.length) break;
    page.forEach(r => { const v = r.book_name || r.topic; if (v) seen.add(v); });
    if (page.length < 1000) break;
    from += 1000;
    if (from > 50000) break;
  }
  return [...seen].sort();
}

// ── 3. Chapters for a book ───────────────────────────────────
export async function getChaptersForBook(subject, bookName) {
  const { data: rpc, error: rpcErr } = await supabase
    .rpc("get_distinct_chapters", { p_subject: subject, p_book: bookName });

  let chapters = [];
  if (!rpcErr && rpc?.length) {
    chapters = rpc.map(r => r.chapter_name).filter(Boolean);
  } else {
    const seen = new Set();
    let from = 0;
    while (true) {
      const { data: page, error: e } = await supabase
        .from("questions").select("chapter_name")
        .eq("subject", subject)
        .or(`book_name.eq.${bookName},topic.eq.${bookName}`)
        .range(from, from + 999);
      if (e || !page?.length) break;
      page.forEach(r => { if (r.chapter_name) seen.add(r.chapter_name); });
      if (page.length < 1000) break;
      from += 1000;
      if (from > 50000) break;
    }
    chapters = [...seen];
  }

  if (chapters.length === 0) {
    const { count } = await supabase.from("questions").select("id", { count:"exact", head:true })
      .eq("subject", subject).or(`book_name.eq.${bookName},topic.eq.${bookName}`);
    const n = Math.max(1, Math.ceil((count ?? 20) / 20));
    return Array.from({ length: n }, (_, i) => ({
      name: `Chapter ${i+1}`, subject, book: bookName,
      chapter: null, offset: i*20, useOffset: true,
    }));
  }

  return chapters
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? "999");
      const nb = parseInt(b.match(/\d+/)?.[0] ?? "999");
      return na - nb;
    })
    .map(c => ({ name: c, subject, book: bookName, chapter: c, offset: 0, useOffset: false }));
}

// ── 4. Subject stats ─────────────────────────────────────────
export async function getSubjectStats(subject) {
  const [{ count: total }, { count: imageCount }] = await Promise.all([
    supabase.from("questions").select("id", { count:"exact", head:true }).eq("subject", subject),
    supabase.from("questions").select("id", { count:"exact", head:true })
      .eq("subject", subject).in("topic", ["PATH_VQA", "VQA_RAD"]),
  ]);
  return { total: total ?? 0, imageCount: imageCount ?? 0 };
}

// ── 5. Lesson questions (the core fetch) ─────────────────────
export async function getLessonQuestions(chapterObj, sm2Store = {}) {
  if (typeof chapterObj === "string") {
    chapterObj = { subject: null, book: chapterObj, chapter: null, name: chapterObj };
  }

  const {
    subject,
    book,
    chapter,
    useOffset  = false,
    offset     = 0,
    filterType,   // from mode selection
    filterDiff,   // 0 = all, 1/2/3
    filterSource, // specific topic override
    modeKey,      // "books" | "datasets" | "flashcards" | "images" etc.
  } = chapterObj;

  let query = supabase
    .from("questions")
    .select("id, subject, topic, book_name, chapter_name, question, options, answer, explanation, type, image, difficulty, tags");

  // ── Apply subject filter ──
  if (subject) query = query.eq("subject", subject);

  // ── Apply mode-based topic filter ──
  const conf = modeKey ? MODE_CONFIG[modeKey] : null;

  if (conf?.topics?.length) {
    // Filter by exact topic values from DB
    query = query.in("topic", conf.topics);
  } else if (book && !conf) {
    // Book mode: filter by book_name or topic
    query = query.or(`book_name.eq.${book},topic.eq.${book}`);
  }

  // ── Apply chapter filter (book mode) ──
  if (!useOffset && chapter && !conf?.topics) {
    query = query.eq("chapter_name", chapter);
  }

  // ── Apply type filter ──
  if (conf?.typeFilter) {
    query = query.eq("type", conf.typeFilter);
  } else if (filterType && filterType !== "all") {
    query = query.eq("type", filterType);
  }

  // ── Exclude image questions from non-image modes ──
  if (conf?.excludeTags?.includes("image_based")) {
    query = query.not("topic", "in", '("PATH_VQA","VQA_RAD")');
  }

  // ── Require image tag for image mode ──
  if (conf?.requireTag) {
    query = query.in("topic", conf.topics ?? ["PATH_VQA", "VQA_RAD"]);
  }

  // ── Difficulty filter ──
  if (filterDiff && filterDiff !== 0) {
    query = query.eq("difficulty", Number(filterDiff));
  }

  // ── Pagination ──
  if (useOffset) query = query.range(offset, offset + 39);
  else           query = query.limit(40);

  const { data, error } = await query;
  if (error) { console.error("getLessonQuestions:", error); return []; }

  // Normalise rows
  const normalised = (data ?? []).map(q => {
    let correct_index = 0;
    if      (typeof q.answer === "number")                               correct_index = q.answer;
    else if (typeof q.answer === "string" && !isNaN(parseInt(q.answer))) correct_index = parseInt(q.answer, 10);

    const tags       = Array.isArray(q.tags) ? q.tags : [];
    const isImageRow = ["PATH_VQA","VQA_RAD"].includes(q.topic) || tags.includes("image_based");
    
    // Note: If you previously implemented the image URL fix, ensure q.image parses correctly here.
    const hasImage   = q.image && q.image !== "NULL" && q.image !== "" && q.image.startsWith("http");

    return {
      ...q,
      options:       Array.isArray(q.options) ? q.options : [],
      correct_index,
      image:         hasImage ? q.image : null,
      // Override type for image rows so QuizScreen renders image UI
      type:          isImageRow ? "image_mcq" : (q.type || "mcq"),
    };
  });

  // ── 🎲 FISHER-YATES SHUFFLE ALGORITHM ──
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check which mode the user selected
  const isPractice = chapterObj.gameMode === "practice";

  if (isPractice) {
    // 🎯 PRACTICE MODE: Infinite Replayability
    // Ignores mastery data and picks a completely random 10 questions from the pool
    return shuffleArray(normalised).slice(0, 10);
    
  } else {
    // ⚔️ COMPETITIVE MODE: Strict Mastery Path
    // Uses SM-2 Spaced Repetition to find the exact cards the user needs to learn
    const today = new Date(); today.setHours(0,0,0,0);
    const isDue = id => { const c = sm2Store[id]; return c?.nextReview && new Date(c.nextReview) <= today; };
    
    const due   = normalised.filter(q => isDue(q.id));
    const fresh = normalised.filter(q => !isDue(q.id));
    
    // 1. Grab the 10 most important questions for their progress
    const top10MasteryQuestions = [...due, ...fresh].slice(0, 10);
    
    // 2. Shuffle ONLY those 10 questions so they can't memorize the sequence order
    return shuffleArray(top10MasteryQuestions);
  }
}

// ── Legacy compat ────────────────────────────────────────────
export async function getSyllabusMap(subject) {
  const books = await getBooksForSubject(subject);
  return books.map(b => ({ name:b, subject, topic:b, book:b, offset:0, useOffset:false }));
}