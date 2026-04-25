const youtubeSearch = require('youtube-search-api');
require('dotenv').config({ path: __dirname + '/../.env' });

async function run() {
  console.log("🚀 Running direct youtube-search-api test...");
  try {
    const query = "React Tutorial full course";
    const results = await youtubeSearch.GetListByKeyword(query, false, 5, [{type: "video"}]);
    
    console.log(`\nFound ${results.items.length} results.`);
    
    if (results.items.length > 0) {
      console.log('\n--- First Result (Raw) ---');
      console.log(JSON.stringify(results.items[0], null, 2));
    }
    
  } catch (err) {
    console.error("❌ Error during test:", err);
  }
}

run();
