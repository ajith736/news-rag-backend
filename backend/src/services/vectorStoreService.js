const { QdrantClient } = require('@qdrant/js-client-rest');
const config = require('../config/config');

class VectorStoreService {


    constructor() {
    // Qdrant Cloud configuration
    this.client = new QdrantClient({
      url:  config.qdrant.url,
      apiKey:  config.qdrant.apiKey
    });
    
    this.collectionName = config.qdrant.collectionName || 'news_articles';
    this.vectorDimension = parseInt(config.qdrant.embeddingDimension) || 768;
     if (process.env.NODE_ENV !== 'production') {
      console.log('[vectorStore] Using Qdrant URL:', config.qdrant.url);
      console.log('[vectorStore] Collection:', this.collectionName);
    }
  }

  /**
   * Initialize Qdrant collection
   */
  async initializeCollection() {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        col => col.name === this.collectionName
      );
      // console.log(collections.collections);

      if (exists) {
        console.log(`✅ Collection '${this.collectionName}' already exists`);
        return;
      }

      // Create new collection
      console.log('Initializing Qdrant collection:', this.collectionName);
      

    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: this.vectorDimension,
        distance: 'Cosine'
      }
    });

    console.log('Collection initialized successfully');
  } catch (error) {
    console.error('Error initializing collection:', error);
    throw error;
  }

  }

  async deleteCollection() {
    try {
      await this.client.deleteCollection(this.collectionName);
      console.log(`Collection '${this.collectionName}' deleted successfully`);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

//   /**
//    * Store articles with their embeddings in Qdrant
//    * @param {Array} articles - Array of article objects
//    * @param {Array} embeddings - Array of embedding vectors
//    */
  async storeArticles(articles, embeddings) {
    try {
      console.log(`🔄 Storing ${articles.length} articles in Qdrant...`);

      // Prepare points for upsert
      const points = articles.map((article, index) => ({
        id: index + 1, // Qdrant requires numeric or UUID ids
        vector: embeddings[index],
        payload: {
          uuid: article.id,
          title: article.title,
          content: article.content,
          link: article.link,
          pubDate: article.pubDate,
          source: article.source,
          category: article.category
        }
      }));

      // Upsert in batches
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        
        await this.client.upsert(this.collectionName, {
          wait: true,
          points: batch
        });

        console.log(`✅ Stored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(points.length / batchSize)}`);
      }

      console.log(`✅ Successfully stored all ${articles.length} articles`);
    } catch (error) {
      console.error('❌ Error storing articles:', error.message);
      throw error;
    }
  }

//   /**
//    * Search for similar articles based on query embedding
//    * @param {Array<number>} queryEmbedding - Query vector
//    * @param {number} limit - Number of results to return
//    */
  async searchSimilar(queryEmbedding, limit = 5) {
    try {
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: limit,
        with_payload: true
      });

      return searchResult.map(result => ({
        score: result.score,
        ...result.payload
      }));
    } catch (error) {
      console.error('❌ Error searching vectors:', error.message);
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo() {
    try {
      return await this.client.getCollection(this.collectionName);
    } catch (error) {
      console.error('❌ Error getting collection info:', error.message);
      throw error;
    }
  }
}

module.exports = new VectorStoreService();
