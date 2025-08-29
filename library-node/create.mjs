#!/usr/bin/env node
// Minimal template initializer for @hexafield/template-library-node
// Usage: npx @hexafield/template-library-node <targetDir?>
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve target directory
const arg = process.argv[2] || '.';
const targetDir = path.resolve(process.cwd(), arg);

// Files/folders to exclude from copy
const EXCLUDES = new Set([
  'node_modules',
  'dist',
  '.git',
  '.DS_Store',
  'create.mjs',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

/** Recursively copy directory, excluding items in EXCLUDES */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (EXCLUDES.has(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function updatePackageJson(pkgPath, newName) {
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
  // Convert to a regular project package
  delete pkg.bin;
  pkg.name = newName || pkg.name?.replace(/^@hexafield\/template-/, '') || 'my-library';
    pkg.version = '0.1.0';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  } catch (e) {
    // best-effort
  }
}

function main() {
  // Determine source root for copying (the template's src dir parents)
  const templateRoot = __dirname;
  const sourceRoot = path.resolve(templateRoot);

  // Ensure target exists or create it
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy selective files/folders from template
  copyDir(sourceRoot, targetDir);

  // After copy, adjust package.json if present
  const targetPkg = path.join(targetDir, 'package.json');
  if (fs.existsSync(targetPkg)) {
    const baseName = path.basename(targetDir);
    updatePackageJson(targetPkg, baseName);
  }

  // Print next steps
  const rel = path.relative(process.cwd(), targetDir) || '.';
  console.log(`\nScaffolded library-node template into ${rel}`);
  console.log('Next steps:');
  console.log(`  cd ${rel}`);
  console.log('  npm install');
  console.log('  npm run build && npm test');
}

main();
