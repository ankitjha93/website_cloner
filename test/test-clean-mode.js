import assert from 'assert';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebsiteCloner } from '../cloner/engine.js';

const PORT = 4568;
const testOutputDir = path.resolve('test-output');
const folderName = 'clean-mode-test';
const cloneFolder = path.join(testOutputDir, folderName);

const sampleHtmlWithTrackers = `<!DOCTYPE html>
<html>
<head>
  <title>Clean Clone Test Page</title>
  <!-- Google Analytics -->
  <script src="https://www.google-analytics.com/analytics.js"></script>
  <!-- Meta Pixel -->
  <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
  <!-- Inline gtag snippet -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-123456');
  </script>
  <!-- Real application script -->
  <script src="/app.js"></script>
</head>
<body>
  <!-- Cookie Consent Banner -->
  <div id="onetrust-consent-sdk">
    <p>We use cookies to improve your experience.</p>
    <button>Accept All</button>
  </div>

  <main>
    <h1>Welcome to Clean Web</h1>
    <p>This page should have zero trackers or cookie banners after cloning.</p>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(sampleHtmlWithTrackers);
  } else if (req.url === '/app.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end('console.log("App script loaded");');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`📡 Mock Server for Clean Mode running on port ${PORT}`);

  try {
    if (fs.existsSync(cloneFolder)) {
      await fs.promises.rm(cloneFolder, { recursive: true, force: true });
    }

    const cloner = new WebsiteCloner({
      targetUrl: `http://localhost:${PORT}/`,
      outputBaseDir: testOutputDir,
      folderName: folderName,
      maxDepth: 1,
      maxPages: 2,
      stripTrackers: true
    });

    cloner.on('log', (l) => console.log(`  [${l.type.toUpperCase()}] ${l.message}`));

    await cloner.start();

    // Verify index.html output
    const savedHtmlPath = path.join(cloneFolder, 'index.html');
    assert(fs.existsSync(savedHtmlPath), 'Saved HTML file exists');

    const cleanedHtml = await fs.promises.readFile(savedHtmlPath, 'utf-8');

    // 1. Google Analytics external script removed
    assert(!cleanedHtml.includes('google-analytics.com'), 'Google Analytics external script was removed');
    // 2. Facebook Pixel external script removed
    assert(!cleanedHtml.includes('connect.facebook.net'), 'Facebook Pixel script was removed');
    // 3. Inline gtag snippet removed
    assert(!cleanedHtml.includes("gtag('config'"), 'Inline gtag code snippet was removed');
    // 4. OneTrust cookie consent banner removed
    assert(!cleanedHtml.includes('onetrust-consent-sdk'), 'OneTrust cookie banner was removed');
    // 5. Legitimate app script preserved
    assert(cleanedHtml.includes('app.js'), 'Legitimate application script was preserved');
    // 6. Content preserved
    assert(cleanedHtml.includes('Welcome to Clean Web'), 'Legitimate HTML content preserved');

    console.log('\n✅ Clean Clone Mode test PASSED! All trackers and cookie banners were successfully sanitized.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Clean Clone Mode test FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
