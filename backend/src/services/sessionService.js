const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
// Ensure env vars are available when this service is executed in isolation
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class SessionService {
   constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number.parseInt(process.env.REDIS_PORT, 10) || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;
    // Use TLS only when explicitly requested or when host is not localhost
    const explicitTls = (process.env.REDIS_TLS || '').toLowerCase() === 'true';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const useTLS = explicitTls && !isLocal;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[sessionService] Redis host:', host);
      console.log('[sessionService] Redis port:', port);
      console.log('[sessionService] Redis TLS:', useTLS);
    }

    const config = {
      socket: { host, port, tls: useTLS ? {} : undefined },
      password
    };

    this.client = redis.createClient(config);
    this.initializeClient();
  }

  async initializeClient() {
    try {
      await this.client.connect();
      console.log('✅ Redis connected successfully');
      
      // Test connection
      await this.client.set('test', 'Hello Redis!');
      const value = await this.client.get('test');
      console.log('Test value:', value);
      
    } catch (error) {
      console.error('❌ Redis connection error:', error);
    }
    
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  createSession() {
    const sessionId = uuidv4();
    return sessionId;
  }

  async addMessage(sessionId, role, content) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    
    await this.client.rPush(
      `session:${sessionId}`,
      JSON.stringify(message)
    );
    
    await this.client.expire(`session:${sessionId}`, 86400);
  }

  async getHistory(sessionId) {
    const messages = await this.client.lRange(`session:${sessionId}`, 0, -1);
    return messages.map(msg => JSON.parse(msg));
  }

  async clearSession(sessionId) {
    await this.client.del(`session:${sessionId}`);
  }

  async disconnect() {
    await this.client.disconnect();
    console.log('Redis disconnected');
  }
}

module.exports = new SessionService();
