/**
 * Simple test script to verify MQTT integration
 * Run this with: node test-mqtt.js
 */

const { initializeMQTT, sendRequest, disconnect } = require('./mqtt/client');
const { v4: uuidv4 } = require('uuid');

async function testMQTTIntegration() {
  console.log('🚀 Starting MQTT Integration Test...\n');

  // Initialize MQTT client
  const client = initializeMQTT();

  // Wait for connection
  await new Promise((resolve) => {
    if (client.connected) {
      resolve();
    } else {
      client.once('connect', resolve);
    }
  });

  console.log('✅ MQTT Client connected\n');

  try {
    // Test 1: Get games list
    console.log('Test 1: Fetching games list...');
    const gamesResponse = await sendRequest('games/request/list', {
      correlationId: uuidv4(),
      userId: 'test-user-123'
    });
    console.log('✅ Games list:', JSON.stringify(gamesResponse, null, 2));
    console.log('');

    // Test 2: Get trivia questions
    console.log('Test 2: Fetching trivia questions...');
    const triviaResponse = await sendRequest('games/request/trivia', {
      correlationId: uuidv4(),
      userId: 'test-user-123',
      count: 3
    });
    console.log('✅ Trivia questions:', JSON.stringify(triviaResponse, null, 2));
    console.log('');

    // Test 3: Get memory game
    console.log('Test 3: Fetching memory game...');
    const memoryResponse = await sendRequest('games/request/memory', {
      correlationId: uuidv4(),
      userId: 'test-user-123',
      difficulty: 'easy'
    });
    console.log('✅ Memory game:', JSON.stringify(memoryResponse, null, 2));
    console.log('');

    // Test 4: Get stretch exercises
    console.log('Test 4: Fetching stretch exercises...');
    const stretchResponse = await sendRequest('games/request/stretch', {
      correlationId: uuidv4(),
      userId: 'test-user-123'
    });
    console.log('✅ Stretch exercises:', JSON.stringify(stretchResponse, null, 2));
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    console.log('\n🔌 Disconnecting MQTT client...');
    disconnect();
    console.log('✅ Done!');
    process.exit(0);
  }
}

// Run tests
testMQTTIntegration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
