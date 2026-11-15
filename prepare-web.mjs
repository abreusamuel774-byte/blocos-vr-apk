import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'vendor', 'mediapipe', 'wasm'), { recursive: true });

fs.copyFileSync(path.join(root, 'game', 'index.html'), path.join(www, 'index.html'));

const three = path.join(root, 'node_modules', 'three', 'build', 'three.module.js');
fs.copyFileSync(three, path.join(www, 'vendor', 'three.module.js'));

const mpRoot = path.join(root, 'node_modules', '@mediapipe', 'tasks-vision');
fs.copyFileSync(path.join(mpRoot, 'vision_bundle.mjs'),
  path.join(www, 'vendor', 'mediapipe', 'vision_bundle.mjs'));

const wasmSource = path.join(mpRoot, 'wasm');
const wasmDest = path.join(www, 'vendor', 'mediapipe', 'wasm');
for (const name of fs.readdirSync(wasmSource)) {
  const from = path.join(wasmSource, name);
  const to = path.join(wasmDest, name);
  if (fs.statSync(from).isFile()) fs.copyFileSync(from, to);
}

const model = path.join(root, 'public', 'vendor', 'hand_landmarker.task');
if (!fs.existsSync(model)) {
  throw new Error('Modelo de mãos não encontrado. O workflow deve baixá-lo antes de preparar o app.');
}
fs.copyFileSync(model, path.join(www, 'vendor', 'hand_landmarker.task'));

console.log('Arquivos offline preparados em www/.');
