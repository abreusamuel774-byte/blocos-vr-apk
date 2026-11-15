import fs from 'node:fs';
const file = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(file, 'utf8');
if (!xml.includes('android.permission.CAMERA')) {
  xml = xml.replace('<manifest ', '<manifest ');
  const p = xml.indexOf('>');
  xml = xml.slice(0, p + 1) + '\n    <uses-permission android:name="android.permission.CAMERA" />' + xml.slice(p + 1);
}
xml = xml.replace('<activity', '<activity android:screenOrientation="sensorLandscape"');
fs.writeFileSync(file, xml);
console.log('Permissão da câmera e orientação VR configuradas.');
