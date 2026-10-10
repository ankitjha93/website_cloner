# ⚡ MirroX — Autonomous Offline Web Replicator & Deep Archiver

**MirroX** is an ultra-modern, high-performance web archiving and replication application built with Node.js and Express. It creates pixel-perfect, offline-navigable copies of websites with deep asset extraction, CSS font localization, live progress streaming, and instant in-browser offline preview.


---

## 🚀 Features

- **Deep Asset Extraction**: Automatically downloads HTML, CSS, JavaScript, Web Fonts (WOFF/TTF), Images (PNG, JPG, SVG, WebP, srcset), Favicons, and media.
- **CSS URL Rewriter**: Recursively inspects stylesheets to extract and rewrite `@import` rules and `url(...)` font/background image references.
- **Link & Asset Localization**: Converts absolute and web URLs into local relative paths so that the cloned site works **100% offline** without broken styles or images.
- **Interactive Control Deck**:
  - Configurable crawl depth (1 to 5 levels)
  - Maximum page limit & concurrency throttles
  - Granular asset type toggles (Images, Styles, Scripts, Fonts, Media)
  - Domain scope restrictions (Same domain vs Subdomains)
- **Live Terminal & Metrics**: Real-time progress monitoring via Server-Sent Events (SSE) showing downloaded files, total size, speed, and streaming activity logs.
- **Built-in Offline Preview**: Test and browse any cloned website inside an interactive in-browser preview modal without leaving the app.
- **One-Click Export**:
  - 📦 Download complete site as `.zip` archive
  - 📂 Open directly in Windows File Explorer
  - 🗑️ Delete archived clones anytime

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; tested on v22)
- **npm** (v9+)

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Run the Application
Start the local server:
```bash
npm start
```
Then open your browser and navigate to:
```
http://localhost:3000
```

### 4. Running the Automated Tests
Verify that crawling, asset extraction, and link localization work properly:
```bash
npm test
```

---

## 📁 Project Structure

```
Website Cloner Project/
├── server.js              # Express web server & REST/SSE API endpoints
├── package.json           # Dependencies and scripts (npm start, npm test)
├── cloner/
│   ├── engine.js          # Core recursive crawling & asset downloading engine
│   ├── cssParser.js       # Extracts & rewrites fonts/images inside CSS files
│   └── utils.js           # Path sanitization, URL normalization & helpers
├── public/
│   ├── index.html         # Modern dark-mode dashboard
│   ├── styles.css         # Glassmorphism styling and responsive layout
│   └── app.js             # Frontend controller & SSE event stream handler
├── clones/                # Output folder storing cloned sites and manifests
└── test/
    └── test-cloner.js     # Verification test with local mock HTTP server
```

---

## 🛡️ Security Note

This tool runs **strictly locally on your machine**. It contains no remote execution loaders, no telemetry, and requires no administrator privileges. All cloned sites are stored locally in the `clones/` folder and can be inspected or browsed safely offline.
