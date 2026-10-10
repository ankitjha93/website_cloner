import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TokenBucketRateLimiter } from '../cloner/rateLimiter.js';
import { RobotsParser } from '../cloner/robotsParser.js';
import { WebsiteCloner } from '../cloner/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.join(__dirname, 'test_output_resilience');

async function runTests() {
  console.log('🧪 Starting Phase 2 Resilient Crawl Engine Test Suite...\n');

  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });

  // -------------------------------------------------------------
  // Test 1: Token Bucket Rate Limiter
  // -------------------------------------------------------------
  console.log('Test 1: TokenBucketRateLimiter token consumption & refill...');
  const limiter = new TokenBucketRateLimiter(10, 10);
  assert.strictEqual(limiter.tokens, 10, 'Initial capacity should be 10');

  // Consume 5 tokens
  await limiter.consume(5);
  assert(limiter.tokens <= 5.1 && limiter.tokens >= 4.8, 'Tokens should be depleted by 5');

  // Dynamically set new rate
  limiter.setRate(20);
  assert.strictEqual(limiter.rps, 20, 'RPS should update to 20');

  // Test backoff calculation
  const startBackoff = Date.now();
  const delay = await limiter.waitBackoff(0, 100, 500); // 100ms base, max 500
  const elapsedBackoff = Date.now() - startBackoff;
  assert(delay >= 100, 'Backoff delay should be >= 100ms');
  assert(elapsedBackoff >= 90, 'Wait should pause execution');
  console.log('  ✓ TokenBucketRateLimiter passed.\n');

  // -------------------------------------------------------------
  // Test 2: Robots.txt RFC 9309 Parser
  // -------------------------------------------------------------
  console.log('Test 2: RobotsParser parsing & rule evaluation...');
  const parser = new RobotsParser();
  const sampleRobotsTxt = `
# Sample robots.txt
User-agent: *
Disallow: /admin/
Disallow: /private/secret.html
Allow: /admin/public/
Crawl-delay: 2.5

User-agent: Googlebot
Disallow: /no-google/
`;

  parser.parse(sampleRobotsTxt);
  assert.strictEqual(parser.crawlDelay, 2.5, 'Crawl-delay should be 2.5');
  assert.strictEqual(parser.isAllowed('/index.html'), true, 'Public root should be allowed');
  assert.strictEqual(parser.isAllowed('/admin/dashboard'), false, '/admin/dashboard should be disallowed');
  assert.strictEqual(parser.isAllowed('/admin/public/login'), true, '/admin/public/ should be allowed by override');
  assert.strictEqual(parser.isAllowed('/private/secret.html'), false, '/private/secret.html should be disallowed');
  assert.strictEqual(parser.isAllowed('/about'), true, '/about should be allowed');
  console.log('  ✓ RobotsParser passed.\n');

  // -------------------------------------------------------------
  // Test 3: Checkpoint Persistence & Recovery
  // -------------------------------------------------------------
  console.log('Test 3: Engine Checkpoint Save & Resume...');
  const siteFolder = 'resilience_test_site';
  const cloner1 = new WebsiteCloner({
    targetUrl: 'https://example.com',
    folderName: siteFolder,
    outputBaseDir: TEST_DIR,
    requestsPerSecond: 10
  });

  // Emulate partial crawl state
  cloner1.origin = 'https://example.com';
  cloner1.hostname = 'example.com';
  cloner1.siteTitle = 'Example Domain Test';
  cloner1.visitedUrls.add('https://example.com');
  cloner1.visitedUrls.add('https://example.com/page1');
  cloner1.pageQueue.push({ url: 'https://example.com/page2', depth: 2 });
  cloner1.stats.pagesCrawled = 2;
  cloner1.stats.assetsDownloaded = 4;
  cloner1.stats.totalBytes = 2048;

  await cloner1.saveCheckpoint();

  const checkpointFile = path.join(TEST_DIR, siteFolder, 'crawl_checkpoint.json');
  assert(fs.existsSync(checkpointFile), 'Checkpoint file must be written to disk');

  // Verify checkpoint contents
  const rawCheckpoint = fs.readFileSync(checkpointFile, 'utf-8');
  const checkpointJson = JSON.parse(rawCheckpoint);
  assert.strictEqual(checkpointJson.targetUrl, 'https://example.com');
  assert.strictEqual(checkpointJson.stats.pagesCrawled, 2);
  assert.strictEqual(checkpointJson.pageQueue.length, 1);

  // Resume with cloner2
  const cloner2 = new WebsiteCloner({
    targetUrl: 'https://example.com',
    folderName: siteFolder,
    outputBaseDir: TEST_DIR,
    resume: true
  });

  const resumed = await cloner2.loadCheckpoint();
  assert.strictEqual(resumed, true, 'Checkpoint should load successfully');
  assert.strictEqual(cloner2.siteTitle, 'Example Domain Test', 'Title should be restored');
  assert.strictEqual(cloner2.stats.pagesCrawled, 2, 'pagesCrawled count should be restored');
  assert.strictEqual(cloner2.pageQueue.length, 1, 'pageQueue item should be restored');
  assert.strictEqual(cloner2.pageQueue[0].url, 'https://example.com/page2');
  console.log('  ✓ Checkpoint Save & Resume passed.\n');

  // Clean up
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  console.log('🎉 All Phase 2 Resilient Crawl Engine Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
