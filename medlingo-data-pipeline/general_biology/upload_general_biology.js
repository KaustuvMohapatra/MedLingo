require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase from your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in .env file!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const fileName = 'medlingo_general_biology_db.json';

async function uploadBiologyData() {
  console.log(`📖 Reading ${fileName}...`);
  
  let questions;
  try {
    questions = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  } catch (err) {
    console.error(`❌ Could not find ${fileName}. Did the Python script finish running?`);
    process.exit(1);
  }
  
  console.log(`🚀 Starting upload of ${questions.length} General Biology questions...`);

  // Upload in chunks of 500 to avoid overloading the database
  const DB_CHUNK_SIZE = 500;
  for (let i = 0; i < questions.length; i += DB_CHUNK_SIZE) {
    const chunk = questions.slice(i, i + DB_CHUNK_SIZE);
    
    // Safety check for schema compatibility
    chunk.forEach(q => {
      q.image = null; // No images in this textbook batch
      if (q.answer !== null && q.answer !== undefined) {
        q.answer = String(q.answer); // Force string to match your database schema
      }
    });

    const { error } = await supabase
      .from('questions')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`❌ DB Insert Error at chunk ${i}:`, error.message);
    } else {
      console.log(`   ✅ Successfully uploaded: ${Math.min(i + DB_CHUNK_SIZE, questions.length)} / ${questions.length}`);
    }
  }

  console.log("\n🎉 GENERAL BIOLOGY UPLOAD COMPLETE! Alberts, Lodish, and Karp are now in your database.");
}

uploadBiologyData();