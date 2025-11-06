const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  {
    url: 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
    dest: path.join(__dirname, '..', 'testing-notification', 'vendor', 'firebase-app-compat.js')
  },
  {
    url: 'https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js',
    dest: path.join(__dirname, '..', 'testing-notification', 'vendor', 'firebase-messaging-compat.js')
  }
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async function(){
  for (const f of files) {
    try {
      console.log('Downloading', f.url, '->', f.dest);
      await download(f.url, f.dest);
    } catch (e) {
      console.warn('Warning: failed to download', f.url, e && e.message ? e.message : e);
    }
  }
})();
