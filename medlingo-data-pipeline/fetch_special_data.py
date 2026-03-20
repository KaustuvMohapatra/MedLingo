import os
import json
import hashlib
import re
from datasets import load_dataset

print("=====================================================")
print(" 🖼️ MEDLINGO: SPECIAL DATA FETCHER (IMAGES & TEXT) 🖼️")
print("=====================================================\n")

# Create a folder to store downloaded X-Rays and Scans
os.makedirs("medlingo_images", exist_ok=True)
master_special_db = []

def generate_question_id(question_text):
    normalized = re.sub(r'[^a-zA-Z0-9]', '', str(question_text).lower())
    return f"q_{hashlib.md5(normalized.encode('utf-8')).hexdigest()[:15]}"

# =========================================================
# 1. Medical Flashcards (Replaces the deleted CliCR dataset)
# =========================================================
print("🔄 Fetching Medical Flashcards (Open-ended / Fill-in-the-blank)...")
try:
    # Using Medalpaca's highly reliable native parquet dataset
    flashcards = load_dataset("medalpaca/medical_meadow_medical_flashcards", split="train")
    total_flashcards = len(flashcards)
    print(f"   -> Processing {total_flashcards} clinical flashcards...")
    
    for i, row in enumerate(flashcards):
        if (i + 1) % 5000 == 0:
            print(f"      ⏳ Parsed {i + 1} / {total_flashcards}...")
            
        # The dataset uses 'input' as the question and 'output' as the answer
        q_text = row.get("input", "")
        if not q_text:
            q_text = row.get("instruction", "")
            
        correct_ans = row.get("output", "")
        
        if not q_text or not correct_ans: continue
        
        master_special_db.append({
            "id": generate_question_id(q_text),
            "subject": "clinical_medicine",
            "topic": "Flashcards",
            "difficulty": 3,
            "type": "fill",  # Perfect for text-input UI
            "question": q_text, 
            "options": [],
            "answer": correct_ans,
            "explanation": f"The correct answer is: {correct_ans}",
            "tags": ["flashcard", "fill-in-the-blank"]
        })
except Exception as e:
    print("⚠️ Medical Flashcards failed:", e)

# =========================================================
# 2. BioASQ (Evidence-based Yes/No)
# =========================================================
print("\n🔄 Fetching BioASQ (Medical Research Yes/No)...")
try:
    # Using a surviving, reliable BioASQ repository
    bioasq = load_dataset("kroshan/BioASQ", split="train")
    total_bioasq = len(bioasq)
    print(f"   -> Processing {total_bioasq} research queries...")
    
    for i, row in enumerate(bioasq):
        if (i + 1) % 1000 == 0:
            print(f"      ⏳ Parsed {i + 1} / {total_bioasq}...")
            
        q_text = row.get("question", "")
        # Checking both common HF BioASQ schema keys just to be safe
        ans = str(row.get("exact_answer", row.get("answer", ""))).lower().strip()
        
        # We only want the rapid-fire Yes/No questions
        if ans not in ["yes", "no"]: continue
        
        options = ["Yes", "No"]
        answer_idx = 0 if ans == "yes" else 1
        
        master_special_db.append({
            "id": generate_question_id(q_text),
            "subject": "research_medicine",
            "topic": "BioASQ",
            "difficulty": 3,
            "type": "mcq",
            "question": q_text,
            "options": options,
            "answer": answer_idx,
            "explanation": f"The correct answer is {ans.capitalize()}.",
            "tags": ["bioasq"]
        })
except Exception as e:
    print("⚠️ BioASQ failed:", e)

# =========================================================
# 3. VQA-RAD & PathVQA (X-Rays & Pathology Images!)
# =========================================================
print("\n🔄 Fetching VQA-RAD & PathVQA (Downloading Images)...")

def process_image_dataset(dataset_repo, subject, tag):
    try:
        ds = load_dataset(dataset_repo, split="train")
        total_images = len(ds)
        print(f"   -> Processing {dataset_repo} ({total_images} images)...")
        
        for i, row in enumerate(ds):
            if (i + 1) % 500 == 0:
                print(f"      ⏳ Downloaded {i + 1} / {total_images} images...")
                
            q_text = row["question"]
            ans_text = str(row["answer"]).capitalize()
            
            # Determine if it's a Yes/No question or Fill-in-the-blank
            is_yes_no = ans_text.lower() in ["yes", "no"]
            q_type = "mcq" if is_yes_no else "fill"
            options = ["Yes", "No"] if is_yes_no else []
            final_ans = (0 if ans_text.lower() == "yes" else 1) if is_yes_no else ans_text
            
            q_id = generate_question_id(q_text + str(i))
            
            # Save the image locally!
            image = row["image"]
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            local_path = os.path.join("medlingo_images", f"{q_id}.jpg")
            image.save(local_path)
            
            master_special_db.append({
                "id": q_id,
                "subject": subject,
                "topic": tag.upper(),
                "difficulty": 2,
                "type": q_type,
                "question": q_text,
                "options": options,
                "answer": final_ans,
                "explanation": f"The correct observation is: {ans_text}.",
                "tags": [tag, "image_based"],
                "local_image_path": local_path  # We will use Node to upload this file!
            })
    except Exception as e:
        print(f"⚠️ {dataset_repo} failed:", e)

process_image_dataset("flaviagiammarino/vqa-rad", "radiology", "vqa_rad")
process_image_dataset("flaviagiammarino/path-vqa", "pathology", "path_vqa")

# =========================================================
# FINAL SAVE TO JSON
# =========================================================
output_file = "medlingo_special_db.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(master_special_db, f, indent=2)

print(f"\n✅ SUCCESS! Downloaded special data and saved all images to the /medlingo_images/ folder.")