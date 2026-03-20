import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_physiology_db.json"
SUBJECT = "physiology"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Guyton and Hall Textbook of Medical Physiology": [
        "Unit I: Introduction to Physiology: The Cell and General Physiology",
        "Unit II: Membrane Physiology, Nerve, and Muscle",
        "Unit III: The Heart",
        "Unit IV: The Circulation",
        "Unit V: The Body Fluids and Kidneys",
        "Unit VI: Blood Cells, Immunity, and Blood Coagulation",
        "Unit VII: Respiration",
        "Unit VIII: Aviation, Space, and Deep-Sea Diving Physiology",
        "Unit IX: The Nervous System: General Principles and Sensory Physiology",
        "Unit X: The Nervous System: The Special Senses",
        "Unit XI: The Nervous System: Motor and Integrative Neurophysiology",
        "Unit XII: Gastrointestinal Physiology",
        "Unit XIII: Metabolism and Temperature Regulation",
        "Unit XIV: Endocrinology and Reproduction",
        "Unit XV: Sports Physiology"
    ],
    "Costanzo Physiology": [
        "Chapter 1: Cellular Physiology",
        "Chapter 2: Autonomic Nervous System",
        "Chapter 3: Neurophysiology",
        "Chapter 4: Cardiovascular Physiology",
        "Chapter 5: Respiratory Physiology",
        "Chapter 6: Renal Physiology",
        "Chapter 7: Acid-Base Physiology",
        "Chapter 8: Gastrointestinal Physiology",
        "Chapter 9: Endocrine Physiology",
        "Chapter 10: Reproductive Physiology"
    ],
    "Ganong's Review of Medical Physiology": [
        "Section 1: Cellular & Molecular Basis for Medical Physiology",
        "Section 2: Central & Peripheral Neurophysiology",
        "Section 3: Endocrine & Reproductive Physiology",
        "Section 4: Gastrointestinal Physiology",
        "Section 5: Cardiovascular Physiology",
        "Section 6: Respiratory Physiology",
        "Section 7: Renal Physiology"
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
        You are a medical school physiology professor.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style physiology questions. 
        Focus heavily on physiological mechanisms, pathways, equations, and clinical applications.
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
                    "tags": ["ai_generated", SUBJECT, "physiology", qtype]
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
print(" 🫀 MEDLINGO: PHYSIOLOGY AI PIPELINE (LOCAL LLAMA 3.1) ")
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