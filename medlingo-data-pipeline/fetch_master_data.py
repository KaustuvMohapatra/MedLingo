import json
import hashlib
import re
from datasets import load_dataset

print("=====================================================")
print(" 🏥 MEDLINGO: ULTIMATE MEDICAL DATABASE FETCHER 🏥")
print("=====================================================\n")

# Master database dictionary
master_db = {}

# 1. Hashing Function for Deduplication
def generate_question_id(question_text):
    normalized = re.sub(r'[^a-zA-Z0-9]', '', str(question_text).lower())
    return f"q_{hashlib.md5(normalized.encode('utf-8')).hexdigest()[:15]}"

# 2. Intelligent Categorizer (Used if dataset doesn't provide a specific branch)
def determine_subject(text, default_subject="general_medicine"):
    if default_subject != "general_medicine":
        return default_subject # Trust the dataset's explicit branch
        
    text = str(text).lower()
    if any(word in text for word in ["drug", "dose", "receptor", "mg", "toxicity", "agonist", "pharmacokinetics"]): return "pharmacology"
    if any(word in text for word in ["muscle", "nerve", "artery", "vein", "joint", "innervation", "bone"]): return "anatomy"
    if any(word in text for word in ["cell", "tumor", "carcinoma", "biopsy", "necrosis", "malignant"]): return "pathology"
    if any(word in text for word in ["pressure", "volume", "secretion", "plasma", "cardiac output"]): return "physiology"
    if any(word in text for word in ["bacteria", "virus", "infection", "gram", "stain", "culture", "antibiotic"]): return "microbiology"
    if any(word in text for word in ["dna", "rna", "allele", "chromosome", "mutation", "gene"]): return "genetics"
    if any(word in text for word in ["pregnancy", "fetal", "placenta", "gestation", "trimester"]): return "obgyn"
    if any(word in text for word in ["child", "infant", "pediatric", "neonate"]): return "pediatrics"
    if any(word in text for word in ["behavior", "dsm", "psychiatric", "delusion", "schizophrenia", "antidepressant"]): return "psychiatry"
    return default_subject

# Helper to save a question to our Master DB
def add_to_db(q_text, options, answer_idx, explanation, subject, dataset_tag, difficulty=2):
    q_id = generate_question_id(q_text)
    
    if q_id in master_db:
        if dataset_tag not in master_db[q_id]["tags"]:
            master_db[q_id]["tags"].append(dataset_tag)
    else:
        master_db[q_id] = {
            "id": q_id,
            "subject": subject,
            "topic": dataset_tag.upper(),
            "difficulty": difficulty,
            "type": "mcq",
            "question": q_text,
            "options": options,
            "answer": answer_idx,
            "explanation": explanation,
            "tags": [dataset_tag]
        }

# =========================================================
# DATASET 1: MMLU (Massive Multitask Language Understanding)
# Contains specialized splits for exact medical departments!
# =========================================================
mmlu_branches = {
    "anatomy": "anatomy",
    "clinical_knowledge": "clinical_medicine",
    "college_biology": "biology",
    "college_medicine": "general_medicine",
    "medical_genetics": "genetics",
    "professional_medicine": "internal_medicine",
    "nutrition": "nutrition",
    "virology": "microbiology"
}

print("🔄 1. Fetching MMLU Medical Department Branches...")
for branch, subject_name in mmlu_branches.items():
    try:
        print(f"   -> Downloading MMLU branch: {branch.upper()}...")
        dataset = load_dataset("cais/mmlu", branch, split="test")
        
        for row in dataset:
            q_text = row["question"]
            options = row["choices"]
            answer_idx = row["answer"]
            
            add_to_db(
                q_text=q_text, 
                options=options, 
                answer_idx=answer_idx, 
                explanation=f"Correct answer: {options[answer_idx]}", 
                subject=subject_name, 
                dataset_tag=f"mmlu_{branch}"
            )
    except Exception as e:
        print(f"   ⚠️ Failed to load MMLU {branch}: {e}")

# =========================================================
# DATASET 2: PubMedQA (Evidence-Based Medical Flashcards)
# =========================================================
print("\n🔄 2. Fetching PubMedQA (Clinical Research Data)...")
try:
    pq_dataset = load_dataset("qiaojin/PubMedQA", "pqa_labeled", split="train")
    print(f"   -> Processing {len(pq_dataset)} clinical context queries...")
    for row in pq_dataset:
        q_text = row["question"] 
        options = ["Yes", "No", "Maybe"]
        correct_string = row["final_decision"].capitalize()
        
        if correct_string in options:
            answer_idx = options.index(correct_string)
            explanation = " ".join(row["context"]["contexts"]) 
            
            add_to_db(q_text, options, answer_idx, explanation, "research_medicine", "pubmed_qa", difficulty=3)
except Exception as e:
    print(f"   ⚠️ Failed to load PubMedQA: {e}")

# =========================================================
# DATASET 3: MedQA (USMLE Step 1)
# =========================================================
print("\n🔄 3. Fetching MedQA (USMLE Step 1)...")
try:
    medqa = load_dataset("GBaker/MedQA-USMLE-4-options", split="train")
    print(f"   -> Processing {len(medqa)} USMLE questions...")
    for row in medqa:
        options_dict = row.get("options", {})
        if not options_dict: continue
        options_list = list(options_dict.values())
        keys_list = list(options_dict.keys())
        answer_letter = row.get("answer_idx")
        if not answer_letter or answer_letter not in keys_list: continue
        correct_index = keys_list.index(answer_letter)
        
        subj = determine_subject(row["question"])
        add_to_db(row["question"], options_list, correct_index, f"Correct answer: {options_list[correct_index]}.", subj, "medqa_usmle")
except Exception as e:
    print(f"   ⚠️ Failed to load MedQA: {e}")

# =========================================================
# DATASET 4: MedMCQA (Massive Global Entrance Exams)
# =========================================================
print("\n🔄 4. Fetching MedMCQA (Massive 180k+ Dataset)...")
try:
    medmcqa = load_dataset("openlifescienceai/medmcqa", split="train")
    total_medmcqa = len(medmcqa)
    print(f"   -> Processing {total_medmcqa} comprehensive questions...")
    
    for i, row in enumerate(medmcqa):
        if (i + 1) % 40000 == 0:
            print(f"      ⏳ Parsed {i + 1} / {total_medmcqa}...")
            
        options_list = [row.get("opa"), row.get("opb"), row.get("opc"), row.get("opd")]
        correct_index = row.get("cop")
        
        if correct_index is None or correct_index < 1 or correct_index > 4 or not all(options_list):
            continue
            
        correct_index -= 1 
        q_text = row["question"]
        explanation = row.get("exp") or f"Correct answer: {options_list[correct_index]}."
        
        raw_subject = str(row.get("subject_name", "")).lower()
        final_subj = determine_subject(q_text, raw_subject if raw_subject else "general_medicine")
        
        add_to_db(q_text, options_list, correct_index, explanation, final_subj, "medmcqa")
except Exception as e:
    print(f"   ⚠️ Failed to load MedMCQA: {e}")

# =========================================================
# DATASET 5: HeadQA (Nursing, Psychology, Pharmacology)
# =========================================================
print("\n🔄 5. Fetching HeadQA (Nursing, Psychology, Healthcare)...")
try:
    headqa = load_dataset("EleutherAI/headqa", "en", split="train")
    print(f"   -> Processing {len(headqa)} specialty healthcare questions...")
    
    for row in headqa:
        category = str(row.get("category", "")).lower()
        
        if category == "nursing": subject = "nursing"
        elif category == "psychology": subject = "psychiatry"
        elif category == "pharmacology": subject = "pharmacology"
        elif category == "biology": subject = "biology"
        else: subject = "general_medicine"

        options_data = row.get("answers", [])
        if len(options_data) < 2: continue
        
        options_list = [opt["atext"] for opt in options_data]
        
        correct_index = row.get("ra", 1) - 1 
        if correct_index < 0 or correct_index >= len(options_list): continue
        
        q_text = row["qtext"]
        
        add_to_db(
            q_text=q_text, 
            options=options_list, 
            answer_idx=correct_index, 
            explanation=f"Correct answer: {options_list[correct_index]}.", 
            subject=subject, 
            dataset_tag="headqa",
            difficulty=2
        )
except Exception as e:
    print(f"   ⚠️ Failed to load HeadQA: {e}")

# =========================================================
# FINAL SAVE TO JSON
# =========================================================
final_questions = list(master_db.values())
output_file = "medlingo_master_db.json"

print(f"\n💾 Saving {len(final_questions)} highly-categorized questions to {output_file}...")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(final_questions, f, indent=2)

print("\n🎉=======================================================🎉")
print(f" SUCCESS! Compiled {len(final_questions)} unique questions!")
print(" Subject Branches Covered: Anatomy, Pathology, Psychiatry, ")
print(" Genetics, Pharmacology, Pediatrics, OBGYN, & more!")
print("🎉=======================================================🎉")