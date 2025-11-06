// Direct test of Twilio Verify - run inside SMS container
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
const testPhone = process.env.TEST_PHONE || '+6598765787';

console.log('\n🧪 Testing Twilio Verify Service...\n');
console.log('Account SID:', accountSid);
console.log('Verify Service SID:', verifySid);
console.log('Test Phone:', testPhone);

const client = twilio(accountSid, authToken);

async function testVerify() {
  try {
    console.log('\n📤 Sending verification code...');
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications
      .create({ to: testPhone, channel: 'sms' });

    console.log('\n✅ SUCCESS!');
    console.log('Status:', verification.status);
    console.log('To:', verification.to);
    console.log('Channel:', verification.channel);
    console.log('SID:', verification.sid);
    console.log('Valid:', verification.valid);
    console.log('\nFull response:', JSON.stringify(verification, null, 2));

    if (verification.status === 'pending') {
      console.log('\n⏳ Verification is PENDING - SMS should be sent!');
      console.log('Check your phone for the code.');
      console.log('\nIf you don\'t receive it:');
      console.log('1. Check Twilio Console logs: https://console.twilio.com/us1/monitor/logs/sms');
      console.log('2. Verify the number is correct in E.164 format');
      console.log('3. Check if the number is blocked or has delivery issues');
    } else {
      console.log('\n⚠️  Unexpected status:', verification.status);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    if (error.moreInfo) {
      console.error('More Info:', error.moreInfo);
    }
    console.error('\nFull error:', JSON.stringify(error, null, 2));
  }
}

testVerify();
