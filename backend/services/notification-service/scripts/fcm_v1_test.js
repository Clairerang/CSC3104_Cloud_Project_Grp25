const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleAuth } = require('google-auth-library');

async function loadServiceAccount() {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!p) throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON not set');
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const full = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  }
  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

async function run() {
  try {
    const cred = await loadServiceAccount();
    const projectId = cred.project_id || process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('project_id not found in service account');

    // load models from the app
    const modelsModule = require(path.join(__dirname, '..', 'src', 'models'));
    await modelsModule.connectMongo();
    const { DeviceToken } = modelsModule.models;

    const tokenDoc = await DeviceToken.findOne({ revoked: { $ne: true } }).sort({ lastSeenAt: -1 }).lean().exec();
    if (!tokenDoc) {
      console.error('No non-revoked device token found in DB');
      process.exit(2);
    }
    console.log('Using token:', tokenDoc.token.slice(0,40) + '...');

    // mint access token using google-auth-library
    const auth = new GoogleAuth({ credentials: cred, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const tokenResp = await client.getAccessToken();
    const accessToken = tokenResp && tokenResp.token ? tokenResp.token : tokenResp;
    if (!accessToken) throw new Error('Could not obtain access token');

    const body = JSON.stringify({
      message: {
        token: tokenDoc.token,
        notification: { title: 'Diag', body: 'FCM v1 diagnostic' }
      }
    });

    const opts = {
      hostname: 'fcm.googleapis.com',
      path: `/v1/projects/${projectId}/messages:send`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk.toString());
      res.on('end', () => {
        console.log('FCM v1 status', res.statusCode);
        try { console.log('FCM v1 response:', JSON.parse(data)); } catch (e) { console.log('FCM v1 response (raw):', data); }
        process.exit(0);
      });
    });

    req.on('error', (e) => { console.error('request error', e); process.exit(3); });
    req.write(body);
    req.end();

  } catch (e) {
    console.error('fcm_v1_test error', e && e.stack ? e.stack : e);
    process.exit(1);
  }
}

run();
