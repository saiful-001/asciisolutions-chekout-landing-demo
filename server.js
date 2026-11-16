// ==========================================================
// লোকাল ডেভেলপমেন্ট ও অটো-সেভ সার্ভার (Node.js)
// টার্মিনালে চালান: node server.js
// ==========================================================
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // সরাসরি js/config.js এ সেভ করার API
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.config) {
          const cfgPath = path.join(__dirname, 'js', 'config.js');
          fs.writeFileSync(cfgPath, data.config, 'utf8');
          console.log('✅ [Auto-Save] js/config.js সরাসরি সেভ হয়েছে!');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved directly to project' }));
      } catch (err) {
        console.error('❌ Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // স্ট্যাটিক ফাইল সার্ভার
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, ''));

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n==========================================================`);
  console.log(`🚀 লোকাল অটো-সেভ সার্ভার রানিং: http://localhost:${PORT}`);
  console.log(`🛒 ল্যান্ডিং পেজ:   http://localhost:${PORT}/index.html`);
  console.log(`⚙️ অ্যাডমিন প্যানেল: http://localhost:${PORT}/admin.html`);
  console.log(`💡 এখন অ্যাডমিন প্যানেল থেকে সেভ দিলে সরাসরি প্রজেক্ট ফাইলে সেভ হবে!`);
  console.log(`==========================================================\n`);
});
