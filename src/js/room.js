import * as T from 'three';
import { createWorld } from './world.js';

export async function createRoom({ onSelect, onReady }) {
  const host = document.getElementById('scene'),
    labelsHost = document.getElementById('scene-labels'),
    tooltip = document.getElementById('room-tooltip');
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-8, 8, 6, -6, 0.1, 100);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const baseTarget = new T.Vector3(0, 1.55, 0),
    target = baseTarget.clone();
  let angle = -0.66,
    elevation = 0.55,
    zoom = 1,
    rendering = 'webgl',
    needsRender = true,
    lastRender = 0,
    night = false,
    transition = null;
  let renderer;
  let available = false;
  try {
    const probe = document.createElement('canvas');
    available = !!probe.getContext('webgl2');
  } catch {}
  if (available && !new URLSearchParams(location.search).has('svg')) {
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.outputColorSpace = T.SRGBColorSpace;
    } catch {
      available = false;
    }
  }
  if (!renderer) {
    const { SVGRenderer } = await import('../../vendor/SVGRenderer.js');
    renderer = new SVGRenderer();
    renderer.setQuality('high');
    renderer.setPrecision(2);
    renderer.overdraw = 0.6;
    rendering = 'svg';
  }
  host.append(renderer.domElement);
  document.body.dataset.renderer = rendering;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const ambient = new T.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xfff1dc, 0.7);
  sun.position.set(-5, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.1, far: 30 });
  sun.shadow.bias = -0.0015;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new T.DirectionalLight(0xe9e5ee, 0.18);
  fill.position.set(5, 4, -2);
  scene.add(fill);
  const labels = [];
  function addLabel(parent, { svg, width, height, x = 0, y = 0, z = 0 }) {
    const anchor = new T.Object3D();
    anchor.position.set(x, y, z);
    parent.add(anchor);
    const div = document.createElement('div');
    div.className =
      'scene-label' + (/CLICK TO ENTER|#2b302e|#353b38/.test(svg) ? ' is-screen' : '');
    div.innerHTML = svg;
    div.style.width = '200px';
    div.style.height = '200px';
    labelsHost.append(div);
    labels.push({ anchor, div, width, height });
  }
  const objects = createWorld(scene, addLabel, { svg: rendering === 'svg' });
  const hotspotHost = document.getElementById('scene-hotspots'),
    hotspots = [],
    effects = [];
  scene.updateMatrixWorld(true);
  for (const object of objects.interactive) {
    const bounds = new T.Box3().setFromObject(object);
    const point = bounds.getCenter(new T.Vector3());
    point.y = bounds.max.y + 0.035;
    const anchor = new T.Object3D();
    anchor.position.copy(object.worldToLocal(point));
    object.add(anchor);
    const button = document.createElement('button');
    button.className = 'object-dot';
    button.dataset.object = object.userData.action;
    button.setAttribute('aria-label', object.userData.title);
    button.innerHTML = '<span></span>';
    hotspotHost.append(button);
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(object.userData.action);
    });
    button.addEventListener('pointerenter', (e) => showTooltip(object, e));
    button.addEventListener('pointerleave', hideTooltip);
    button.addEventListener('focus', () => {
      const b = button.getBoundingClientRect();
      showTooltip(object, { clientX: b.right, clientY: b.top });
    });
    button.addEventListener('blur', hideTooltip);
    hotspots.push({ object, anchor, button, offset: object.userData.pinOffset || [5, -3] });
  }
  function updateHotspots() {
    for (const { anchor, button, offset } of hotspots) {
      const p = project(anchor.getWorldPosition(new T.Vector3()));
      button.style.left = p.x + offset[0] + 'px';
      button.style.top = p.y + offset[1] + 'px';
      button.hidden = p.z < -1 || p.z > 1;
    }
  }
  function nudge(id) {
    const object =
      id === 'basketball'
        ? objects.effects.basketball
        : id === 'cube'
          ? objects.effects.rubik
          : null;
    if (!object || reduced) return;
    const existing = effects.findIndex((e) => e.object === object);
    if (existing >= 0) {
      const e = effects[existing];
      object.position.y = e.baseY;
      object.rotation.y = e.baseRotation;
      effects.splice(existing, 1);
    }
    effects.push({
      id,
      object,
      start: performance.now(),
      baseY: object.position.y,
      baseRotation: object.rotation.y,
    });
    needsRender = true;
  }
  const bounds = new T.Box3().setFromObject(objects.world);
  const corners = [];
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) corners.push(new T.Vector3(x, y, z));
  let baseSpan = 8.5;
  function placeCamera() {
    const r = 18;
    camera.position.set(
      target.x + Math.sin(angle) * Math.cos(elevation) * r,
      target.y + Math.sin(elevation) * r,
      target.z + Math.cos(angle) * Math.cos(elevation) * r
    );
    camera.lookAt(target);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    placeCamera();
    const points = corners.map((c) => c.clone().applyMatrix4(camera.matrixWorldInverse));
    const xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    const width = Math.max(...xs) - Math.min(...xs),
      height = Math.max(...ys) - Math.min(...ys);
    baseSpan = Math.max(height, width / (w / h)) * (w < 600 ? 1.12 : 1.06);
    camera.left = (-baseSpan * w) / h / 2;
    camera.right = (baseSpan * w) / h / 2;
    camera.top = baseSpan / 2;
    camera.bottom = -baseSpan / 2;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  const project = (v) => {
    const q = v.clone().project(camera);
    return {
      x: ((q.x + 1) * host.clientWidth) / 2,
      y: ((1 - q.y) * host.clientHeight) / 2,
      z: q.z,
    };
  };
  const q = new T.Quaternion();
  const normal = new T.Vector3();
  const center = new T.Vector3();
  function updateLabels() {
    for (const { anchor, div, width, height } of labels) {
      anchor.getWorldPosition(center);
      anchor.getWorldQuaternion(q);
      normal.set(0, 0, 1).applyQuaternion(q);
      if (normal.dot(camera.position.clone().sub(center)) <= 0) {
        div.hidden = true;
        continue;
      }
      div.hidden = false;
      const a = project(anchor.localToWorld(new T.Vector3(-width / 2, height / 2, 0))),
        b = project(anchor.localToWorld(new T.Vector3(width / 2, height / 2, 0))),
        c = project(anchor.localToWorld(new T.Vector3(-width / 2, -height / 2, 0)));
      div.style.transform = `matrix(${(b.x - a.x) / 200},${(b.y - a.y) / 200},${(c.x - a.x) / 200},${(c.y - a.y) / 200},${a.x},${a.y})`;
      div.style.filter =
        night && !div.classList.contains('is-screen') ? 'brightness(.5) saturate(.8)' : 'none';
    }
  }
  const raycaster = new T.Raycaster();
  function hit(event) {
    const rect = host.getBoundingClientRect();
    raycaster.setFromCamera(
      new T.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1
      ),
      camera
    );
    const intersections = raycaster.intersectObjects(objects.interactive, true);
    for (const intersection of intersections) {
      let o = intersection.object;
      while (o && !o.userData.action) o = o.parent;
      if (o) return o;
    }
    return null;
  }
  function hideTooltip() {
    tooltip.classList.remove('visible');
    host.style.cursor = 'grab';
  }
  function showTooltip(object, event) {
    tooltip.textContent = object.userData.title;
    const small = document.createElement('small');
    small.textContent =
      object.userData.action === 'desktop' ? 'CLICK TO ENTER' : 'CLICK TO EXPLORE';
    tooltip.append(small);
    tooltip.style.left = Math.max(12, Math.min(innerWidth - 235, event.clientX + 17)) + 'px';
    tooltip.style.top = Math.max(65, Math.min(innerHeight - 90, event.clientY + 15)) + 'px';
    tooltip.classList.add('visible');
    host.style.cursor = 'pointer';
  }
  let pointer = null;
  let active = true;
  host.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, angle, elevation, moved: 0 };
    host.setPointerCapture(e.pointerId);
    hideTooltip();
  });
  host.addEventListener('pointermove', (e) => {
    if (!active) return;
    if (pointer) {
      const dx = e.clientX - pointer.x,
        dy = e.clientY - pointer.y;
      pointer.moved = Math.max(pointer.moved, Math.abs(dx) + Math.abs(dy));
      angle = T.MathUtils.clamp(pointer.angle + dx * 0.0017, -1.05, -0.25);
      elevation = T.MathUtils.clamp(pointer.elevation + dy * 0.0013, 0.36, 0.8);
      transition = null;
      needsRender = true;
      host.style.cursor = 'grabbing';
    } else {
      const o = hit(e);
      if (o) showTooltip(o, e);
      else hideTooltip();
    }
  });
  host.addEventListener('pointerup', (e) => {
    if (!pointer) return;
    const moved = pointer.moved;
    pointer = null;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    hideTooltip();
    if (moved < 6) {
      const o = hit(e);
      if (o) {
        onSelect(o.userData.action);
      }
    }
  });
  host.addEventListener('pointercancel', () => {
    pointer = null;
    hideTooltip();
  });
  host.addEventListener('pointerleave', () => {
    if (!pointer) hideTooltip();
  });
  host.addEventListener(
    'wheel',
    (e) => {
      if (!active) return;
      e.preventDefault();
      transition = null;
      zoom = T.MathUtils.clamp(zoom - e.deltaY * 0.0006, 0.8, 1.65);
      needsRender = true;
    },
    { passive: false }
  );
  function tween(to, ms = 650) {
    const from = { target: target.clone(), angle, elevation, zoom };
    transition = { from, to, start: performance.now(), duration: reduced ? 1 : ms };
    needsRender = true;
  }
  function reset() {
    tween({ target: baseTarget.clone(), angle: -0.66, elevation: 0.55, zoom: 1 });
    hideTooltip();
  }
  function focus(id) {
    const object = objects.interactive.find((o) => o.userData.action === id);
    if (!object) return;
    const pos = object.getWorldPosition(new T.Vector3());
    tween(
      id === 'desktop'
        ? { target: pos, angle: -0.35, elevation: 0.12, zoom: 4.4 }
        : { target: baseTarget.clone().lerp(pos, 0.2), angle: -0.66, elevation: 0.55, zoom: 1.08 },
      650
    );
    hideTooltip();
  }
  function setNight(value) {
    night = value;
    ambient.intensity = night ? 0.24 : 0.55;
    if (rendering === 'svg')
      ambient.color.setRGB(night ? 0.1 : 0.4, night ? 0.1 : 0.4, night ? 0.14 : 0.4);
    sun.intensity = night ? 0.28 : 0.7;
    fill.intensity = night ? 0.12 : 0.18;
    objects.glow.intensity = night ? 3.0 : 0;
    const color = night ? 0x292a30 : 0xf7f2e9;
    renderer.setClearColor(color, rendering === 'webgl' ? 0 : 1);
    needsRender = true;
  }
  let frame;
  function animate(time) {
    frame = requestAnimationFrame(animate);
    if (!active || document.hidden) return;
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i],
        t = Math.min(1, (time - e.start) / 850);
      if (e.id === 'basketball')
        e.object.position.y = e.baseY + Math.abs(Math.sin(t * Math.PI * 2)) * 0.4 * (1 - t);
      else e.object.rotation.y = e.baseRotation + Math.PI * 0.5 * (1 - Math.pow(1 - t, 3));
      if (t >= 1) {
        e.object.position.y = e.baseY;
        if (e.id === 'cube') e.object.rotation.y = e.baseRotation + Math.PI / 2;
        effects.splice(i, 1);
      }
      needsRender = true;
    }
    if (transition) {
      const t = Math.min(1, (time - transition.start) / transition.duration),
        k = t * t * (3 - 2 * t);
      target.lerpVectors(transition.from.target, transition.to.target, k);
      angle = T.MathUtils.lerp(transition.from.angle, transition.to.angle, k);
      elevation = T.MathUtils.lerp(transition.from.elevation, transition.to.elevation, k);
      zoom = T.MathUtils.lerp(transition.from.zoom, transition.to.zoom, k);
      needsRender = true;
      if (t === 1) transition = null;
    }
    if (!reduced && rendering === 'webgl') {
      for (const o of objects.animated)
        o.mesh.position.y = o.base + Math.sin(time * 0.001 + o.phase) * 0.035;
      needsRender = true;
    }
    if (!needsRender || time - lastRender < (rendering === 'svg' ? 55 : 20)) return;
    lastRender = time;
    placeCamera();
    scene.updateMatrixWorld(true);
    renderer.render(scene, camera);
    updateLabels();
    updateHotspots();
    needsRender = false;
  }
  new ResizeObserver(resize).observe(host);
  resize();
  setNight(document.documentElement.dataset.theme === 'night');
  animate(0);
  document.getElementById('scene-loading').classList.add('finished');
  document.getElementById('scene-loading').setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    document.getElementById('scene-loading').hidden = true;
  }, 650);
  host.dataset.ready = 'true';
  onReady?.(rendering);
  return {
    reset,
    focus,
    nudge,
    setNight,
    setActive(value) {
      active = value;
      needsRender = true;
      hideTooltip();
    },
    dispose() {
      cancelAnimationFrame(frame);
      renderer.dispose?.();
    },
  };
}
