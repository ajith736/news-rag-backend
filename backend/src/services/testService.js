require('dotenv').config();
const sessionService = require('./sessionService');

async function testSession() {
  // Wait for Redis to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test 1: Create session
    const sessionId = sessionService.createSession();
    console.log('✓ Session created:', sessionId);

    // Test 2: Add messages
    await sessionService.addMessage(sessionId, 'user', 'Hello!');
    await sessionService.addMessage(sessionId, 'assistant', 'Hi! How can I help?');
    console.log('✓ Messages added');

    // Test 3: Get history
    const history = await sessionService.getHistory(sessionId);
    console.log('✓ Session history:', history);

    // Test 4: Clear session
    await sessionService.clearSession(sessionId);
    console.log('✓ Session cleared');

    // Disconnect
    await sessionService.disconnect();
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSession();
