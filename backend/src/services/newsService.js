const Parser = require('rss-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class NewsService {
  constructor() {
    this.parser = new Parser();
    this.articles = [];
    
    // Multiple RSS feeds for diversity
    this.rssFeeds = [
      'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
      'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
      // 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'http://rss.cnn.com/rss/edition.rss',
      // 'http://feeds.reuters.com/Reuters/worldNews',
      // 'https://www.theguardian.com/world/rss',
      // 'http://feeds.feedburner.com/TechCrunch/',
      'https://www.wired.com/feed/rss',
      // 'https://www.bloomberg.com/feed/podcast/etf-report.xml',
      // 'https://www.forbes.com/business/feed/',
      'https://www.ft.com/?format=rss',
      'https://www.espn.com/espn/rss/news',
      'https://feeds.bbci.co.uk/sport/rss.xml',
      'https://variety.com/feed/',
      'https://www.rollingstone.com/music/music-news/feed/',
      // 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
      'https://www.nasa.gov/rss/dyn/breaking_news.rss',
      'https://www.livescience.com/feeds/all',
      // 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
    ];
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
