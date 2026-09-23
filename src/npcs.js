// NPCs: andam pelas calçadas, fogem de tiros; policiais perseguem quando há estrelas.
import * as THREE from 'three';
import { criarHumano } from './player.js';
const R = (a, b) => a + Math.random() * (b - a);
const peles = [0xf1c27d, 0xc68642, 0x8d5524, 0xffdbac];
const roupas = [0xff0000, 0xffffff, 0x000000, 0x2e8b57, 0xffcc00];

export class NPC {
  constructor(scene, policia) {
    this.policia = policia; this.cacando = false;
    this.obj = criarHumano(policia ? 0x1e3a8a : roupas[Math.random() * 5 | 0], peles[Math.random() * 4 | 0]);
    this.obj.scale.setScalar(R(.9, 1.1)); scene.add(this.obj); this.reset();
  }
  reset() {
    this.hp = 100; this.fuga = 0; this.cacando = false; this.dir = Math.random() < .5 ? 1 : -1;
    this.eixo = Math.random() < .5 ? 'x' : 'z';
    const rua = Math.round(R(-9, 9)) * 100 + 10, p = R(-900, 900);
    this.obj.position.set(this.eixo === 'z' ? rua : p, 0, this.eixo === 'z' ? p : rua);
  }
  // Retorna o dano causado ao jogador neste frame
  atualizar(dt, alvo, estrelas) {
    const p = this.obj.position;
    if (this.policia && estrelas > 0) {
      this.cacando = true;
      const dx = alvo.x - p.x, dz = alvo.z - p.z, d = Math.hypot(dx, dz) || 1;
      this.obj.rotation.y = Math.atan2(dx, dz);
      if (d > 2.5) { p.x += dx / d * (5 + estrelas) * dt; p.z += dz / d * (5 + estrelas) * dt; return 0; }
      return 8 * dt;
    }
    if (this.cacando) this.reset();
    this.fuga = Math.max(0, this.fuga - dt);
    const e = this.eixo, antes = Math.floor(p[e] / 100);
    p[e] += this.dir * (this.fuga > 0 ? 8 : 1.6) * dt;
    if (p[e] > 950) this.dir = -1; else if (p[e] < -950) this.dir = 1; // evita ficar oscilando na borda
    if (Math.floor(p[e] / 100) !== antes && Math.random() < .5) { // vira na esquina
      p[e] = Math.round(p[e] / 100) * 100 + this.dir * 10; this.eixo = e === 'x' ? 'z' : 'x'; this.dir = Math.random() < .5 ? 1 : -1;
    }
    this.obj.rotation.y = this.eixo === 'x' ? this.dir * Math.PI / 2 : (this.dir > 0 ? 0 : Math.PI);
    return 0;
  }
}
export const criarNPCs = (scene, n = 30) => Array.from({ length: n }, (_, i) => new NPC(scene, i < 4));
