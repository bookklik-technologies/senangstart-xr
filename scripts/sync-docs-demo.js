/**
 * Copy the built library bundle and bundled font into docs/public/demo so the
 * live demo iframes in the documentation site load the same artifact the
 * examples and npm consumers get.
 *
 * Run automatically before `docs:dev` and `docs:build` (see package.json
 * predocs:* scripts). The copies are gitignored — they are build output, not
 * source, so they can never drift from dist/.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const demoDir = path.join(root, 'docs', 'public', 'demo');

const files = ['senangstart-xr.min.js', 'Outfit-Regular.ttf'];

const missing = files.filter((file) => !fs.existsSync(path.join(dist, file)));
if (missing.length) {
  console.error(
    'sync-docs-demo: missing build output in dist/: ' + missing.join(', ') +
    '\nRun `npm run dist-min` first (CI does this automatically).'
  );
  process.exit(1);
}

fs.mkdirSync(demoDir, { recursive: true });

files.forEach((file) => {
  const from = path.join(dist, file);
  const to = path.join(demoDir, file);
  fs.copyFileSync(from, to);
  console.log(
    'sync-docs-demo: ' + path.relative(root, from) + ' -> ' + path.relative(root, to)
  );
});
