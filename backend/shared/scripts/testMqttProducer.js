#!/usr/bin/env node
/**
 * MQTT Test Producer - HiveMQ Edition
 * Replaces old testProducer.js (Kafka version)
 * 
 * Usage: node testMqttProducer.js
 */

const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

console.log(`🔗 Connecting to HiveMQ at mqtt://${MQTT_BROKER}:${MQTT_PORT}...`);

const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `test-producer-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  console.log('✅ Connected to HiveMQ broker');
  
  // Test 1: Daily check-in event (gamification)
  const checkInEvent = {
    type: 'daily_checkin',
    userId: 'test-user-123',
    action: 'daily_checkin',
    timestamp: new Date().toISOString(),
    source: 'test-script'
  };
  
  mqttClient.publish('engagement/events', JSON.stringify(checkInEvent), { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to publish check-in event:', err);
    } else {
      console.log('📤 Published check-in event to engagement/events');
      console.log('   Data:', checkInEvent);
    }
  });
  
  // Test 2: SMS family request
  setTimeout(() => {
    const smsEvent = {
      type: 'sms_family_request',
      userId: 'test-user-123',
      recipient: 'daughter',
      messageContent: 'Test message from MQTT producer',
      originalRequest: 'Send SMS to my daughter',
      timestamp: new Date().toISOString(),
      source: 'test-script'
    };
    
    mqttClient.publish('notification/events', JSON.stringify(smsEvent), { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to publish SMS event:', err);
      } else {
        console.log('📤 Published SMS event to notification/events');
        console.log('   Data:', smsEvent);
      }
    });
  }, 1000);
  
  // Test 3: Badge awarded event (from gamification to notification)
  setTimeout(() => {
    const badgeEvent = {
      type: 'badge_awarded',
      userId: 'test-user-123',
      badge: '7-day streak',
      points: 50,
      timestamp: new Date().toISOString(),
      source: 'gamification-service'
    };
    
    mqttClient.publish('gamification/events', JSON.stringify(badgeEvent), { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to publish badge event:', err);
      } else {
        console.log('📤 Published badge event to gamification/events');
        console.log('   Data:', badgeEvent);
      }
      
      // Disconnect after all tests
      setTimeout(() => {
        console.log('✅ All test events published successfully');
        console.log('🔌 Disconnecting from broker...');
        mqttClient.end();
        process.exit(0);
      }, 500);
    });
  }, 2000);
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT connection error:', err);
  process.exit(1);
});

mqttClient.on('close', () => {
  console.log('👋 Disconnected from HiveMQ broker');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted, closing connection...');
  mqttClient.end();
  process.exit(0);
});
