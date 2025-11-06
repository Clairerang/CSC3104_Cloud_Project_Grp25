// Check verification status and delivery details
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('\n🔍 Checking Verification Delivery Status...\n');

const client = twilio(accountSid, authToken);

async function checkDelivery() {
  try {
    // Check the specific verification attempt
    const verificationSid = 'VE3feaf73358cd8d7e58aa5bc16b12e9e8'; // From previous test
    
    console.log('Fetching verification details...');
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications(verificationSid)
      .fetch();

    console.log('\n📋 Verification Details:');
    console.log('Status:', verification.status);
    console.log('To:', verification.to);
    console.log('Channel:', verification.channel);
    console.log('Valid:', verification.valid);
    console.log('Created:', verification.dateCreated);
    console.log('Updated:', verification.dateUpdated);
    
    console.log('\n📤 Send Attempts:');
    if (verification.sendCodeAttempts && verification.sendCodeAttempts.length > 0) {
      verification.sendCodeAttempts.forEach((attempt, i) => {
        console.log(`\nAttempt ${i + 1}:`);
        console.log('  SID:', attempt.attempt_sid);
        console.log('  Channel:', attempt.channel);
        console.log('  Time:', attempt.time);
      });
    } else {
      console.log('No send attempts recorded');
    }

    // Now check actual SMS messages sent from your account
    console.log('\n\n📱 Checking SMS Messages (last 10)...');
    const messages = await client.messages.list({ 
      to: '+6598765787',
      limit: 10 
    });

    if (messages.length === 0) {
      console.log('❌ NO SMS MESSAGES FOUND for +6598765787');
      console.log('\nThis means:');
      console.log('1. Twilio Verify is NOT actually sending SMS');
      console.log('2. The Verify service might not be properly configured');
      console.log('3. The number might not be approved for your Verify service');
    } else {
      messages.forEach((msg, i) => {
        console.log(`\nMessage ${i + 1}:`);
        console.log('  SID:', msg.sid);
        console.log('  Status:', msg.status);
        console.log('  To:', msg.to);
        console.log('  From:', msg.from);
        console.log('  Date:', msg.dateCreated);
        console.log('  Body:', msg.body ? msg.body.substring(0, 50) + '...' : 'N/A');
        console.log('  Error Code:', msg.errorCode || 'None');
        console.log('  Error Message:', msg.errorMessage || 'None');
      });
    }

    // Check Verify service configuration
    console.log('\n\n🔐 Verify Service Configuration:');
    const service = await client.verify.v2.services(verifySid).fetch();
    console.log('Service Name:', service.friendlyName);
    console.log('Code Length:', service.codeLength);
    console.log('Lookup Enabled:', service.lookupEnabled);
    console.log('Do Not Share Warning:', service.doNotShareWarningEnabled);
    console.log('Custom Code:', service.customCodeEnabled);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.status) console.error('Status:', error.status);
  }
}

checkDelivery();
