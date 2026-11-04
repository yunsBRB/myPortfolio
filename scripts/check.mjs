import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const sourceDirectories = ['src/js', 'scripts', 'tests'];
const sourceFiles = sourceDirectories.flatMap((directory) =>
  readdirSync(directory)
    .filter((file) => /\.(?:js|mjs)$/.test(file))
    .map((file) => `${directory}/${file}`)
);

for (const file of sourceFiles) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

  const source = readFileSync(file, 'utf8');
  const imports = source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)(['"])(\.[^'"]+)\1/g);

  for (const [, , importedPath] of imports) {
    if (!existsSync(resolve(dirname(file), importedPath))) {
      throw new Error(`Broken module import in ${file}: ${importedPath}`);
    }
  }
}

const requiredFiles = [
  '.nojekyll',
  'index.html',
  'src/css/styles.css',
  'src/js/app.js',
  'vendor/three.module.js',
  'vendor/three.core.js',
  'vendor/SVGRenderer.js',
  'vendor/Projector.js',
  'assets/documents/resume.pdf',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }
}

const html = readFileSync('index.html', 'utf8');
const assetPaths = html.matchAll(/(?:src|href)="([^"#]+)"/g);

for (const [, path] of assetPaths) {
  if (/^(?:https?:|data:|mailto:|#)/.test(path)) continue;
  if (!existsSync(path)) {
    throw new Error(`Broken local asset: ${path}`);
  }
}

const importMap = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
for (const path of Object.values(importMap.imports)) {
  if (!existsSync(path)) {
    throw new Error(`Broken import map entry: ${path}`);
  }
}

const tests = readdirSync('tests')
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => `tests/${file}`);

execFileSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' });
console.log('Source syntax, module paths, local assets and engine tests passed.');
