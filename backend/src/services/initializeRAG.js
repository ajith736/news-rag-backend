const newsService = require('./newsService');
const embeddingService = require('./embeddingService');
const vectorStoreService = require('./vectorStoreService');

class RAGInitializer {
  /**
   * Initialize complete RAG pipeline
   */
  async initialize() {
    try {
      console.log('🚀 Starting RAG Pipeline Initialization...\n');

      // Step 1: Initialize Qdrant collection
      console.log('Step 1: Initializing Vector Database');
      await vectorStoreService.initializeCollection();

      // Step 2: Fetch news articles
      console.log('\nStep 2: Fetching News Articles');
      const articles = await newsService.fetchArticles(50);

      if (articles.length === 0) {
        throw new Error('No articles fetched');
      }

      // Step 3: Prepare texts for embedding
      console.log('\nStep 3: Preparing Texts for Embedding');
      const texts = articles.map(article => 
        newsService.prepareTextForEmbedding(article)
      );

      // Step 4: Generate embeddings
      console.log('\nStep 4: Generating Embeddings');
      const embeddings = await embeddingService.generateEmbeddingsInBatches(texts, 10);

      // Step 5: Store in vector database
      console.log('\nStep 5: Storing Articles in Vector Database');
      await vectorStoreService.storeArticles(articles, embeddings);

      // Step 6: Verify collection
      console.log('\nStep 6: Verifying Collection');
      const collectionInfo = await vectorStoreService.getCollectionInfo();
      console.log(`✅ Collection Points Count: ${collectionInfo.points_count}`);

      console.log('\n🎉 RAG Pipeline Initialization Complete!\n');
      
      return {
        success: true,
        articlesCount: articles.length,
        collectionInfo: collectionInfo
      };
    } catch (error) {
      console.error('\n❌ RAG Initialization Failed:', error.message);
      throw error;
    }
  }

  async refresh() {
    try {
      console.log('\n🧹 Flushing/Deleting existing vector collection...');
      await vectorStoreService.deleteCollection();
      // Now re-initialize as usual
      return await this.initialize();
    } catch (error) {
      console.error('❌ RAG Refresh failed:', error);
      throw error;
    }
  }
}

module.exports = new RAGInitializer();
