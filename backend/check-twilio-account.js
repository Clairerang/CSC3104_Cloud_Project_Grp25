require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('\n🔍 Checking Twilio Account Configuration...\n');
console.log('Account SID:', accountSid);
console.log('Verify Service SID:', verifySid);

const client = twilio(accountSid, authToken);

async function checkAccount() {
  try {
    // Get account info
    console.log('\n📊 Fetching Account Details...');
    const account = await client.api.accounts(accountSid).fetch();
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    console.log('Account Name:', account.friendlyName);

    // Check if trial account
    if (account.type === 'Trial') {
      console.log('\n⚠️  TRIAL ACCOUNT DETECTED');
      console.log('Trial accounts can ONLY send to verified phone numbers.');
      console.log('You must verify phone numbers in Twilio Console first:');
      console.log('https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    }

    // Get verified phone numbers (trial accounts only)
    if (account.type === 'Trial') {
      try {
        console.log('\n📱 Verified Phone Numbers (Trial accounts only send to these):');
        const validationRequests = await client.validationRequests.list({ limit: 20 });
        if (validationRequests.length === 0) {
          console.log('  ❌ No verified phone numbers found!');
          console.log('  You need to add verified numbers at:');
          console.log('  https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        } else {
          validationRequests.forEach(v => {
            console.log(`  ✅ ${v.phoneNumber} (${v.friendlyName || 'No name'})`);
          });
        }
      } catch (err) {
        console.log('  Could not fetch verified numbers:', err.message);
      }
    }

    // Check Verify Service
    console.log('\n🔐 Checking Verify Service...');
    const service = await client.verify.v2.services(verifySid).fetch();
    console.log('Service Name:', service.friendlyName);
    console.log('Service Status:', service.status || 'active');
    console.log('Default Template:', service.defaultTemplateSid || 'N/A');

    // Check balance
    console.log('\n💰 Account Balance...');
    const balance = await client.balance.fetch();
    console.log('Balance:', balance.balance, balance.currency);

    console.log('\n✅ Configuration check complete!\n');

    // Provide recommendations
    console.log('📋 RECOMMENDATIONS:');
    if (account.type === 'Trial') {
      console.log('  1. Add +6598765787 as a verified number in Twilio Console');
      console.log('  2. OR upgrade to a paid account to send to any number');
      console.log('  3. Verify numbers here: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    } else {
      console.log('  ✅ Full account - can send to any number!');
    }

  } catch (error) {
    console.error('\n❌ Error checking account:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.moreInfo) {
      console.error('More Info:', error.moreInfo);
    }
  }
}

checkAccount();
