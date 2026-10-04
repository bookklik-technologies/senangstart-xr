'use strict';

// CI integration runner. Local interactive auditing uses the requested Browser.
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const {chromium} = require('playwright');
const aframeDist = path.dirname(require.resolve('aframe'));
const aframePackage = JSON.parse(fs.readFileSync(path.join(aframeDist, '..', 'package.json'), 'utf8'));
if (process.env.SXR_AFRAME) assert.equal(aframePackage.version, process.env.SXR_AFRAME, 'installed A-Frame package matches matrix');
const root = path.resolve(__dirname, '..');
const bundle = process.env.SXR_BUNDLE || 'senangstart-xr.min.js';
assert(['senangstart-xr.js', 'senangstart-xr.min.js'].includes(bundle));
const output = path.join(root, 'artifacts/browser');
fs.mkdirSync(output, {recursive: true});
const html = fs.readFileSync(path.join(__dirname, 'fixtures/aframe.html'), 'utf8').replace('__BUNDLE__', bundle);
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
        return;
    }
    if (url.pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
    const files = {
        '/aframe.js': path.join(aframeDist, 'aframe-master.min.js'),
        ['/dist/' + bundle]: path.join(root, 'dist', bundle),
        '/dist/Outfit-Regular.ttf': path.join(root, 'dist/Outfit-Regular.ttf'),
    };
    const file = files[url.pathname];
    if (!file || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', file.endsWith('.ttf') ? 'font/ttf' : 'application/javascript');
    res.end(fs.readFileSync(file));
});

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    let browser;
    const errors = [];
    try {
        browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
        const page = await browser.newPage({viewport: {width: 1280, height: 900}});
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('requestfailed', request => errors.push(request.url() + ': ' + request.failure().errorText));
        page.on('response', response => { if (response.status() >= 400) errors.push(response.url() + ': ' + response.status()); });
        await page.goto(`http://127.0.0.1:${server.address().port}/`);
        await page.waitForFunction(() => document.querySelector('a-scene')?.hasLoaded && document.querySelector('#slider')?.components['sxr-slider']);
        await page.screenshot({path: path.join(output, '01-initial.png')});
        const report = await page.evaluate(async () => {
            const checks = [];
            const check = (condition, name) => { if (!condition) throw new Error(name); checks.push(name); };
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            // A-Frame primitive mappings update through MutationObserver callbacks.
            // Poll component state so assertions wait for those asynchronous updates.
            const checkEventually = async (condition, name) => {
                const deadline = Date.now() + 5000;
                while (!condition() && Date.now() < deadline) await wait(10);
                check(condition(), name);
            };
            const loaded = el => el.hasLoaded ? Promise.resolve() : new Promise(resolve => el.addEventListener('loaded', resolve, {once: true}));
            const scene = document.querySelector('a-scene');
            await SXR.registerFontFile(SXR.fonts.default);
            check(Boolean(SXR.fonts.registered[SXR.fonts.default]), 'packaged default font loads');
            const container = document.querySelector('#layout');
            const first = document.querySelector('#first');
            check(container.components['sxr-flex-container'].data.fontColor === '#ff0000', 'primitive style mapping is parsed');
            await checkEventually(() => first.components['sxr-label'].data.fontColor === '#ff0000', 'initial inherited color');
            container.setAttribute('font-color', '#00ff00');
            await checkEventually(() => first.components['sxr-label'].data.fontColor === '#00ff00', 'inherited colors update');
            first.setAttribute('font-color', '#0000ff');
            await checkEventually(() => first.components['sxr-label'].data.fontColor === '#0000ff', 'authored child color is applied');
            container.setAttribute('font-color', '#ffffff');
            const second = document.querySelector('#second');
            await checkEventually(() => second.components['sxr-label'].data.fontColor === '#ffffff', 'inherited sibling colors update');
            check(first.components['sxr-label'].data.fontColor === '#0000ff', 'authored child color is preserved');
            container.setAttribute('height', 4);
            await wait(300);
            check(Math.abs(first.object3D.position.y - 1.75) < 0.001, 'row edge uses half child height after resize');
            const previousX = second.object3D.position.x;
            first.setAttribute('width', 2);
            await wait(300);
            check(second.object3D.position.x > previousX, 'child resize relayouts siblings');
            const slider = document.querySelector('#slider');
            slider.setAttribute('width', 4);
            await wait(300);
            const horizontal = slider.components['sxr-slider'];
            check(horizontal.sliderActiveBar.getAttribute('geometry').width === 1.75, 'resized slider bar matches track');
            slider.object3D.rotation.z = Math.PI / 2;
            slider.object3D.scale.set(2, 2, 2);
            scene.object3D.updateMatrixWorld(true);
            const hit = slider.object3D.localToWorld(new AFRAME.THREE.Vector3(0.875, 0, 0));
            const originalHit = hit.clone();
            slider.emit('click', {intersection: {point: hit}});
            check(Math.abs(horizontal.data.percent - 0.75) < 0.001 && hit.equals(originalHit), 'transformed slider uses a copied hit point');
            const vertical = document.querySelector('#vertical');
            vertical.setAttribute('height', 4);
            await wait(300);
            const verticalComponent = vertical.components['sxr-vertical-slider'];
            vertical.dispatchEvent(new KeyboardEvent('keyup', {key: 'End', bubbles: true}));
            check(window.verticalValue === 1, 'vertical keyboard callback remains percent-only');
            scene.object3D.updateMatrixWorld(true);
            vertical.emit('click', {intersection: {point: vertical.object3D.localToWorld(new AFRAME.THREE.Vector3(0, 0, 0))}});
            check(Math.abs(verticalComponent.data.percent - 0.5) < 0.001, 'vertical hit math after resize');
            const input = document.querySelector('#input');
            input.focus();
            input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', bubbles: true}));
            const field = input.components['sxr-input'].nativeField;
            check(document.activeElement === field && field.getAttribute('aria-hidden') !== 'true', 'keyboard focuses accessible native editor');
            field.value = 'Typed value';
            field.dispatchEvent(new Event('input'));
            check(input.components['sxr-input'].data.value === 'Typed value', 'native text synchronizes');
            input.setAttribute('native-editing', false);
            await checkEventually(() => !field.isConnected && !input.components['sxr-input'].nativeField, 'disabling native editing disposes field');
            for (const id of ['toggle', 'radio']) {
                const el = document.getElementById(id);
                const mesh = el.getObject3D('mesh');
                check(mesh.material.transparent && mesh.material.opacity === 0 && !mesh.material.depthWrite,
                    id + ' hit target is invisible and does not write depth');
                el.setAttribute('width', 3);
                await wait(300);
                check(el.getAttribute('geometry').width === 3, id + ' hit area spans the resized row');
                scene.object3D.updateMatrixWorld(true);
                const origin = el.object3D.localToWorld(new AFRAME.THREE.Vector3(1.25, 0, 1));
                const direction = new AFRAME.THREE.Vector3(0, 0, -1).transformDirection(el.object3D.matrixWorld);
                const ray = new AFRAME.THREE.Raycaster(origin, direction);
                check(ray.intersectObject(mesh, false).length > 0, id + ' transparent label area remains raycastable');
                el.emit('click');
                check(!el.components['sxr-' + id].data.checked, id + ' respects disabled state');
            }
            // Check both ordinary-entity use and component-only removal.
            const counts = [];
            for (let round = 0; round < 12; round++) {
                for (const name of ['sxr-slider', 'sxr-vertical-slider', 'sxr-button', 'sxr-input']) {
                    const el = document.createElement('a-entity');
                    el.setAttribute(name, '');
                    scene.appendChild(el);
                    await loaded(el);
                    el.removeAttribute(name);
                    check(el.children.length === 0, name + ' removes owned children');
                    el.remove();
                }
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                counts.push({...scene.renderer.info.memory});
            }
            const tail = counts.slice(6);
            check(tail.at(-1).geometries <= tail[0].geometries + 2 && tail.at(-1).textures <= tail[0].textures + 2, 'renderer resources stabilize after warm-up');
            return {aframeRuntime: AFRAME.version, checks, resourceCounts: counts};
        });
        // Patch releases can retain the previous runtime version in their bundle.
        // Validate the installed package above and record both versions for diagnosis.
        report.aframe = aframePackage.version;
        await page.screenshot({path: path.join(output, '02-after-interactions.png')});
        fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({...report, bundle, errors}, null, 2));
        assert.deepEqual(errors, [], 'no browser errors or missing assets');
        console.log(`PASS: A-Frame ${report.aframe}, ${bundle}, ${report.checks.length} integration checks`);
    } catch (error) {
        fs.writeFileSync(path.join(output, 'failure.txt'), [error.stack, ...errors].join('\n'));
        throw error;
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
