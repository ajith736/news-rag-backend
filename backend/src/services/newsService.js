const Parser = require('rss-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class NewsService {
  constructor() {
    this.parser = new Parser();
    this.articles = [];
    
    // Multiple RSS feeds for diversity
    this.rssFeeds = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.reuters.com/reuters/worldNews',
  'https://feeds.bloomberg.com/markets/news.rss',
  'https://feeds.cnbc.com/cnbc/world',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://feeds.theguardian.com/theguardian/world/rss',
  'https://feeds.nytimes.com/services/xml/rss/nyt/world.xml',
  'https://apnews.com/hub/world-news/rss',
  'https://feeds.france24.com/en/rss/',
  'https://www.theaustralian.com.au/feed/',
  'https://feeds.timesofindia.indiatimes.com/toi-world/feedlatest.cms',
  'https://feeds.ndtv.com/ndtv/latest',
  'https://indianexpress.com/feed/',
  'https://feeds.thehindu.com/thehindu/latest/',
  'https://feeds.news18.com/rss/',
  'https://feeds.business-standard.com/news/rss/',
  'https://feeds.economictimes.indiatimes.com/economictimes/economictimes-all.xml',
  'https://firstpost.com/feed/'];
  }

  /**
   * Fetch articles from multiple RSS feeds
   */
  async fetchArticles(targetCount = 50) {
    console.log('📰 Fetching news articles...');
    const allArticles = [];

    for (const feedUrl of this.rssFeeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        const articles = feed.items.map(item => ({
          id: uuidv4(),
          title: item.title || '',
          content: this.cleanContent(item.contentSnippet || item.content || item.summary || ''),
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          source: feed.title || 'Unknown',
          category: item.categories ? item.categories.join(', ') : 'General'
        }));

        allArticles.push(...articles);
        console.log(`✅ Fetched ${articles.length} articles from ${feed.title}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${feedUrl}:`, error.message);
      }
    }

    // Shuffle articles for random diversity
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Shuffle before slicing
    this.articles = shuffle(allArticles).slice(0, targetCount);
    console.log(`✅ Total articles collected: ${this.articles.length}`);
    
    return this.articles;
  }

  /**
   * Clean HTML tags and extra whitespace from content
   */
  cleanContent(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Prepare text for embedding (title + content)
   */
  prepareTextForEmbedding(article) {
    return `${article.title}. ${article.content}`.trim();
  }

  /**
   * Get all articles
   */
  getArticles() {
    return this.articles;
  }
}

module.exports = new NewsService();
