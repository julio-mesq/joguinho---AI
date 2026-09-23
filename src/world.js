// Mundo: ruas, prédios (InstancedMesh), praia, montanhas e ciclo dia/noite.
import * as THREE from 'three';
const lotes = new Map(); // colisão: prédios por quarteirão (100x100)
const R = (a, b) => a + Math.random() * (b - a);

// Retorna true se o ponto (x,z) com raio r bate em algum prédio
export function colide(x, z, r) {
  if (Math.abs(x) > 1000 || Math.abs(z) > 1000) return true;
  const a = lotes.get(Math.floor(x / 100) + ',' + Math.floor(z / 100));
  if (!a) return false;
  for (const l of a) if (Math.abs(x - l.x) < l.w + r && Math.abs(z - l.z) < l.d + r) return true;
  return false;
}

export function criarMundo(scene) {
  const mat = c => new THREE.MeshLambertMaterial({ color: c });
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), mat(0xa0a0a0));
  chao.rotation.x = -Math.PI / 2; scene.add(chao);

  // Ruas (#2b2b2b) com faixa central branca, a cada 100 m
  const asf = mat(0x2b2b2b), faixa = mat(0xffffff);
  for (let i = -10; i <= 10; i++) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(14, .1, 2000), asf); a.position.set(i * 100, .05, 0);
    const b = new THREE.Mesh(new THREE.BoxGeometry(2000, .1, 14), asf); b.position.set(0, .05, i * 100);
    const fa = new THREE.Mesh(new THREE.BoxGeometry(.3, .1, 2000), faixa); fa.position.set(i * 100, .1, 0);
    const fb = new THREE.Mesh(new THREE.BoxGeometry(2000, .1, .3), faixa); fb.position.set(0, .1, i * 100);
    scene.add(a, b, fa, fb);
  }

  // Prédios: 4 por quarteirão (vidro azul, concreto, tijolo)
  const cores = [0x4a90e2, 0x808080, 0xa0522d];
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), 1600);
  const m = new THREE.Matrix4(), c = new THREE.Color(); let n = 0;
  for (let bx = -10; bx < 10; bx++) for (let bz = -10; bz < 10; bz++) {
    const arr = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const w = R(20, 34), d = R(20, 34), h = R(10, 70);
      const x = bx * 100 + 28 + i * 44, z = bz * 100 + 28 + j * 44;
      m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
      im.setMatrixAt(n, m); im.setColorAt(n, c.setHex(cores[Math.random() * 3 | 0])); n++;
      arr.push({ x, z, w: w / 2, d: d / 2 });
    }
    lotes.set(bx + ',' + bz, arr);
  }
  im.frustumCulled = false; scene.add(im);

  // Praia (areia + mar) ao sul e montanhas ao redor
  const areia = new THREE.Mesh(new THREE.BoxGeometry(2400, .1, 100), mat(0xf4e2a1)); areia.position.set(0, .03, 1050);
  const mar = new THREE.Mesh(new THREE.BoxGeometry(2400, .1, 100), mat(0x1e90ff)); mar.position.set(0, .04, 1150);
  scene.add(areia, mar);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, mt = new THREE.Mesh(new THREE.ConeGeometry(R(120, 180), R(150, 300), 6), mat(i % 2 ? 0x3cb371 : 0x8b4513));
    mt.position.set(Math.cos(a) * 1350, 100, Math.sin(a) * 1350); scene.add(mt);
  }

  // Luz do sol + céu dinâmico (azul -> laranja -> roxo)
  const sol = new THREE.DirectionalLight(0xffffff, 1.5); scene.add(sol, sol.target);
  const amb = new THREE.HemisphereLight(0x87ceeb, 0x444444, .6); scene.add(amb);
  const dia = new THREE.Color(0x87ceeb), por = new THREE.Color(0xff8c00), noite = new THREE.Color(0x191970);
  return function atualizarCeu(t, alvo) { // t: 0..1 = um dia completo
    const a = t * Math.PI * 2, h = Math.sin(a);
    sol.position.set(alvo.x + Math.cos(a) * 500, Math.sin(a) * 500, alvo.z + 200); sol.target.position.copy(alvo);
    const col = h > .3 ? dia.clone() : h > 0 ? por.clone().lerp(dia, h / .3) : por.clone().lerp(noite, Math.min(1, -h * 4));
    scene.background.copy(col); scene.fog.color.copy(col);
    sol.intensity = Math.max(.1, h * 1.6); amb.intensity = .25 + Math.max(0, h) * .5;
  };
}
