
# MedLingo: The Gamified Medical Education Engine

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Python](https://img.shields.io/badge/Python-Data_Pipeline-FFD43B?style=for-the-badge&logo=python&logoColor=blue)](https://python.org/)

**MedLingo** is a high-performance, full-stack educational platform designed to transform the rigorous, exhausting study of medicine into a highly addictive, gamified experience. 

Built for medical students and professionals, it leverages a massive proprietary database of **200,000+ board-style questions**, **21,000+ clinical images**, and AI-synthesized syllabus data to provide a "Duolingo-style" spaced-repetition learning journey through 39 distinct medical textbooks and global exam datasets.

---

## System Architecture Overview

MedLingo is split into two highly optimized, distinct ecosystems: the **Data Engineering Pipeline** (Backend/Python/Node.js) and the **Interactive Experience Layer** (Frontend/React/Vite).

### 1. The Data Pipeline (The "Brain")
Before the UI even loads, a multi-stage data engineering pipeline processes massive open-source and AI-generated datasets into a unified, flattened medical schema hosted on Supabase PostgreSQL.

*   **Massive Dataset Ingestion:** Python scripts (`fetch_master_data.py`) connect to Hugging Face and PubMed via native Parquet formats to programmatically download and format **MedQA** (USMLE Step 1-3), **MedMCQA** (NEET-PG/AIIMS), **BioASQ**, **HeadQA**, and **33,000+ Medical Meadow clinical flashcards**.
*   **Concurrent Media Processing:** A specialized high-speed Node.js uploader handles concurrent image uploads (10 at a time) to Supabase Storage, instantly linking real-world Radiology (**VQA-RAD**) and Pathology (**PathVQA**) scans to clinical text scenarios. Fill-in-the-blank cases (**CliCR**) are formatted for native text-input UI.
*   **Enterprise AI Textbook Synthesis:** Utilizes the Google Gemini 1.5 API to read the Table of Contents of **13 Gold Standard Medical Subjects** (targeting 39 top textbooks including *Robbins Pathology*, *Guyton Physiology*, *Gray's Anatomy*, and *Harrison's Internal Medicine*). The AI autonomously generates original, copyright-free clinical MCQs perfectly aligned with medical school syllabi, featuring auto-save and rate-limit bypassing.
*   **Deterministic Deduplication:** A custom `hashlib` MD5 function strips punctuation and spaces from question text to generate unique hashed IDs (e.g., `q_8f7b2c...`), ensuring exactly zero duplicate questions across overlapping datasets.
*   **0-Millisecond Syllabus Generation:** To prevent 200,000+ row database scans on app load, `build_syllabus.js` crawls the database to generate a static local syllabus map (`syllabus.js`). This allows the frontend to load a complex 39-book curriculum in under 50ms without blocking database queries.

### 2. The Frontend (The "Game")
A 3D, pixelated, premium cartoon aesthetic built with React and Tailwind CSS that focuses heavily on creating a "Flow State" for studying.

*   **The Winding Pathway:** A dynamically generated learning path that zig-zags through medical chapters using Sine-wave mathematics (`Math.sin()`), replicating modern mobile gaming interfaces. Nodes transition dynamically from Locked (Gray) ➔ Active (Gold) ➔ Completed (Purple).
*   **Spaced Repetition (SM-2):** Questions are dynamically prioritized using a modified **SuperMemo-2 (SM-2) algorithm** via a persistent `Zustand` store. The app mathematically calculates `easeFactor` and `nextReview` dates to force students to review difficult concepts exactly when they are about to forget them.
*   **Smart Database Retrieval:** Implements "Lazy Fetching". The app only queries Supabase when a user taps an active node, pulling exactly 10 questions injected dynamically with due spaced-repetition review cards.
*   **Tactile 3D UI Components:** Custom-engineered buttons and flashcards with thick matte-black borders (`border-[4px] border-[#111827]`), physical "press-down" Y-axis translations (`active:translate-y-[6px]`), and heavy drop-shadows.
*   **Interactive Gamification HUD:** Real-time local tracking of Gold XP (⚡), Hearts/Lives (❤️), and Daily Streaks (🔥).
*   **Premium Motion Physics (React Bits):** Integrates advanced interactive components:
    *   `Aurora` & `PixelSnow`: Mystical, shifting particle backgrounds.
    *   `ClickSpark` & `PixelBlast`: 3D pixel explosions on interactions and level-ups.
    *   `StarBorder`: Glowing orbital borders for active lesson nodes.
    *   `BlurText`: Smooth focal-reveal animations for rendering flashcard text.
    *   `AnimatedContent`: Bouncy, spring-physics feedback drawers.

---

## Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, React Router DOM |
| **State Management** | Zustand (with LocalStorage persistence middleware) |
| **Styling & UI** | Tailwind CSS, PostCSS, Lucide React (Icons) |
| **Animations & FX** | Framer Motion, React Bits, Canvas Confetti |
| **Backend & Database** | Supabase (PostgreSQL), Supabase Cloud Storage, Row Level Security (RLS) |
| **Data Pipelines** | Python 3, Pandas, `datasets` (Hugging Face API), Google GenAI SDK |
| **Node.js Scripts** | `fs`, `@supabase/supabase-js`, Promise-based concurrency |
| **Deployment** | Vercel (Frontend Global CDN), GitHub Actions (CI/CD) |

---

## Database Schema (Unified Flattened Model)

Instead of utilizing disparate, fragmented tables for images, text, and flashcards, all medical data is flattened into a highly indexed `questions` table in PostgreSQL to ensure lightning-fast read operations:

```sql
id: TEXT           -- Deterministic MD5 Hash (Primary Key).
subject: TEXT      -- Standardized medical department (e.g., anatomy, pathology).
topic: TEXT        -- The "Book - Chapter" string used for syllabus mapping.
difficulty: INT    -- 1 (Easy), 2 (Medium), 3 (Hard).
type: TEXT         -- UI trigger ('mcq', 'fill', 'flashcard', 'reading').
question: TEXT     -- The clinical scenario or factoid.
options: JSONB     -- Array of multiple choice options (for 'mcq').
answer: TEXT/INT   -- Index of the correct option, or string for fill-in-the-blank.
explanation: TEXT  -- Detailed medical breakdown for the feedback drawer.
image: TEXT        -- Public URL to the clinical scan in Supabase Storage (Nullable).
tags: JSONB        -- Array of tags for deep filtering (e.g.,["usmle", "robbins_pathology"]).
```

---

## Local Development Setup

Follow these steps to run MedLingo locally on your machine.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/MedLingo.git
cd MedLingo/medlingo-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root `medlingo-app` folder containing your Supabase public credentials:
```plaintext
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Build the Static Syllabus (Optional)
If you have updated the database via the Python pipelines or AI generators, you can regenerate the static map for 0ms load times on the Home Screen:
```bash
node src/scripts/build_syllabus.js
```

### 4. Run the Game
Boot up the Vite development server:
```bash
npm run dev
```

---

## Deployment Guide

### Frontend (Vercel / Netlify)
1. Connect the GitHub repository to your Vercel/Netlify dashboard.
2. Ensure the build command is set to `npm run build` and the output directory is `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Project Settings > Environment Variables**.
4. Deploy. Vite will automatically minify and optimize the build payload.

### Backend (Supabase Security & RLS)
Ensure your database is locked down but publicly readable by the React application. Run this in your Supabase SQL Editor:
```sql
-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Enable public read access for the questions table
CREATE POLICY "Allow public read access" ON questions FOR SELECT USING (true);

-- Ensure the Storage Policy is set to Public for the clinical images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
```


## Contact & Credits

**Architect & Developer:** Kaustuv Mohapatra 

*Disclaimer: MedLingo is an educational platform. The medical scenarios, textbook syntheses generated by AI, and open-source datasets are intended for educational review only and should not be used for actual clinical decision-making or patient diagnosis.*
```
