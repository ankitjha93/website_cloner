import fs from 'fs';
import path from 'path';

/**
 * Heuristic AST & Regex Security Rules for Client-side Scripts
 */
const SECURITY_RULES = [
  {
    id: 'CRYPTOMINER',
    severity: 'CRITICAL',
    penalty: 35,
    title: 'Cryptocurrency Miner Signature',
    regex: /(?:coinhive|cryptoloot|miner\.start|CoinHive\.Anonymous|webassembly\s*miner)/i,
    description: 'Detected client-side cryptocurrency mining script signature (e.g. CoinHive, CryptoLoot).',
    recommendation: 'Remove mining web workers immediately to protect user CPU and battery life.'
  },
  {
    id: 'DANGEROUS_EVAL',
    severity: 'HIGH',
    penalty: 25,
    title: 'Arbitrary Code Execution Sink (eval / Function)',
    regex: /(?:\beval\s*\(|new\s+Function\s*\()/g,
    description: 'Dynamic code execution via eval() or new Function() allows arbitrary code injection and exploits.',
    recommendation: 'Refactor dynamic string evaluation to native JSON.parse() or statically typed logic.'
  },
  {
    id: 'OBFUSCATION_HEX_CHAIN',
    severity: 'HIGH',
    penalty: 20,
    title: 'Heavily Obfuscated String Sequence',
    regex: /(?:\\x[0-9a-fA-F]{2}){8,}|(?:\\u[0-9a-fA-F]{4}){8,}/g,
    description: 'Detected packed or hex-encoded payload commonly used by exploit kits and malware droppers.',
    recommendation: 'De-obfuscate script source and verify payload legitimacy before serving.'
  },
  {
    id: 'OBFUSCATION_CHARCODE',
    severity: 'MEDIUM',
    penalty: 15,
    title: 'Chained String.fromCharCode Obfuscation',
    regex: /String\.fromCharCode\s*\(\s*\d+\s*(?:,\s*\d+\s*){6,}\)/g,
    description: 'Constructing strings from ASCII byte sequences to evade static signature detection.',
    recommendation: 'Replace dynamic byte decoding with clear static string literals.'
  },
  {
    id: 'KEYLOGGER_PATTERN',
    severity: 'HIGH',
    penalty: 20,
    title: 'Potential Keystroke Exfiltration Pattern',
    regex: /addEventListener\s*\(\s*['"]key(?:down|press)['"].*?(?:fetch|XMLHttpRequest|\.send)\s*\(/is,
    description: 'Global keystroke listener directly wired to outbound network transmission.',
    recommendation: 'Verify input handling logic and ensure keystrokes are not transmitted to untrusted endpoints.'
  },
  {
    id: 'DOCUMENT_WRITE_SINK',
    severity: 'MEDIUM',
    penalty: 10,
    title: 'Insecure DOM Injection (document.write)',
    regex: /document\.write(?:ln)?\s*\(/g,
    description: 'Use of document.write poses XSS risks and degrades page render performance.',
    recommendation: 'Use document.createElement() or element.textContent instead.'
  },
  {
    id: 'CANVAS_FINGERPRINTING',
    severity: 'LOW',
    penalty: 5,
    title: 'Browser Canvas Fingerprinting Beacon',
    regex: /toDataURL\s*\(\s*['"]image\/png['"]\s*\)|getImageData\s*\(.+?\)/g,
    description: 'Canvas manipulation patterns frequently leveraged for cross-site hardware fingerprinting.',
    recommendation: 'Ensure privacy consent compliance when tracking canvas rendering attributes.'
  },
  {
    id: 'INSECURE_HTTP_RESOURCE',
    severity: 'LOW',
    penalty: 5,
    title: 'Mixed Content / Insecure HTTP Reference',
    regex: /http:\/\/(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"']*/g,
    description: 'Hardcoded plaintext HTTP URL inside scripts may trigger mixed-content browser blocking.',
    recommendation: 'Upgrade external assets to secure HTTPS protocols.'
  }
];

/**
 * Recursively find all files to audit
 */
function getAuditableFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAuditableFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.mjs', '.html', '.htm'].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

/**
 * Audits a cloned project directory
 * @param {string} projectDir Absolute path to cloned website directory
 * @returns {Promise<Object>} Security audit report
 */
export async function auditClonedDirectory(projectDir) {
  const files = getAuditableFiles(projectDir);
  const findings = [];
  let totalPenalty = 0;
  let filesWithIssues = new Set();

  for (const filePath of files) {
    try {
      const stat = fs.statSync(filePath);
      // Skip scanning files larger than 5MB to avoid memory choke
      if (stat.size > 5 * 1024 * 1024) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(projectDir, filePath).replace(/\\/g, '/');

      for (const rule of SECURITY_RULES) {
        // Reset regex state
        const regex = new RegExp(rule.regex.source, rule.regex.flags);
        let match;

        if (regex.global) {
          while ((match = regex.exec(content)) !== null) {
            // Find line number
            const charIndex = match.index;
            const preceding = content.substring(0, charIndex);
            const lineNum = (preceding.match(/\n/g) || []).length + 1;
            const snippet = lines[lineNum - 1]?.trim().substring(0, 120) || match[0].substring(0, 80);

            findings.push({
              id: rule.id,
              severity: rule.severity,
              penalty: rule.penalty,
              title: rule.title,
              description: rule.description,
              recommendation: rule.recommendation,
              file: relativePath,
              line: lineNum,
              snippet: snippet
            });

            totalPenalty += rule.penalty;
            filesWithIssues.add(relativePath);

            // Cap findings per rule per file to 3 to prevent log flood
            if (findings.filter(f => f.file === relativePath && f.id === rule.id).length >= 3) {
              break;
            }
          }
        } else {
          match = regex.exec(content);
          if (match) {
            const charIndex = match.index;
            const preceding = content.substring(0, charIndex);
            const lineNum = (preceding.match(/\n/g) || []).length + 1;
            const snippet = lines[lineNum - 1]?.trim().substring(0, 120) || match[0].substring(0, 80);

            findings.push({
              id: rule.id,
              severity: rule.severity,
              penalty: rule.penalty,
              title: rule.title,
              description: rule.description,
              recommendation: rule.recommendation,
              file: relativePath,
              line: lineNum,
              snippet: snippet
            });

            totalPenalty += rule.penalty;
            filesWithIssues.add(relativePath);
          }
        }
      }
    } catch {
      // Continue on read errors
    }
  }

  // Calculate score and grade
  const score = Math.max(0, 100 - totalPenalty);
  let grade = 'A+';
  let riskLevel = 'CLEAN';

  if (score >= 95) {
    grade = 'A+';
    riskLevel = 'CLEAN';
  } else if (score >= 85) {
    grade = 'A';
    riskLevel = 'CLEAN';
  } else if (score >= 70) {
    grade = 'B';
    riskLevel = 'MODERATE';
  } else if (score >= 50) {
    grade = 'C';
    riskLevel = 'SUSPICIOUS';
  } else {
    grade = 'F';
    riskLevel = 'HIGH RISK';
  }

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  return {
    score,
    grade,
    riskLevel,
    stats: {
      totalFilesScanned: files.length,
      filesAffected: filesWithIssues.size,
      totalFindings: findings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount
    },
    findings,
    scannedAt: new Date().toISOString()
  };
}
