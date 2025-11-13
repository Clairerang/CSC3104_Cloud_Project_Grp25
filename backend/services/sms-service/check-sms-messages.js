// Check actual SMS messages sent to the number
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('\n📱 Checking SMS Message Delivery...\n');

const client = twilio(accountSid, authToken);

async function checkMessages() {
  try {
    console.log('Fetching SMS messages sent to +6598765787...\n');
    
    const messages = await client.messages.list({ 
      to: '+6598765787',
      limit: 20 
    });

    if (messages.length === 0) {
      console.log('❌ NO SMS MESSAGES FOUND for +6598765787\n');
      console.log('This indicates one of these issues:');
      console.log('1. ⚠️  Twilio Verify service is NOT configured to send actual SMS');
      console.log('2. ⚠️  The Verify service might be in "silent mode" for testing');
      console.log('3. ⚠️  Geographic restrictions might be blocking Singapore numbers');
      console.log('4. ⚠️  Trial account might have additional restrictions\n');
      
      console.log('📋 RECOMMENDATION:');
      console.log('Check your Twilio Verify Service settings at:');
      console.log('https://console.twilio.com/us1/develop/verify/services/' + process.env.TWILIO_VERIFY_SERVICE_SID);
      console.log('\nLook for:');
      console.log('- Geographic Permissions (must include Singapore)');
      console.log('- Service Status (must be Active)');
      console.log('- SMS Channel (must be enabled)');
    } else {
      console.log(`✅ Found ${messages.length} SMS message(s):\n`);
      messages.forEach((msg, i) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Message ${i + 1}:`);
        console.log(`  SID: ${msg.sid}`);
        console.log(`  Status: ${msg.status} ${msg.status === 'delivered' ? '✅' : msg.status === 'sent' ? '⏳' : '❌'}`);
        console.log(`  To: ${msg.to}`);
        console.log(`  From: ${msg.from}`);
        console.log(`  Date: ${msg.dateCreated}`);
        console.log(`  Direction: ${msg.direction}`);
        console.log(`  Price: ${msg.price} ${msg.priceUnit || ''}`);
        
        if (msg.body) {
          console.log(`  Body: ${msg.body.substring(0, 100)}${msg.body.length > 100 ? '...' : ''}`);
        }
        
        if (msg.errorCode) {
          console.log(`  ❌ ERROR CODE: ${msg.errorCode}`);
          console.log(`  ❌ ERROR: ${msg.errorMessage}`);
        }
        
        console.log(`  Segments: ${msg.numSegments}`);
        console.log(`  Media: ${msg.numMedia || 0}`);
      });
    }

    // Also check for any messages sent TODAY
    console.log('\n\n📅 All messages sent TODAY:');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = await client.messages.list({ 
      dateSentAfter: today,
      limit: 50 
    });

    console.log(`Found ${todayMessages.length} total message(s) sent today\n`);
    
    if (todayMessages.length > 0) {
      const toSingapore = todayMessages.filter(m => m.to && m.to.startsWith('+65'));
      console.log(`Messages to Singapore (+65): ${toSingapore.length}`);
      
      toSingapore.forEach(msg => {
        console.log(`  - ${msg.to}: ${msg.status} (${msg.errorCode || 'no error'})`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.status) console.error('Status:', error.status);
  }
}

checkMessages();
