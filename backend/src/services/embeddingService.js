const axios = require('axios');
const config = require('../config/config');

class EmbeddingService {
  constructor() {
    this.apiKey = config.jina.apiKey;
    this.apiUrl = config.jina.apiUrl;
    this.model = config.jina.model;
  }

//   /**
//    * Generate embeddings for multiple texts
//    * @param {Array<string>} texts - Array of text strings
//    * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
//    */
  async generateEmbeddings(texts) {
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for embedding generation');
    }

    try {
      console.log(`🔄 Generating embeddings for ${texts.length} texts...`);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          input: texts,
          encoding_type: 'float'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const embeddings = response.data.data.map(item => item.embedding);
      console.log(`✅ Generated ${embeddings.length} embeddings`);
      
      return embeddings;
    } catch (error) {
      console.error('❌ Error generating embeddings:', error.response?.data || error.message);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

//   /**
//    * Generate single embedding
//    * @param {string} text - Single text string
//    * @returns {Promise<Array<number>>} Embedding vector
//    */
  async generateEmbedding(text) {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

//   /**
//    * Generate embeddings in batches to avoid API limits
//    * @param {Array<string>} texts - Array of texts
//    * @param {number} batchSize - Size of each batch
//    */
  async generateEmbeddingsInBatches(texts, batchSize = 10) {
    const allEmbeddings = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
      
      const embeddings = await this.generateEmbeddings(batch);
      allEmbeddings.push(...embeddings);
      
      // Add delay to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return allEmbeddings;
  }
}

module.exports = new EmbeddingService();
