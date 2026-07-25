const fs = require('node:fs');
const path = require('node:path');

if (process.platform !== 'win32') {
  process.exit(0);
}

const targets = [
  {
    file: 'node_modules/@granite-js/plugin-micro-frontend/dist/index.js',
    original: 'path.resolve(modulePath)',
    replacement: "path.resolve(modulePath).replaceAll('\\\\', '/')",
  },
  {
    file: 'node_modules/@granite-js/plugin-micro-frontend/dist/index.cjs',
    original: 'path.default.resolve(modulePath)',
    replacement: "path.default.resolve(modulePath).replaceAll('\\\\', '/')",
  },
];

const compatFiles = [
  'node_modules/@apps-in-toss/plugin-compat/dist/index.js',
  'node_modules/@apps-in-toss/plugin-compat/dist/index.cjs',
];
const compatPatches = [
  {
    original: 'const reactUsePolyfillPath = __require.resolve("react18-use");',
    replacement:
      'const reactUsePolyfillPath = __require.resolve("react18-use").replaceAll("\\\\", "/");',
  },
  {
    original: 'const reactEffectEventPolyfillPath = __require.resolve("use-effect-event");',
    replacement:
      'const reactEffectEventPolyfillPath = __require.resolve("use-effect-event").replaceAll("\\\\", "/");',
  },
  {
    original: 'const reactUsePolyfillPath = require.resolve("react18-use");',
    replacement:
      'const reactUsePolyfillPath = require.resolve("react18-use").replaceAll("\\\\", "/");',
  },
  {
    original: 'const reactEffectEventPolyfillPath = require.resolve("use-effect-event");',
    replacement:
      'const reactEffectEventPolyfillPath = require.resolve("use-effect-event").replaceAll("\\\\", "/");',
  },
];

for (const target of targets) {
  const filePath = path.join(process.cwd(), target.file);
  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes(target.replacement)) {
    continue;
  }

  if (!source.includes(target.original)) {
    throw new Error(`Granite Windows 호환 패치 대상을 찾지 못했어요: ${target.file}`);
  }

  fs.writeFileSync(filePath, source.replace(target.original, target.replacement), 'utf8');
}

for (const relativePath of compatFiles) {
  const filePath = path.join(process.cwd(), relativePath);
  let source = fs.readFileSync(filePath, 'utf8');

  for (const patch of compatPatches) {
    if (source.includes(patch.replacement)) {
      continue;
    }
    if (source.includes(patch.original)) {
      source = source.replace(patch.original, patch.replacement);
    }
  }

  fs.writeFileSync(filePath, source, 'utf8');
}
