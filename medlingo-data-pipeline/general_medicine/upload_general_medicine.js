require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in .env file!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const fileName = 'medlingo_general_medicine_db.json';

async function uploadGeneralMedData() {
  console.log(`📖 Reading ${fileName}...`);
  
  let questions;
  try {
    questions = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  } catch (err) {
    console.error(`❌ Could not find ${fileName}. Did the Python pipeline finish running?`);
    process.exit(1);
  }
  
  console.log(`🔍 Found ${questions.length} total generated questions. Cleaning up duplicates...`);

  // --- Deduplicate based on ID to prevent "ON CONFLICT" errors ---
  const uniqueMap = new Map();
  questions.forEach(q => {
    q.image = null; 
    if (q.answer !== null && q.answer !== undefined) {
      q.answer = String(q.answer); 
    }
    uniqueMap.set(q.id, q);
  });

  const uniqueQuestions = Array.from(uniqueMap.values());
  const duplicatesRemoved = questions.length - uniqueQuestions.length;
  
  console.log(`🧹 Removed ${duplicatesRemoved} duplicate questions!`);
  console.log(`🚀 Starting upload of ${uniqueQuestions.length} UNIQUE General Medicine questions...`);

  const DB_CHUNK_SIZE = 500;
  for (let i = 0; i < uniqueQuestions.length; i += DB_CHUNK_SIZE) {
    const chunk = uniqueQuestions.slice(i, i + DB_CHUNK_SIZE);

    const { error } = await supabase
      .from('questions')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`❌ DB Insert Error at chunk ${i}:`, error.message);
    } else {
      console.log(`   ✅ Successfully uploaded: ${Math.min(i + DB_CHUNK_SIZE, uniqueQuestions.length)} / ${uniqueQuestions.length}`);
    }
  }

  console.log("\n🎉 GENERAL MEDICINE UPLOAD COMPLETE! Davidson's, Kumar & Clark's, and Oxford Handbook are now in your database.");
}

uploadGeneralMedData();