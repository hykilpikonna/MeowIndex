#!/usr/bin/env node

/**
 * Build script for MeowIndex Caddy template.
 * Assembles modular CSS and JS from caddy/ into docs/meowindex.html.
 *
 * Usage:
 *   node scripts/build-caddy.js
 *   node scripts/build-caddy.js --watch
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CADDY_DIR = path.join(ROOT_DIR, 'caddy');
const CSS_DIR = path.join(CADDY_DIR, 'css');
const JS_DIR = path.join(CADDY_DIR, 'js');
const TEMPLATE_FILE = path.join(CADDY_DIR, 'template.html');
const OUTPUT_HTML = path.join(ROOT_DIR, 'docs', 'meowindex.html');
const DIST_DIR = path.join(CADDY_DIR, 'dist');

function getFilesSorted(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort()
    .map(f => path.join(dir, f));
}

function build() {
  const startTime = performance.now();

  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Template not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

  // 1. Assemble CSS
  const cssFiles = getFilesSorted(CSS_DIR, '.css');
  const cssChunks = cssFiles.map(file => {
    const filename = path.basename(file);
    const content = fs.readFileSync(file, 'utf8').trim();
    return `    /* === [caddy/css/${filename}] === */\n${content.split('\n').map(line => line ? '    ' + line : '').join('\n')}`;
  });
  const bundledCss = cssChunks.join('\n\n');

  // 2. Assemble JS
  const jsFiles = getFilesSorted(JS_DIR, '.js');
  const jsChunks = jsFiles.map(file => {
    const filename = path.basename(file);
    const content = fs.readFileSync(file, 'utf8').trim();
    return `    // === [caddy/js/${filename}] ===\n${content.split('\n').map(line => line ? '    ' + line : '').join('\n')}`;
  });
  const bundledJs = jsChunks.join('\n\n');

  // 3. Inject into template
  let result = template
    .replace('/* {{MEOWINDEX_CSS}} */', bundledCss)
    .replace('// {{MEOWINDEX_JS}}', bundledJs);

  // 4. Write output HTML
  fs.mkdirSync(path.dirname(OUTPUT_HTML), { recursive: true });
  fs.writeFileSync(OUTPUT_HTML, result.trim() + '\n', 'utf8');

  // 5. Also write standalone dist bundles
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, 'meowindex.css'), cssFiles.map(f => fs.readFileSync(f, 'utf8').trim()).join('\n\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'meowindex.js'), jsFiles.map(f => fs.readFileSync(f, 'utf8').trim()).join('\n\n') + '\n', 'utf8');

  const elapsed = (performance.now() - startTime).toFixed(1);
  const lineCount = result.split('\n').length;
  const kbSize = (Buffer.byteLength(result, 'utf8') / 1024).toFixed(1);

  console.log(`✔ [${new Date().toLocaleTimeString()}] Built docs/meowindex.html (${lineCount} lines, ${kbSize} KB) in ${elapsed}ms from ${cssFiles.length} CSS and ${jsFiles.length} JS modules.`);
}

// Build once
build();

// Watch mode if requested
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  console.log('👀 Watching caddy/ directory for changes...');
  let debounceTimeout = null;

  const triggerBuild = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      try {
        build();
      } catch (err) {
        console.error('Build error:', err.message);
      }
    }, 100);
  };

  fs.watch(CADDY_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.css') || filename.endsWith('.js') || filename.endsWith('.html'))) {
      triggerBuild();
    }
  });
}
