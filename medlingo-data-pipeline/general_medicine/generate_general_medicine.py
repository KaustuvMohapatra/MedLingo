import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_general_medicine_db.json"
SUBJECT = "general_medicine"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Davidson's Principles and Practice of Medicine": [
        "Chapter 1: Infectious Diseases",
        "Chapter 2: Respiratory Disease",
        "Chapter 3: Cardiovascular Disease",
        "Chapter 4: Gastroenterology",
        "Chapter 5: Neurology",
        "Chapter 6: Rheumatology and Bone Disease"
    ],
    "Kumar & Clark's Clinical Medicine": [
        "Chapter 1: Ethics and Communication",
        "Chapter 2: Liver and Biliary Tract",
        "Chapter 3: Kidney and Urinary Tract",
        "Chapter 4: Endocrine Disease",
        "Chapter 5: Blood Disorders",
        "Chapter 6: Skin Disease"
    ],
    "Oxford Handbook of Clinical Medicine": [
        "Chapter 1: Thinking About Medicine",
        "Chapter 2: History and Examination",
        "Chapter 3: Cardiovascular Medicine",
        "Chapter 4: Chest Medicine",
        "Chapter 5: Emergency Medicine",
        "Chapter 6: Surgery"
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
        You are a general medicine ward attending physician.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style general medicine questions. 
        Focus heavily on the diagnosis, management, and treatment algorithms of common diseases seen on the wards.
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
                    "tags": ["ai_generated", SUBJECT, "general_medicine", qtype]
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
print(" 🏥 MEDLINGO: GENERAL MEDICINE AI PIPELINE (LOCAL LLAMA) ")
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