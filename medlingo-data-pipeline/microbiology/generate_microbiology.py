import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_microbiology_db.json"
SUBJECT = "microbiology"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Jawetz, Melnick, & Adelberg's Medical Microbiology": [
        "Section 1: Fundamentals of Microbiology",
        "Section 2: Immunology",
        "Section 3: Bacteriology",
        "Section 4: Virology",
        "Section 5: Mycology",
        "Section 6: Parasitology",
        "Section 7: Diagnostic Medical Microbiology"
    ],
    "Murray's Medical Microbiology": [
        "Section 1: Introduction",
        "Section 2: Principles of Laboratory Diagnosis",
        "Section 3: Basic Concepts in the Immune Response",
        "Section 4: Bacteriology (Gram-Positive & Gram-Negative)",
        "Section 5: Virology (DNA & RNA Viruses)",
        "Section 6: Mycology",
        "Section 7: Parasitology"
    ],
    "Clinical Microbiology Made Ridiculously Simple": [
        "Part 1: Bacteria (Gram-Positive, Gram-Negative, Acid-Fast)",
        "Part 2: Fungi",
        "Part 3: Viruses",
        "Part 4: Parasites",
        "Part 5: Very Strange Bugs (Prions)",
        "Part 6: Antimicrobial Drugs"
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
        You are a medical school microbiology professor.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style microbiology questions. 
        Focus heavily on pathogen characteristics, virulence factors, disease presentation, and diagnostics.
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
                    "tags": ["ai_generated", SUBJECT, "microbiology", qtype]
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
print(" 🦠 MEDLINGO: MICROBIOLOGY AI PIPELINE (LOCAL LLAMA 3.1) ")
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