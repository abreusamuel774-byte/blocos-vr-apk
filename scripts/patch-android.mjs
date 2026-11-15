import fs from 'node:fs';

const file = 'android/app/src/main/AndroidManifest.xml';

let xml = fs.readFileSync(file, 'utf8');

// Verificar se o AndroidManifest existe corretamente
if (!xml.includes('<manifest')) {
  throw new Error('Tag manifest não encontrada!');
}

// Adicionar permissão da câmera
if (!xml.includes('android.permission.CAMERA')) {
  const manifestStart = xml.indexOf('<manifest');
  const manifestEnd = xml.indexOf('>', manifestStart);

  if (manifestEnd === -1) {
    throw new Error('Abertura do manifest inválida!');
  }

  xml =
    xml.slice(0, manifestEnd + 1) +
    '\n    <uses-permission android:name="android.permission.CAMERA" />\n' +
    xml.slice(manifestEnd + 1);
}

// Configurar orientação VR sem duplicar atributos
xml = xml.replace(/<activity\b[^>]*>/g, (activity) => {
  if (activity.includes('android:screenOrientation=')) {
    return activity.replace(
      /android:screenOrientation="[^"]*"/,
      'android:screenOrientation="sensorLandscape"'
    );
  }

  return activity.replace(
    '<activity',
    '<activity android:screenOrientation="sensorLandscape"'
  );
});

fs.writeFileSync(file, xml, 'utf8');

console.log('Manifest VR configurado corretamente!');
