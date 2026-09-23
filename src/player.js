// Jogador: modelo humanoide simples, movimento, pulo e stamina.
import * as THREE from 'three';
import { colide } from './world.js';
export const teclas = {};
addEventListener('keydown', e => teclas[e.code] = true);
addEventListener('keyup', e => teclas[e.code] = false);

// Humanoide feito de formas básicas (usado também pelos NPCs)
export function criarHumano(cor, pele) {
  const g = new THREE.Group(), m = c => new THREE.MeshLambertMaterial({ color: c });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(.6, .8, .3), m(cor)); corpo.position.y = 1.2;
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), m(pele)); cab.position.y = 1.85;
  const per = new THREE.Mesh(new THREE.BoxGeometry(.5, .8, .3), m(0x223355)); per.position.y = .4;
  g.add(corpo, cab, per); return g;
}

export class Jogador {
  constructor(scene) {
    this.obj = criarHumano(0xff0000, 0xf1c27d); scene.add(this.obj); this.obj.position.set(6, 0, 30);
    this.yaw = 0; this.pitch = 0; this.vy = 0; this.hp = 100; this.st = 100; this.dinheiro = 0; this.veiculo = null;
  }
  atualizar(dt) {
    if (this.veiculo) return;
    const fx = (teclas.KeyW ? 1 : 0) - (teclas.KeyS ? 1 : 0), sx = (teclas.KeyD ? 1 : 0) - (teclas.KeyA ? 1 : 0);
    const correr = teclas.ShiftLeft && this.st > 0 && (fx || sx), v = correr ? 9 : 4.5, l = Math.hypot(fx, sx) || 1;
    const s = Math.sin(this.yaw), c = Math.cos(this.yaw), p = this.obj.position;
    const dx = (-s * fx + c * sx) / l * v * dt, dz = (-c * fx - s * sx) / l * v * dt;
    if (!colide(p.x + dx, p.z, .4)) p.x += dx;
    if (!colide(p.x, p.z + dz, .4)) p.z += dz;
    this.st = Math.max(0, Math.min(100, this.st + (correr ? -20 : 12) * dt));
    if (teclas.Space && p.y <= 0) this.vy = 6;
    this.vy -= 18 * dt; p.y = Math.max(0, p.y + this.vy * dt); if (p.y === 0) this.vy = 0;
    this.obj.rotation.y = this.yaw;
  }
}
