import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function replaceSection(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Não encontrei o início de ${label}.`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Não encontrei o fim de ${label}.`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function repairGameHtml(file) {
  let html = fs.readFileSync(file, 'utf8');

  const enableGyro = `async function enableGyro(){
  try{
    if(typeof DeviceOrientationEvent==='undefined'){
      setToast('Este navegador não oferece giroscópio.');
      return;
    }
    if(typeof DeviceOrientationEvent.requestPermission==='function'){
      const permission=await DeviceOrientationEvent.requestPermission();
      if(permission!=='granted'){
        setToast('Permissão do giroscópio não concedida.');
        return;
      }
    }
    gyroBase=null;
    gyroOn=true;
    window.addEventListener('deviceorientation',onDeviceOrientation,true);
    $('optGyro').checked=true;
    $('gyroQuick').textContent='🧭 3DOF ON';
    setToast('Giroscópio ligado. Vire o celular para olhar!');
  }catch(error){
    console.warn(error);
    setToast('Não foi possível ativar o giroscópio.');
  }
}
`;

  const processHands = `function processHands(now){
  if(!handsOn||!handTask)return;
  const video=$('cameraVideo');
  if(!video||video.readyState<2){
    hands.forEach(arm=>arm.visible=false);
    return;
  }
  try{
    const result=handTask.detectForVideo(video,now);
    const landmarks=result.landmarks||[];
    hands.forEach((arm,index)=>{
      const points=landmarks[index];
      if(!points||!points.length){
        arm.visible=false;
        return;
      }
      arm.visible=true;
      const wrist=points[0];
      const side=index===0?-1:1;
      arm.position.x=side*.34+(0.5-wrist.x)*.35;
      arm.position.y=-.3+(0.5-wrist.y)*.45;
      if(points[8]){
        const tip=points[8];
        arm.rotation.z=Math.atan2(tip.y-wrist.y,tip.x-wrist.x)*.15;
      }
    });
    $('handLabel').textContent=landmarks.length?'Mãos: detectadas':'Mãos: procurando';
  }catch(error){
    console.warn('Falha no rastreamento das mãos:',error);
  }
}
`;

  html = replaceSection(
    html,
    'async function enableGyro(){',
    'function disableGyro(){',
    enableGyro,
    'função do giroscópio'
  );
  html = replaceSection(
    html,
    'function processHands(now){',
    'function setCameraLook(dx,dy){',
    processHands,
    'função de rastreamento das mãos'
  );

  const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!moduleMatch) throw new Error(`Não encontrei o script principal em ${file}.`);

  const tempFile = path.join(os.tmpdir(), `blocos-vr-check-${process.pid}.mjs`);
  try {
    fs.writeFileSync(tempFile, moduleMatch[1], 'utf8');
    execFileSync(process.execPath, ['--check', tempFile], { stdio: 'pipe' });
  } catch (error) {
    const detail = error.stderr?.toString() || error.message;
    throw new Error(`O JavaScript de ${file} ainda tem um erro de sintaxe:\n${detail}`);
  } finally {
    try { fs.rmSync(tempFile, { force: true }); } catch {}
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log(`Código do jogo corrigido e validado: ${file}`);
}

// O workflow prepara www/ antes de executar este arquivo. Corrigimos tanto
// o arquivo-fonte quanto a cópia que será empacotada no aplicativo.
const htmlFiles = ['game/index.html', 'www/index.html'].filter(fs.existsSync);
if (!htmlFiles.includes('game/index.html') || !htmlFiles.includes('www/index.html')) {
  throw new Error('Não encontrei game/index.html e www/index.html. Confira a etapa prepare:web do workflow.');
}
for (const file of htmlFiles) repairGameHtml(file);

// Mantém a configuração Android que já existia no projeto.
const manifest = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(manifest, 'utf8');
if (!xml.includes('android.permission.CAMERA')) {
  const p = xml.indexOf('>');
  if (p < 0) throw new Error('AndroidManifest.xml inválido: tag manifest não encontrada.');
  xml = xml.slice(0, p + 1) + '\n    <uses-permission android:name="android.permission.CAMERA" />' + xml.slice(p + 1);
}
if (!xml.includes('android:screenOrientation=')) {
  xml = xml.replace('<activity', '<activity android:screenOrientation="sensorLandscape"');
}
fs.writeFileSync(manifest, xml);
console.log('Permissão da câmera e orientação VR configuradas.');
