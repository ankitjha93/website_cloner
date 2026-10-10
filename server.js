import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import archiver from 'archiver';
import { WebsiteCloner } from './cloner/engine.js';
import { sanitizeName } from './cloner/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const CLONES_DIR = path.join(__dirname, 'clones');

// Ensure clones directory exists
if (!fs.existsSync(CLONES_DIR)) {
  fs.mkdirSync(CLONES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active clone jobs: jobId -> { cloner, sseClients: Set }
const activeJobs = new Map();

/**
 * POST /api/clone - Start a new website clone job
 */
app.post('/api/clone', async (req, res) => {
  try {
    const {
      url,
      maxDepth = 2,
      maxPages = 50,
      concurrency = 5,
      downloadImages = true,
      downloadCss = true,
      downloadJs = true,
      downloadFonts = true,
      downloadMedia = false,
      sameDomainOnly = true,
      allowSubdomains = false,
      stripTrackers = true
    } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cloner = new WebsiteCloner({
      targetUrl: url.trim(),
      maxDepth,
      maxPages,
      concurrency,
      downloadImages,
      downloadCss,
      downloadJs,
      downloadFonts,
      downloadMedia,
      sameDomainOnly,
      allowSubdomains,
      stripTrackers,
      outputBaseDir: CLONES_DIR
    });


    const jobData = {
      id: jobId,
      cloner,
      sseClients: new Set(),
      status: 'starting',
      folderName: cloner.folderName,
      logs: []
    };
    activeJobs.set(jobId, jobData);

    // Event hooks
    cloner.on('log', (logEntry) => {
      jobData.logs.push(logEntry);
      if (jobData.logs.length > 500) jobData.logs.shift(); // keep last 500
      broadcastJobEvent(jobId, 'log', logEntry);
    });

    cloner.on('progress', (progressData) => {
      broadcastJobEvent(jobId, 'progress', progressData);
    });

    cloner.on('complete', (manifest) => {
      jobData.status = 'completed';
      broadcastJobEvent(jobId, 'complete', manifest);
    });

    cloner.on('error', (err) => {
      jobData.status = 'error';
      broadcastJobEvent(jobId, 'error', { message: err.message });
    });

    // Start cloning in background
    cloner.start().catch((err) => {
      jobData.status = 'error';
      broadcastJobEvent(jobId, 'error', { message: err.message });
    });

    res.json({
      success: true,
      jobId,
      folderName: cloner.folderName,
      targetUrl: cloner.targetUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function broadcastJobEvent(jobId, eventName, data) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of job.sseClients) {
    try {
      client.write(message);
    } catch {
      job.sseClients.delete(client);
    }
  }
}

/**
 * GET /api/clone/:id/progress - SSE stream for real-time progress
 */
app.get('/api/clone/:id/progress', (req, res) => {
  const { id } = req.params;
  const job = activeJobs.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  job.sseClients.add(res);

  // Send historical logs
  for (const log of job.logs) {
    res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
  }

  req.on('close', () => {
    job.sseClients.delete(res);
  });
});

/**
 * POST /api/clone/:id/cancel - Cancel active cloning job
 */
app.post('/api/clone/:id/cancel', (req, res) => {
  const { id } = req.params;
  const job = activeJobs.get(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  job.cloner.cancel();
  res.json({ success: true, message: 'Cancellation requested' });
});

/**
 * GET /api/clones - Get all cloned websites
 */
app.get('/api/clones', async (req, res) => {
  try {
    const folders = await fs.promises.readdir(CLONES_DIR, { withFileTypes: true });
    const sites = [];

    for (const dirent of folders) {
      if (dirent.isDirectory()) {
        const manifestPath = path.join(CLONES_DIR, dirent.name, 'site_manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const raw = await fs.promises.readFile(manifestPath, 'utf-8');
            const data = JSON.parse(raw);
            sites.push({ ...data, folder: dirent.name });
          } catch {
            sites.push({ folder: dirent.name, title: dirent.name, clonedAt: null });
          }
        } else {
          sites.push({ folder: dirent.name, title: dirent.name, clonedAt: null });
        }
      }
    }

    // Sort newest first
    sites.sort((a, b) => new Date(b.clonedAt || 0) - new Date(a.clonedAt || 0));
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/clones/:folderName/zip - Download cloned website as a ZIP file
 */
app.get('/api/clones/:folderName/zip', (req, res) => {
  const safeFolder = sanitizeName(req.params.folderName);
  const targetDir = path.join(CLONES_DIR, safeFolder);

  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: 'Cloned site folder not found' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFolder}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => res.status(500).send({ error: err.message }));
  archive.pipe(res);
  archive.directory(targetDir, false);
  archive.finalize();
});

/**
 * POST /api/clones/:folderName/open-folder - Open cloned folder in Windows Explorer
 */
app.post('/api/clones/:folderName/open-folder', (req, res) => {
  const safeFolder = sanitizeName(req.params.folderName);
  const targetDir = path.resolve(path.join(CLONES_DIR, safeFolder));

  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  let command = `explorer.exe "${targetDir}"`;
  if (process.platform === 'darwin') {
    command = `open "${targetDir}"`;
  } else if (process.platform === 'linux') {
    command = `xdg-open "${targetDir}"`;
  }

  exec(command, (err) => {
    // Note: On Windows, explorer.exe exits with code 1 when the window opens normally
    if (err && err.code !== 1) {
      console.error('File manager launch error:', err);
      return res.status(500).json({ error: 'Failed to open file manager' });
    }
    res.json({ success: true, path: targetDir });
  });
});


/**
 * DELETE /api/clones/:folderName - Delete a cloned website folder
 */
app.delete('/api/clones/:folderName', async (req, res) => {
  try {
    const safeFolder = sanitizeName(req.params.folderName);
    const targetDir = path.join(CLONES_DIR, safeFolder);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await fs.promises.rm(targetDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/clones/:folderName/tree - Get recursive file structure & asset statistics
 */
app.get('/api/clones/:folderName/tree', async (req, res) => {
  try {
    const safeFolder = sanitizeName(req.params.folderName);
    const targetDir = path.resolve(CLONES_DIR, safeFolder);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const stats = {
      htmlCount: 0,
      cssCount: 0,
      jsCount: 0,
      imageCount: 0,
      fontCount: 0,
      mediaCount: 0,
      otherCount: 0,
      totalFiles: 0,
      totalSize: 0
    };

    async function buildTree(dirPath, relativePath = '') {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const children = [];

      for (const entry of entries) {
        if (entry.name === 'site_manifest.json') continue; // hide internal manifest
        const fullPath = path.join(dirPath, entry.name);
        const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          const subChildren = await buildTree(fullPath, rel);
          children.push({
            name: entry.name,
            path: rel,
            type: 'directory',
            children: subChildren
          });
        } else if (entry.isFile()) {
          const fileStat = await fs.promises.stat(fullPath);
          const ext = path.extname(entry.name).toLowerCase();
          const size = fileStat.size;

          stats.totalFiles++;
          stats.totalSize += size;

          if (['.html', '.htm'].includes(ext)) stats.htmlCount++;
          else if (['.css'].includes(ext)) stats.cssCount++;
          else if (['.js', '.mjs'].includes(ext)) stats.jsCount++;
          else if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.avif'].includes(ext)) stats.imageCount++;
          else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) stats.fontCount++;
          else if (['.mp4', '.mp3', '.webm', '.ogg', '.wav'].includes(ext)) stats.mediaCount++;
          else stats.otherCount++;

          children.push({
            name: entry.name,
            path: rel,
            type: 'file',
            ext,
            size
          });
        }
      }

      children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      return children;
    }

    const tree = await buildTree(targetDir);
    res.json({
      name: safeFolder,
      tree,
      stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/clones/:folderName/file - Read file content for in-browser inspector
 */
app.get('/api/clones/:folderName/file', async (req, res) => {
  try {
    const safeFolder = sanitizeName(req.params.folderName);
    const targetDir = path.resolve(CLONES_DIR, safeFolder);
    const reqPath = req.query.path;

    if (!reqPath || typeof reqPath !== 'string') {
      return res.status(400).json({ error: 'File path required' });
    }

    const resolvedFilePath = path.resolve(targetDir, reqPath);
    if (!resolvedFilePath.startsWith(targetDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(resolvedFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const ext = path.extname(resolvedFilePath).toLowerCase();
    const isText = ['.html', '.htm', '.css', '.js', '.json', '.svg', '.txt', '.md', '.xml'].includes(ext);

    if (isText) {
      const content = await fs.promises.readFile(resolvedFilePath, 'utf-8');
      const stat = await fs.promises.stat(resolvedFilePath);
      res.json({
        type: 'text',
        name: path.basename(resolvedFilePath),
        ext,
        size: stat.size,
        content
      });
    } else {
      const stat = await fs.promises.stat(resolvedFilePath);
      res.json({
        type: 'binary',
        name: path.basename(resolvedFilePath),
        ext,
        size: stat.size,
        url: `/preview/${safeFolder}/${reqPath.replace(/\\/g, '/')}`
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve offline preview of cloned sites
 */

app.use('/preview/:folderName', (req, res, next) => {
  const safeFolder = sanitizeName(req.params.folderName);
  const siteDir = path.join(CLONES_DIR, safeFolder);

  if (!fs.existsSync(siteDir)) {
    return res.status(404).send('Cloned site preview not found');
  }

  express.static(siteDir, {
    index: ['index.html', 'index.htm']
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Website Cloner is running at: http://localhost:${PORT}`);
  console.log(`📁 Clones storage directory: ${CLONES_DIR}`);
  console.log(`======================================================\n`);
});
