import fs from 'fs';
import path from 'path';

/**
 * Technology Signatures Catalog
 */
const TECH_SIGNATURES = [
  // Frontend Frameworks
  {
    name: 'Next.js',
    category: 'Framework',
    icon: 'triangle',
    color: '#000000',
    patterns: [/__NEXT_DATA__/i, /\/_next\/static\//i, /next-route-announcer/i, /content=["']Next\.js/i]
  },
  {
    name: 'React',
    category: 'Framework',
    icon: 'atom',
    color: '#61dafb',
    patterns: [/react\.production/i, /_reactInternalInstance/i, /react-dom/i, /data-reactroot/i, /__REACT_DEVTOOLS_/i]
  },
  {
    name: 'Nuxt.js',
    category: 'Framework',
    icon: 'layers',
    color: '#00dc82',
    patterns: [/__NUXT__/i, /\/_nuxt\//i]
  },
  {
    name: 'Vue.js',
    category: 'Framework',
    icon: 'code-2',
    color: '#42b883',
    patterns: [/vue\.global/i, /vue\.runtime/i, /data-v-[a-f0-9]{6,}/i, /__vue_app__/i]
  },
  {
    name: 'Angular',
    category: 'Framework',
    icon: 'shield',
    color: '#dd0031',
    patterns: [/ng-version/i, /angular\.min\.js/i, /@angular\//i]
  },
  {
    name: 'Svelte',
    category: 'Framework',
    icon: 'zap',
    color: '#ff3e00',
    patterns: [/class="svelte-[a-z0-9]+"/i, /__svelte/i]
  },
  {
    name: 'jQuery',
    category: 'Library',
    icon: 'code',
    color: '#0769ad',
    patterns: [/jquery(?:\.min)?\.js/i, /jQuery\s*v[0-9.]+/i]
  },
  {
    name: 'HTMX',
    category: 'Library',
    icon: 'send',
    color: '#3366cc',
    patterns: [/htmx\.min\.js/i, /hx-(?:get|post|target|swap)/i]
  },
  {
    name: 'Alpine.js',
    category: 'Library',
    icon: 'mountain',
    color: '#77c1d2',
    patterns: [/alpine(?:\.min)?\.js/i, /x-data=/i, /x-bind=/i]
  },

  // CSS & Styling
  {
    name: 'Tailwind CSS',
    category: 'Styling',
    icon: 'palette',
    color: '#38bdf8',
    patterns: [
      /tailwindcss/i,
      /@tailwind/i,
      /(?:flex|grid)\s+(?:items-center|justify-between)\s+(?:p-\d|px-\d|space-x-)/i,
      /(?:bg-slate-|bg-zinc-|text-sky-|rounded-xl|backdrop-blur-)/i
    ]
  },
  {
    name: 'Bootstrap',
    category: 'Styling',
    icon: 'layout',
    color: '#7952b3',
    patterns: [/bootstrap(?:\.min)?\.(?:css|js)/i, /class="[^"]*\b(?:container-fluid|col-md-|navbar-expand-)/i]
  },
  {
    name: 'Material UI',
    category: 'Styling',
    icon: 'component',
    color: '#007fff',
    patterns: [/MuiButton|MuiBox|MuiTypography|@mui\//i]
  },

  // Icons & Typography
  {
    name: 'Lucide Icons',
    category: 'Icons',
    icon: 'sparkles',
    color: '#f43f5e',
    patterns: [/data-lucide=/i, /lucide(?:\.min)?\.js/i]
  },
  {
    name: 'Font Awesome',
    category: 'Icons',
    icon: 'flag',
    color: '#538dd7',
    patterns: [/font-awesome/i, /fontawesome/i, /class="[^"]*\bfa-[a-z0-9-]+/i]
  },
  {
    name: 'Google Fonts',
    category: 'Fonts',
    icon: 'type',
    color: '#4285f4',
    patterns: [/fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i]
  },

  // CMS & Infrastructure
  {
    name: 'WordPress',
    category: 'CMS',
    icon: 'globe',
    color: '#21759b',
    patterns: [/wp-content\//i, /wp-includes\//i, /generator" content="WordPress/i]
  },
  {
    name: 'Shopify',
    category: 'E-Commerce',
    icon: 'shopping-bag',
    color: '#96bf48',
    patterns: [/cdn\.shopify\.com/i, /Shopify\.theme/i]
  },
  {
    name: 'Cloudflare',
    category: 'CDN & Security',
    icon: 'cloud',
    color: '#f38020',
    patterns: [/cloudflare/i, /cdnjs\.cloudflare\.com/i, /cf-ray/i]
  },
  {
    name: 'Vercel',
    category: 'Deployment',
    icon: 'triangle',
    color: '#000000',
    patterns: [/vitals\.vercel-insights\.com/i, /vercel/i]
  }
];

/**
 * Detects technologies used in a cloned website directory
 * @param {string} projectDir Absolute path to cloned directory
 * @returns {Promise<Object>} Detected tech stack report
 */
export async function detectTechStack(projectDir) {
  const detected = new Map();

  if (!fs.existsSync(projectDir)) {
    return { technologies: [] };
  }

  // Scan top-level HTML, CSS, and main JS files
  const sampleFiles = [];

  function collectSamples(dir, depth = 0) {
    if (depth > 2) return;
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          collectSamples(fullPath, depth + 1);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (['.html', '.htm', '.css', '.js'].includes(ext)) {
            sampleFiles.push(fullPath);
          }
        }
      }
    } catch {}
  }

  collectSamples(projectDir);

  // Read contents of sample files (up to first 50 files)
  const contents = [];
  for (const file of sampleFiles.slice(0, 50)) {
    try {
      const stat = fs.statSync(file);
      if (stat.size > 2 * 1024 * 1024) continue; // skip > 2MB
      const content = fs.readFileSync(file, 'utf-8');
      contents.push(content);
    } catch {}
  }

  const combinedSample = contents.join('\n');

  for (const tech of TECH_SIGNATURES) {
    for (const pattern of tech.patterns) {
      if (pattern.test(combinedSample)) {
        if (!detected.has(tech.name)) {
          detected.set(tech.name, {
            name: tech.name,
            category: tech.category,
            icon: tech.icon,
            color: tech.color
          });
        }
        break;
      }
    }
  }

  return {
    technologies: Array.from(detected.values())
  };
}
