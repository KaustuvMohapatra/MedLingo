import os
import json
import time
import hashlib
import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1"
OUTPUT_FILE = "medlingo_genetics_db.json"
SUBJECT = "genetics"

# --- 1. DEPARTMENT CONFIGURATION ---
BOOKS = {
    "Thompson & Thompson Genetics in Medicine": [
        "Chapter 1: Introduction to Genetics",
        "Chapter 2: The Human Genome and Chromosomal Basis of Heredity",
        "Chapter 3: The Human Genome: Gene Structure and Function",
        "Chapter 4: Tools of Human Molecular Genetics",
        "Chapter 5: Principles of Clinical Cytogenetics",
        "Chapter 6: Clinical Cytogenetics: Disorders of Autosomes and Sex Chromosomes",
        "Chapter 7: Patterns of Single-Gene Inheritance",
        "Chapter 8: Genetics of Common Disorders with Complex Inheritance",
        "Chapter 9: Genetic Variation in Populations",
        "Chapter 10: Identifying the Genetic Basis for Human Disease",
        "Chapter 11: The Molecular Basis of Genetic Disease",
        "Chapter 12: The Molecular, Biochemical, and Cellular Basis of Genetic Disease",
        "Chapter 13: The Treatment of Genetic Disease",
        "Chapter 14: Developmental Genetics and Birth Defects",
        "Chapter 15: Cancer Genetics and Genomics",
        "Chapter 16: Risk Assessment and Genetic Counseling",
        "Chapter 17: Prenatal Diagnosis and Screening",
        "Chapter 18: Application of Genomics to Medicine"
    ],
    "Emery's Elements of Medical Genetics": [
        "Chapter 1: History and Impact of Genetics in Medicine",
        "Chapter 2: The Cellular and Molecular Basis of Inheritance",
        "Chapter 3: Chromosomes and Cell Division",
        "Chapter 4: Finding the Cause of Monogenic Disorders by Identifying Disease Genes",
        "Chapter 5: Laboratory Techniques for Diagnosis of Monogenic Disorders",
        "Chapter 6: Patterns of Inheritance",
        "Chapter 7: Population and Mathematical Genetics",
        "Chapter 8: Risk Calculation",
        "Chapter 9: Developmental Genetics",
        "Chapter 10: Genetics of Cancer",
        "Chapter 11: Pharmacogenetics and Personalized Medicine"
    ],
    "Medical Genetics by Jorde, Carey, & Bamshad": [
        "Chapter 1: Basic Cell Biology: Structure and Function of Genes and Chromosomes",
        "Chapter 2: Genetic Variation: Its Origin and Detection",
        "Chapter 3: Autosomal Dominant and Recessive Inheritance",
        "Chapter 4: Sex-Linked and Nontraditional Modes of Inheritance",
        "Chapter 5: Clinical Cytogenetics: The Chromosomal Basis of Human Disease",
        "Chapter 6: Biochemical Genetics: Disorders of Metabolism",
        "Chapter 7: Immunogenetics",
        "Chapter 8: Genetics of Development",
        "Chapter 9: Cancer Genetics",
        "Chapter 10: Multifactorial Inheritance and Common Diseases",
        "Chapter 11: Genetic Testing and Gene Therapy",
        "Chapter 12: Clinical Genetics and Genetic Counseling"
    ]
}

QUESTION_TYPES = [
    "conceptual",
    "clinical",
    "case-based",
    "application"
]

QUESTIONS_PER_TYPE = 20 # Generating 20 per type (80 per chapter total)
BATCH_SIZE = 5          # 5 questions per LLM request to guarantee perfect JSON

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
        You are a medical school exam generator.
        Textbook: {book_name}
        Chapter: {chapter_name}
        Question type: {qtype}

        Generate EXACTLY {BATCH_SIZE} USMLE-style questions.
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
            "format": "json", # Critical: Forces Ollama into JSON-only output
            "options": {
                "temperature": 0.2 # Critical: Reduces creative formatting errors
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
                    "tags": ["ai_generated", SUBJECT, qtype]
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
print(" 🧬 MEDLINGO: GENETICS AI PIPELINE (LOCAL LLAMA 3.1) ")
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