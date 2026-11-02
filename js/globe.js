// Scene 02: a sphere of project photographs. Three.js vanilla.
// setProgress(p) is driven by the pinned ScrollTrigger; drag adds inertia on top.
import * as THREE from '../vendor/three.module.min.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // inOut cubic
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));

export function createGlobe(canvas, { tiles, frontIndex = 0, featureIndex = 7, mobile = false, onHover }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  const group = new THREE.Group();
  scene.add(group);

  const R = 5;
  const loader = new THREE.TextureLoader();
  const texCache = new Map();
  const getTex = (src) => {
    if (!texCache.has(src)) {
      const t = loader.load(src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      texCache.set(src, t);
    }
    return texCache.get(src);
  };

  // Rings of curved patches. Each patch is a slice of a sphere, so the photo bends with the globe.
  const rowStep = 0.3;
  const rows = mobile ? [-2, -1, 0, 1, 2] : [-3, -2, -1, 0, 1, 2, 3];
  const baseW = 0.36, baseH = 0.24, gap = 0.04;
  const meshes = [];
  let k = 0;
  const frontPhi = Math.PI / 2;
  rows.forEach((r) => {
    const theta = Math.PI / 2 + r * rowStep;
    const s = Math.sin(theta);
    const w = baseW / s;
    const n = Math.floor((Math.PI * 2) / (w + gap / s));
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const phiC = frontPhi + i * step + (r % 2 ? step / 2 : 0);
      const geo = new THREE.SphereGeometry(R, 10, 8, phiC - w / 2, w, theta - baseH / 2, baseH);
      let idx;
      if (r === 0 && i === 0) idx = frontIndex;
      else if (r === 0 && i === 7) idx = featureIndex;
      else { idx = k % tiles.length; k++; if (idx === frontIndex || idx === featureIndex) { idx = (idx + 1) % tiles.length; } }
      const tile = tiles[idx];
      const mat = new THREE.MeshBasicMaterial({ map: getTex(tile.src), transparent: true, opacity: 0, side: THREE.FrontSide, depthWrite: true });
      const m = new THREE.Mesh(geo, mat);
      const dir = new THREE.Vector3(-Math.cos(phiC) * s, Math.cos(theta), Math.sin(phiC) * s);
      m.userData = { dir, phi: phiC, cap: tile.cap || '', delay: Math.random() * 0.12 + (Math.abs(r) * 0.03) };
      group.add(m);
      meshes.push(m);
      if (r === 0 && i === 7) group.userData.featurePhi = phiC;
      if (r === 0 && i === 0) group.userData.front = m;
    }
  });

  // state
  let progress = 0, drag = 0, vel = 0, idle = 0, paused = false, active = false;
  let w = 1, h = 1, nearZ = 11, farZ = 23;
  const tmp = new THREE.Vector3();

  function resize() {
    w = canvas.clientWidth || window.innerWidth; h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // near: the front tile is as wide as the hero frame (30vw desktop, 76vw mobile)
    const frameFrac = mobile ? 0.76 : 0.3;
    const tileW = baseW * R; // arc width at equator
    const visW = tileW / frameFrac;
    nearZ = R + visW / (2 * t * camera.aspect);
    // far: the whole sphere fills about 72% of the shorter side
    const fit = mobile ? 0.86 : 0.72;
    const byH = (2 * R) / (fit * 2 * t);
    const byW = (2 * R) / (fit * 2 * t * camera.aspect);
    farZ = Math.max(byH, byW);
  }

  // drag (horizontal only; vertical always scrolls the page)
  let down = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { if (mobile) return; down = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (down) { const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * 0.004; drag += vel; }
    pointer.x = (e.clientX / w) * 2 - 1; pointer.y = -(e.clientY / h) * 2 + 1; pointer.cx = e.clientX; pointer.cy = e.clientY; pointer.in = true;
  });
  canvas.addEventListener('pointerup', () => { down = false; });
  canvas.addEventListener('pointerleave', () => { down = false; pointer.in = false; onHover && onHover(null); });
  const pointer = { x: 0, y: 0, cx: 0, cy: 0, in: false };
  const ray = new THREE.Raycaster();
  let hovered = null;

  function frame() {
    if (!active) return;
    if (!down) { vel *= 0.94; drag += vel; }
    if (!paused) idle += 0.0009;

    const p = progress;
    const pIn = ease(seg(p, 0, 0.3));
    const pTurn = ease(seg(p, 0.25, 0.75));
    const pDive = ease(seg(p, 0.75, 1));

    // rotation: start with the front tile facing us, turn 140deg, then bring the feature tile round
    const turn = THREE.MathUtils.degToRad(140) * pTurn + idle + drag;
    const featureRot = Math.PI / 2 - group.userData.featurePhi;
    // shortest path from current turn to the feature angle
    let target = featureRot;
    while (target - turn > Math.PI) target -= Math.PI * 2;
    while (target - turn < -Math.PI) target += Math.PI * 2;
    group.rotation.y = turn + (target - turn) * pDive;
    group.rotation.x = 0.12 * pIn * (1 - pDive);

    const z = nearZ + (farZ - nearZ) * pIn;
    camera.position.set(0, 0, z + ((R + 0.55) - z) * pDive);
    camera.lookAt(0, 0, 0);

    // per tile: fade in from depth, darken when facing away
    const camDir = tmp.copy(camera.position).normalize();
    for (const m of meshes) {
      const d = m.userData.dir.clone().applyEuler(group.rotation);
      const facing = d.dot(camDir);
      const appear = clamp((pIn * 1.25) - m.userData.delay);
      const isFront = m === group.userData.front;
      const a = isFront ? 1 : appear;
      m.material.opacity = a * clamp(facing * 2.2 + 0.25, 0, 1);
      const lum = 0.28 + 0.72 * clamp(facing, 0, 1);
      m.material.color.setScalar(m === hovered ? 1 : lum);
      const sc = m === hovered ? 1.05 : 1;
      m.scale.setScalar(m.scale.x + (sc - m.scale.x) * 0.15);
    }

    // hover
    if (pointer.in && !mobile && pDive < 0.05) {
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(meshes, false).find((h) => h.object.material.opacity > 0.4);
      const next = hit ? hit.object : null;
      if (next !== hovered) { hovered = next; }
      onHover && onHover(hovered && hovered.userData.cap ? { text: hovered.userData.cap, x: pointer.cx, y: pointer.cy } : null);
    } else if (hovered) { hovered = null; onHover && onHover(null); }

    renderer.render(scene, camera);
  }

  resize();
  return {
    setProgress(p) { progress = p; },
    setActive(v) { active = v; },
    setPaused(v) { paused = v; },
    resize,
    frame,
    dispose() { renderer.dispose(); texCache.forEach((t) => t.dispose()); },
  };
}
