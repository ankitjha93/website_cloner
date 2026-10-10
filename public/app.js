// Website Cloner PRO — Ultra-Modern Frontend Controller
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cloneForm = document.getElementById('cloneForm');
  const targetUrlInput = document.getElementById('targetUrlInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const startCloneBtn = document.getElementById('startCloneBtn');
  const startBtnIcon = document.getElementById('startBtnIcon');
  const startBtnText = document.getElementById('startBtnText');
  const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn');
  const advancedContent = document.getElementById('advancedContent');
  const advancedChevron = document.getElementById('advancedChevron');

  // Depth & Sliders
  const segmentedDepth = document.getElementById('segmentedDepth');
  const depthInput = document.getElementById('depthInput');
  const maxPagesInput = document.getElementById('maxPagesInput');
  const maxPagesVal = document.getElementById('maxPagesVal');
  const concurrencyInput = document.getElementById('concurrencyInput');
  const concurrencyVal = document.getElementById('concurrencyVal');
  const rpsInput = document.getElementById('rpsInput');
  const rpsVal = document.getElementById('rpsVal');

  // Checkboxes
  const sameDomainOnly = document.getElementById('sameDomainOnly');
  const allowSubdomains = document.getElementById('allowSubdomains');
  const toggleImages = document.getElementById('toggleImages');
  const toggleCss = document.getElementById('toggleCss');
  const toggleJs = document.getElementById('toggleJs');
  const toggleFonts = document.getElementById('toggleFonts');
  const toggleMedia = document.getElementById('toggleMedia');
  const toggleCleanMode = document.getElementById('toggleCleanMode');
  const toggleRobots = document.getElementById('toggleRobots');

  // Sound Control
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  // Monitor Elements
  const monitorSection = document.getElementById('monitorSection');
  const monitorTargetTitle = document.getElementById('monitorTargetTitle');
  const monitorStateTag = document.getElementById('monitorStateTag');
  const gaugeFill = document.getElementById('gaugeFill');
  const gaugePct = document.getElementById('gaugePct');
  const cancelJobBtn = document.getElementById('cancelJobBtn');
  const completedActions = document.getElementById('completedActions');
  const openPreviewBtn = document.getElementById('openPreviewBtn');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const openFolderBtn = document.getElementById('openFolderBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  const copyLogsBtn = document.getElementById('copyLogsBtn');
  const terminalLogs = document.getElementById('terminalLogs');

  // Metric counters
  const metricPages = document.getElementById('metricPages');
  const metricAssets = document.getElementById('metricAssets');
  const metricSize = document.getElementById('metricSize');
  const metricQueue = document.getElementById('metricQueue');
  const metricErrors = document.getElementById('metricErrors');

  // Library & Delete Modal
  const clonesGrid = document.getElementById('clonesGrid');
  const refreshLibraryBtn = document.getElementById('refreshLibraryBtn');
  const toastContainer = document.getElementById('toastContainer');
  const deleteModal = document.getElementById('deleteModal');
  const deleteSitePreview = document.getElementById('deleteSitePreview');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const closeDeleteOverlay = document.getElementById('closeDeleteOverlay');

  // Responsive Studio & Inspector Elements
  const previewModal = document.getElementById('previewModal');
  const previewIframe = document.getElementById('previewIframe');
  const previewUrlBar = document.getElementById('previewUrlBar');
  const previewExternalLink = document.getElementById('previewExternalLink');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  const closePreviewOverlay = document.getElementById('closePreviewOverlay');

  // Studio Mode Switcher
  const viewLiveBtn = document.getElementById('viewLiveBtn');
  const viewInspectorBtn = document.getElementById('viewInspectorBtn');
  const viewportControls = document.getElementById('viewportControls');
  const viewportBtns = document.querySelectorAll('.viewport-btn[data-device]');
  const rotateViewportBtn = document.getElementById('rotateViewportBtn');

  // Studio Telemetry & Zoom Controls
  const viewportDimensionBadge = document.getElementById('viewportDimensionBadge');
  const dimensionText = document.getElementById('dimensionText');
  const studioZoomController = document.getElementById('studioZoomController');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const zoomLevelText = document.getElementById('zoomLevelText');

  // Studio Action Suite
  const reloadPreviewBtn = document.getElementById('reloadPreviewBtn');
  const copyPreviewUrlBtn = document.getElementById('copyPreviewUrlBtn');
  const toggleStageBgBtn = document.getElementById('toggleStageBgBtn');
  const toggleFullscreenStudioBtn = document.getElementById('toggleFullscreenStudioBtn');

  // Preview Stage & Device Frame
  const previewStage = document.getElementById('previewStage');
  const previewDeviceFrame = document.getElementById('previewDeviceFrame');
  const deviceNotch = document.getElementById('deviceNotch');
  const deviceHomeBar = document.getElementById('deviceHomeBar');

  // Inspector Stage & File Tree
  const inspectorStage = document.getElementById('inspectorStage');
  const assetTotalCountBadge = document.getElementById('assetTotalCountBadge');
  const pillHtml = document.getElementById('pillHtml');
  const pillCss = document.getElementById('pillCss');
  const pillJs = document.getElementById('pillJs');
  const pillImg = document.getElementById('pillImg');
  const pillFont = document.getElementById('pillFont');
  const fileTreeContainer = document.getElementById('fileTreeContainer');

  // Code & Image Viewer Elements
  const codeBreadcrumbs = document.getElementById('codeBreadcrumbs');
  const currentFileName = document.getElementById('currentFileName');
  const currentFileSize = document.getElementById('currentFileSize');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const codeViewerBody = document.getElementById('codeViewerBody');
  const codeLineNumbers = document.getElementById('codeLineNumbers');
  const codeContent = document.getElementById('codeContent');
  const imageViewerBody = document.getElementById('imageViewerBody');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const imagePreviewMeta = document.getElementById('imagePreviewMeta');

  // Security Audit Stage Elements
  const viewAuditBtn = document.getElementById('viewAuditBtn');
  const auditStage = document.getElementById('auditStage');
  const auditGradeCircle = document.getElementById('auditGradeCircle');
  const auditGradeText = document.getElementById('auditGradeText');
  const auditScoreNum = document.getElementById('auditScoreNum');
  const auditRiskBadge = document.getElementById('auditRiskBadge');
  const auditGradeSubtitle = document.getElementById('auditGradeSubtitle');
  const auditCriticalCount = document.getElementById('auditCriticalCount');
  const auditHighCount = document.getElementById('auditHighCount');
  const auditMediumCount = document.getElementById('auditMediumCount');
  const auditLowCount = document.getElementById('auditLowCount');
  const rescanAuditBtn = document.getElementById('rescanAuditBtn');
  const downloadAuditReportBtn = document.getElementById('downloadAuditReportBtn');
  const auditTechPills = document.getElementById('auditTechPills');
  const findingsCountBadge = document.getElementById('findingsCountBadge');
  const auditFindingsList = document.getElementById('auditFindingsList');

  let currentJobId = null;
  let currentFolderName = null;
  let activeEventSource = null;
  let pendingDeleteFolder = null;
  let pendingDeleteTitle = null;
  let activePreviewFolder = null;
  let currentDevice = 'desktop';
  let isLandscape = false;
  let loadedTreeFolder = null;
  let cachedAuditReport = null;
  let cachedTechReport = null;

  // Studio Lab State
  let currentZoom = 1.0;
  let stageThemeIndex = 0;
  const stageThemes = ['theme-grid', 'theme-obsidian', 'theme-light'];
  const stageThemeNames = ['Cyber Grid', 'Deep Obsidian', 'Studio Light'];

  const Motion = window.Motion;

  // ==========================================
  // 1. Web Audio Micro-Interactions
  // ==========================================
  let isSoundEnabled = localStorage.getItem('cloner_sfx') !== 'false';
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.05, gainVal = 0.08) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {}
  }

  function playClickSound() {
    playTone(800, 'sine', 0.03, 0.06);
  }

  function playSuccessChime() {
    if (!isSoundEnabled) return;
    playTone(523.25, 'triangle', 0.15, 0.1); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.1), 100); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.35, 0.12), 200); // G5
  }

  function playDeleteSound() {
    playTone(220, 'sawtooth', 0.08, 0.08);
  }

  function updateSoundUI() {
    if (isSoundEnabled) {
      soundIcon.className = 'aceternity-icon-pod glow-cyan';
      soundIcon.innerHTML = '<i data-lucide="volume-2" class="icon-xs"></i>';
      soundText.textContent = 'SFX ON';
      soundToggleBtn.classList.remove('muted');
    } else {
      soundIcon.className = 'aceternity-icon-pod';
      soundIcon.innerHTML = '<i data-lucide="volume-x" class="icon-xs"></i>';
      soundText.textContent = 'SFX OFF';
      soundToggleBtn.classList.add('muted');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('cloner_sfx', isSoundEnabled.toString());
    updateSoundUI();
    if (isSoundEnabled) playClickSound();
  });
  updateSoundUI();

  // ==========================================
  // 2. Toast Notification System
  // ==========================================
  function showToast({ title, message, type = 'info', duration = 3500 }) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconHtml = '<span class="aceternity-icon-pod glow-cyan"><i data-lucide="info" class="icon-xs"></i></span>';
    if (type === 'danger') iconHtml = '<span class="aceternity-icon-pod glow-rose"><i data-lucide="alert-octagon" class="icon-xs"></i></span>';
    if (type === 'success') iconHtml = '<span class="aceternity-icon-pod glow-emerald"><i data-lucide="check-circle-2" class="icon-xs"></i></span>';
    if (type === 'warning') iconHtml = '<span class="aceternity-icon-pod glow-amber"><i data-lucide="alert-triangle" class="icon-xs"></i></span>';

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" title="Close">×</button>
      <div class="toast-progress">
        <div class="toast-progress-bar"></div>
      </div>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Progress bar animation
    const progressBar = toast.querySelector('.toast-progress-bar');
    if (progressBar) {
      progressBar.style.transition = `transform ${duration}ms linear`;
      progressBar.style.transform = 'scaleX(1)';
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    }

    let isDismissed = false;
    const dismiss = () => {
      if (isDismissed) return;
      isDismissed = true;
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 320);
    };

    toast.querySelector('.toast-close').onclick = dismiss;
    const timer = setTimeout(dismiss, duration);

    toast.onmouseenter = () => {
      clearTimeout(timer);
      if (progressBar) progressBar.style.transition = 'none';
    };
  }

  // ==========================================
  // 3. Cockpit Input & Paste Button
  // ==========================================
  pasteBtn.addEventListener('click', async () => {
    playClickSound();
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        let cleaned = text.trim();
        targetUrlInput.value = cleaned;
        targetUrlInput.focus();
        showToast({ title: 'Pasted URL', message: cleaned, type: 'info', duration: 2000 });
        if (Motion) Motion.animate(pasteBtn, { scale: [1, 1.15, 1] }, { duration: 0.2 });
      }
    } catch {
      targetUrlInput.focus();
    }
  });

  // ==========================================
  // 4. Segmented Depth Cards Controller
  // ==========================================
  const depthCards = document.querySelectorAll('.depth-card');
  depthCards.forEach(card => {
    card.addEventListener('click', () => {
      playClickSound();
      depthCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const depth = card.dataset.depth;
      depthInput.value = depth;
      if (Motion) Motion.animate(card, { scale: [0.97, 1] }, { type: 'spring' });
    });
  });

  // Slider bindings
  maxPagesInput.addEventListener('input', () => maxPagesVal.textContent = maxPagesInput.value);
  concurrencyInput.addEventListener('input', () => concurrencyVal.textContent = concurrencyInput.value);
  if (rpsInput && rpsVal) {
    rpsInput.addEventListener('input', () => rpsVal.textContent = rpsInput.value);
  }

  // Accordion toggle
  toggleAdvancedBtn.addEventListener('click', () => {
    playClickSound();
    advancedContent.classList.toggle('hidden');
    advancedChevron.classList.toggle('open');
  });

  // Quick preset sample chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      playClickSound();
      targetUrlInput.value = chip.dataset.url;
      targetUrlInput.focus();
      if (Motion) Motion.animate(chip, { scale: [1, 1.12, 1] }, { duration: 0.2 });
    });
  });

  // ==========================================
  // 5. Framer Motion Button Physics
  // ==========================================
  if (Motion && startCloneBtn) {
    startCloneBtn.addEventListener('mouseenter', () => {
      if (!startCloneBtn.disabled) {
        Motion.animate(startCloneBtn, { scale: 1.04 }, { type: 'spring', stiffness: 400, damping: 15 });
      }
    });

    startCloneBtn.addEventListener('mouseleave', () => {
      if (!startCloneBtn.disabled) {
        Motion.animate(startCloneBtn, { scale: 1.0 }, { type: 'spring', stiffness: 400, damping: 15 });
      }
    });

    startCloneBtn.addEventListener('mousedown', () => {
      if (!startCloneBtn.disabled) {
        Motion.animate(startCloneBtn, { scale: 0.96 }, { duration: 0.08 });
      }
    });

    startCloneBtn.addEventListener('mouseup', () => {
      if (!startCloneBtn.disabled) {
        Motion.animate(startCloneBtn, { scale: 1.04 }, { duration: 0.08 });
      }
    });
  }

  // Mouse Ambient Follower
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  // Rolling Metric Number Counter
  function animateCounter(element, targetNum) {
    const rawText = element.textContent.replace(/[^0-9]/g, '');
    const currentNum = parseInt(rawText, 10) || 0;
    if (currentNum === targetNum) return;

    const duration = 500;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(currentNum + (targetNum - currentNum) * easeOut);
      element.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 3D Magnetic Card Tilting
  function apply3DTilt(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  // ==========================================
  // 6. Radial Progress Gauge
  // ==========================================
  const CIRCUMFERENCE = 119.38; // 2 * pi * 19
  function updateRadialGauge(pct) {
    pct = Math.max(0, Math.min(100, pct));
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    if (gaugeFill) gaugeFill.style.strokeDashoffset = offset.toFixed(2);
    if (gaugePct) gaugePct.textContent = `${Math.round(pct)}%`;
  }

  // ==========================================
  // 7. Terminal Console Logs & Filters
  // ==========================================
  let currentLogFilter = 'all';

  function appendLog(logEntry) {
    const line = document.createElement('div');
    line.className = `log-line log-type-${logEntry.type || 'info'}`;
    line.dataset.type = logEntry.type || 'info';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = `[${logEntry.timestamp || new Date().toLocaleTimeString()}]`;

    const msgSpan = document.createElement('span');
    msgSpan.className = `log-${logEntry.type || 'info'}`;
    msgSpan.textContent = logEntry.message;

    line.appendChild(timeSpan);
    line.appendChild(msgSpan);
    terminalLogs.appendChild(line);

    if (currentLogFilter !== 'all' && line.dataset.type !== currentLogFilter) {
      line.style.display = 'none';
    }

    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound();
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLogFilter = tab.dataset.filter;

      const lines = terminalLogs.querySelectorAll('.log-line');
      lines.forEach(line => {
        if (currentLogFilter === 'all' || line.dataset.type === currentLogFilter) {
          line.style.display = 'flex';
        } else {
          line.style.display = 'none';
        }
      });
    });
  });

  clearLogsBtn.addEventListener('click', () => {
    playClickSound();
    terminalLogs.innerHTML = '';
  });

  copyLogsBtn.addEventListener('click', async () => {
    playClickSound();
    const text = Array.from(terminalLogs.querySelectorAll('.log-line'))
      .map(l => l.textContent)
      .join('\n');
    if (text) {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Logs Copied', message: 'All terminal activity copied to clipboard', type: 'info' });
    }
  });

  // ==========================================
  // 8. Clone Form Submission
  // ==========================================
  cloneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let url = targetUrlInput.value.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    playClickSound();

    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }

    startCloneBtn.disabled = true;
    startCloneBtn.classList.add('btn-cloning-active');
    startBtnText.textContent = 'Cloning Site...';
    startBtnIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      </svg>
    `;

    monitorSection.classList.remove('hidden');
    completedActions.classList.add('hidden');
    cancelJobBtn.classList.remove('hidden');
    monitorStateTag.textContent = 'ACTIVE CLONING';
    monitorTargetTitle.textContent = `Cloning: ${url}`;
    terminalLogs.innerHTML = '';
    updateRadialGauge(5);

    // Reset metrics
    metricPages.textContent = '0';
    metricAssets.textContent = '0';
    metricSize.textContent = '0 B';
    metricQueue.textContent = '0';
    metricErrors.textContent = '0';

    monitorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showToast({
      title: 'Cloning Started',
      message: `Analyzing assets & crawling ${url}`,
      type: 'info'
    });

    const payload = {
      url,
      maxDepth: parseInt(depthInput.value, 10),
      maxPages: parseInt(maxPagesInput.value, 10),
      concurrency: parseInt(concurrencyInput.value, 10),
      sameDomainOnly: sameDomainOnly.checked,
      allowSubdomains: allowSubdomains.checked,
      downloadImages: toggleImages.checked,
      downloadCss: toggleCss.checked,
      downloadJs: toggleJs.checked,
      downloadFonts: toggleFonts.checked,
      downloadMedia: toggleMedia.checked,
      stripTrackers: toggleCleanMode ? toggleCleanMode.checked : true,
      requestsPerSecond: rpsInput ? parseInt(rpsInput.value, 10) : 5,
      respectRobots: toggleRobots ? toggleRobots.checked : true
    };

    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start cloning');

      currentJobId = data.jobId;
      currentFolderName = data.folderName;

      connectProgressStream(currentJobId, payload.maxPages);
    } catch (err) {
      appendLog({ type: 'error', message: `Start Error: ${err.message}` });
      resetStartButton();
      showToast({
        title: 'Cloning Failed',
        message: err.message,
        type: 'danger'
      });
    }
  });

  function resetStartButton() {
    startCloneBtn.disabled = false;
    startCloneBtn.classList.remove('btn-cloning-active');
    startBtnText.textContent = 'Start Cloning';
    startBtnIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
    if (Motion) Motion.animate(startCloneBtn, { scale: 1.0 }, { type: 'spring' });
  }

  // Connect SSE progress stream
  function connectProgressStream(jobId, maxPages) {
    const es = new EventSource(`/api/clone/${jobId}/progress`);
    activeEventSource = es;

    es.addEventListener('log', (event) => {
      const log = JSON.parse(event.data);
      appendLog(log);
    });

    es.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data);
      animateCounter(metricPages, data.pagesCrawled);
      animateCounter(metricAssets, data.assetsDownloaded);
      metricSize.textContent = data.totalBytesFormatted;
      animateCounter(metricQueue, data.queueSize);
      animateCounter(metricErrors, data.errors);

      const estimatedTotal = Math.max(maxPages, data.pagesCrawled + data.queueSize);
      const pct = Math.min(95, ((data.pagesCrawled) / estimatedTotal) * 90 + 5);
      updateRadialGauge(pct);
    });

    es.addEventListener('complete', (event) => {
      const manifest = JSON.parse(event.data);
      appendLog({ type: 'success', message: 'Clone job completed successfully!' });
      
      updateRadialGauge(100);
      monitorStateTag.textContent = 'COMPLETED';
      monitorTargetTitle.textContent = `Preserved: ${manifest.title || manifest.targetUrl}`;
      cancelJobBtn.classList.add('hidden');
      completedActions.classList.remove('hidden');

      resetStartButton();
      setupCompletedActions(manifest.folderName);
      loadClonedSites();
      playSuccessChime();

      showToast({
        title: 'Cloning Complete!',
        message: `Successfully preserved ${manifest.stats.pages} pages & ${manifest.stats.assets} assets offline`,
        type: 'success',
        duration: 4500
      });

      es.close();
    });

    es.addEventListener('error', (event) => {
      try {
        const data = JSON.parse(event.data);
        appendLog({ type: 'error', message: data.message || 'Job stopped with error' });
      } catch {}
      monitorStateTag.textContent = 'HALTED';
      cancelJobBtn.classList.add('hidden');
      resetStartButton();
      es.close();
    });
  }

  cancelJobBtn.addEventListener('click', async () => {
    if (!currentJobId) return;
    playClickSound();
    try {
      await fetch(`/api/clone/${currentJobId}/cancel`, { method: 'POST' });
      cancelJobBtn.disabled = true;
      cancelJobBtn.innerHTML = '<span>Stopping...</span>';
      showToast({
        title: 'Job Stopped',
        message: 'Cloning process was halted',
        type: 'warning'
      });
    } catch (err) {
      appendLog({ type: 'error', message: `Cancel error: ${err.message}` });
    }
  });

  function setupCompletedActions(folderName) {
    openPreviewBtn.onclick = () => openPreviewModal(folderName);
    downloadZipBtn.onclick = () => {
      playClickSound();
      window.location.href = `/api/clones/${folderName}/zip`;
      showToast({ title: 'Download Started', message: 'Packaging offline site ZIP archive', type: 'info' });
    };
    openFolderBtn.onclick = async () => {
      playClickSound();
      const originalText = openFolderBtn.innerHTML;
      openFolderBtn.disabled = true;
      openFolderBtn.innerHTML = '<span>Opening...</span>';
      try {
        const res = await fetch(`/api/clones/${folderName}/open-folder`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        openFolderBtn.classList.add('btn-action-success');
        openFolderBtn.innerHTML = '<span>Opened in Explorer ✓</span>';
        showToast({ title: 'Folder Opened', message: 'Opened site directory in Windows Explorer', type: 'info' });
        setTimeout(() => {
          openFolderBtn.classList.remove('btn-action-success');
          openFolderBtn.innerHTML = originalText;
          openFolderBtn.disabled = false;
        }, 2000);
      } catch (err) {
        showToast({ title: 'Explorer Error', message: err.message, type: 'danger' });
        openFolderBtn.innerHTML = originalText;
        openFolderBtn.disabled = false;
      }
    };
  }

  // ==========================================
  // 9. Load and Render Cloned Sites Archive
  // ==========================================
  async function loadClonedSites() {
    try {
      const res = await fetch('/api/clones');
      const sites = await res.json();

      if (!sites || sites.length === 0) {
        clonesGrid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <p>No websites cloned yet. Enter a URL above to start your first archive!</p>
          </div>
        `;
        return;
      }

      clonesGrid.innerHTML = '';
      sites.forEach(site => {
        const card = document.createElement('div');
        card.className = 'clone-card';

        const dateStr = site.clonedAt ? new Date(site.clonedAt).toLocaleString() : 'Unknown date';
        const pagesCount = site.stats?.pages || 1;
        const totalSize = site.stats?.totalBytesFormatted || 'Local files';

        card.innerHTML = `
          <div class="clone-card-header">
            <div class="clone-favicon">
              ${site.favicon ? `<img src="${site.favicon}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2338bdf8%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'">` : '<i data-lucide="globe" class="icon-sm" style="color:var(--accent-cyan);"></i>'}
            </div>
            <div style="min-width:0; flex:1;">
              <h4 class="clone-title" title="${site.title || site.folder}">${site.title || site.folder}</h4>
              <div class="clone-url" title="${site.targetUrl || ''}">${site.targetUrl || site.folder}</div>
            </div>
          </div>

          <div class="clone-meta">
            <span class="clone-meta-item"><i data-lucide="layers" class="icon-xs" style="color:var(--accent-cyan)"></i> ${pagesCount} ${pagesCount === 1 ? 'page' : 'pages'}</span>
            <span class="clone-meta-item"><i data-lucide="hard-drive" class="icon-xs" style="color:var(--accent-indigo)"></i> ${totalSize}</span>
            <span class="clone-meta-item"><i data-lucide="calendar" class="icon-xs" style="color:var(--text-muted)"></i> ${dateStr}</span>
            ${site.hasCheckpoint ? `
              <span class="vault-checkpoint-badge" title="Crawl was paused or interrupted. Ready to resume from checkpoint!">
                <i data-lucide="rotate-ccw" class="icon-xs"></i> Paused
              </span>
            ` : ''}
            ${site.securityScore ? `
              <span class="vault-security-pill grade-${(site.securityScore.grade || 'A').toLowerCase().replace('+', '')}" title="Security Score: ${site.securityScore.score}/100 (${site.securityScore.riskLevel})">
                <i data-lucide="shield-check" class="icon-xs"></i> ${site.securityScore.grade} (${site.securityScore.score})
              </span>
            ` : ''}
          </div>

          ${site.techStack && site.techStack.length > 0 ? `
            <div class="vault-tech-row">
              ${site.techStack.slice(0, 4).map(t => `
                <span class="vault-tech-chip" title="${t.category}: ${t.name}">
                  <span class="tech-chip-dot" style="background:${t.color || '#38bdf8'}"></span>
                  <span>${t.name}</span>
                </span>
              `).join('')}
              ${site.techStack.length > 4 ? `<span class="vault-tech-chip">+${site.techStack.length - 4}</span>` : ''}
            </div>
          ` : ''}

          <div class="clone-actions">
            ${site.hasCheckpoint ? `
              <button class="btn btn-warning btn-xs resume-btn" data-folder="${site.folder}" title="Resume Crawl from Checkpoint">
                <i data-lucide="play" class="icon-xs"></i> <span>Resume</span>
              </button>
            ` : ''}
            <button class="btn btn-success btn-xs preview-btn" data-folder="${site.folder}">
              <i data-lucide="eye" class="icon-xs"></i> <span>Preview</span>
            </button>
            <a href="/api/clones/${site.folder}/zip" class="btn btn-secondary btn-xs zip-btn" title="Download ZIP">
              <i data-lucide="download" class="icon-xs"></i> <span>ZIP</span>
            </a>
            <button class="btn btn-secondary btn-xs open-folder-btn" data-folder="${site.folder}" title="Open in Windows Explorer">
              <i data-lucide="folder-open" class="icon-xs"></i> <span>Folder</span>
            </button>
            <button class="btn btn-danger btn-xs delete-btn" data-folder="${site.folder}" title="Delete Archive">
              <i data-lucide="trash-2" class="icon-xs"></i>
            </button>
          </div>
        `;

        apply3DTilt(card);

        if (site.hasCheckpoint) {
          const resBtn = card.querySelector('.resume-btn');
          if (resBtn) {
            resBtn.onclick = () => resumeCrawl(site.folder, site.title || site.folder);
          }
        }

        card.querySelector('.preview-btn').onclick = () => openPreviewModal(site.folder);
        
        card.querySelector('.zip-btn').onclick = () => {
          playClickSound();
          showToast({ title: 'Download Started', message: `Downloading ZIP for "${site.title || site.folder}"`, type: 'info' });
        };

        const folderBtn = card.querySelector('.open-folder-btn');
        folderBtn.onclick = async () => {
          playClickSound();
          const orig = folderBtn.innerHTML;
          folderBtn.disabled = true;
          folderBtn.innerHTML = '<i data-lucide="loader-2" class="icon-xs spin-icon"></i> <span>Opening...</span>';
          if (window.lucide) window.lucide.createIcons();
          try {
            const res = await fetch(`/api/clones/${site.folder}/open-folder`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            folderBtn.classList.add('btn-action-success');
            folderBtn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> <span>Opened ✓</span>';
            if (window.lucide) window.lucide.createIcons();
            showToast({ title: 'Folder Opened', message: `Opened "${site.title || site.folder}" in Explorer`, type: 'info' });
            setTimeout(() => {
              folderBtn.classList.remove('btn-action-success');
              folderBtn.innerHTML = orig;
              if (window.lucide) window.lucide.createIcons();
              folderBtn.disabled = false;
            }, 1800);
          } catch (err) {
            showToast({ title: 'Error', message: 'Could not open folder: ' + err.message, type: 'danger' });
            folderBtn.innerHTML = orig;
            if (window.lucide) window.lucide.createIcons();
            folderBtn.disabled = false;
          }
        };

        // Open In-App Delete Modal
        card.querySelector('.delete-btn').onclick = () => {
          playClickSound();
          pendingDeleteFolder = site.folder;
          pendingDeleteTitle = site.title || site.folder;
          deleteSitePreview.textContent = pendingDeleteTitle;
          deleteModal.classList.remove('hidden');
          if (Motion) {
            const box = deleteModal.querySelector('.confirm-modal-box');
            Motion.animate(box, { scale: [0.9, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 400, damping: 22 });
          }
        };

        clonesGrid.appendChild(card);
      });

      if (Motion && clonesGrid.children.length > 0) {
        Motion.animate(
          '.clone-card',
          { opacity: [0, 1], y: [16, 0] },
          { delay: Motion.stagger(0.06), type: 'spring', stiffness: 350, damping: 20 }
        );
      }
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Failed to load clones:', err);
    }
  }

  // ==========================================
  // Resume Crawl from Checkpoint Handler
  // ==========================================
  async function resumeCrawl(folder, title) {
    playClickSound();
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }

    startCloneBtn.disabled = true;
    startCloneBtn.classList.add('btn-cloning-active');
    startBtnText.textContent = 'Resuming...';

    monitorSection.classList.remove('hidden');
    completedActions.classList.add('hidden');
    cancelJobBtn.classList.remove('hidden');
    monitorStateTag.textContent = 'RESUMING ENGINE';
    monitorTargetTitle.textContent = `Resuming: ${title}`;
    terminalLogs.innerHTML = '';
    updateRadialGauge(15);

    monitorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showToast({
      title: 'Resuming Crawl',
      message: `Restoring queue & checkpoint for ${title}`,
      type: 'info'
    });

    try {
      const res = await fetch('/api/clone/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: folder })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resume crawl');

      currentJobId = data.jobId;
      currentFolderName = data.folderName;

      appendLog({ type: 'success', message: `⚡ Checkpoint restored with ${data.restoredPages || 0} pages already processed.` });
      connectProgressStream(currentJobId, 50);
    } catch (err) {
      appendLog({ type: 'error', message: `Resume Error: ${err.message}` });
      resetStartButton();
      showToast({ title: 'Resume Failed', message: err.message, type: 'danger' });
    }
  }

  // ==========================================
  // 10. In-App Delete Modal Handlers
  // ==========================================
  function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    pendingDeleteFolder = null;
    pendingDeleteTitle = null;
  }

  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  closeDeleteOverlay.addEventListener('click', closeDeleteModal);

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!pendingDeleteFolder) return;
    playDeleteSound();
    const folder = pendingDeleteFolder;
    const title = pendingDeleteTitle;
    closeDeleteModal();

    try {
      const res = await fetch(`/api/clones/${folder}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast({
        title: 'Archive Deleted',
        message: `Successfully removed "${title}" from local storage`,
        type: 'danger',
        duration: 4000
      });

      loadClonedSites();
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message,
        type: 'danger'
      });
    }
  });

  // ==========================================
  // 11. Refresh Button with Feedback
  // ==========================================
  const refreshSvg = refreshLibraryBtn.querySelector('svg');
  const refreshText = refreshLibraryBtn.querySelector('span');

  refreshLibraryBtn.addEventListener('click', async () => {
    if (refreshLibraryBtn.disabled) return;
    playClickSound();

    refreshLibraryBtn.disabled = true;
    refreshLibraryBtn.classList.add('btn-refresh-active');
    refreshSvg.classList.add('spin-icon');
    refreshText.textContent = 'Refreshing...';

    const minDelay = new Promise(resolve => setTimeout(resolve, 500));
    try {
      await Promise.all([loadClonedSites(), minDelay]);
      refreshSvg.classList.remove('spin-icon');
      refreshLibraryBtn.classList.remove('btn-refresh-active');
      refreshLibraryBtn.classList.add('btn-refresh-success');
      refreshText.textContent = 'Updated ✓';

      showToast({
        title: 'Archive Refreshed',
        message: 'Cloned sites list updated',
        type: 'info',
        duration: 2500
      });

      setTimeout(() => {
        refreshLibraryBtn.classList.remove('btn-refresh-success');
        refreshText.textContent = 'Refresh';
        refreshLibraryBtn.disabled = false;
      }, 1200);
    } catch (err) {
      refreshSvg.classList.remove('spin-icon');
      refreshLibraryBtn.classList.remove('btn-refresh-active');
      refreshText.textContent = 'Refresh';
      refreshLibraryBtn.disabled = false;
    }
  });

  // ==========================================
  // 12. Multi-Device Studio & Code Inspector
  // ==========================================

  // Studio Mode Switcher
  viewLiveBtn.addEventListener('click', () => {
    playClickSound();
    viewLiveBtn.classList.add('active');
    viewInspectorBtn.classList.remove('active');
    if (viewAuditBtn) viewAuditBtn.classList.remove('active');
    previewStage.classList.remove('hidden');
    inspectorStage.classList.add('hidden');
    if (auditStage) auditStage.classList.add('hidden');
    viewportControls.classList.remove('hidden');
  });

  viewInspectorBtn.addEventListener('click', () => {
    playClickSound();
    viewInspectorBtn.classList.add('active');
    viewLiveBtn.classList.remove('active');
    if (viewAuditBtn) viewAuditBtn.classList.remove('active');
    previewStage.classList.add('hidden');
    inspectorStage.classList.remove('hidden');
    if (auditStage) auditStage.classList.add('hidden');
    viewportControls.classList.add('hidden');

    if (activePreviewFolder && loadedTreeFolder !== activePreviewFolder) {
      loadAssetTree(activePreviewFolder);
    }
  });

  if (viewAuditBtn) {
    viewAuditBtn.addEventListener('click', () => {
      playClickSound();
      viewAuditBtn.classList.add('active');
      viewLiveBtn.classList.remove('active');
      viewInspectorBtn.classList.remove('active');
      previewStage.classList.add('hidden');
      inspectorStage.classList.add('hidden');
      if (auditStage) auditStage.classList.remove('hidden');
      viewportControls.classList.add('hidden');

      if (activePreviewFolder) {
        loadSecurityAudit(activePreviewFolder);
      }
    });
  }

  // Security Audit Controller
  async function loadSecurityAudit(folderName, forceRefresh = false) {
    if (!forceRefresh && cachedAuditReport && cachedAuditReport.folder === folderName) {
      renderAuditDashboard(cachedAuditReport.data);
      if (cachedTechReport && cachedTechReport.folder === folderName) {
        renderTechChips(cachedTechReport.data);
      }
      return;
    }

    if (auditGradeText) auditGradeText.textContent = '...';
    if (auditScoreNum) auditScoreNum.textContent = '--';
    if (auditFindingsList) auditFindingsList.innerHTML = '<div class="findings-empty-state">Running heuristic static analysis & vulnerability scan...</div>';
    if (auditTechPills) auditTechPills.innerHTML = '<span class="tech-chip-loading">Fingerprinting web technologies...</span>';

    try {
      const [auditRes, techRes] = await Promise.all([
        fetch(`/api/clones/${folderName}/audit`),
        fetch(`/api/clones/${folderName}/tech`)
      ]);

      const auditData = await auditRes.json();
      const techData = await techRes.json();

      cachedAuditReport = { folder: folderName, data: auditData };
      cachedTechReport = { folder: folderName, data: techData };

      renderAuditDashboard(auditData);
      renderTechChips(techData);
    } catch (err) {
      if (auditFindingsList) {
        auditFindingsList.innerHTML = `<div class="findings-empty-state" style="color:var(--accent-rose);">Error running security audit: ${err.message}</div>`;
      }
    }
  }

  function renderAuditDashboard(audit) {
    if (auditGradeText) auditGradeText.textContent = audit.grade || 'A+';
    if (auditScoreNum) auditScoreNum.textContent = audit.score ?? 100;
    
    if (auditGradeCircle) {
      const gradeClass = (audit.grade || 'a').toLowerCase().replace('+', '');
      auditGradeCircle.className = `audit-grade-circle grade-${gradeClass}`;
    }
    
    if (auditRiskBadge) {
      auditRiskBadge.textContent = audit.riskLevel || 'CLEAN';
      const riskClass = (audit.riskLevel || '').toLowerCase().replace(/\s+/g, '-');
      auditRiskBadge.className = `audit-risk-badge ${riskClass === 'clean' ? 'clean' : (riskClass === 'moderate' ? 'moderate' : 'high-risk')}`;
    }

    if (audit.stats) {
      if (auditCriticalCount) auditCriticalCount.textContent = audit.stats.criticalCount || 0;
      if (auditHighCount) auditHighCount.textContent = audit.stats.highCount || 0;
      if (auditMediumCount) auditMediumCount.textContent = audit.stats.mediumCount || 0;
      if (auditLowCount) auditLowCount.textContent = audit.stats.lowCount || 0;
      if (findingsCountBadge) findingsCountBadge.textContent = `${audit.stats.totalFindings || 0} findings (${audit.stats.totalFilesScanned || 0} files scanned)`;

      if (auditGradeSubtitle) {
        if (audit.stats.totalFindings === 0) {
          auditGradeSubtitle.textContent = `Clean repository: All ${audit.stats.totalFilesScanned} files passed static checks with 0 vulnerabilities.`;
        } else {
          auditGradeSubtitle.textContent = `Identified ${audit.stats.totalFindings} potential risk patterns across ${audit.stats.filesAffected} files.`;
        }
      }
    }

    if (auditFindingsList) {
      if (!audit.findings || audit.findings.length === 0) {
        auditFindingsList.innerHTML = `
          <div class="findings-empty-state">
            <div class="aceternity-icon-pod glow-emerald" style="width:52px; height:52px; margin:0 auto 0.75rem;">
              <i data-lucide="shield-check" class="icon-lg"></i>
            </div>
            <h4 style="color:#fff; margin-bottom:0.25rem;">Zero Security Vulnerabilities Detected</h4>
            <p style="font-size:0.8rem; color:var(--text-secondary);">No dynamic eval sinks, obfuscation chains, or cryptominers found.</p>
          </div>
        `;
      } else {
        auditFindingsList.innerHTML = audit.findings.map(f => `
          <div class="finding-card ${f.severity.toLowerCase()}">
            <div class="finding-header-row">
              <div class="finding-title-group">
                <span class="finding-severity-pill ${f.severity.toLowerCase()}">${f.severity}</span>
                <span class="finding-title">${f.title}</span>
              </div>
              <span class="finding-location">${f.file} : line ${f.line}</span>
            </div>
            <div class="finding-desc">${f.description}</div>
            ${f.snippet ? `<pre class="finding-snippet"><code>${f.snippet}</code></pre>` : ''}
            <div class="finding-recommendation">
              <i data-lucide="info" class="icon-xs"></i>
              <span>${f.recommendation}</span>
            </div>
          </div>
        `).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderTechChips(tech) {
    if (!auditTechPills) return;
    if (!tech.technologies || tech.technologies.length === 0) {
      auditTechPills.innerHTML = '<span class="tech-chip-loading">Standard Web Architecture (HTML5, Vanilla CSS & JS)</span>';
      return;
    }

    auditTechPills.innerHTML = tech.technologies.map(t => `
      <span class="tech-chip" title="${t.category}">
        <span class="tech-chip-dot" style="background:${t.color || '#38bdf8'}; box-shadow:0 0 8px ${t.color || '#38bdf8'}"></span>
        <span>${t.name}</span>
        <span class="tech-category-tag">${t.category}</span>
      </span>
    `).join('');
  }

  if (rescanAuditBtn) {
    rescanAuditBtn.addEventListener('click', async () => {
      playClickSound();
      const icon = rescanAuditBtn.querySelector('[data-lucide], svg');
      if (icon) icon.classList.add('spin-icon');
      if (activePreviewFolder) {
        await loadSecurityAudit(activePreviewFolder, true);
        showToast({ title: 'Audit Refreshed', message: 'Security scan updated for this archive', type: 'info', duration: 2000 });
      }
      setTimeout(() => { if (icon) icon.classList.remove('spin-icon'); }, 600);
    });
  }

  if (downloadAuditReportBtn) {
    downloadAuditReportBtn.addEventListener('click', () => {
      playClickSound();
      if (!cachedAuditReport || !cachedAuditReport.data) return;
      const blob = new Blob([JSON.stringify(cachedAuditReport.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-${activePreviewFolder || 'site'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ title: 'Report Exported', message: 'Security audit JSON report downloaded', type: 'success' });
    });
  }

  // Viewport Telemetry & Dimension Readout
  function updateDimensionTelemetry() {
    if (!dimensionText) return;
    if (currentDevice === 'desktop') {
      const w = previewDeviceFrame.clientWidth || 1440;
      const h = previewDeviceFrame.clientHeight || 900;
      dimensionText.textContent = `Fluid • ${w} × ${h} px`;
    } else if (currentDevice === 'tablet') {
      dimensionText.textContent = isLandscape ? '1024 × 768 px' : '768 × 1024 px';
    } else if (currentDevice === 'mobile') {
      dimensionText.textContent = isLandscape ? '844 × 390 px' : '390 × 844 px';
    }
  }

  // Viewport Switcher Controls
  function updateDeviceFrame() {
    previewDeviceFrame.className = `preview-device-frame ${currentDevice}${isLandscape ? ' landscape' : ''}`;
    
    // Dynamic Island Notch
    if (currentDevice === 'mobile' && !isLandscape) {
      deviceNotch.classList.remove('hidden');
    } else {
      deviceNotch.classList.add('hidden');
    }

    // Home indicator bar
    if (deviceHomeBar) {
      if (currentDevice === 'mobile') {
        deviceHomeBar.classList.remove('hidden');
      } else {
        deviceHomeBar.classList.add('hidden');
      }
    }

    updateDimensionTelemetry();
  }

  viewportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      viewportBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDevice = btn.dataset.device;
      updateDeviceFrame();

      if (Motion) {
        Motion.animate(previewDeviceFrame, { scale: [0.97 * currentZoom, currentZoom] }, { duration: 0.25 });
      }
    });
  });

  rotateViewportBtn.addEventListener('click', () => {
    playClickSound();
    if (currentDevice === 'desktop') {
      showToast({
        title: 'Device Orientation',
        message: 'Rotation applies to Tablet and Mobile viewport frames',
        type: 'info',
        duration: 2500
      });
      return;
    }

    isLandscape = !isLandscape;
    updateDeviceFrame();

    if (Motion) {
      Motion.animate(rotateViewportBtn, { rotate: [0, 180] }, { duration: 0.3 });
    }
  });

  // Studio Zoom Scaling Engine
  function setZoom(level) {
    currentZoom = Math.min(Math.max(level, 0.4), 1.5);
    const rounded = Math.round(currentZoom * 100);
    if (zoomLevelText) zoomLevelText.textContent = `${rounded}%`;
    if (previewDeviceFrame) {
      previewDeviceFrame.style.transform = `scale(${currentZoom})`;
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      playClickSound();
      setZoom(currentZoom + 0.1);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      playClickSound();
      setZoom(currentZoom - 0.1);
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      playClickSound();
      setZoom(1.0);
      showToast({ title: 'Studio Zoom', message: 'Scale reset to 100%', type: 'info', duration: 1500 });
    });
  }

  // Developer Studio Toolbar Actions
  if (reloadPreviewBtn) {
    reloadPreviewBtn.addEventListener('click', () => {
      playClickSound();
      const icon = reloadPreviewBtn.querySelector('[data-lucide], svg');
      if (icon) icon.classList.add('spin-icon');

      try {
        if (previewIframe.contentWindow) {
          previewIframe.contentWindow.location.reload();
        } else {
          previewIframe.src = previewIframe.src;
        }
      } catch {
        previewIframe.src = previewIframe.src;
      }

      showToast({
        title: 'Viewport Reloaded',
        message: 'Cloned website refreshed in frame',
        type: 'info',
        duration: 1800
      });

      setTimeout(() => {
        if (icon) icon.classList.remove('spin-icon');
      }, 700);
    });
  }

  if (copyPreviewUrlBtn) {
    copyPreviewUrlBtn.addEventListener('click', async () => {
      playClickSound();
      try {
        const urlToCopy = previewUrlBar.textContent.trim();
        await navigator.clipboard.writeText(urlToCopy);

        const originalHtml = copyPreviewUrlBtn.innerHTML;
        copyPreviewUrlBtn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> <span>Copied!</span>';
        copyPreviewUrlBtn.classList.add('btn-action-success');
        if (window.lucide) window.lucide.createIcons();

        showToast({
          title: 'Offline Link Copied',
          message: 'Ready to share or open in any browser tab',
          type: 'success',
          duration: 2500
        });

        setTimeout(() => {
          copyPreviewUrlBtn.innerHTML = originalHtml;
          copyPreviewUrlBtn.classList.remove('btn-action-success');
          if (window.lucide) window.lucide.createIcons();
        }, 1600);
      } catch {
        showToast({ title: 'Copy Failed', message: 'Could not access clipboard', type: 'danger' });
      }
    });
  }

  if (toggleStageBgBtn) {
    toggleStageBgBtn.addEventListener('click', () => {
      playClickSound();
      previewStage.classList.remove(stageThemes[stageThemeIndex]);
      stageThemeIndex = (stageThemeIndex + 1) % stageThemes.length;
      previewStage.classList.add(stageThemes[stageThemeIndex]);

      showToast({
        title: 'Canvas Theme',
        message: `Switched stage to ${stageThemeNames[stageThemeIndex]}`,
        type: 'info',
        duration: 1800
      });
    });
  }

  function toggleFullscreenStudio() {
    playClickSound();
    const isFullscreen = previewModal.classList.toggle('fullscreen-mode');
    const icon = toggleFullscreenStudioBtn.querySelector('[data-lucide], svg');
    if (icon) {
      icon.setAttribute('data-lucide', isFullscreen ? 'minimize-2' : 'maximize-2');
      if (window.lucide) window.lucide.createIcons();
    }
    updateDimensionTelemetry();
  }

  if (toggleFullscreenStudioBtn) {
    toggleFullscreenStudioBtn.addEventListener('click', toggleFullscreenStudio);
  }

  // Asset Tree & Code Inspector Controller
  function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function getFileIcon(ext) {
    if (['.html', '.htm'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-amber" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="file-code" class="icon-xs"></i></span>';
    }
    if (['.css'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-cyan" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="palette" class="icon-xs"></i></span>';
    }
    if (['.js', '.mjs'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-amber" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="cpu" class="icon-xs"></i></span>';
    }
    if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.avif'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-purple" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="image" class="icon-xs"></i></span>';
    }
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-emerald" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="type" class="icon-xs"></i></span>';
    }
    if (['.mp4', '.mp3', '.webm', '.ogg', '.wav'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-rose" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="film" class="icon-xs"></i></span>';
    }
    if (['.json', '.xml', '.txt', '.md'].includes(ext)) {
      return '<span class="aceternity-icon-pod glow-indigo" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="file-text" class="icon-xs"></i></span>';
    }
    return '<span class="aceternity-icon-pod" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="file" class="icon-xs"></i></span>';
  }

  async function loadAssetTree(folderName) {
    fileTreeContainer.innerHTML = '<div class="tree-loading">Analyzing directory & assets...</div>';

    try {
      const res = await fetch(`/api/clones/${folderName}/tree`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load asset tree');

      loadedTreeFolder = folderName;
      const stats = data.stats;

      // Update pills & badges
      assetTotalCountBadge.textContent = `${stats.totalFiles} files`;
      pillHtml.textContent = `${stats.htmlCount} HTML`;
      pillCss.textContent = `${stats.cssCount} CSS`;
      pillJs.textContent = `${stats.jsCount} JS`;
      pillImg.textContent = `${stats.imageCount} IMG`;
      pillFont.textContent = `${stats.fontCount} FONT`;

      fileTreeContainer.innerHTML = '';
      let firstFile = null;

      function renderNodes(nodes, container) {
        nodes.forEach(node => {
          if (node.type === 'directory') {
            const folderEl = document.createElement('div');
            folderEl.className = 'tree-folder';

            const titleEl = document.createElement('div');
            titleEl.className = 'tree-folder-title';
            titleEl.innerHTML = `
              <span class="tree-folder-arrow">▼</span>
              <span class="aceternity-icon-pod glow-indigo" style="padding:2px 5px; border-radius:6px; margin-right:4px;"><i data-lucide="folder" class="icon-xs"></i></span>
              <span>${node.name}</span>
            `;

            const childrenEl = document.createElement('div');
            childrenEl.className = 'tree-folder-children';

            titleEl.addEventListener('click', (e) => {
              e.stopPropagation();
              folderEl.classList.toggle('collapsed');
              const folderIcon = titleEl.querySelector('[data-lucide]');
              if (folderIcon) {
                const isCollapsed = folderEl.classList.contains('collapsed');
                folderIcon.setAttribute('data-lucide', isCollapsed ? 'folder' : 'folder-open');
                if (window.lucide) window.lucide.createIcons();
              }
            });

            folderEl.appendChild(titleEl);
            folderEl.appendChild(childrenEl);
            container.appendChild(folderEl);

            if (node.children && node.children.length > 0) {
              renderNodes(node.children, childrenEl);
            }
          } else {
            const fileEl = document.createElement('div');
            fileEl.className = 'tree-file';
            fileEl.dataset.path = node.path;
            fileEl.dataset.size = node.size;
            fileEl.innerHTML = `
              <div class="tree-file-left">
                ${getFileIcon(node.ext)}
                <span>${node.name}</span>
              </div>
              <span class="tree-file-size">${formatBytes(node.size)}</span>
            `;

            fileEl.addEventListener('click', () => {
              playClickSound();
              document.querySelectorAll('.tree-file').forEach(f => f.classList.remove('active'));
              fileEl.classList.add('active');
              loadFileContent(folderName, node.path, node.size);
            });

            container.appendChild(fileEl);

            if (!firstFile) firstFile = { node, el: fileEl };
            if (node.path === 'index.html') firstFile = { node, el: fileEl };
          }
        });
      }

      renderNodes(data.tree, fileTreeContainer);
      if (window.lucide) window.lucide.createIcons();

      // Automatically inspect index.html or first file
      if (firstFile) {
        firstFile.el.classList.add('active');
        loadFileContent(folderName, firstFile.node.path, firstFile.node.size);
      }
    } catch (err) {
      fileTreeContainer.innerHTML = `<div class="tree-loading" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  }

  async function loadFileContent(folderName, filePath, fileSize) {
    // Update breadcrumbs
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const parentPath = parts.join('/');

    codeBreadcrumbs.innerHTML = `
      <span class="crumb-root">root</span>
      ${parentPath ? `<span class="crumb-separator">/</span><span class="crumb-root">${parentPath}</span>` : ''}
      <span class="crumb-separator">/</span>
      <span class="crumb-active">${fileName}</span>
    `;

    currentFileSize.textContent = formatBytes(fileSize);

    try {
      const res = await fetch(`/api/clones/${folderName}/file?path=${encodeURIComponent(filePath)}`);
      const fileData = await res.json();
      if (!res.ok) throw new Error(fileData.error || 'Failed to read file');

      if (fileData.type === 'text') {
        codeViewerBody.classList.remove('hidden');
        imageViewerBody.classList.add('hidden');
        copyCodeBtn.classList.remove('hidden');

        codeContent.textContent = fileData.content;

        // Line numbers generator
        const lineCount = (fileData.content.match(/\n/g) || []).length + 1;
        const lineNumbersArr = [];
        for (let i = 1; i <= lineCount; i++) {
          lineNumbersArr.push(i);
        }
        codeLineNumbers.textContent = lineNumbersArr.join('\n');
      } else {
        const isImg = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.avif'].includes(fileData.ext);
        if (isImg) {
          codeViewerBody.classList.add('hidden');
          imageViewerBody.classList.remove('hidden');
          copyCodeBtn.classList.add('hidden');

          imagePreviewImg.src = fileData.url;
          imagePreviewMeta.textContent = `${fileData.name} • ${formatBytes(fileData.size)} • ${fileData.ext.toUpperCase().replace('.', '')} Image`;
        } else {
          codeViewerBody.classList.remove('hidden');
          imageViewerBody.classList.add('hidden');
          copyCodeBtn.classList.add('hidden');

          codeLineNumbers.textContent = '1';
          codeContent.textContent = `[Binary Asset: ${fileData.name} (${formatBytes(fileData.size)})]\nDirect inspection is only supported for text, HTML, CSS, JS, and image formats.`;
        }
      }
    } catch (err) {
      codeViewerBody.classList.remove('hidden');
      imageViewerBody.classList.add('hidden');
      codeLineNumbers.textContent = '1';
      codeContent.textContent = `Error loading file: ${err.message}`;
    }
  }

  // Copy Code Button
  copyCodeBtn.addEventListener('click', async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(codeContent.textContent);
      const originalText = copyCodeBtn.innerHTML;
      copyCodeBtn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> <span>Copied! ✓</span>';
      copyCodeBtn.classList.add('btn-refresh-success');
      if (window.lucide) window.lucide.createIcons();

      showToast({
        title: 'Copied to Clipboard',
        message: 'Source code copied to your clipboard',
        type: 'success',
        duration: 2000
      });

      setTimeout(() => {
        copyCodeBtn.innerHTML = originalText;
        copyCodeBtn.classList.remove('btn-refresh-success');
        if (window.lucide) window.lucide.createIcons();
      }, 1500);
    } catch {
      showToast({ title: 'Copy Failed', message: 'Unable to write to clipboard', type: 'danger' });
    }
  });

  // Modal Open & Close
  function openPreviewModal(folderName) {
    playClickSound();
    activePreviewFolder = folderName;
    const previewUrl = `/preview/${folderName}/index.html`;
    previewIframe.src = previewUrl;
    previewUrlBar.textContent = `http://localhost:3000${previewUrl}`;
    previewExternalLink.href = previewUrl;

    // Reset default view state
    viewLiveBtn.classList.add('active');
    viewInspectorBtn.classList.remove('active');
    if (viewAuditBtn) viewAuditBtn.classList.remove('active');
    previewStage.classList.remove('hidden');
    inspectorStage.classList.add('hidden');
    if (auditStage) auditStage.classList.add('hidden');
    viewportControls.classList.remove('hidden');

    // Reset zoom and fullscreen
    setZoom(1.0);
    previewModal.classList.remove('fullscreen-mode');
    const fsIcon = toggleFullscreenStudioBtn?.querySelector('[data-lucide], svg');
    if (fsIcon) {
      fsIcon.setAttribute('data-lucide', 'maximize-2');
    }

    // Reset to desktop view
    currentDevice = 'desktop';
    isLandscape = false;
    viewportBtns.forEach(b => b.classList.toggle('active', b.dataset.device === 'desktop'));
    updateDeviceFrame();

    // Preload tree in background for instantaneous inspector tab feel
    loadAssetTree(folderName);

    previewModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    if (Motion) {
      const modalWindow = previewModal.querySelector('.preview-modal-window');
      if (modalWindow) {
        Motion.animate(modalWindow, { scale: [0.92, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 380, damping: 22 });
      }
    }
  }

  function closePreview() {
    previewModal.classList.add('hidden');
    previewModal.classList.remove('fullscreen-mode');
    setZoom(1.0);
    previewIframe.src = 'about:blank';
    activePreviewFolder = null;
  }

  closePreviewBtn.addEventListener('click', closePreview);
  closePreviewOverlay.addEventListener('click', closePreview);
  
  // Studio Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!deleteModal.classList.contains('hidden')) closeDeleteModal();
      if (!previewModal.classList.contains('hidden')) closePreview();
    } else if (e.key === 'f' || e.key === 'F') {
      if (!previewModal.classList.contains('hidden') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        toggleFullscreenStudio();
      }
    }
  });

  // Keep fluid resolution readout synchronized on window resize
  window.addEventListener('resize', () => {
    if (!previewModal.classList.contains('hidden') && currentDevice === 'desktop') {
      updateDimensionTelemetry();
    }
  });

  // Initial load
  loadClonedSites();
  if (window.lucide) window.lucide.createIcons();
});
