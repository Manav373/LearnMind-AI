import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { searchYouTube, getVideoDetails } from '../src/services/youtube.service';

async function test() {
  const query = 'Python Tutorial for Beginners';
  console.log(`\n🔍 Testing YouTube search for: "${query}"...`);
  
  try {
    const results = await searchYouTube(query);
    console.log(`✅ Search successful! Found ${results.length} results.`);
    
    if (results.length > 0) {
      const first = results[0];
      console.log('\n--- First Result ---');
      console.log(JSON.stringify(first, null, 2));
      
      if (!first.id) {
        console.log('❌ ERROR: Result is missing an ID! Video playback will fail.');
      } else {
        console.log(`\n🔍 Testing details fetch for ID: ${first.id}...`);
        const details = await getVideoDetails(first.id);
        
        if (details) {
          console.log('✅ Details fetch successful!');
          console.log(`Title from details: ${details.title}`);
        } else {
          console.log('❌ Details fetch returned null.');
        }
      }
    } else {
      console.log('⚠️ No results found.');
    }
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message || error);
  }
}

test();
