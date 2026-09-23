// Veículos: aceleração, freio, direção e dano ao bater.
import * as THREE from 'three';
import { teclas } from './player.js';
import { colide } from './world.js';

export class Carro {
  constructor(scene, x, z, cor, yaw) {
    this.obj = new THREE.Group();
    const m = c => new THREE.MeshLambertMaterial({ color: c });
    const b = new THREE.Mesh(new THREE.BoxGeometry(2, .8, 4.4), m(cor)); b.position.y = .7;
    const k = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 2), m(0x223344)); k.position.set(0, 1.45, .2);
    this.obj.add(b, k);
    for (const sx of [-1, 1]) for (const sz of [-1.4, 1.4]) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .3, 10), m(0x111111));
      r.rotation.z = Math.PI / 2; r.position.set(sx * 1.05, .4, sz); this.obj.add(r);
    }
    this.obj.position.set(x, 0, z); this.yaw = yaw; this.v = 0; this.hp = 100; scene.add(this.obj);
  }
  atualizar(dt, dirigindo) {
    if (dirigindo) {
      const a = (teclas.KeyW ? 1 : 0) - (teclas.KeyS ? 1 : 0);
      this.v += a * (a * this.v < 0 ? 30 : 14) * dt;               // acelera / freia
      if (teclas.Space) this.v *= Math.max(0, 1 - 4 * dt);          // freio de mão
      const dir = (teclas.KeyA ? 1 : 0) - (teclas.KeyD ? 1 : 0);
      this.yaw += dir * dt * 1.8 * Math.max(-1, Math.min(1, this.v / 8));
    }
    this.v = Math.max(-8, Math.min(38, this.v * Math.max(0, 1 - .5 * dt)));
    const p = this.obj.position, dx = -Math.sin(this.yaw) * this.v * dt, dz = -Math.cos(this.yaw) * this.v * dt;
    if (colide(p.x + dx, p.z + dz, 1.6)) { this.hp = Math.max(0, this.hp - Math.abs(this.v) * .8); this.v *= -.3; }
    else { p.x += dx; p.z += dz; }
    this.obj.rotation.y = this.yaw;
  }
}
