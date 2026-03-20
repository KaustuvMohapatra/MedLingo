require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in .env file!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("📖 Reading medlingo_master_db.json...");
let questions;
try {
  questions = JSON.parse(fs.readFileSync('medlingo_master_db.json', 'utf-8'));
} catch (err) {
  console.error("❌ Cannot find 'medlingo_master_db.json'. Did you run the Python script first?");
  process.exit(1);
}

async function uploadInChunks() {
  const CHUNK_SIZE = 500;
  console.log(`🚀 Starting upload of ${questions.length} questions in chunks of ${CHUNK_SIZE}...`);

  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    const chunk = questions.slice(i, i + CHUNK_SIZE);
    
    console.log(`⏳ Uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(questions.length / CHUNK_SIZE)}...`);
    
    // .upsert({ onConflict: 'id' }) tells Supabase: "If a question with this ID already exists in the database, update it, don't throw an error!"
    const { error } = await supabase
      .from('questions')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error uploading chunk starting at index ${i}:`, error.message);
    } else {
      console.log(`✅ Chunk successfully merged into database!`);
    }
  }

  console.log("🎉 MEGA DATABASE UPLOAD COMPLETE! Zero duplicates.");
}

uploadInChunks();