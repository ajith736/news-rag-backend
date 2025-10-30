const path = require('path');
// Ensure env vars are loaded when running this script directly
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const ragInitializer = require('./services/initializeRAG');
const ragService = require('./services/ragService');

async function main() {
  try {
    // TEST: Flush and Reinitialize RAG pipeline
    console.log('\n--- RAG FLUSH/REFRESH TEST ---');
    const refreshInfo = await ragInitializer.refresh();
    console.log('\n[REFRESH] Vector collection reloaded.');
    console.log('  - Success:', refreshInfo.success);
    console.log('  - Articles Count:', refreshInfo.articlesCount);
    console.log('  - DB Collection Info:', refreshInfo.collectionInfo);

    // Optionally: Run some test queries
    const testQueries = [
      "What are the latest developments in climate change?",
      "Tell me about recent technology news",
      "What's happening in world politics?"
    ];

    console.log('\n' + '='.repeat(60));
    console.log('Testing RAG Pipeline with Sample Queries');
    console.log('='.repeat(60) + '\n');

    for (const query of testQueries) {
      console.log(`\n📝 Query: ${query}`);
      console.log('-'.repeat(60));
      
      const result = await ragService.answerQuery(query);
      
      console.log(`\n💡 Answer:\n${result.answer}`);
      console.log(`\n📚 Sources:`);
      result.sources.forEach((source, index) => {
        console.log(`  ${index + 1}. ${source.title} (${source.source}) - Score: ${source.relevanceScore?.toFixed(3)}`);
      });
      console.log('\n' + '='.repeat(60));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
