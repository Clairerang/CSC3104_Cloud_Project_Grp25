const path = require('path');

(async function(){
  try {
    // load app models
    const modelsModule = require(path.join(__dirname, '..', 'src', 'models'));
    await modelsModule.connectMongo();
    const { DeviceToken } = modelsModule.models;

    const tokenDoc = await DeviceToken.findOne({ revoked: { $ne: true } }).sort({ lastSeenAt: -1 }).lean().exec();
    if (!tokenDoc) {
      console.error('No non-revoked device token found');
      process.exit(2);
    }
    console.log('Found token for user', tokenDoc.userId, 'token-preview', (tokenDoc.token||'').slice(0,40) + '...');

    // trigger a checkin for that user via local HTTP call
    const payload = { userId: tokenDoc.userId, mood: 'automated-ok' };
    const res = await fetch('http://localhost:4002/checkin', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const j = await res.json();
    console.log('/checkin response', j);
    process.exit(0);
  } catch (e) {
    console.error('auto_trigger_checkin error', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
