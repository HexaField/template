#!/usr/bin/env node
// Minimal template initializer for @hexafield/template-web
// Usage: npx @hexafield/template-web <targetDir?>
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arg = process.argv[2] || '.';
const targetDir = path.resolve(process.cwd(), arg);

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

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (EXCLUDES.has(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function updatePackageJson(pkgPath, newName) {
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
  delete pkg.bin;
    pkg.name = newName || pkg.name?.replace(/^@hexafield\/template-/, '') || 'my-web-app';
    pkg.version = '0.1.0';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  } catch {}
}

function ensureReadme(target) {
  const readme = path.join(target, 'README.md');
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(
      readme,
      `# ${path.basename(target)}\n\nGenerated from @hexafield/template-web.\n\n## Scripts\n- dev: Vite dev server\n- build: Vite build\n- serve: Preview build\n`
    );
  }
}

function main() {
  const sourceRoot = path.resolve(__dirname);
  fs.mkdirSync(targetDir, { recursive: true });
  copyDir(sourceRoot, targetDir);
  const targetPkg = path.join(targetDir, 'package.json');
  if (fs.existsSync(targetPkg)) {
    const baseName = path.basename(targetDir);
    updatePackageJson(targetPkg, baseName);
  }
  ensureReadme(targetDir);
  const rel = path.relative(process.cwd(), targetDir) || '.';
  console.log(`\nScaffolded web template into ${rel}`);
  console.log('Next steps:');
  console.log(`  cd ${rel}`);
  console.log('  npm install');
  console.log('  npm run dev');
}

main();
