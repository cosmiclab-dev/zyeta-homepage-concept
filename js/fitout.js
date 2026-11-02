// Scene 06: a procedural office floor that builds itself in Zyeta's seven stages.
// Built from simple geometry so no model file is needed.
import * as THREE from '../vendor/three.module.min.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t) => 1 - Math.pow(1 - t, 4);

const C = {
  slab: 0x8f9490, column: 0xd9dbd6, core: 0x2b3a35, wall: 0xe9eae6, glass: 0xbfd6d6,
  yellow: 0xb5e48c, ceiling: 0xcfd2cc, light: 0xfff4d6, desk: 0xc9a77c, chair: 0x26302c, plant: 0x4f7a52, pot: 0xe9eae6, rug: 0xb8735a,
};

export function createFitout(canvas, { mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x1f2b27, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1f2b27, 40, 90);
  const camera = new THREE.PerspectiveCamera(mobile ? 50 : 32, 1, 0.1, 300);

  const amb = new THREE.HemisphereLight(0xffffff, 0x2b3a35, 1.1);
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(14, 26, 10);
  const warm = new THREE.PointLight(0xffd59a, 0, 40, 1.5);
  warm.position.set(0, 3, 0);
  scene.add(amb, sun, warm);

  const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
  const box = (w, h, d, mat) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return new THREE.Mesh(g, mat); };

  // every material that x-ray mode should fade
  const fadeable = [];
  const mk = (color, extra) => { const m = lam(color, { transparent: true, ...extra }); fadeable.push(m); return m; };

  const W = 24, D = 14, H = 3.6;
  const floor = new THREE.Group();
  scene.add(floor);

  // 01 slab and columns
  const slabMat = mk(C.slab);
  const slab = box(W, 0.4, D, slabMat); slab.position.y = -0.4; floor.add(slab);
  const colMat = mk(C.column);
  for (let x = -9; x <= 9; x += 6) for (let z = -4.5; z <= 4.5; z += 9) { const c = box(0.6, H, 0.6, colMat); c.position.set(x, 0, z); floor.add(c); }

  // plan lines drawn on the slab
  const planPts = [];
  const rect = (x1, z1, x2, z2) => { planPts.push(x1, .02, z1, x2, .02, z1, x2, .02, z1, x2, .02, z2, x2, .02, z2, x1, .02, z2, x1, .02, z2, x1, .02, z1); };
  rect(-11.5, -6.5, 11.5, 6.5);
  rect(-11.5, -6.5, -5, -1); rect(-5, -6.5, 0, -1); rect(-11.5, 2, -6, 6.5); rect(-6, 2, -2, 6.5);
  rect(-2, -1.5, 2.5, 1.5); rect(5, -6.5, 11.5, -2.5);
  const planGeo = new THREE.BufferGeometry();
  planGeo.setAttribute('position', new THREE.Float32BufferAttribute(planPts, 3));
  const planCount = planPts.length / 3;
  const plan = new THREE.LineSegments(planGeo, new THREE.LineBasicMaterial({ color: C.yellow, transparent: true }));
  floor.add(plan);

  // 02 core, partitions, glass
  const design = new THREE.Group(); floor.add(design);
  const core = box(4.5, H, 3, mk(C.core)); core.position.set(0.25, 0, 0); design.add(core);
  const wallMat = mk(C.wall);
  const walls = [
    [-5, -3.75, 0.14, 5.5], [0, -3.75, 0.14, 5.5], [-8.25, -1, 6.5, 0.14], [-2.5, -1, 5, 0.14],
    [-6, 4.25, 0.14, 4.5], [-2, 4.25, 0.14, 4.5], [-8.75, 2, 5.5, 0.14], [-4, 2, 4, 0.14],
    [8.25, -2.5, 6.5, 0.14], [5, -4.5, 0.14, 4],
  ].map(([x, z, w, d]) => { const m = box(w, 2.9, d, wallMat); m.position.set(x, 0, z); design.add(m); return m; });
  const glassMat = mk(C.glass, { opacity: 0.22, depthWrite: false });
  const glass = [];
  [[0, -7, W, 0.06], [0, 7, W, 0.06], [-12, 0, 0.06, D], [12, 0, 0.06, D]].forEach(([x, z, w, d]) => { const g = box(w, H, d, glassMat); g.position.set(x, 0, z); design.add(g); glass.push(g); });

  // 03 MEP: ducts and trays in the ceiling void, in site yellow
  const mep = new THREE.Group(); floor.add(mep);
  const ductMat = new THREE.MeshLambertMaterial({ color: C.yellow, emissive: 0x1e3410 });
  const ducts = [];
  [[0, -3, 22, 0.9], [0, 3.2, 22, 0.9]].forEach(([x, z, l, s]) => { const g = new THREE.BoxGeometry(l, 0.55, s); const m = new THREE.Mesh(g, ductMat); m.position.set(x, 3.15, z); mep.add(m); ducts.push(m); });
  for (let x = -9; x <= 9; x += 4.5) { const g = new THREE.BoxGeometry(0.5, 0.35, 6.2); const m = new THREE.Mesh(g, ductMat); m.position.set(x, 3.15, 0.1); mep.add(m); ducts.push(m); }
  const trayMat = new THREE.MeshLambertMaterial({ color: 0x8fc45e });
  [-5.5, 5.5].forEach((z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(23, 0.08, 0.4), trayMat); m.position.set(0, 2.95, z); mep.add(m); ducts.push(m); });
  ducts.forEach((d) => { d.userData.y = d.position.y; });

  // 04 ceiling rafts and light bars
  const ceil = new THREE.Group(); floor.add(ceil);
  const raftMat = mk(C.ceiling);
  const rafts = [];
  [[-8, -3.5], [-2, -3.5], [6, -4.5], [-8, 4.3], [-2.5, 4.3], [7, 3.5]].forEach(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 3.4), raftMat); m.position.set(x, 3.0, z); ceil.add(m); rafts.push(m); });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, emissive: C.light, emissiveIntensity: 0 });
  const lights = [];
  for (let x = -9; x <= 9; x += 3) for (let z = -5.5; z <= 5.5; z += 2.75) { if (Math.abs(x) < 3 && Math.abs(z) < 2) continue; const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.12), lightMat); m.position.set(x, 2.85, z); ceil.add(m); lights.push(m); }
  [...rafts, ...lights].forEach((m) => { m.userData.y = m.position.y; });

  // 05 furniture: instanced desks and chairs, planters, rugs
  const furn = new THREE.Group(); floor.add(furn);
  const deskSpots = [];
  for (let x = 4; x <= 10; x += 3) for (let z = 0.8; z <= 5.6; z += 2.4) deskSpots.push([x, z]);
  for (let x = -10.5; x <= -6.5; x += 2) deskSpots.push([x, -5.2]);
  const deskGeo = new THREE.BoxGeometry(1.4, 0.75, 0.7); deskGeo.translate(0, 0.375, 0);
  const chairGeo = new THREE.BoxGeometry(0.5, 0.9, 0.5); chairGeo.translate(0, 0.45, 0);
  const desks = new THREE.InstancedMesh(deskGeo, lam(C.desk), deskSpots.length * 2);
  const chairs = new THREE.InstancedMesh(chairGeo, lam(C.chair), deskSpots.length * 2);
  const items = [];
  deskSpots.forEach(([x, z], i) => {
    [[0, -0.36], [0, 0.36]].forEach(([dx, dz], j) => { items.push({ mesh: desks, i: i * 2 + j, x: x + dx, z: z + dz, r: 0 }); });
    [[0, -1.05], [0, 1.05]].forEach(([dx, dz], j) => { items.push({ mesh: chairs, i: i * 2 + j, x: x + dx, z: z + dz, r: 0 }); });
  });
  furn.add(desks, chairs);
  const sofaMat = lam(C.rug);
  const extras = [];
  [[-1, 4.3, 3.2, 0.7, 1], [-9.2, 4.6, 0.9, 0.7, 2.6], [-3.5, -3.8, 3, 0.75, 1.4]].forEach(([x, z, w, h, d]) => { const m = box(w, h, d, sofaMat); m.position.set(x, 0, z); furn.add(m); extras.push(m); });
  const potGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.6, 14); potGeo.translate(0, 0.3, 0);
  const leafGeo = new THREE.SphereGeometry(0.55, 12, 10); leafGeo.translate(0, 1.05, 0);
  [[-11, -0.3], [11, 6], [3, -6.2], [-4.6, 6], [11, -1.2], [2.6, 2.6]].forEach(([x, z]) => {
    const g = new THREE.Group(); g.add(new THREE.Mesh(potGeo, lam(C.pot)), new THREE.Mesh(leafGeo, lam(C.plant))); g.position.set(x, 0, z); furn.add(g); extras.push(g);
  });
  items.forEach((it, n) => { it.delay = (it.x + 12) / 24 * 0.5 + (n % 4) * 0.02; });
  extras.forEach((e, n) => { e.userData.delay = 0.3 + n * 0.05; });
  const dummy = new THREE.Object3D();

  // camera keyframes per stage
  const s = mobile ? 1.85 : 1;
  const keys = [
    { p: [0, 34 * s, 0.01], t: [0, 0, mobile ? -4 : 0] },
    { p: [19 * s, 17 * s, 19 * s], t: [0, 0.5, 0] },
    { p: [9 * s, 4.2, 11 * s], t: [-2, 3, -1] },
    { p: [19 * s, 18 * s, 17 * s], t: [0, 1, 0] },
    { p: [-17 * s, 14 * s, 19 * s], t: [0, 0.5, 0] },
    { p: [-15 * s, 11 * s, 17 * s], t: [0, 1, 0] },
    { p: [-7 * s, 4.5, 9 * s], t: [1, 1.4, 0] },
  ];
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), tA = new THREE.Vector3(), tB = new THREE.Vector3();

  let progress = 0, active = false, w = 1, h = 1;
  function resize() {
    w = canvas.clientWidth || window.innerWidth; h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function frame() {
    if (!active) return;
    const P = progress * 7; // 0..7
    const stage = Math.min(6, Math.floor(P));
    const local = P - stage;
    const st = (n) => clamp((P - n) / 0.6); // 0..1 over the first 60% of stage n

    // camera: move during the first 60% of each stage, hold the rest
    const from = keys[Math.max(0, stage - 1)], to = keys[stage];
    const k = stage === 0 ? 1 : ease(clamp(local / 0.6));
    vA.fromArray(from.p); vB.fromArray(to.p); tA.fromArray(from.t); tB.fromArray(to.t);
    camera.position.copy(vA.lerp(vB, k));
    camera.lookAt(tA.lerp(tB, k));

    // 01 plan lines draw
    plan.geometry.setDrawRange(0, Math.floor(planCount * clamp(P / 0.7)));
    plan.material.opacity = 1 - 0.6 * st(1);

    // 02 walls rise
    const d2 = st(1);
    walls.forEach((m, i) => { const t = out(clamp(d2 * 1.6 - i * 0.06)); m.scale.y = Math.max(0.001, t); m.visible = t > 0.002; });
    core.scale.y = Math.max(0.001, out(d2)); core.visible = d2 > 0.002;
    glass.forEach((g) => { g.visible = d2 > 0.3; g.scale.y = Math.max(0.001, out(clamp((d2 - 0.3) / 0.7))); });

    // 03 MEP drops into the void; x-ray everything else
    const d3 = st(2);
    ducts.forEach((m, i) => { const t = out(clamp(d3 * 1.4 - i * 0.05)); m.position.y = m.userData.y + (1 - t) * 6; m.visible = t > 0.001; });
    const xray = stage === 2 ? clamp(local / 0.3) : stage === 3 ? 1 - clamp(local / 0.4) : 0;
    fadeable.forEach((m) => { m.opacity = (m === glassMat ? 0.22 : 1) * (1 - 0.85 * xray); m.depthWrite = xray < 0.5 && m !== glassMat; });

    // 04 ceiling slots in from above
    const d4 = st(3);
    [...rafts, ...lights].forEach((m, i) => { const t = out(clamp(d4 * 1.5 - (i % 12) * 0.04)); m.position.y = m.userData.y + (1 - t) * 4; m.visible = t > 0.001; });

    // 05 furniture drops and settles
    const d5 = st(4);
    items.forEach((it) => {
      const t = out(clamp((d5 - it.delay) / 0.45));
      dummy.position.set(it.x, (1 - t) * 3, it.z); dummy.scale.setScalar(Math.max(0.001, t)); dummy.updateMatrix();
      it.mesh.setMatrixAt(it.i, dummy.matrix);
    });
    desks.instanceMatrix.needsUpdate = true; chairs.instanceMatrix.needsUpdate = true;
    extras.forEach((e) => { const t = out(clamp((d5 - e.userData.delay) / 0.45)); e.position.y = (1 - t) * 3; e.scale.setScalar(Math.max(0.001, t)); });

    // 06 commissioning: lights on
    const d6 = st(5);
    lightMat.emissiveIntensity = 2.2 * d6;
    warm.intensity = 60 * d6;
    amb.intensity = 1.1 - 0.35 * d6;
    renderer.setClearColor(new THREE.Color(0x1f2b27).lerp(new THREE.Color(0x15201c), d6), 1);

    renderer.render(scene, camera);
  }

  resize();
  return {
    setProgress(p) { progress = p; },
    setActive(v) { active = v; },
    resize, frame,
    dispose() { renderer.dispose(); },
  };
}
