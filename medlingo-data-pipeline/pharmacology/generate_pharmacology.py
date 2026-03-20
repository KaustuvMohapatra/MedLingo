import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_pharmacology_db.json"
SUBJECT = "pharmacology"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Katzung's Basic and Clinical Pharmacology": [
        "Section 1: Basic Principles of Pharmacology",
        "Section 2: Autonomic Drugs",
        "Section 3: Cardiovascular-Renal Drugs",
        "Section 4: Drugs with Important Actions on Smooth Muscle",
        "Section 5: Drugs That Act in the Central Nervous System",
        "Section 6: Drugs Used to Treat Diseases of the Blood, Inflammation, and Gout",
        "Section 7: Endocrine Drugs",
        "Section 8: Chemotherapeutic Drugs",
        "Section 9: Toxicology"
    ],
    "Goodman & Gilman's The Pharmacological Basis of Therapeutics": [
        "Section 1: General Principles",
        "Section 2: Neuropharmacology",
        "Section 3: Modulation of Cardiovascular Function",
        "Section 4: Inflammation, Immunomodulation, and Hematopoiesis",
        "Section 5: Endocrine Pharmacology",
        "Section 6: Gastrointestinal Pharmacology",
        "Section 7: Chemotherapy of Infectious Diseases",
        "Section 8: Pharmacotherapy of Neoplastic Disease"
    ],
    "Lippincott Illustrated Reviews: Pharmacology": [
        "Unit 1: Principles of Drug Therapy (Pharmacokinetics/Pharmacodynamics)",
        "Unit 2: Drugs Affecting the Autonomic Nervous System",
        "Unit 3: Drugs Affecting the Central Nervous System",
        "Unit 4: Drugs Affecting the Cardiovascular System",
        "Unit 5: Drugs Affecting the Endocrine System",
        "Unit 6: Drugs for Other Disorders (GI, Respiratory)",
        "Unit 7: Chemotherapeutic Drugs"
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
        You are a medical school pharmacology professor.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style pharmacology questions. 
        Focus heavily on mechanisms of action, pharmacokinetics, adverse drug reactions, and clinical indications.
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
                    "difficulty": 2, 
                    "type": "mcq",
                    "question": q.get("question", ""),
                    "options": q.get("options", []),
                    "answer": str(q.get("answer", "")),
                    "explanation": q.get("explanation", ""),
                    "tags": ["ai_generated", SUBJECT, "pharmacology", qtype]
                }
                all_questions.append(formatted_q)
                
        except Exception as e:
            print(f"      ⚠ Batch {b+1} failed: JSON Parsing Error. Skipping chunk to prevent crash.")
            
        time.sleep(1) # Let the local GPU clear memory between batches
        
    return all_questions

# -----------------------------
# MAIN PIPELINE
# -----------------------------
print("=====================================================")
print(" 💊 MEDLINGO: PHARMACOLOGY AI PIPELINE (LOCAL LLAMA 3.1) ")
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
            
            # Auto-save frequently
            save_db(db)

print("\n🎉 PIPELINE SUCCESS!")
print(f"Total questions generated: {len(db)}")
print(f"💾 Saved to: {OUTPUT_FILE}")