import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_anatomy_db.json"
SUBJECT = "anatomy"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Gray's Anatomy for Students": [
        "Chapter 1: The Body",
        "Chapter 2: Back",
        "Chapter 3: Thorax",
        "Chapter 4: Abdomen",
        "Chapter 5: Pelvis and Perineum",
        "Chapter 6: Lower Limb",
        "Chapter 7: Upper Limb",
        "Chapter 8: Head and Neck"
    ],
    "Moore's Clinically Oriented Anatomy": [
        "Chapter 1: Thorax",
        "Chapter 2: Abdomen",
        "Chapter 3: Pelvis and Perineum",
        "Chapter 4: Back",
        "Chapter 5: Lower Limb",
        "Chapter 6: Upper Limb",
        "Chapter 7: Head",
        "Chapter 8: Neck",
        "Chapter 9: Cranial Nerves"
    ],
    "Netter's Atlas of Human Anatomy": [
        "Section 1: Head and Neck",
        "Section 2: Back and Spinal Cord",
        "Section 3: Thorax",
        "Section 4: Abdomen",
        "Section 5: Pelvis and Perineum",
        "Section 6: Upper Limb",
        "Section 7: Lower Limb"
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
        You are a medical school anatomy professor.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style anatomy questions. 
        Focus heavily on anatomical landmarks, nerve innervations, blood supply, and clinical correlations.
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
            "format": "json", # Forces Ollama into JSON-only output
            "options": {
                "temperature": 0.2 # Reduces creative formatting errors
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
                    "tags": ["ai_generated", SUBJECT, "anatomy", qtype]
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
print(" 🦴 MEDLINGO: ANATOMY AI PIPELINE (LOCAL LLAMA 3.1) ")
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