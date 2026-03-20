require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function uploadSpecialData() {
  console.log("📖 Reading medlingo_special_db.json...");
  const questions = JSON.parse(fs.readFileSync('medlingo_special_db.json', 'utf-8'));
  
  console.log(`🚀 Starting upload of ${questions.length} special records...`);

  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];

    // 1. Image Upload Logic
    if (q.local_image_path) {
      try {
        const fileBuffer = fs.readFileSync(q.local_image_path);
        // Clean the path to get just the filename
        const fileName = q.local_image_path.replace(/^medlingo_images[\\/]/, '');
        
        // Upload image to Supabase Storage ('images' bucket)
        const { error: uploadErr } = await supabase.storage
          .from('images')
          .upload(`questions/${fileName}`, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadErr) {
          console.error(`❌ Failed to upload image ${fileName}:`, uploadErr.message);
          continue; 
        }

        // Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`questions/${fileName}`);

        // Attach the public URL to the 'image' column matching your schema
        q.image = urlData.publicUrl;

      } catch (err) {
        console.error(`❌ Image processing error for ${q.id}:`, err);
        continue;
      }
    } else {
        // Ensure the image column is null if there is no image
        q.image = null;
    }

    // Remove the local path key so it doesn't get sent to PostgreSQL
    delete q.local_image_path; 

    // Force the answer to be a string to ensure Postgres accepts it
    if (q.answer !== null && q.answer !== undefined) {
      q.answer = String(q.answer); 
    }

    // 2. Database Insert Logic
    const { error: dbError } = await supabase
      .from('questions')
      .upsert(q, { onConflict: 'id' });

    if (dbError) {
      console.error(`❌ Error uploading question ${q.id} to DB:`, dbError.message);
    } else {
      console.log(`✅ Uploaded [${i + 1}/${questions.length}]: ${q.id} (${q.type})`);
    }
  }

  console.log("🎉 SPECIAL MEDIA UPLOAD COMPLETE! Images and questions are now linked.");
}

uploadSpecialData();