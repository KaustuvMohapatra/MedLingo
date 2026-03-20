import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_pathology_db.json"
SUBJECT = "pathology"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Robbins and Cotran Pathologic Basis of Disease": [
        "Chapter 1: Cellular Responses to Stress and Toxic Insults",
        "Chapter 2: Acute and Chronic Inflammation",
        "Chapter 3: Hemodynamic Disorders, Thromboembolism, and Shock",
        "Chapter 4: Genetic Disorders",
        "Chapter 5: Diseases of the Immune System",
        "Chapter 6: Neoplasia",
        "Chapter 7: Cardiovascular System",
        "Chapter 8: Respiratory System",
        "Chapter 9: Gastrointestinal Tract",
        "Chapter 10: Liver and Biliary Tract",
        "Chapter 11: The Endocrine System",
        "Chapter 12: The Central Nervous System"
    ],
    "Pathoma (Fundamentals of Pathology)": [
        "Chapter 1: Growth Adaptations, Cellular Injury, and Cell Death",
        "Chapter 2: Inflammation, Inflammatory Disorders, and Healing",
        "Chapter 3: Principles of Neoplasia",
        "Chapter 4: Hemostasis and Related Disorders",
        "Chapter 5: Red Blood Cell Disorders",
        "Chapter 6: White Blood Cell Disorders",
        "Chapter 7: Vascular Pathology",
        "Chapter 8: Cardiac Pathology",
        "Chapter 9: Respiratory Tract Pathology",
        "Chapter 10: Renal and Urinary Tract Pathology"
    ],
    "Goljan's Rapid Review Pathology": [
        "Chapter 1: Cellular Injury",
        "Chapter 2: Inflammation and Repair",
        "Chapter 3: Hemodynamics",
        "Chapter 4: Nutrition and Environmental Pathology",
        "Chapter 5: Neoplasia",
        "Chapter 6: Hematology",
        "Chapter 7: Cardiovascular Pathology",
        "Chapter 8: Respiratory Pathology",
        "Chapter 9: Gastrointestinal Pathology",
        "Chapter 10: Endocrine Pathology"
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
        You are a medical school pathology professor.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style pathology questions. 
        Focus heavily on pathogenesis, morphological changes, clinical manifestations, and relevant lab findings.
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
                    "tags": ["ai_generated", SUBJECT, "pathology", qtype]
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
print(" 🔬 MEDLINGO: PATHOLOGY AI PIPELINE (LOCAL LLAMA 3.1) ")
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