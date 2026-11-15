# BLOCOS VR — projeto para gerar APK Android offline

Este ZIP é o **projeto-fonte para compilar o APK na nuvem**. Ele ainda não é o APK instalável.
A compilação precisa baixar dependências e o modelo de mãos uma vez; depois disso, o jogo empacota
Three.js, MediaPipe, o modelo de mãos e o mundo dentro do aplicativo para funcionar sem internet.

## O que já está preparado
- Jogo BLOCOS VR 5.1 como conteúdo local do aplicativo.
- Three.js empacotado localmente (sem CDN durante o jogo).
- MediaPipe Tasks Vision, arquivos WASM e modelo de mãos empacotados localmente.
- Permissão Android para câmera.
- Orientação paisagem, adequada ao visor SBS.
- Workflow GitHub Actions que compila um APK de teste.

## Como gerar o APK usando só o celular
1. Baixe e extraia este ZIP no celular.
2. No navegador, entre em https://github.com/new e crie um repositório chamado `blocos-vr-apk`.
3. No repositório, use **Add file → Upload files** e envie os arquivos e pastas que estão dentro desta pasta
   (incluindo a pasta `.github`; se ela não aparecer no seletor, ative a visualização de arquivos ocultos ou
   envie o projeto pelo navegador em modo computador).
4. Faça o commit na branch `main`.
5. Abra a aba **Actions** do repositório.
6. Selecione **Build BLOCOS VR APK** e toque em **Run workflow**. Também inicia automaticamente após o primeiro push.
7. Quando terminar com marca verde, abra a execução e baixe o artefato **BLOCOS-VR-APK**.
8. Extraia o artefato e instale `app-debug.apk`. O Android pode pedir autorização para instalar apps dessa origem.

## Importante
- O APK de debug é para teste e instalação manual; não é uma versão publicada na Play Store.
- Na primeira vez, conceda permissão de câmera nas opções do Android para usar a detecção das mãos.
- A detecção das mãos precisa da câmera e pode não funcionar bem com a câmera traseira dependendo de como o telefone fica no VR Box.
- O giroscópio depende dos sensores do aparelho.
- O jogo e o rastreador ficam no APK; o jogo não precisa de internet depois de instalado.
- O processo de build usa serviços externos do GitHub e baixa as bibliotecas/modelo durante a compilação.
- Ainda é necessário testar o APK no aparelho real; este ambiente não possui Android SDK nem acesso à rede para compilar e validar o APK aqui.

## Tecnologias
- Capacitor Android 7
- Three.js 0.180.0
- MediaPipe Tasks Vision 0.10.14
