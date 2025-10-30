const {
    GoogleGenerativeAI
} = require('@google/generative-ai');
const config = require('../config/config');
const embeddingService = require('./embeddingService');
const vectorStoreService = require('./vectorStoreService');

class RAGService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: config.gemini.model
        });
        this.topK = config.rag.topK;
    }

    //   /**
    //    * Answer a query using RAG pipeline
    //    * @param {string} query - User query
    //    * @returns {Promise<Object>} Answer and sources
    //    */
    async answerQuery(query) {
        try {
            console.log(`🔍 Processing query: "${query}"`);

            // Step 1: Generate query embedding
            const queryEmbedding = await embeddingService.generateEmbedding(query);

            // Step 2: Retrieve top-k similar documents
            const retrievedDocs = await vectorStoreService.searchSimilar(
                queryEmbedding,
                this.topK
            );

            console.log(`✅ Retrieved ${retrievedDocs.length} relevant articles`);

            // Step 3: Prepare context from retrieved documents
            const context = this.prepareContext(retrievedDocs);

            // Step 4: Generate answer using Gemini
            const answer = await this.generateAnswer(query, context);

            return {
                answer: answer,
                sources: retrievedDocs.map(doc => ({
                    title: doc.title,
                    source: doc.source,
                    link: doc.link,
                    relevanceScore: doc.score
                }))
            };
        } catch (error) {
            console.error('❌ Error in RAG pipeline:', error.message);
            throw error;
        }
    }

    /**
     * Prepare context from retrieved documents
     */
    prepareContext(documents) {
        return documents
            .map((doc, index) => {
                return `[Document ${index + 1}]
Title: ${doc.title}
Source: ${doc.source}
Content: ${doc.content}
---`;
            })
            .join('\n\n');
    }

    /**
     * Generate answer using Gemini with context
     */
    async generateAnswer(query, context) {
        const prompt = `You are a helpful AI assistant that answers questions based on news articles.

CONTEXT (Retrieved News Articles):
${context}

USER QUESTION: ${query}

INSTRUCTIONS:
- Answer the question based ONLY on the information provided in the context above
- If the context doesn't contain enough information to answer the question, say so
- Be concise and informative
- Cite which document(s) you're referencing when possible
- Do not make up information

ANSWER:`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('❌ Error generating answer with Gemini:', error.message);
            throw new Error('Failed to generate answer');
        }
    }
}

module.exports = new RAGService();