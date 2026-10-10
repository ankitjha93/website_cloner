import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditClonedDirectory } from '../cloner/securityScanner.js';
import { detectTechStack } from '../cloner/techDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, '../test-output/security-audit-test');

async function runSecurityTests() {
  console.log('🛡️ Starting Security Scanner & Tech Detector Unit Test...\n');

  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });

  // 1. Create a mock index.html with React, Tailwind, and Google Fonts
  const mockHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Mock Tech Test</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
  <link rel="stylesheet" href="styles.css">
  <meta name="generator" content="Next.js">
</head>
<body class="flex items-center justify-between p-6 bg-slate-900 text-sky-400 rounded-xl">
  <div id="root" data-reactroot=""></div>
  <i data-lucide="shield-check"></i>
  <script src="app.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(TEST_DIR, 'index.html'), mockHtml);

  // 2. Create a mock app.js with React signature + vulnerable eval & CoinHive miner pattern
  const mockJs = `
// React client code
const React = { version: "18.2.0" };
window._reactInternalInstance = true;

// Suspicious/Malicious patterns for test verification
function executeDynamic(payload) {
  return eval(payload); // Dangerous eval
}

// Simulated cryptominer pattern
const miner = { start: function() { console.log("CoinHive mining started"); } };
miner.start();

// Document write sink
document.write("<p>Insecure</p>");
`;
  fs.writeFileSync(path.join(TEST_DIR, 'app.js'), mockJs);

  // Test 1: Run Security Scanner
  console.log('Testing auditClonedDirectory()...');
  const audit = await auditClonedDirectory(TEST_DIR);

  console.log(`  Score: ${audit.score}/100, Grade: ${audit.grade}, Risk: ${audit.riskLevel}`);
  console.log(`  Total findings: ${audit.stats.totalFindings}`);

  assert(audit.score < 100, 'Security score should be reduced due to findings');
  assert(audit.findings.length >= 3, 'Should detect at least 3 findings (eval, miner, document.write)');

  const hasEval = audit.findings.some(f => f.id === 'DANGEROUS_EVAL');
  const hasMiner = audit.findings.some(f => f.id === 'CRYPTOMINER');
  const hasDocWrite = audit.findings.some(f => f.id === 'DOCUMENT_WRITE_SINK');

  assert(hasEval, 'Should detect DANGEROUS_EVAL finding');
  assert(hasMiner, 'Should detect CRYPTOMINER finding');
  assert(hasDocWrite, 'Should detect DOCUMENT_WRITE_SINK finding');
  console.log('  ✅ Security scanner accurately caught all malicious patterns!\n');

  // Test 2: Run Tech Stack Detector
  console.log('Testing detectTechStack()...');
  const techReport = await detectTechStack(TEST_DIR);
  const techNames = techReport.technologies.map(t => t.name);
  console.log(`  Detected technologies: ${techNames.join(', ')}`);

  assert(techNames.includes('React'), 'Should detect React framework');
  assert(techNames.includes('Next.js'), 'Should detect Next.js');
  assert(techNames.includes('Tailwind CSS'), 'Should detect Tailwind CSS');
  assert(techNames.includes('Lucide Icons'), 'Should detect Lucide Icons');
  assert(techNames.includes('Google Fonts'), 'Should detect Google Fonts');
  console.log('  ✅ Tech stack fingerprinter correctly identified all technologies!\n');

  // Cleanup
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  console.log('🎉 All Security & Tech Detector tests passed with 100% success!\n');
}

runSecurityTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
