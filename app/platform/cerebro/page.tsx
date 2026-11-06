"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import KryptonShell from "@/components/layout/KryptonShell";

function noise(x: number, y: number, z: number) {
  return (
    Math.sin(x * 1.7 + y * 2.3) * Math.cos(y * 1.3 - z * 1.9) * 0.6 +
    Math.sin(z * 3.1 + x * 2.1) * Math.cos(x * 1.9 + z * 0.8) * 0.3 +
    Math.sin(x * 4.4 - y * 3.2 + z * 2.6) * 0.2
  );
}

function lobeRadius(dir: THREE.Vector3, base: number, detail: number, groove: number) {
  const n = noise(dir.x * detail, dir.y * detail, dir.z * detail);
  const g = groove ? Math.exp(-((dir.x * 7) ** 2)) * groove : 0;
  return base * (1 + 0.16 * n - g);
}

function buildLobe(base: number, detail: number, groove: number, scale: THREE.Vector3) {
  const geo = new THREE.IcosahedronGeometry(1, 5);
  const pos = geo.attributes.position;
  const dir = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    const r = lobeRadius(dir, base, detail, groove);
    pos.setXYZ(i, dir.x * r * scale.x, dir.y * r * scale.y, dir.z * r * scale.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function surfacePoints(n: number, base: number, detail: number, groove: number, scale: THREE.Vector3) {
  const ico = new THREE.IcosahedronGeometry(1, 1);
  const p = ico.attributes.position;
  const dir = new THREE.Vector3();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < p.count && pts.length < n; i++) {
    dir.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const r = lobeRadius(dir, base, detail, groove) * 1.015;
    pts.push(new THREE.Vector3(dir.x * r * scale.x, dir.y * r * scale.y, dir.z * r * scale.z));
  }
  return pts;
}

export default function CerebroPage() {
  const mount = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleTimeString("es-VE")), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientWidth;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 0.3, 5.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const scaleL = new THREE.Vector3(1.0, 0.98, 1.05);
    const brainMat = new THREE.MeshStandardMaterial({ color: 0xff2f7f, emissive: 0x7a0038, emissiveIntensity: 0.55, roughness: 0.55, metalness: 0.12 });
    const left = new THREE.Mesh(buildLobe(1.0, 3.2, 0.28, scaleL), brainMat);
    left.position.x = -0.58;
    left.scale.set(1.15, 1, 1);
    const right = new THREE.Mesh(buildLobe(1.0, 3.2, 0.28, scaleL), brainMat);
    right.position.x = 0.58;
    right.scale.set(1.15, 1, 1);
    const cerebMat = new THREE.MeshStandardMaterial({ color: 0xb4004f, emissive: 0x4a0020, emissiveIntensity: 0.4, roughness: 0.6 });
    const cereb = new THREE.Mesh(buildLobe(0.5, 6, 0, new THREE.Vector3(1, 0.8, 0.9)), cerebMat);
    cereb.position.set(0.5, -0.75, -0.75);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.6, 10), cerebMat);
    stem.position.set(0.15, -1.25, -0.4);
    stem.rotation.z = 0.3;
    group.add(left, right, cereb, stem);

    const pts = [...surfacePoints(70, 1.0, 3.2, 0.28, scaleL), ...surfacePoints(16, 0.5, 6, 0, new THREE.Vector3(1, 0.8, 0.9)).map((p) => p.add(new THREE.Vector3(0.5, -0.75, -0.75)))];
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const nodeMat = new THREE.PointsMaterial({ color: 0xffe3f1, size: 0.045, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    const linePts: THREE.Vector3[] = [];
    pts.forEach((p, i) => {
      const nearest = pts
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      nearest.forEach((o) => { linePts.push(p, pts[o.j]); });
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffb3d9, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    scene.add(new THREE.AmbientLight(0x331020, 1.1));
    const key = new THREE.PointLight(0xff5fa8, 7, 10);
    key.position.set(2.4, 1.6, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0x8a2cff, 3, 10);
    rim.position.set(-2.4, -1, -2);
    scene.add(rim);

    group.rotation.y = 0.35;
    group.rotation.x = 0.08;

    const drag = { on: false, x: 0, y: 0 };
    function down(e: PointerEvent) {
      drag.on = true; drag.x = e.clientX; drag.y = e.clientY;
      el!.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (!drag.on) return;
      group.rotation.y += (e.clientX - drag.x) * 0.008;
      group.rotation.x += (e.clientY - drag.y) * 0.005;
      group.rotation.x = Math.max(-0.9, Math.min(0.9, group.rotation.x));
      drag.x = e.clientX; drag.y = e.clientY;
    }
    function up() { drag.on = false; }
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);

    let raf = 0;
    const clock = new THREE.Clock();
    function loop() {
      const t = clock.getElapsedTime();
      if (!drag.on) group.rotation.y += 0.0022;
      key.intensity = 6 + Math.sin(t * 1.3) * 1.6;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    loop();

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const s = el.clientWidth;
      renderer.setSize(s, s);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      [left.geometry, right.geometry, cereb.geometry, stem.geometry, nodeGeo, lineGeo].forEach((g) => g.dispose());
      [brainMat, cerebMat, nodeMat, lineMat].forEach((m) => m.dispose());
    };
  }, []);

  return (
    <KryptonShell>
      <section className="mx-auto max-w-2xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">KRYPTON PLATFORM</p>
        <h1 className="mt-2 text-2xl font-light">Cerebro de Krypton</h1>
        <p className="mt-2 text-sm text-white/60">Arrástralo para girarlo en 3D. Vista de exhibición.</p>

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/15 bg-black p-2">
          <span className="absolute left-4 top-3 z-10 flex items-center gap-2 text-[10px] tracking-widest text-pink-200/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" /> CORTEX · EN VIVO
          </span>
          <div ref={mount} className="mx-auto aspect-square w-full max-w-md touch-none" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="k-glass-card rounded-2xl p-4">
            <p className="text-xs text-white/55">Pulso · Cortex</p>
            <svg viewBox="0 0 160 36" className="mt-2 h-9 w-full">
              <path d="M0 18 H50 L58 4 L66 32 L74 10 L82 18 H160" fill="none" stroke="#ff8fc7" strokeWidth="1.6" className="krypton-brain-trace" />
            </svg>
          </div>
          <div className="k-glass-card rounded-2xl p-4">
            <p className="text-xs text-white/55">Reloj del núcleo</p>
            <p className="mt-2 font-mono text-lg text-pink-100">{now || "--:--:--"}</p>
          </div>
        </div>

        <Link href="/platform" className="mt-8 block text-center text-xs text-white/55 underline">Volver a Platform</Link>
      </section>
    </KryptonShell>
  );
}
