/**
 * STATIC SYLLABUS
 * Pre-computed from the actual database so the app never needs to
 * scan 200k rows to build navigation. Update this file if you add
 * new content to the database.
 *
 * Structure:
 *   SYLLABUS[subject] = {
 *     label, icon, color, bg,
 *     books: [{ name, chapters: ["Chapter 1: ...", ...] }],
 *     datasets: [{ topic, label, icon }],
 *   }
 */

export const SYLLABUS = {
  anatomy: {
    label:"Anatomy", icon:"🦴", color:"#EF4444", bg:"#3B0A0A",
    desc:"Gross, micro & neuro anatomy",
    books: [
      { name:"Gray's Anatomy for Students", chapters:["Chapter 1: The Body","Chapter 2: Back","Chapter 3: Thorax","Chapter 4: Abdomen","Chapter 5: Pelvis and Perineum","Chapter 6: Lower Limb","Chapter 7: Upper Limb","Chapter 8: Head and Neck"] },
      { name:"Moore's Clinically Oriented Anatomy", chapters:["Chapter 1: Thorax","Chapter 2: Abdomen","Chapter 3: Pelvis and Perineum","Chapter 4: Back","Chapter 5: Lower Limb","Chapter 6: Upper Limb","Chapter 7: Head","Chapter 8: Neck","Chapter 9: Cranial Nerves"] },
      { name:"Netter's Atlas of Human Anatomy", chapters:["Section 1: Head and Neck","Section 2: Back and Spinal Cord","Section 3: Thorax","Section 4: Abdomen","Section 5: Pelvis and Perineum","Section 6: Upper Limb","Section 7: Lower Limb"] },
    ],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  physiology: {
    label:"Physiology", icon:"⚡", color:"#F59E0B", bg:"#3B2500",
    desc:"Body systems & homeostasis",
    books: [
      { name:"Guyton and Hall Textbook of Medical Physiology", chapters:["Unit I: Introduction to Physiology","Unit II: Membrane Physiology, Nerve, and Muscle","Unit III: The Heart","Unit IV: The Circulation","Unit V: The Body Fluids and Kidneys","Unit VI: Blood Cells, Immunity, and Blood Coagulation","Unit VII: Respiration","Unit VIII: Aviation, Space, and Deep-Sea Diving Physiology","Unit IX: The Nervous System: General Principles","Unit X: The Nervous System: Special Senses","Unit XI: Motor and Integrative Neurophysiology","Unit XII: Gastrointestinal Physiology","Unit XIII: Metabolism and Temperature Regulation","Unit XIV: Endocrinology and Reproduction","Unit XV: Sports Physiology"] },
      { name:"Costanzo Physiology", chapters:["Chapter 1: Cellular Physiology","Chapter 2: Autonomic Nervous System","Chapter 3: Neurophysiology","Chapter 4: Cardiovascular Physiology","Chapter 5: Respiratory Physiology","Chapter 6: Renal Physiology","Chapter 7: Acid-Base Physiology","Chapter 8: Gastrointestinal Physiology","Chapter 9: Endocrine Physiology","Chapter 10: Reproductive Physiology"] },
      { name:"Ganong's Review of Medical Physiology", chapters:["Section 1: Cellular & Molecular Basis","Section 2: Central & Peripheral Neurophysiology","Section 3: Endocrine & Reproductive Physiology","Section 4: Gastrointestinal Physiology","Section 5: Cardiovascular Physiology","Section 6: Respiratory Physiology","Section 7: Renal Physiology"] },
    ],
    datasets: [
      { topic:"MEDMCQA",    label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" },
      { topic:"USMLE Step 1", label:"USMLE Step 1",        icon:"🏥" },
      { topic:"MEDQA_USMLE", label:"MedQA (USMLE)",        icon:"🏥" },
    ],
  },

  pathology: {
    label:"Pathology", icon:"🔬", color:"#8B5CF6", bg:"#1E0A3B",
    desc:"Disease mechanisms & slides",
    books: [
      { name:"Robbins and Cotran Pathologic Basis of Disease", chapters:["Chapter 1: Cellular Responses to Stress","Chapter 2: Acute and Chronic Inflammation","Chapter 3: Hemodynamic Disorders, Thromboembolism, and Shock","Chapter 4: Genetic Disorders","Chapter 5: Diseases of the Immune System","Chapter 6: Neoplasia","Chapter 7: Cardiovascular System","Chapter 8: Respiratory System","Chapter 9: Gastrointestinal Tract","Chapter 10: Liver and Biliary Tract","Chapter 11: The Endocrine System","Chapter 12: The Central Nervous System"] },
      { name:"Pathoma (Fundamentals of Pathology)", chapters:["Chapter 1: Growth Adaptations, Cellular Injury, and Cell Death","Chapter 2: Inflammation, Inflammatory Disorders, and Healing","Chapter 3: Principles of Neoplasia","Chapter 4: Hemostasis and Related Disorders","Chapter 5: Red Blood Cell Disorders","Chapter 6: White Blood Cell Disorders","Chapter 7: Vascular Pathology","Chapter 8: Cardiac Pathology","Chapter 9: Respiratory Tract Pathology","Chapter 10: Renal and Urinary Tract Pathology"] },
      { name:"Goljan's Rapid Review Pathology", chapters:["Chapter 1: Cellular Injury","Chapter 2: Inflammation and Repair","Chapter 3: Hemodynamics","Chapter 4: Nutrition and Environmental Pathology","Chapter 5: Neoplasia","Chapter 6: Hematology","Chapter 7: Cardiovascular Pathology","Chapter 8: Respiratory Pathology","Chapter 9: Gastrointestinal Pathology","Chapter 10: Endocrine Pathology"] },
    ],
    datasets: [
      { topic:"MEDMCQA",  label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" },
      { topic:"PATH_VQA", label:"PathVQA — Histology Slides", icon:"🔬" },
    ],
    hasImages: true,
  },

  pharmacology: {
    label:"Pharmacology", icon:"💉", color:"#10B981", bg:"#0A2A1E",
    desc:"Drugs, mechanisms & side effects",
    books: [
      { name:"Katzung's Basic and Clinical Pharmacology", chapters:["Section 1: Basic Principles","Section 2: Autonomic Drugs","Section 3: Cardiovascular-Renal Drugs","Section 4: Drugs Acting on Smooth Muscle","Section 5: Drugs Acting in the CNS","Section 6: Drugs for Blood, Inflammation, and Gout","Section 7: Endocrine Drugs","Section 8: Chemotherapeutic Drugs","Section 9: Toxicology"] },
      { name:"Goodman & Gilman's The Pharmacological Basis of Therapeutics", chapters:["Section 1: General Principles","Section 2: Neuropharmacology","Section 3: Cardiovascular Function","Section 4: Inflammation, Immunomodulation, and Hematopoiesis","Section 5: Endocrine Pharmacology","Section 6: Gastrointestinal Pharmacology","Section 7: Chemotherapy of Infectious Diseases","Section 8: Pharmacotherapy of Neoplastic Disease"] },
      { name:"Lippincott Illustrated Reviews: Pharmacology", chapters:["Unit 1: Principles of Drug Therapy","Unit 2: Drugs Affecting the Autonomic Nervous System","Unit 3: Drugs Affecting the Central Nervous System","Unit 4: Drugs Affecting the Cardiovascular System","Unit 5: Drugs Affecting the Endocrine System","Unit 6: Drugs for Other Disorders (GI, Respiratory)","Unit 7: Chemotherapeutic Drugs"] },
    ],
    datasets: [
      { topic:"MEDMCQA",    label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" },
      { topic:"USMLE Step 1", label:"USMLE Step 1",        icon:"🏥" },
      { topic:"MEDQA_USMLE", label:"MedQA (USMLE)",        icon:"🏥" },
    ],
  },

  microbiology: {
    label:"Microbiology", icon:"🦠", color:"#06B6D4", bg:"#0A1E2A",
    desc:"Bugs, viruses & immunology",
    books: [
      { name:"Murray's Medical Microbiology", chapters:["Section 1: Introduction","Section 2: Principles of Laboratory Diagnosis","Section 3: Basic Concepts in the Immune Response","Section 4: Bacteriology (Gram-Positive & Gram-Negative)","Section 5: Virology (DNA & RNA Viruses)","Section 6: Mycology","Section 7: Parasitology"] },
      { name:"Jawetz, Melnick, & Adelberg's Medical Microbiology", chapters:["Section 1: Fundamentals of Microbiology","Section 2: Immunology","Section 3: Bacteriology","Section 4: Virology","Section 5: Mycology","Section 6: Parasitology","Section 7: Diagnostic Medical Microbiology"] },
      { name:"Clinical Microbiology Made Ridiculously Simple", chapters:["Part 1: Bacteria (Gram-Positive, Gram-Negative, Acid-Fast)","Part 2: Fungi","Part 3: Viruses","Part 4: Parasites","Part 5: Very Strange Bugs (Prions)","Part 6: Antimicrobial Drugs"] },
    ],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  biochemistry: {
    label:"Biochemistry", icon:"🧪", color:"#F97316", bg:"#3B1500",
    desc:"Pathways & molecular biology",
    books: [
      { name:"Harper's Illustrated Biochemistry", chapters:["Section 1: Structures & Functions of Proteins","Section 2: Enzymes","Section 3: Bioenergetics","Section 4: Metabolism of Carbohydrates","Section 5: Metabolism of Lipids","Section 6: Metabolism of Proteins & Amino Acids","Section 7: Structure, Function, & Replication of Informational Macromolecules"] },
      { name:"Lippincott's Illustrated Reviews: Biochemistry", chapters:["Unit 1: Protein Structure and Function","Unit 2: Bioenergetics","Unit 3: Carbohydrate Metabolism","Unit 4: Lipid Metabolism","Unit 5: Nitrogen Metabolism","Unit 6: Molecular Biology"] },
    ],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  genetics: {
    label:"Genetics", icon:"🧬", color:"#EC4899", bg:"#3B0A1E",
    desc:"Inheritance & genomics",
    books: [
      { name:"Thompson & Thompson Genetics in Medicine", chapters:["Chapter 1: Introduction to Genetics","Chapter 2: The Human Genome and Chromosomal Basis","Chapter 3: Gene Structure and Function","Chapter 4: Tools of Human Molecular Genetics","Chapter 5: Principles of Clinical Cytogenetics","Chapter 6: Clinical Cytogenetics: Disorders","Chapter 7: Patterns of Single-Gene Inheritance","Chapter 8: Genetics of Common Disorders","Chapter 9: Genetic Variation in Populations","Chapter 10: Identifying the Genetic Basis for Human Disease","Chapter 11: The Molecular Basis of Genetic Disease","Chapter 12: The Molecular, Biochemical, and Cellular Basis","Chapter 13: The Treatment of Genetic Disease","Chapter 14: Developmental Genetics and Birth Defects","Chapter 15: Cancer Genetics and Genomics","Chapter 16: Risk Assessment and Genetic Counseling","Chapter 17: Prenatal Diagnosis and Screening","Chapter 18: Application of Genomics to Medicine"] },
      { name:"Emery's Elements of Medical Genetics", chapters:["Chapter 1: History and Impact of Genetics","Chapter 2: Cellular and Molecular Basis of Inheritance","Chapter 3: Chromosomes and Cell Division","Chapter 4: Finding the Cause of Monogenic Disorders","Chapter 5: Laboratory Techniques for Diagnosis","Chapter 6: Patterns of Inheritance","Chapter 7: Population and Mathematical Genetics","Chapter 8: Risk Calculation","Chapter 9: Developmental Genetics","Chapter 10: Genetics of Cancer","Chapter 11: Pharmacogenetics and Personalized Medicine"] },
      { name:"Medical Genetics by Jorde, Carey, & Bamshad", chapters:["Chapter 1: Basic Cell Biology: Genes and Chromosomes","Chapter 2: Genetic Variation: Its Origin and Detection","Chapter 3: Autosomal Dominant and Recessive Inheritance","Chapter 4: Sex-Linked and Nontraditional Modes","Chapter 5: Clinical Cytogenetics"] },
    ],
    datasets: [],
  },

  nutrition: {
    label:"Nutrition", icon:"🥗", color:"#84CC16", bg:"#1A2A0A",
    desc:"Vitamins, minerals & dietetics",
    books: [
      { name:"Advanced Nutrition and Human Metabolism (Gropper)", chapters:["Chapter 1: The Cell and Digestive System","Chapter 2: Energy Metabolism","Chapter 3: Water-Soluble Vitamins","Chapter 4: Fat-Soluble Vitamins","Chapter 5: Macrominerals and Microminerals","Chapter 6: Fluid and Electrolyte Balance"] },
      { name:"Krause and Mahan's Food & the Nutrition Care Process", chapters:["Part 1: Nutrition Assessment","Part 2: Nutrition Diagnosis and Intervention","Part 3: Nutrition in the Life Cycle","Part 4: Nutrition for Weight Management","Part 5: Medical Nutrition Therapy for Cardiovascular Disease","Part 6: Medical Nutrition Therapy for GI Disorders","Part 7: Medical Nutrition Therapy for Endocrine Disorders"] },
      { name:"Modern Nutrition in Health and Disease (Shils)", chapters:["Section 1: Specific Dietary Components","Section 2: Vitamins and Minerals","Section 3: Diet and Chronic Disease","Section 4: Nutrition in Metabolic Disorders","Section 5: Nutritional Assessment and Counseling"] },
    ],
    datasets: [],
  },

  psychiatry: {
    label:"Psychiatry", icon:"🧠", color:"#A855F7", bg:"#1E0A3B",
    desc:"Mental health & psychopharm",
    books: [
      { name:"Kaplan & Sadock's Synopsis of Psychiatry", chapters:["Chapter 1: Psychiatric Examination","Chapter 2: Schizophrenia","Chapter 3: Mood Disorders","Chapter 4: Anxiety Disorders","Chapter 5: Psychopharmacology","Chapter 6: Child and Adolescent Psychiatry"] },
      { name:"DSM-5-TR (Diagnostic and Statistical Manual)", chapters:["Chapter 1: Neurodevelopmental Disorders","Chapter 2: Schizophrenia Spectrum","Chapter 3: Bipolar and Related Disorders","Chapter 4: Depressive Disorders","Chapter 5: Anxiety Disorders","Chapter 6: Obsessive-Compulsive Disorders"] },
      { name:"First Aid for the Psychiatry Clerkship", chapters:["Chapter 1: Approach to the Psychiatric Patient","Chapter 2: Psychotic Disorders","Chapter 3: Mood Disorders","Chapter 4: Personality Disorders","Chapter 5: Psychiatric Medications","Chapter 6: Substance-Related Disorders"] },
    ],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  radiology: {
    label:"Radiology", icon:"🩻", color:"#94A3B8", bg:"#1A1A2A",
    desc:"X-ray, CT, MRI · Image MCQs",
    books: [],
    datasets: [
      { topic:"VQA_RAD",  label:"VQA-RAD (X-ray, CT, MRI)", icon:"🩻" },
      { topic:"MEDMCQA",  label:"MedMCQA (NEET/AIIMS)",     icon:"🗃️" },
    ],
    hasImages: true,
  },

  obgyn: {
    label:"OB/GYN", icon:"👶", color:"#F472B6", bg:"#3B0A1E",
    desc:"Obstetrics & gynaecology",
    books: [
      { name:"Williams Obstetrics / Williams Gynecology", chapters:["Part 1: Maternal Anatomy and Physiology","Part 2: Preconception and Prenatal Care","Part 3: Labor and Delivery","Part 4: Obstetrical Complications","Part 5: Gynecologic Oncology","Part 6: Reproductive Endocrinology and Infertility"] },
      { name:"Blueprints Obstetrics & Gynecology", chapters:["Chapter 1: Normal Pregnancy","Chapter 2: Complications of Pregnancy","Chapter 3: Normal Labor and Delivery","Chapter 4: General Gynecology","Chapter 5: Infertility","Chapter 6: Gynecologic Neoplasms"] },
      { name:"Hacker & Moore's Essentials of Obstetrics and Gynecology", chapters:["Chapter 1: The Patient-Physician Relationship","Chapter 2: Maternal-Fetal Physiology","Chapter 3: Normal Labor and Delivery","Chapter 4: Reproductive Endocrinology","Chapter 5: Gynecologic Infections","Chapter 6: Menstrual Cycle Abnormalities"] },
    ],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  internal_medicine: {
    label:"Internal Medicine", icon:"🫀", color:"#EF4444", bg:"#3B0A0A",
    desc:"Cardiology, nephrology & more",
    books: [
      { name:"Harrison's Principles of Internal Medicine", chapters:["Part 1: Cardinal Manifestations of Disease","Part 2: Oncology and Hematology","Part 3: Infectious Diseases","Part 4: Cardiovascular Disorders","Part 5: Respiratory Disorders","Part 6: Renal and Urinary Tract Disorders","Part 7: Gastrointestinal Disorders"] },
      { name:"Goldman-Cecil Medicine", chapters:["Chapter 1: Approach to Medicine, the Patient, and the Medical Profession","Chapter 2: Cardiovascular Disease","Chapter 3: Respiratory Diseases","Chapter 4: Renal Diseases","Chapter 5: Endocrine and Metabolic Diseases","Chapter 6: Gastrointestinal and Liver Diseases"] },
      { name:"Step-Up to Medicine", chapters:["Chapter 1: Diseases of the Cardiovascular System","Chapter 2: Diseases of the Pulmonary System","Chapter 3: Diseases of the Renal System","Chapter 4: Infectious Diseases","Chapter 5: Hematology and Oncology","Chapter 6: Endocrine System"] },
    ],
    datasets: [
      { topic:"MEDMCQA",    label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" },
      { topic:"USMLE Step 1", label:"USMLE Step 1",        icon:"🏥" },
    ],
  },

  clinical_medicine: {
    label:"Clinical Medicine", icon:"🩺", color:"#3B82F6", bg:"#0A1A3B",
    desc:"Clinical reasoning & cases",
    books: [
      { name:"Bates' Guide to Physical Examination and History Taking", chapters:["Chapter 1: Interviewing and Health History","Chapter 2: Vital Signs and Pain","Chapter 3: Head and Neck","Chapter 4: Thorax and Lungs","Chapter 5: Cardiovascular System","Chapter 6: The Abdomen"] },
      { name:"Hutchison's Clinical Methods", chapters:["Chapter 1: Doctor and Patient","Chapter 2: Basic Clinical Skills","Chapter 3: The Abdomen","Chapter 4: The Nervous System","Chapter 5: Locomotor System","Chapter 6: Respiratory System"] },
      { name:"Macleod's Clinical Examination", chapters:["Chapter 1: General Examination","Chapter 2: Cardiovascular System","Chapter 3: Respiratory System","Chapter 4: Gastrointestinal System","Chapter 5: Nervous System","Chapter 6: Musculoskeletal System"] },
    ],
    datasets: [
      { topic:"Flashcards", label:"Medical Flashcards (Anki)", icon:"🃏" },
      { topic:"MEDMCQA",    label:"MedMCQA (NEET/AIIMS)",     icon:"🗃️" },
    ],
    hasFlashcards: true,
  },

  general_medicine: {
    label:"General Medicine", icon:"💊", color:"#6366F1", bg:"#0A0A3B",
    desc:"Broad clinical & preventive",
    books: [
      { name:"Davidson's Principles and Practice of Medicine", chapters:["Chapter 1: Infectious Diseases","Chapter 2: Respiratory Disease","Chapter 3: Cardiovascular Disease","Chapter 4: Gastroenterology","Chapter 5: Neurology","Chapter 6: Rheumatology and Bone Disease"] },
      { name:"Kumar & Clark's Clinical Medicine", chapters:["Chapter 1: Ethics and Communication","Chapter 2: Liver and Biliary Tract","Chapter 3: Kidney and Urinary Tract","Chapter 4: Endocrine Disease","Chapter 5: Blood Disorders","Chapter 6: Skin Disease"] },
      { name:"Oxford Handbook of Clinical Medicine", chapters:["Chapter 1: Thinking About Medicine","Chapter 2: History and Examination","Chapter 3: Cardiovascular Medicine","Chapter 4: Chest Medicine","Chapter 5: Emergency Medicine","Chapter 6: Surgery"] },
    ],
    datasets: [
      { topic:"USMLE Step 1", label:"USMLE Step 1",   icon:"🏥" },
      { topic:"MEDQA_USMLE",  label:"MedQA (USMLE)",  icon:"🏥" },
      { topic:"HEADQA",       label:"HeadQA (Spain)", icon:"🎓" },
    ],
  },

  surgery: {
    label:"Surgery", icon:"🔪", color:"#DC2626", bg:"#3B0A0A",
    desc:"Operative & post-op care",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  pediatrics: {
    label:"Pediatrics", icon:"🧒", color:"#FBBF24", bg:"#3B2500",
    desc:"Child health & development",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  anaesthesia: {
    label:"Anaesthesia", icon:"😴", color:"#67E8F9", bg:"#0A2A2A",
    desc:"Anaesthetic agents & critical care",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  forensic_medicine: {
    label:"Forensic Medicine", icon:"⚖️", color:"#9CA3AF", bg:"#1A1A1A",
    desc:"Legal medicine & toxicology",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  social_preventive_medicine: {
    label:"Preventive Medicine", icon:"🏥", color:"#34D399", bg:"#0A2A1A",
    desc:"Epidemiology & biostatistics",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  ophthalmology: {
    label:"Ophthalmology", icon:"👁️", color:"#60A5FA", bg:"#0A1A3B",
    desc:"Eye diseases & optics",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  ent: {
    label:"ENT", icon:"👂", color:"#A78BFA", bg:"#1E0A3B",
    desc:"Ear, nose & throat",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  dermatology: {
    label:"Dermatology", icon:"🩹", color:"#FDE68A", bg:"#3B2A00",
    desc:"Skin disorders & image Dx",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  biology: {
    label:"Biology", icon:"🌱", color:"#22C55E", bg:"#0A2A0A",
    desc:"Cell biology & life sciences",
    books: [
      { name:"Alberts' Molecular Biology of the Cell", chapters:["Chapter 1: Cells and Genomes","Chapter 2: Cell Chemistry and Bioenergetics","Chapter 3: Proteins","Chapter 4: DNA, Chromosomes, and Genomes","Chapter 5: DNA Replication, Repair, and Recombination","Chapter 6: How Cells Read the Genome","Chapter 7: Control of Gene Expression","Chapter 8: Analyzing Cells, Molecules, and Systems","Chapter 9: Visualizing Cells","Chapter 10: Membrane Structure","Chapter 11: Membrane Transport of Small Molecules","Chapter 12: Intracellular Compartments and Protein Sorting","Chapter 13: Intracellular Membrane Traffic","Chapter 14: Energy Conversion: Mitochondria and Chloroplasts","Chapter 15: Cell Signaling","Chapter 16: The Cytoskeleton","Chapter 17: The Cell Cycle","Chapter 18: Cell Death","Chapter 19: Cell Junctions and the Extracellular Matrix","Chapter 20: Cancer"] },
      { name:"Lodish's Molecular Cell Biology", chapters:["Chapter 1: Molecules, Cells, and Model Organisms","Chapter 5: Fundamental Molecular Genetic Mechanisms"] },
    ],
    datasets: [],
  },

  dental: {
    label:"Dental", icon:"🦷", color:"#E2E8F0", bg:"#1A1A2A",
    desc:"Oral medicine & surgery",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  orthopaedics: {
    label:"Orthopaedics", icon:"🦴", color:"#FB923C", bg:"#3B1500",
    desc:"Fractures & musculoskeletal",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },

  research_medicine: {
    label:"Research & Stats", icon:"📊", color:"#818CF8", bg:"#0A0A3B",
    desc:"Biostatistics & EBM",
    books: [],
    datasets: [{ topic:"MEDMCQA", label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" }],
  },
};

// ── Helpers ──────────────────────────────────────────────────
export const SUBJECT_LIST = Object.keys(SYLLABUS).sort();

export function getSubjectMeta(subject) {
  return SYLLABUS[subject?.toLowerCase()] ?? {
    label: (subject||"").replace(/_/g," "),
    icon: "📚", color: "#6B7280", bg: "#1A1A1A", desc: "",
    books: [], datasets: [],
  };
}

// All chapters for a subject+book (no DB call needed)
export function getStaticChapters(subject, bookName) {
  const s = SYLLABUS[subject?.toLowerCase()];
  if (!s) return [];
  const book = s.books.find(b => b.name === bookName);
  return book?.chapters ?? [];
}

// All books for a subject
export function getStaticBooks(subject) {
  return SYLLABUS[subject?.toLowerCase()]?.books ?? [];
}

// All datasets for a subject
export function getStaticDatasets(subject) {
  return SYLLABUS[subject?.toLowerCase()]?.datasets ?? [];
}

// Global flashcard dataset (for all subjects)
export const FLASHCARD_DATASET = { topic:"Flashcards", label:"Medical Flashcards (Anki)", icon:"🃏" };
export const IMAGE_DATASETS = [
  { topic:"PATH_VQA", label:"PathVQA — Histology Slides", icon:"🔬" },
  { topic:"VQA_RAD",  label:"VQA-RAD — Radiology Scans",  icon:"🩻" },
];
export const ALL_DATASETS = [
  { topic:"MEDMCQA",    label:"MedMCQA (NEET/AIIMS)", icon:"🗃️" },
  { topic:"USMLE Step 1", label:"USMLE Step 1",        icon:"🏥" },
  { topic:"MEDQA_USMLE", label:"MedQA (USMLE)",        icon:"🏥" },
  { topic:"HEADQA",     label:"HeadQA (Spain)",         icon:"🎓" },
  { topic:"BioASQ",     label:"BioASQ (PubMed)",        icon:"🔬" },
  { topic:"Flashcards", label:"Flashcards (Anki)",      icon:"🃏" },
  { topic:"PATH_VQA",   label:"PathVQA (Histology)",    icon:"🔬" },
  { topic:"VQA_RAD",    label:"VQA-RAD (Radiology)",    icon:"🩻" },
];
