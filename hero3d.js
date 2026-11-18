/* ============ MASTER SOUD — Hero 3D (Three.js) ============ */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("hero3d");
const hero = canvas && canvas.parentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 820px)").matches;

function supportsGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}

if (canvas && supportsGL()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, 0.055);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 11);

  // luzes
  scene.add(new THREE.AmbientLight(0x4a6a96, 0.6));
  const key = new THREE.PointLight(0x6fb6ff, 60, 30); key.position.set(4, 3, 5); scene.add(key);
  const rim = new THREE.PointLight(0x2b6cb0, 40, 30); rim.position.set(-6, -2, 3); scene.add(rim);

  const root = new THREE.Group();
  root.position.x = small ? 0 : 2.6;
  scene.add(root);

  // ---- painéis de vidro (película) ----
  function roundedRect(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  const paneGeo = new THREE.ExtrudeGeometry(roundedRect(2.2, 1.35, 0.28), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 });
  paneGeo.center();
  const tints = [0x0b1a2c, 0x123a66, 0x0a0f18, 0x1f4f86, 0x0d2440];
  const panes = [];
  const N = small ? 7 : 11;
  for (let i = 0; i < N; i++) {
    const m = new THREE.MeshPhysicalMaterial({
      color: tints[i % tints.length], metalness: 0.15, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05,
      transparent: true, opacity: 0.55 + (i % 3) * 0.12, envMapIntensity: 1.6, side: THREE.DoubleSide
    });
    const p = new THREE.Mesh(paneGeo, m);
    const a = (i / N) * Math.PI * 2;
    const rad = 2.6 + (i % 3) * 0.55;
    p.userData = { a, rad, y: (i - N / 2) * 0.42, spd: 0.12 + (i % 4) * 0.03, wob: Math.random() * 6 };
    p.scale.setScalar(0.55 + (i % 4) * 0.14);
    // borda neon
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(paneGeo, 30), new THREE.LineBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.35 }));
    p.add(edge);
    root.add(p); panes.push(p);
  }

  // ---- anéis de luz ----
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  const rings = [3.4, 4.4].map((r, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), ringMat.clone());
    t.rotation.x = Math.PI / 2.25 + i * 0.25; t.material.opacity = 0.35 - i * 0.12; root.add(t); return t;
  });

  // ---- núcleo brilhante ----
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 4), new THREE.MeshPhysicalMaterial({ color: 0x0d2440, metalness: 1, roughness: 0.15, envMapIntensity: 2.2, clearcoat: 1 }));
  root.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0x4888c8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
  halo.scale.setScalar(5.5); root.add(halo);

  // ---- partículas ----
  const PN = small ? 450 : 1100;
  const pos = new Float32Array(PN * 3);
  for (let i = 0; i < PN; i++) { pos[i * 3] = (Math.random() - 0.5) * 26; pos[i * 3 + 1] = (Math.random() - 0.5) * 14; pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.04, color: 0x9ccaff, transparent: true, opacity: 0.7, map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  scene.add(dust);

  // ---- feixes de luz (velocidade) ----
  const streaks = [];
  const sGeo = new THREE.PlaneGeometry(3.5, 0.02);
  for (let i = 0; i < (small ? 6 : 14); i++) {
    const s = new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0x6fb6ff : 0xffffff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
    resetStreak(s, true); scene.add(s); streaks.push(s);
  }
  function resetStreak(s, init) {
    s.position.set(init ? (Math.random() - 0.5) * 30 : -16 - Math.random() * 10, (Math.random() - 0.5) * 7, -3 - Math.random() * 6);
    s.userData.v = 0.08 + Math.random() * 0.18; s.userData.o = 0.25 + Math.random() * 0.5;
  }

  // ---- piso grade ----
  const grid = new THREE.GridHelper(60, 60, 0x1f4f86, 0x10233a);
  grid.position.y = -3.2; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);

  function glowTex() {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ---- interação ----
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => { target.x = e.clientX / innerWidth * 2 - 1; target.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; target.x = Math.max(-1, Math.min(1, e.gamma / 35)); target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 35)); }, { passive: true });
  let scrollK = 0;
  addEventListener("scroll", () => { scrollK = Math.min(1, scrollY / (hero.offsetHeight || 800)); }, { passive: true });

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    root.position.x = w < 820 ? 0 : 3.9; root.position.y = w < 820 ? 1.6 : 0; root.position.z = w < 820 ? -2 : -2.5;
    camera.position.z = w < 820 ? 13 : 11;
  }
  resize(); addEventListener("resize", resize);

  let running = true, visible = true, t0 = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && running && !reduce) loop(); }, { threshold: 0 }).observe(hero);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !reduce) loop(); });

  let raf = 0;
  function frame(now) {
    const t = (now - t0) / 1000;
    cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05;
    camera.position.x = cur.x * 1.2; camera.position.y = 0.4 - cur.y * 0.7 + scrollK * 1.5;
    camera.lookAt(root.position.x * 0.55, root.position.y * 0.6 - scrollK, 0);

    root.rotation.y = t * 0.08 + cur.x * 0.25; root.rotation.x = cur.y * 0.12;
    panes.forEach((p) => {
      const d = p.userData, a = d.a + t * d.spd;
      p.position.set(Math.cos(a) * d.rad, d.y * 0.6 + Math.sin(t * 0.7 + d.wob) * 0.25, Math.sin(a) * d.rad);
      p.rotation.set(Math.sin(t * 0.3 + d.wob) * 0.4, -a + Math.PI / 2, Math.cos(t * 0.25 + d.wob) * 0.2);
    });
    rings.forEach((r, i) => { r.rotation.z = t * (i ? -0.12 : 0.18); });
    core.rotation.y = t * 0.4; core.rotation.x = t * 0.2;
    halo.material.opacity = 0.75 + Math.sin(t * 1.6) * 0.15;
    key.position.x = 4 + Math.sin(t * 0.5) * 2;
    dust.rotation.y = t * 0.015; dust.position.y = Math.sin(t * 0.2) * 0.2;
    streaks.forEach((s) => {
      s.position.x += s.userData.v; s.material.opacity = Math.min(s.userData.o, s.material.opacity + 0.02);
      if (s.position.x > 16) { s.material.opacity = 0; resetStreak(s); }
    });
    grid.position.z = (t * 0.8) % 1;
    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    const step = (now) => { if (!running || !visible) return; frame(now); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }

  if (reduce) { frame(performance.now() + 4000); }
  else loop();
  requestAnimationFrame(() => canvas.classList.add("ready"));
}
