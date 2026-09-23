# Meu GTA (protótipo 3D no navegador)

## Jogar rápido
Extraia o zip e dê dois cliques em `iniciar.bat` (Windows) ou execute `./iniciar.sh` (Mac/Linux). Precisa de Python 3 e internet (o Three.js vem de um CDN). Para parar, feche a janela do terminal.

## Rodar no VS Code
1. Abra a pasta `meu-gta` no VS Code (Arquivo > Abrir Pasta).
2. No terminal: `python -m http.server 8000`
3. Acesse http://localhost:8000
   (Módulos ES não funcionam abrindo o arquivo com `file://`; use sempre um servidor.)

## Publicar no GitHub Pages
1. Crie um repositório e envie todos os arquivos (`git init`, `git add .`, `git commit`, `git push`).
2. No GitHub: Settings > Pages > Source: branch `main`, pasta `/ (root)`.
3. Aguarde 1-2 minutos e abra `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Módulos
- `main.js`: renderer, câmeras (V), tiro (F), HUD, veículos (E), cheat HESOYAM.
- `src/world.js`: cidade 2x2 km, prédios instanciados, praia, montanhas, ciclo dia/noite, colisão.
- `src/player.js`: humanoide, movimento, pulo, stamina.
- `src/vehicles.js`: carros com aceleração, freio, direção e dano.
- `src/npcs.js`: 30 NPCs (4 policiais) que andam, fogem e perseguem.

## Ainda não incluído
Física com Cannon/Rapier, áudio (Howler), GSAP, minimapa, armas 2-6, escolhas/karma, personalização,
modelos .glb, clima e demais veículos. Cada um pode virar um novo módulo em `src/`.
