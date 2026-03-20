import json
import hashlib
import re
from datasets import load_dataset

print("📥 Initializing Master Medical Data Fetcher...")

# Dictionary to hold our deduplicated database (Key: Unique ID, Value: Question Data)
master_db = {}

# Helper function: Creates a unique fingerprint for a question to detect duplicates
def generate_question_id(question_text):
    # Remove all punctuation, spaces, and make lowercase
    normalized = re.sub(r'[^a-zA-Z0-9]', '', question_text.lower())
    # Generate a deterministic ID based on the text
    return f"q_{hashlib.md5(normalized.encode('utf-8')).hexdigest()[:15]}"

# Helper function: Categorize subject
def determine_subject(text):
    text = text.lower()
    if any(word in text for word in["drug", "dose", "inhibits", "receptor", "mg", "toxicity", "agonist", "side effect"]): return "pharmacology"
    if any(word in text for word in["muscle", "nerve", "artery", "vein", "joint", "innervation", "bone"]): return "anatomy"
    if any(word in text for word in["cell", "tumor", "carcinoma", "biopsy", "necrosis", "malignant"]): return "pathology"
    if any(word in text for word in["pressure", "volume", "secretion", "plasma", "cardiac output"]): return "physiology"
    if any(word in text for word in["bacteria", "virus", "infection", "gram", "stain", "culture"]): return "microbiology"
    return "general_medicine"

# ---------------------------------------------------------
# DATASET 1: MedQA (USMLE Step 1)
# ---------------------------------------------------------
print("\n🔄 Fetching Dataset 1: MedQA (USMLE)...")
try:
    medqa = load_dataset("GBaker/MedQA-USMLE-4-options", split="train")
    print(f"   Found {len(medqa)} questions in MedQA. Processing...")
    
    for row in medqa:
        options_dict = row.get("options", {})
        if not options_dict: continue
        
        options_list = list(options_dict.values())
        keys_list = list(options_dict.keys())
        
        answer_letter = row.get("answer_idx")
        if not answer_letter or answer_letter not in keys_list: continue
        correct_index = keys_list.index(answer_letter)
        
        q_text = row["question"]
        q_id = generate_question_id(q_text)
        
        # Deduplication logic
        if q_id not in master_db:
            master_db[q_id] = {
                "id": q_id,
                "subject": determine_subject(q_text),
                "topic": "USMLE",
                "difficulty": 2,
                "type": "mcq",
                "question": q_text,
                "options": options_list,
                "answer": correct_index,
                "explanation": f"Correct answer: {options_list[correct_index]}.",
                "tags": ["usmle"]
            }
except Exception as e:
    print(f"⚠️ MedQA fetch failed: {e}")

# ---------------------------------------------------------
# DATASET 2: MedMCQA (Massive Global Medical Q&A)
# ---------------------------------------------------------
print("\n🔄 Fetching Dataset 2: MedMCQA (This is huge, please wait)...")
try:
    medmcqa = load_dataset("openlifescienceai/medmcqa", split="train")
    total_medmcqa = len(medmcqa)
    print(f"   Found {total_medmcqa} questions in MedMCQA! Processing ALL of them...")
    
    for i, row in enumerate(medmcqa):
        # Progress indicator so you know it's working!
        if (i + 1) % 25000 == 0:
            print(f"   ⏳ Processed {i + 1} / {total_medmcqa} questions...")
            
        # MedMCQA uses 'opa', 'opb', 'opc', 'opd' for options
        options_list =[row.get("opa"), row.get("opb"), row.get("opc"), row.get("opd")]
        
        # 'cop' is correct option (1, 2, 3, or 4). We need 0-indexed (0, 1, 2, 3)
        correct_index = row.get("cop")
        if correct_index is None or correct_index < 1 or correct_index > 4 or not all(options_list):
            continue
            
        correct_index -= 1 
        q_text = row["question"]
        q_id = generate_question_id(q_text)
        
        explanation = row.get("exp")
        if not explanation:
            explanation = f"Correct answer: {options_list[correct_index]}."

        if q_id in master_db:
            # IT'S A DUPLICATE! Let's merge the tags instead of creating a new entry.
            if "medmcqa" not in master_db[q_id]["tags"]:
                master_db[q_id]["tags"].append("medmcqa")
        else:
            # New Question
            master_db[q_id] = {
                "id": q_id,
                "subject": determine_subject(q_text),
                "topic": row.get("subject_name", "General").capitalize() if row.get("subject_name") else "General",
                "difficulty": 2,
                "type": "mcq",
                "question": q_text,
                "options": options_list,
                "answer": correct_index,
                "explanation": explanation,
                "tags": ["medmcqa"]
            }
except Exception as e:
    print(f"⚠️ MedMCQA fetch failed: {e}")

# ---------------------------------------------------------
# SAVE TO JSON
# ---------------------------------------------------------
final_questions = list(master_db.values())
output_file = "medlingo_master_db.json"

print(f"\n💾 Saving {len(final_questions)} formatted questions to JSON...")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(final_questions, f, indent=2)

print(f"✅ SUCCESS! Deduplicated and merged {len(final_questions)} unique questions into {output_file}")