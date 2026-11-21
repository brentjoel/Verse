"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildConstellation, emotionHues, freshProbe, nextTier, stepProbe, tierSettings, type QualityTier, type RenderTier } from "@/lib/constellation";

type Props = {
  order: readonly string[];
  selected: number;
  inner: boolean;
  innerCount: number;
  intensity: "low" | "medium" | "high";
  rotation: number;
  lean?: readonly number[];
  tier: RenderTier;
  onTierChange: (tier: QualityTier) => void;
};

const SECTORS = 8;
const INNER_SHARE = 0.32;

const vertexShader = /* glsl */ `
  attribute float aSector;
  attribute float aSize;
  attribute float aPhase;
  attribute float aRing;
  uniform float uTime, uOuterRot, uInnerRot, uInner, uIntensity, uPixel, uSelectedInner, uDaylight;
  uniform float uSelect[${SECTORS}];
  uniform float uLean[${SECTORS}];
  uniform vec3 uColors[${SECTORS}];
  uniform vec3 uInnerColor;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlint;

  vec2 turn(vec2 p, float r) { return vec2(p.x * cos(r) + p.y * sin(r), -p.x * sin(r) + p.y * cos(r)); }

  void main() {
    vec3 p = position;
    float s = aSector;
    float breathe = sin(uTime * 0.9 + aPhase) * 0.012;
    float twinkle = 0.62 + 0.38 * sin(uTime * (0.6 + fract(aPhase) * 0.9) + aPhase * 3.0);
    float alpha;
    float size = aSize;
    vec3 color;

    if (aRing < 0.5) {
      // Outer emotion ring and halo.
      float idx = s < 0.0 ? floor(aPhase / 6.2832 * ${SECTORS}.0) : s;
      int i = int(clamp(idx, 0.0, ${SECTORS - 1}.0));
      color = uColors[i];
      float select = s < 0.0 ? 0.0 : uSelect[i];
      float lean = s < 0.0 ? 0.0 : uLean[i];
      float radial = 1.0 + breathe + select * 0.035 + lean * 0.05 + uInner * 0.18;
      p.xy = turn(p.xy, uOuterRot) * radial;
      alpha = s < 0.0 ? 0.3 * twinkle : mix(0.55, 1.0, max(select, lean)) * twinkle;
      size *= 1.0 + select * 0.45 + lean * 0.35;
      alpha *= mix(1.0, 0.2, uInner);
    } else {
      // Inner feeling ring blooms from the center when an emotion is chosen.
      float sub = s;
      float bloom = smoothstep(0.0, 1.0, uInner);
      float selected = 1.0 - min(abs(sub - uSelectedInner), 1.0);
      p.xy = turn(p.xy, uInnerRot) * (0.9 * bloom) * (1.0 + breathe + selected * 0.04 * uIntensity);
      color = mix(uInnerColor, vec3(1.0), 0.08 * sub);
      alpha = bloom * mix(0.45, 1.0, selected) * twinkle;
      size *= (0.8 + 0.3 * uIntensity) * (1.0 + selected * 0.4);
    }

    // Soft brightening near the pointer on fine pointers.
    float near = uPointer.x > 8.0 ? 0.0 : smoothstep(0.7, 0.0, distance(p.xy, uPointer));
    alpha = min(1.0, (alpha + near * 0.45) * (1.0 + uDaylight * 0.7));
    size *= 1.0 + uDaylight * 0.25;
    size *= 1.0 + near * 0.5;

    vColor = color;
    vAlpha = alpha;
    vGlint = step(2.1, aSize);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPixel;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlint;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = pow(smoothstep(0.5, 0.0, d), 1.6);
    float glint = vGlint * (max(0.0, 1.0 - abs(c.x) * 14.0) * smoothstep(0.5, 0.0, abs(c.y)) + max(0.0, 1.0 - abs(c.y) * 14.0) * smoothstep(0.5, 0.0, abs(c.x))) * 0.6;
    float a = (core + glint) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function geometryFor(tier: RenderTier) {
  const total = tierSettings[tier].particles;
  const innerN = Math.round(total * INNER_SHARE);
  const outer = buildConstellation(total - innerN, SECTORS, 7);
  const inner = buildConstellation(innerN, 4, 11);
  const count = total;
  const positions = new Float32Array(count * 3);
  const sector = new Float32Array(count);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const ring = new Float32Array(count);
  positions.set(outer.positions); positions.set(inner.positions, outer.positions.length);
  sector.set(outer.sector); size.set(outer.size); phase.set(outer.phase);
  for (let i = 0; i < innerN; i++) {
    const j = total - innerN + i;
    // Inner halo particles join their nearest feeling cloud instead of drifting free.
    sector[j] = inner.sector[i] < 0 ? i % 4 : inner.sector[i];
    size[j] = inner.size[i]; phase[j] = inner.phase[i]; ring[j] = 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSector", new THREE.BufferAttribute(sector, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  geometry.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));
  return geometry;
}

export default function ConstellationScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const target = useRef(props);
  useEffect(() => { target.current = props; });
  const { tier, onTierChange } = props;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" }); }
    catch { onTierChange("list"); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tierSettings[tier].maxDpr));
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2.3, 2.3, 2.3, -2.3, -10, 10);
    const geometry = geometryFor(tier);
    const colors = Array.from({ length: SECTORS }, () => new THREE.Color());
    const uniforms = {
      uTime: { value: 0 }, uOuterRot: { value: 0 }, uInnerRot: { value: 0 }, uInner: { value: 0 },
      uIntensity: { value: 1 }, uPixel: { value: 3 }, uSelectedInner: { value: 0 }, uDaylight: { value: 0 },
      uSelect: { value: new Array<number>(SECTORS).fill(0) }, uLean: { value: new Array<number>(SECTORS).fill(0) },
      uColors: { value: colors }, uInnerColor: { value: new THREE.Color() }, uPointer: { value: new THREE.Vector2(9, 9) },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    let daylight = false;
    const syncTheme = () => {
      daylight = document.documentElement.dataset.theme === "light";
      const order = target.current.order;
      for (let i = 0; i < SECTORS; i++) colors[i].set(emotionHues[order[i]]?.[daylight ? "day" : "night"] ?? "#ffffff");
      material.blending = daylight ? THREE.NormalBlending : THREE.AdditiveBlending;
      uniforms.uDaylight.value = daylight ? 1 : 0;
      material.needsUpdate = true;
      // Observable state for tests and debugging; no personal data.
      element.dataset.daylight = String(daylight);
      element.dataset.tier = tier;
    };
    syncTheme();
    const theme = new MutationObserver(syncTheme);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const width = element.clientWidth, height = element.clientHeight;
      renderer.setSize(width, height, false);
      // Fewer particles get slightly larger points so lower tiers still read as dense light.
      uniforms.uPixel.value = Math.max(1.5, height * renderer.getPixelRatio() * 0.0058 * Math.sqrt(9000 / tierSettings[tier].particles) ** 0.5);
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();

    // Pointer: brighten nearby particles and tilt the field slightly (fine pointers only).
    const dial = element.parentElement;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const tilt = { x: 0, y: 0 };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || !dial) return;
      const rect = dial.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width * 2 - 1, ny = (event.clientY - rect.top) / rect.height * 2 - 1;
      uniforms.uPointer.value.set(nx * 2.3, -ny * 2.3);
      tilt.x = ny * 0.07; tilt.y = nx * 0.07;
    };
    const leave = () => { uniforms.uPointer.value.set(9, 9); tilt.x = 0; tilt.y = 0; };
    dial?.addEventListener("pointermove", move);
    dial?.addEventListener("pointerleave", leave);

    let frames = 0, outerRot = 0, innerRot = 0, frame = 0, previous = 0, time = 0;
    let probe = freshProbe, probing = true;
    let lockedOuter = 0;
    const render = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now; time += delta;
      if (probing) {
        const step = stepProbe(probe, now);
        probe = step.probe;
        if (step.fps !== null) {
          probing = false;
          const next = nextTier(tier, step.fps);
          if (next !== tier) { onTierChange(next); return; }
        }
      }
      const t = target.current;
      const ease = 1 - Math.exp(-delta * 7);
      if (!t.inner) lockedOuter = t.rotation;
      outerRot += ((t.inner ? lockedOuter : t.rotation) - outerRot) * ease;
      innerRot += ((t.inner ? t.rotation : 0) - innerRot) * ease;
      uniforms.uTime.value = time;
      uniforms.uOuterRot.value = outerRot;
      uniforms.uInnerRot.value = innerRot;
      uniforms.uInner.value += ((t.inner ? 1 : 0) - uniforms.uInner.value) * (1 - Math.exp(-delta * 4));
      uniforms.uIntensity.value += ((t.intensity === "low" ? 0.6 : t.intensity === "high" ? 1.4 : 1) - uniforms.uIntensity.value) * ease;
      const innerSpan = Math.PI * 2 / Math.max(1, t.innerCount);
      uniforms.uSelectedInner.value = ((Math.round(-t.rotation / innerSpan) % t.innerCount) + t.innerCount) % t.innerCount;
      for (let i = 0; i < SECTORS; i++) {
        uniforms.uSelect.value[i] += ((i === t.selected ? 1 : 0) - uniforms.uSelect.value[i]) * ease;
        uniforms.uLean.value[i] += ((t.lean?.[i] ?? 0) - uniforms.uLean.value[i]) * ease;
      }
      const hue = emotionHues[t.order[t.selected]]?.[daylight ? "day" : "night"];
      if (hue) uniforms.uInnerColor.value.set(hue);
      points.rotation.x += (tilt.x - points.rotation.x) * ease;
      points.rotation.y += (tilt.y - points.rotation.y) * ease;
      renderer.render(scene, camera);
      if (++frames % 30 === 0) element.dataset.draws = String(renderer.info.render.calls);
      frame = requestAnimationFrame(render);
    };
    const visibility = () => {
      cancelAnimationFrame(frame); previous = 0;
      if (probing) probe = freshProbe;
      if (!document.hidden) frame = requestAnimationFrame(render);
    };
    const lost = (event: Event) => { event.preventDefault(); onTierChange("list"); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility); visibility();

    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); theme.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      dial?.removeEventListener("pointermove", move);
      dial?.removeEventListener("pointerleave", leave);
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [tier, onTierChange]);

  return <div className="wheel-canvas" ref={host} aria-hidden="true" />;
}
