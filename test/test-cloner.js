import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebsiteCloner } from '../cloner/engine.js';

async function runTest() {
  console.log('🧪 Starting Website Cloner Verification Test...');

  // 1. Create a dummy test server
  const testServer = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Cloner Site</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <h1>Hello World</h1>
          <p>Testing cloner engine.</p>
          <img src="/logo.png" alt="Test Logo">
          <a href="/subpage.html">Go to Subpage</a>
        </body>
        </html>
      `);
    } else if (req.url === '/subpage.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Subpage</title></head>
        <body><h2>Subpage Content</h2><a href="/index.html">Back to Home</a></body>
        </html>
      `);
    } else if (req.url === '/style.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(`
        body { background: #111; color: #fff; font-family: sans-serif; }
        .banner { background-image: url('/banner.jpg'); }
      `);
    } else if (req.url === '/logo.png' || req.url === '/banner.jpg') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])); // PNG header
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  const TEST_PORT = 4567;
  await new Promise((resolve) => testServer.listen(TEST_PORT, resolve));
  console.log(`📡 Mock HTTP test server listening on port ${TEST_PORT}`);

  const testOutputDir = path.join(process.cwd(), 'test-output');
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }

  try {
    const cloner = new WebsiteCloner({
      targetUrl: `http://localhost:${TEST_PORT}/`,
      maxDepth: 2,
      maxPages: 10,
      concurrency: 2,
      outputBaseDir: testOutputDir,
      folderName: 'test-clone-job'
    });

    cloner.on('log', (l) => console.log(`  [${l.type.toUpperCase()}] ${l.message}`));

    const result = await cloner.start();

    // Check assertions
    const cloneFolder = path.join(testOutputDir, 'test-clone-job');
    const indexHtmlPath = path.join(cloneFolder, 'index.html');
    const subpagePath = path.join(cloneFolder, 'subpage.html');
    const cssPath = path.join(cloneFolder, 'style.css');
    const manifestPath = path.join(cloneFolder, 'site_manifest.json');

    if (!fs.existsSync(indexHtmlPath)) throw new Error('index.html was not generated');
    if (!fs.existsSync(subpagePath)) throw new Error('subpage.html was not generated');
    if (!fs.existsSync(cssPath)) throw new Error('style.css was not generated');
    if (!fs.existsSync(manifestPath)) throw new Error('site_manifest.json was not generated');

    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    if (!indexHtmlContent.includes('subpage.html')) {
      throw new Error('Relative link to subpage.html not found in index.html');
    }

    console.log('\n✅ All tests passed successfully!');
    console.log(`   Pages crawled: ${result.stats.pages}`);
    console.log(`   Assets downloaded: ${result.stats.assets}`);
    console.log(`   Total bytes: ${result.stats.totalBytesFormatted}`);
  } finally {
    testServer.close();
    // Clean up test output
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
