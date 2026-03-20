import os
import json
import time
import hashlib
import re
import google.generativeai as genai
from dotenv import load_dotenv  # <-- NEW: Import dotenv

print("=====================================================")
print(" 🧬 MEDLINGO: GENERAL BIOLOGY SYLLABUS ENGINE 🧬")
print("=====================================================\n")

# --- 1. SETUP ---
# Load environment variables from the .env file in the same directory
load_dotenv()

# Fetch the API key securely
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file!")
    exit(1)

genai.configure(api_key=api_key)

# Use gemini-2.5-flash with native JSON mode for perfect formatting
model = genai.GenerativeModel('gemini-3-flash-preview')

def generate_question_id(question_text):
    normalized = re.sub(r'[^a-zA-Z0-9]', '', str(question_text).lower())
    return f"q_ai_{hashlib.md5(normalized.encode('utf-8')).hexdigest()[:15]}"

# --- 2. DEPARTMENT CONFIGURATION ---
SUBJECT = "general_biology"
QUESTIONS_PER_CHAPTER = 200 # Adjust this higher if you want a deeper database!

# The exact chapters for your first 3 textbooks
BOOKS = {
    "Alberts' Molecular Biology of the Cell": [
        "Chapter 1: Cells and Genomes",
        "Chapter 2: Cell Chemistry and Bioenergetics",
        "Chapter 3: Proteins",
        "Chapter 4: DNA, Chromosomes, and Genomes",
        "Chapter 5: DNA Replication, Repair, and Recombination",
        "Chapter 6: How Cells Read the Genome: From DNA to Protein",
        "Chapter 7: Control of Gene Expression",
        "Chapter 8: Analyzing Cells, Molecules, and Systems",
        "Chapter 9: Visualizing Cells",
        "Chapter 10: Membrane Structure",
        "Chapter 11: Membrane Transport of Small Molecules",
        "Chapter 12: Intracellular Compartments and Protein Sorting",
        "Chapter 13: Intracellular Membrane Traffic",
        "Chapter 14: Energy Conversion: Mitochondria and Chloroplasts",
        "Chapter 15: Cell Signaling",
        "Chapter 16: The Cytoskeleton",
        "Chapter 17: The Cell Cycle",
        "Chapter 18: Cell Death",
        "Chapter 19: Cell Junctions and the Extracellular Matrix",
        "Chapter 20: Cancer",
        "Chapter 21: Development of Multicellular Organisms",
        "Chapter 22: Stem Cells and Tissue Renewal",
        "Chapter 23: Pathogens and Infection",
        "Chapter 24: The Innate and Adaptive Immune Systems"
    ],
    "Lodish's Molecular Cell Biology": [
        "Chapter 1: Molecules, Cells, and Model Organisms",
        "Chapter 2: Chemical Foundations",
        "Chapter 3: Protein Structure and Function",
        "Chapter 4: Culturing and Visualizing Cells",
        "Chapter 5: Fundamental Molecular Genetic Mechanisms",
        "Chapter 6: Molecular Genetic Techniques",
        "Chapter 7: Biomembrane Structure",
        "Chapter 8: Genes, Genomics, and Chromosomes",
        "Chapter 9: Transcriptional Control of Gene Expression",
        "Chapter 10: Post-Transcriptional Gene Control",
        "Chapter 11: Transmembrane Transport of Ions and Small Molecules",
        "Chapter 12: Cellular Energetics",
        "Chapter 13: Moving Proteins into Membranes and Organelles",
        "Chapter 14: Vesicular Traffic, Secretion, and Endocytosis",
        "Chapter 15: Signal Transduction and G Protein-Coupled Receptors",
        "Chapter 16: Signaling Pathways that Control Gene Expression",
        "Chapter 17: Cell Organization and Movement I: Microfilaments",
        "Chapter 18: Cell Organization and Movement II: Microtubules and IFs",
        "Chapter 19: The Eukaryotic Cell Cycle",
        "Chapter 20: Integrating Cells into Tissues",
        "Chapter 21: Stem Cells, Cell Asymmetry, and Cell Death",
        "Chapter 22: Cells of the Nervous System",
        "Chapter 23: Immunology",
        "Chapter 24: Cancer"
    ],
    "Karp's Cell and Molecular Biology": [
        "Chapter 1: Introduction to the Study of Cell and Molecular Biology",
        "Chapter 2: The Chemical Basis of Life",
        "Chapter 3: Bioenergetics, Enzymes, and Metabolism",
        "Chapter 4: The Structure and Function of the Plasma Membrane",
        "Chapter 5: Aerobic Respiration and the Mitochondrion",
        "Chapter 6: Photosynthesis and the Chloroplast",
        "Chapter 7: Interactions Between Cells and Their Environment",
        "Chapter 8: Cytoplasmic Membrane Systems and Membrane Trafficking",
        "Chapter 9: The Cytoskeleton and Cell Motility",
        "Chapter 10: The Nature of the Gene and the Genome",
        "Chapter 11: Gene Expression: From Transcription to Translation",
        "Chapter 12: Control of Gene Expression",
        "Chapter 13: DNA Replication and Repair",
        "Chapter 14: Cellular Reproduction",
        "Chapter 15: Cell Signaling and Signal Transduction",
        "Chapter 16: Cancer",
        "Chapter 17: The Immune Response",
        "Chapter 18: Techniques in Cell and Molecular Biology"
    ]
}

# --- 3. THE AI PROMPT ENGINE ---
def generate_questions_for_chapter(book_name, chapter_name, subject, num_questions):
    prompt = f"""
    You are an expert medical school professor. Generate {num_questions} USMLE-style multiple choice questions based on the concepts taught in '{book_name}', specifically focusing on '{chapter_name}'.
    
    CRITICAL INSTRUCTIONS:
    1. DO NOT plagiarize directly from the textbook. Generate original questions that test the *concepts* taught in this chapter.
    2. Format the output STRICTLY as a valid JSON array of objects.
    
    Each object must have exactly these keys:
    - "question": (string) A clinical or conceptual question.
    - "options": (array of 4 strings) Four possible answers.
    - "answer": (string) The exact string of the correct option.
    - "explanation": (string) A detailed, educational explanation of why the answer is correct.
    - "difficulty": (integer) 1 (Easy), 2 (Medium), or 3 (Hard).
    """
    
    try:
        # Force the model to return strict JSON
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        raw_questions = json.loads(response.text)
        formatted_questions = []
        
        for q in raw_questions:
            options = q.get("options", [])
            correct_str = q.get("answer", "")
            
            # Map the string answer to the integer index for your database
            answer_idx = options.index(correct_str) if correct_str in options else 0
            
            formatted_questions.append({
                "id": generate_question_id(q["question"]),
                "subject": subject,
                "topic": f"{book_name} - {chapter_name}",
                "difficulty": q.get("difficulty", 2),
                "type": "mcq",
                "question": q["question"],
                "options": options,
                "answer": answer_idx,
                "explanation": q.get("explanation", ""),
                "tags": ["ai_generated", subject, book_name]
            })
        return formatted_questions
    except Exception as e:
        print(f"      ⚠️ Failed to generate/parse chapter '{chapter_name}': {e}")
        return []

# --- 4. THE MAIN LOOP ---
master_db = []
output_file = f"medlingo_{SUBJECT}_db.json"

for book_name, chapters in BOOKS.items():
    print(f"\n📚 Generating syllabus for: {book_name}")
    
    for i, chapter in enumerate(chapters):
        print(f"   -> Processing {chapter} ({i+1}/{len(chapters)})...")
        
        chapter_qs = generate_questions_for_chapter(book_name, chapter, SUBJECT, QUESTIONS_PER_CHAPTER)
        master_db.extend(chapter_qs)
        
        # Auto-save after every chapter
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(master_db, f, indent=2)
            
        print(f"      ✅ Saved {len(chapter_qs)} questions. Sleeping 10s for API rate limits...")
        time.sleep(10) 

print(f"\n🎉 SUCCESS! Generated {len(master_db)} total questions for {SUBJECT}.")
print(f"💾 Saved to {output_file}")