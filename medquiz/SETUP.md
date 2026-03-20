# MedQuiz — Full Setup & File Guide

## 1. Scaffold the project

```bash
npm create vite@latest medquiz -- --template react
cd medquiz
npm install
```

## 2. Install all dependencies

```bash
# Styling
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# State & routing
npm install zustand react-router-dom

# Supabase client
npm install @supabase/supabase-js

# React Bits interactive components
npm install @reactbits/ui
# (if the scoped package name differs, use the exact one from your earlier install)
```

## 3. Environment variables

Create `.env` in project root:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 4. Replace / create files

Copy every file from the `src/` tree below into your project, matching the paths exactly.

```
src/
├── main.jsx
├── App.jsx
├── index.css
├── tailwind.config.js          (move to project root)
├── api/
│   └── supabaseService.js
├── store/
│   └── useProgressStore.js
├── components/
│   ├── Button3D.jsx
│   ├── Card3D.jsx
│   ├── GlobalLayout.jsx
│   └── HeaderHUD.jsx
└── screens/
    ├── HomeScreen.jsx
    ├── QuizScreen.jsx
    └── VictoryScreen.jsx
```

## 5. Run

```bash
npm run dev
```
