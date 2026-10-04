'use strict';

// A failed pack or consumer install is a failed release check, never a skip.
const {execFileSync} = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const temporaryRoot = fs.realpathSync(os.tmpdir());
const fixture = fs.mkdtempSync(path.join(temporaryRoot, 'senangstart-xr-consumer-'));
const npmCli = process.env.npm_execpath || require.resolve('npm/bin/npm-cli.js');
const npm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], {
    cwd, encoding: 'utf8', timeout: 180000, windowsHide: true,
});

try {
    const info = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', fixture], root))[0];
    const tarball = path.resolve(fixture, info.filename);
    assert.equal(path.dirname(tarball), fixture, 'tarball must stay in consumer directory');
    const files = new Set(info.files.map(file => file.path));
    for (const file of ['dist/senangstart-xr.js', 'dist/senangstart-xr.min.js', 'dist/Outfit-Regular.ttf', 'README.md', 'LICENSE']) {
        assert(files.has(file), `package is missing ${file}`);
    }
    fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({name: 'sxr-consumer-fixture', version: '1.0.0', private: true}));
    // Install the supported peer. Network, resolution and install failures
    // propagate as nonzero; there is deliberately no successful skip path.
    npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball, 'aframe@1.8.0'], fixture);
    const packageDir = path.join(fixture, 'node_modules', ...info.name.split('/'));
    const installed = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    for (const target of [installed.main, installed.exports['.'], 'dist/Outfit-Regular.ttf']) {
        const file = path.resolve(packageDir, target);
        assert(file.startsWith(packageDir + path.sep), 'package entry must stay inside package');
        assert(fs.statSync(file).size > 0, `installed file missing or empty: ${target}`);
    }
    assert(fs.readFileSync(path.join(packageDir, 'dist/Outfit-Regular.ttf')).equals(fs.readFileSync(path.join(root, 'Outfit-Regular.ttf'))));
    console.log('PASS: packaged font and entry points; consumer install with A-Frame 1.8.0');
    console.log('Browser registration and rendering are checked separately by check:browser in CI.');
} finally {
    const resolved = fs.realpathSync(fixture);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('senangstart-xr-consumer-'));
    fs.rmSync(resolved, {recursive: true, force: true});
}
