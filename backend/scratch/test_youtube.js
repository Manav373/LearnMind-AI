require('dotenv').config({ path: __dirname + '/../.env' });
const { searchYouTube, getVideoDetails } = require('../src/services/youtube.service');

async function test() {
  const query = 'Python Tutorial for Beginners';
  console.log(`\n🔍 Testing YouTube search for: "${query}"...`);
  
  try {
    const results = await searchYouTube(query);
    console.log(`✅ Search successful! Found ${results.length} results.`);
    
    if (results.length > 0) {
      const first = results[0];
      console.log('\n--- First Result ---');
      console.log(`ID: ${first.id}`);
      console.log(`Title: ${first.title}`);
      console.log(`Thumbnail: ${first.thumbnail}`);
      
      if (!first.id) {
        console.log('❌ ERROR: Result is missing an ID! This is why the video won\'t play.');
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
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

test();
