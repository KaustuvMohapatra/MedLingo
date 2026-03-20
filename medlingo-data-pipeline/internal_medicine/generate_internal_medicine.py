import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_internal_medicine_db.json"
SUBJECT = "internal_medicine"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Harrison's Principles of Internal Medicine": [
        "Part 1: Cardinal Manifestations of Disease",
        "Part 2: Oncology and Hematology",
        "Part 3: Infectious Diseases",
        "Part 4: Cardiovascular Disorders",
        "Part 5: Respiratory Disorders",
        "Part 6: Renal and Urinary Tract Disorders",
        "Part 7: Gastrointestinal Disorders"
    ],
    "Goldman-Cecil Medicine": [
        "Chapter 1: Approach to Medicine, the Patient, and the Medical Profession",
        "Chapter 2: Cardiovascular Disease",
        "Chapter 3: Respiratory Diseases",
        "Chapter 4: Renal Diseases",
        "Chapter 5: Endocrine and Metabolic Diseases",
        "Chapter 6: Gastrointestinal and Liver Diseases"
    ],
    "Step-Up to Medicine": [
        "Chapter 1: Diseases of the Cardiovascular System",
        "Chapter 2: Diseases of the Pulmonary System",
        "Chapter 3: Diseases of the Renal System",
        "Chapter 4: Infectious Diseases",
        "Chapter 5: Hematology and Oncology",
        "Chapter 6: Endocrine System"
    ]
}

QUESTION_TYPES = [
    "conceptual",
    "clinical",
    "case-based",
    "application"
]

QUESTIONS_PER_TYPE = 20  # 80 questions total per chapter
BATCH_SIZE = 5           # Chunks of 5 to guarantee flawless JSON syntax

# -----------------------------
# Helpers
# -----------------------------
def generate_question_id(question_text):
    normalized = re.sub(r'[^a-zA-Z0-9]', '', str(question_text).lower())
    return f"q_ai_{hashlib.md5(normalized.encode('utf-8')).hexdigest()[:15]}"

def load_db():
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def save_db(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# -----------------------------
# LLM Request
# -----------------------------
def generate_questions(book_name, chapter_name, qtype):
    all_questions = []
    batches = QUESTIONS_PER_TYPE // BATCH_SIZE

    for b in range(batches):
        prompt = f"""
        You are the Chief of Internal Medicine and a board examiner.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE Step 2/3 style Internal Medicine questions. 
        Focus heavily on complex pathogenesis, differential diagnosis, diagnostics, and advanced treatment algorithms.
        Format the output STRICTLY as a JSON object containing a "questions" array.

        Format Example:
        {{
          "questions": [
            {{
              "question": "The question text here...",
              "options": ["A", "B", "C", "D"],
              "answer": "A",
              "explanation": "Detailed explanation here..."
            }}
          ]
        }}
        """

        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json", 
            "options": {
                "temperature": 0.2 
            }
        }

        try:
            r = requests.post(OLLAMA_URL, json=payload)
            text = r.json().get("response", "")
            
            data = json.loads(text)
            qs = data.get("questions", [])
            
            for q in qs:
                formatted_q = {
                    "id": generate_question_id(q.get("question", "")),
                    "subject": SUBJECT,
                    "topic": f"{book_name} - {chapter_name}",
                    "difficulty": 3, 
                    "type": "mcq",
                    "question": q.get("question", ""),
                    "options": q.get("options", []),
                    "answer": str(q.get("answer", "")),
                    "explanation": q.get("explanation", ""),
                    "tags": ["ai_generated", SUBJECT, "internal_medicine", qtype]
                }
                all_questions.append(formatted_q)
                
        except Exception as e:
            print(f"      ⚠ Batch {b+1} failed: JSON Parsing Error. Skipping chunk to prevent crash.")
            
        time.sleep(1) 
        
    return all_questions

# -----------------------------
# MAIN PIPELINE
# -----------------------------
print("=====================================================")
print(" 🫀 MEDLINGO: INTERNAL MEDICINE AI PIPELINE (LOCAL LLAMA) ")
print("=====================================================")

db = load_db()
print(f"\nExisting questions: {len(db)}")

for book_name, chapters in BOOKS.items():
    print(f"\n📚 Processing Textbook: {book_name}")
    
    for i, chapter in enumerate(chapters):
        print(f"\n   -> Chapter {i+1}/{len(chapters)}: {chapter}")

        for qtype in QUESTION_TYPES:
            print(f"      Generating {qtype} questions ({QUESTIONS_PER_TYPE} total in chunks of {BATCH_SIZE})...")
            
            questions = generate_questions(book_name, chapter, qtype)
            db.extend(questions)
            save_db(db)

print("\n🎉 PIPELINE SUCCESS!")
print(f"Total questions generated: {len(db)}")
print(f"💾 Saved to: {OUTPUT_FILE}")