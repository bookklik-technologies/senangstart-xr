'use strict';

/**
 * Reproducible build/package checks:
 * - dist/ contains the development and production bundles
 * - the distributed and example copies are byte-identical
 * - the bundled font asset ships with the package
 * Exits non-zero (and prints what is out of sync) when a check fails.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const problems = [];

const hashOf = function (file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
};

const distPairs = [
    ['dist/senangstart-xr.js', 'examples/js/senangstart-xr.js'],
    ['dist/senangstart-xr.min.js', 'examples/js/senangstart-xr.min.js'],
    ['dist/senangstart-xr.min.js.map', 'examples/js/senangstart-xr.min.js.map'],
    ['Outfit-Regular.ttf', 'dist/Outfit-Regular.ttf'],
    ['Outfit-Regular.ttf', 'examples/js/Outfit-Regular.ttf'],
];

distPairs.forEach(function (pair) {
    const distFile = path.join(root, pair[0]);
    const exampleFile = path.join(root, pair[1]);
    if (!fs.existsSync(distFile)) {
        problems.push(`missing bundle: ${pair[0]} (run npm run dist)`);
        return;
    }
    if (!fs.existsSync(exampleFile)) {
        problems.push(`missing example copy: ${pair[1]} (run npm run dist:all)`);
        return;
    }
    const distHash = hashOf(distFile);
    const exampleHash = hashOf(exampleFile);
    if (distHash !== exampleHash) {
        problems.push(`${pair[1]} is out of sync with ${pair[0]} (hashes differ)`);
    }
});

const fontFile = path.join(root, 'Outfit-Regular.ttf');
if (!fs.existsSync(fontFile)) {
    problems.push('missing bundled font asset: Outfit-Regular.ttf');
} else {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (!pkg.files.includes('Outfit-Regular.ttf')) {
        problems.push('package.json "files" does not include the bundled font asset');
    }
}

const minFile = path.join(root, 'dist/senangstart-xr.min.js');
if (fs.existsSync(minFile)) {
    const banner = fs.readFileSync(minFile, 'utf8');
    if (banner.length < 1000) {
        problems.push('dist/senangstart-xr.min.js looks truncated');
    }
}

if (problems.length) {
    problems.forEach(function (problem) { console.error('FAIL: ' + problem); });
    process.exit(1);
}
console.log('build/package checks passed: bundles in sync, font asset packaged');
