// Ponto de entrada: renderer, câmera (POVs), tiro, HUD, veículos e cheats.
import * as THREE from 'three';
import { criarMundo } from './src/world.js';
import { Jogador, teclas } from './src/player.js';
import { Carro } from './src/vehicles.js';
import { criarNPCs } from './src/npcs.js';

const cv = document.getElementById('c'), $ = id => document.getElementById(id);
const fraco = (navigator.hardwareConcurrency || 4) <= 4; // detecção simples de PC fraco
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !fraco });
renderer.setPixelRatio(fraco ? 1 : Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); scene.fog = new THREE.Fog(0x87ceeb, 150, fraco ? 500 : 900);
const cam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .1, 1500);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });

const ceu = criarMundo(scene), jog = new Jogador(scene), npcs = criarNPCs(scene);
const cores = [0xff0000, 0x000000, 0xffffff, 0xffcc00, 0x1e90ff];
const carros = Array.from({ length: 12 }, (_, i) => {
  const h = i % 2, rua = (i % 5 - 2) * 100, livre = (Math.random() - .5) * 400;
  return i === 0 ? new Carro(scene, 0, 32, cores[0], 0) : new Carro(scene, h ? livre : rua, h ? rua : livre, cores[i % 5], h * Math.PI / 2);
});

let rodando = false, pov = 0, estrelas = 0, semCrime = 0, municao = 12, tiroT = 0, tempoDia = .25, buf = '';
// Pausa / retomada com pointer lock (ESC libera o mouse)
$('menu').onclick = () => { cv.requestPointerLock?.(); rodando = true; $('menu').classList.add('off'); };
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement) { rodando = false; $('menu').classList.remove('off'); } });
addEventListener('mousemove', e => { if (document.pointerLockElement) { jog.yaw -= e.movementX * .0025; jog.pitch = Math.max(-1, Math.min(1, jog.pitch - e.movementY * .0025)); } });

addEventListener('keydown', e => {
  buf = (buf + e.key).toLowerCase().slice(-7);
  if (buf === 'hesoyam') { jog.hp = 100; jog.dinheiro += 250000; } // cheat estilo GTA
  if (!rodando) return;
  if (e.code === 'KeyV') pov = (pov + 1) % 3;
  if (e.code === 'KeyR') municao = 12;
  if (e.code === 'KeyE') {
    if (jog.veiculo) { const c = jog.veiculo, p = c.obj.position; jog.obj.position.set(p.x + Math.cos(c.yaw) * 3, 0, p.z - Math.sin(c.yaw) * 3); jog.yaw = c.yaw; jog.veiculo = null; }
    else { const c = carros.find(k => k.obj.position.distanceTo(jog.obj.position) < 8); if (c) jog.veiculo = c; }
  }
});

const ray = new THREE.Raycaster(), tmp = new THREE.Vector3();
function atirar(t) {
  if (municao <= 0 || jog.veiculo || t < tiroT + .15) return;
  tiroT = t; municao--;
  ray.setFromCamera({ x: 0, y: 0 }, cam);
  const o = ray.ray.origin.clone(), fim = o.clone().addScaledVector(ray.ray.direction, 80);
  const linha = new THREE.Line(new THREE.BufferGeometry().setFromPoints([jog.obj.position.clone().setY(1.4), fim]), new THREE.LineBasicMaterial({ color: 0xffff00 }));
  scene.add(linha); setTimeout(() => { scene.remove(linha); linha.geometry.dispose(); }, 60);
  for (const n of npcs) { // NPCs a menos de 40 m fogem
    if (n.obj.position.distanceTo(jog.obj.position) < 40) n.fuga = 4;
    tmp.copy(n.obj.position).setY(1.2);
    if (ray.ray.distanceSqToPoint(tmp) < .5 && tmp.distanceTo(o) < 80) {
      n.hp -= 50; estrelas = Math.min(5, estrelas + (n.policia ? 2 : 1)); semCrime = 0;
      if (n.hp <= 0) { jog.dinheiro += 50; n.reset(); }
    }
  }
}

let ultimo = performance.now();
function loop(agora) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (agora - ultimo) / 1000); ultimo = agora;
  if (!rodando) return;
  tempoDia = (tempoDia + dt / 240) % 1; // dia completo = 4 minutos
  jog.atualizar(dt);
  carros.forEach(c => c.atualizar(dt, c === jog.veiculo));
  const alvo = jog.veiculo ? jog.veiculo.obj.position : jog.obj.position;
  let dano = 0; npcs.forEach(n => dano += n.atualizar(dt, alvo, estrelas));
  jog.hp -= dano;
  semCrime += dt; if (estrelas > 0 && semCrime > 20) { estrelas--; semCrime = 0; }
  if (jog.hp <= 0) { jog.hp = 100; estrelas = 0; jog.veiculo = null; jog.obj.position.set(6, 0, 30); } // "morreu"
  if (teclas.KeyF) atirar(agora / 1000);

  // Câmera: 0 = terceira pessoa, 1 = primeira pessoa, 2 = drone orbitando
  jog.obj.visible = !jog.veiculo && pov !== 1;
  const yaw = jog.veiculo ? jog.veiculo.yaw : jog.yaw, olhar = alvo.clone().setY(alvo.y + 1.6);
  if (pov === 1 && !jog.veiculo) { cam.position.set(alvo.x, alvo.y + 1.7, alvo.z); cam.rotation.set(jog.pitch, jog.yaw, 0, 'YXZ'); }
  else {
    const d = jog.veiculo ? 9 : 4.5, h = jog.veiculo ? 3.5 : 2.4 - jog.pitch * 2, a = agora / 4000;
    const pos = pov === 2 ? new THREE.Vector3(alvo.x + Math.sin(a) * 18, alvo.y + 8, alvo.z + Math.cos(a) * 18)
      : new THREE.Vector3(alvo.x + Math.sin(yaw) * d, alvo.y + h, alvo.z + Math.cos(yaw) * d);
    cam.position.lerp(pos, 1 - Math.exp(-8 * dt)); cam.lookAt(olhar);
  }
  ceu(tempoDia, alvo);

  // HUD
  $('hp').style.width = Math.max(0, jog.hp) + '%'; $('st').style.width = jog.st + '%';
  $('money').textContent = '$' + jog.dinheiro; $('stars').textContent = '★'.repeat(estrelas);
  $('info').textContent = jog.veiculo ? Math.round(Math.abs(jog.veiculo.v) * 3.6) + ' km/h' : 'Pistola ' + municao + '/12';
  renderer.render(scene, cam);
}
requestAnimationFrame(loop);
