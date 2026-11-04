import * as T from 'three';
import { ART } from './art.js';

export function createWorld(scene, addLabel, { svg = false } = {}) {
  const world = new T.Group();
  scene.add(world);
  const interactive = [];
  const animated = [];
  const colors = {
    cream: 0xf0e4d0,
    wall: 0xf0e4d7,
    floor: 0xded7e3,
    dark: 0x34343b,
    dark2: 0x48474e,
    leaf: 0x4d792f,
    green: 0x34703b,
    orange: 0xd99542,
    red: 0xb64e39,
    black: 0x20242a,
  };
  const materialCache = new Map();
  function material(color) {
    if (!materialCache.has(color))
      materialCache.set(color, new T.MeshLambertMaterial({ color, flatShading: true }));
    return materialCache.get(color);
  }
  function subdivide(geometry) {
    const source = geometry.index ? geometry.toNonIndexed() : geometry;
    const a = source.attributes.position;
    const out = [];
    function triangle(a, b, c, depth = 0) {
      const ab = a.distanceToSquared(b),
        bc = b.distanceToSquared(c),
        ca = c.distanceToSquared(a);
      if (Math.max(ab, bc, ca) < 0.24 || depth > 7) {
        out.push(...a.toArray(), ...b.toArray(), ...c.toArray());
        return;
      }
      if (ab >= bc && ab >= ca) {
        const m = a.clone().add(b).multiplyScalar(0.5);
        triangle(a, m, c, depth + 1);
        triangle(m, b, c, depth + 1);
      } else if (bc >= ca) {
        const m = b.clone().add(c).multiplyScalar(0.5);
        triangle(a, b, m, depth + 1);
        triangle(a, m, c, depth + 1);
      } else {
        const m = c.clone().add(a).multiplyScalar(0.5);
        triangle(a, b, m, depth + 1);
        triangle(m, b, c, depth + 1);
      }
    }
    for (let i = 0; i < a.count; i += 3)
      triangle(
        new T.Vector3().fromBufferAttribute(a, i),
        new T.Vector3().fromBufferAttribute(a, i + 1),
        new T.Vector3().fromBufferAttribute(a, i + 2)
      );
    const result = new T.BufferGeometry();
    result.setAttribute('position', new T.Float32BufferAttribute(out, 3));
    result.computeVertexNormals();
    return result;
  }
  function mesh(g, c, p, x = 0, y = 0, z = 0) {
    if (svg) g = subdivide(g);
    const m = new T.Mesh(g, material(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    (p || world).add(m);
    return m;
  }
  function box(w, h, d, c, p, x = 0, y = 0, z = 0) {
    return mesh(new T.BoxGeometry(w, h, d), c, p, x, y, z);
  }
  function roundBox(w, h, d, r, c, p, x = 0, y = 0, z = 0) {
    r = Math.min(r, w / 3, h / 3);
    const s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 3 });
    g.translate(0, 0, -d / 2);
    return mesh(g, c, p, x, y, z);
  }
  function sphere(r, c, p, x, y, z, segments = 10) {
    return mesh(new T.SphereGeometry(r, segments, 7), c, p, x, y, z);
  }
  function cylinder(rt, rb, h, c, p, x, y, z, segments = 16) {
    return mesh(new T.CylinderGeometry(rt, rb, h, segments), c, p, x, y, z);
  }
  function line(a, b, r, c, p) {
    const av = new T.Vector3(...a),
      bv = new T.Vector3(...b);
    const v = bv.clone().sub(av);
    const m = cylinder(
      r,
      r,
      v.length(),
      c,
      p,
      ...av.clone().add(bv).multiplyScalar(0.5).toArray(),
      6
    );
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    return m;
  }
  function group(x, y, z, parent = world) {
    const g = new T.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function action(g, id, title) {
    g.userData.action = id;
    g.userData.title = title;
    interactive.push(g);
    return g;
  }
  function poster(
    parent,
    x,
    y,
    z,
    w,
    h,
    art,
    { rotation = 0, frame = colors.dark, border = 0.035 } = {}
  ) {
    const g = group(x, y, z, parent);
    g.rotation.y = rotation;
    roundBox(w + border * 2, h + border * 2, 0.045, 0.015, frame, g);
    addLabel(g, { svg: art, width: w * 0.96, height: h * 0.96, z: 0.034 });
    return g;
  }
  function contactShadow(x, z, rx, rz, opacity = 0.08, y = 0.026) {
    const m = new T.Mesh(
      new T.CircleGeometry(1, 32),
      new T.MeshBasicMaterial({ color: 0x635e68, transparent: true, opacity, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.scale.set(rx, rz, 1);
    m.position.set(x, y, z);
    world.add(m);
    return m;
  }
  // One continuous, gently notched island.
  const outline = new T.Shape();
  outline.moveTo(-4.5, -3.4);
  outline.lineTo(4.35, -3.4);
  outline.quadraticCurveTo(4.6, -3.4, 4.6, -3.15);
  outline.lineTo(4.6, 3.1);
  outline.quadraticCurveTo(4.6, 3.45, 4.25, 3.45);
  outline.lineTo(0.6, 3.45);
  outline.quadraticCurveTo(0.3, 3.45, 0.15, 3.2);
  outline.lineTo(-0.2, 2.85);
  outline.quadraticCurveTo(-0.4, 2.65, -0.65, 2.75);
  outline.lineTo(-2.4, 3.45);
  outline.lineTo(-4.35, 3.45);
  outline.quadraticCurveTo(-4.6, 3.45, -4.6, 3.2);
  outline.lineTo(-4.6, -3.15);
  outline.quadraticCurveTo(-4.6, -3.4, -4.5, -3.4);
  const base = mesh(
    new T.ExtrudeGeometry(outline, { depth: 0.23, bevelEnabled: false, curveSegments: 6 }),
    colors.cream
  );
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.0;
  const floorGeometry = new T.ShapeGeometry(outline, 6);
  floorGeometry.rotateX(Math.PI / 2);
  for (let i = 0; i < floorGeometry.index.count; i += 3) {
    const a = floorGeometry.index.getX(i);
    floorGeometry.index.setX(i, floorGeometry.index.getX(i + 1));
    floorGeometry.index.setX(i + 1, a);
  }
  floorGeometry.computeVertexNormals();
  const floor = mesh(floorGeometry, colors.floor);
  floor.position.y = 0.012;
  box(8.9, 3.65, 0.13, colors.wall, world, 0, 1.825, -3.34);
  box(0.13, 3.65, 6.2, colors.wall, world, 4.46, 1.825, -0.25);
  box(4.7, 0.67, 2.45, colors.cream, world, -0.35, 0.335, -2.0);
  box(4.7, 0.012, 2.45, 0xe3dce7, world, -0.35, 0.677, -2.0);
  box(1.5, 0.18, 0.37, colors.cream, world, -0.17, 0.09, -0.26);
  box(1.5, 0.36, 0.37, colors.cream, world, -0.17, 0.18, -0.63);
  box(1.5, 0.53, 0.37, colors.cream, world, -0.17, 0.265, -1.0);
  // Floating portal, matching the sofa and desk.
  const arch = group(-4.12, 0, -1.12);
  arch.rotation.y = 0.05;
  const archShape = new T.Shape();
  archShape.moveTo(-0.75, 0);
  archShape.lineTo(-0.75, 2.9);
  archShape.absarc(0, 2.9, 0.75, Math.PI, 0, true);
  archShape.lineTo(0.75, 0);
  archShape.lineTo(0.48, 0);
  archShape.lineTo(0.48, 2.9);
  archShape.absarc(0, 2.9, 0.48, 0, Math.PI, false);
  archShape.lineTo(-0.48, 0);
  archShape.closePath();
  mesh(
    new T.ExtrudeGeometry(archShape, { depth: 0.27, bevelEnabled: false, curveSegments: 10 }),
    colors.dark,
    arch
  );
  action(arch, 'guide', 'A little guide');
  const stone1 = roundBox(0.55, 0.16, 0.4, 0.1, 0xd8cce0, world, -4.2, 0.25, 0.01);
  const stone2 = roundBox(0.48, 0.16, 0.36, 0.1, 0xd8cce0, world, -4.27, 0.48, -0.52);
  animated.push(
    { type: 'float', mesh: stone1, base: 0.25, phase: 0 },
    { type: 'float', mesh: stone2, base: 0.48, phase: 2 }
  );
  // The main workbench.
  const desk = group(-0.55, 0.68, -2.25);
  box(2.75, 0.17, 1.02, colors.dark, desk, 0, 1.02, 0);
  box(0.2, 1, 0.83, colors.dark, desk, -1.11, 0.5, 0);
  box(0.2, 1, 0.83, colors.dark, desk, 1.11, 0.5, 0);
  contactShadow(-0.55, -2.25, 1.55, 0.65, 0.09, 0.683);
  const computer = group(-0.1, 1.11, 0, desk);
  roundBox(0.83, 0.68, 0.52, 0.075, colors.cream, computer, 0, 0.45, 0);
  box(0.74, 0.12, 0.62, colors.cream, computer, 0, 0.06, 0.04);
  box(0.47, 0.09, 0.4, 0xc4b49c, computer, 0, 0.14, 0);
  roundBox(0.66, 0.48, 0.013, 0.04, colors.dark, computer, 0, 0.46, 0.27);
  addLabel(computer, { svg: ART.screen, width: 0.65, height: 0.475, y: 0.46, z: 0.28 });
  box(0.13, 0.045, 0.014, colors.orange, computer, -0.19, 0.16, 0.36);
  cylinder(0.015, 0.015, 0.008, 0x90b37e, computer, 0.26, 0.16, 0.355, 8).rotation.x = Math.PI / 2;
  action(computer, 'desktop', 'Enter YUNS OS');
  // Keyboard and small details.
  const keyboard = group(-0.14, 1.132, 0.38, desk);
  box(0.79, 0.035, 0.25, 0xd8c9ae, keyboard);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 11; c++)
      box(0.047, 0.012, 0.045, colors.cream, keyboard, -0.34 + c * 0.064, 0.025, -0.08 + r * 0.068);
  const bottle = group(-1.05, 1.115, 0.03, desk);
  cylinder(0.09, 0.075, 0.34, colors.green, bottle, 0, 0.18, 0, 12);
  cylinder(0.093, 0.093, 0.055, 0xee9428, bottle, 0, 0.38, 0, 14);
  cylinder(0.028, 0.028, 0.045, 0xee9428, bottle, 0, 0.43, 0, 8);
  addLabel(bottle, { svg: ART.g, width: 0.1, height: 0.15, y: 0.22, z: 0.092 });
  // Chair and wheels, drawn from simple solids.
  const chair = group(-0.55, 0.68, -1.12);
  cylinder(0.035, 0.045, 0.44, 0xa99f8e, chair, 0, 0.25, 0, 8);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    line([0, 0.07, 0], [Math.cos(a) * 0.32, 0.07, Math.sin(a) * 0.32], 0.018, 0xa99f8e, chair);
    sphere(0.035, colors.dark2, chair, Math.cos(a) * 0.32, 0.045, Math.sin(a) * 0.32, 6);
  }
  roundBox(0.64, 0.12, 0.54, 0.07, colors.cream, chair, 0, 0.52, 0);
  const chairBack = roundBox(0.62, 0.63, 0.13, 0.07, colors.cream, chair, 0, 0.85, 0.23);
  chairBack.rotation.x = 0.14;
  // Floor lamp with a small warm glow at night.
  const lamp = group(-2.55, 0.68, -1.52);
  box(0.24, 0.24, 0.24, 0xd9a26e, lamp, 0, 0.12, 0);
  roundBox(0.1, 1.04, 0.1, 0.03, 0xfff1cc, lamp, 0, 0.75, 0);
  const glow = new T.PointLight(0xffd49d, 0, 3, 2);
  glow.position.set(-2.55, 1.85, -1.52);
  world.add(glow);
  // Soft, low-poly couch, facing the open side of the room.
  const sofa = group(-2.7, 0, 1.42);
  roundBox(2.64, 0.44, 1.08, 0.17, colors.dark, sofa, 0, 0.32, 0);
  for (let i = 0; i < 2; i++) {
    roundBox(1.08, 0.23, 0.81, 0.11, 0x414147, sofa, -0.55 + i * 1.1, 0.62, 0.13);
    const back = roundBox(1.15, 0.81, 0.26, 0.13, colors.dark2, sofa, -0.56 + i * 1.12, 0.91, -0.4);
    back.rotation.x = -0.08;
  }
  roundBox(0.27, 0.6, 1.11, 0.12, colors.dark2, sofa, -1.25, 0.65, 0.03);
  roundBox(0.27, 0.6, 1.11, 0.12, colors.dark2, sofa, 1.25, 0.65, 0.03);
  contactShadow(-2.7, 1.42, 1.5, 0.74, 0.12);
  // Coffee table, laptop, controller and Rubik’s cube.
  const table = group(-1.52, 0, 2.68);
  cylinder(0.78, 0.78, 0.12, colors.cream, table, 0, 0.56, 0, 36);
  for (const [x, z] of [
    [-0.45, -0.32],
    [0.43, -0.22],
    [0, 0.48],
  ])
    box(0.11, 0.5, 0.11, colors.cream, table, x, 0.25, z);
  contactShadow(-1.52, 2.68, 0.85, 0.6, 0.08);
  const laptop = group(-0.15, 0.64, -0.1, table);
  box(0.56, 0.035, 0.38, colors.dark2, laptop, 0, 0, 0);
  const lid = group(0, 0.19, -0.16, laptop);
  lid.rotation.x = -0.15;
  box(0.56, 0.36, 0.026, colors.dark, lid);
  addLabel(lid, { svg: ART.laptop, width: 0.5, height: 0.32, z: 0.015 });
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 7; c++)
      box(0.037, 0.006, 0.03, 0x77757a, laptop, -0.21 + c * 0.067, 0.021, -0.07 + r * 0.045);
  action(laptop, 'arcade', 'Games');
  laptop.userData.pinOffset = [-7, -5];
  const controller = group(0.18, 0.655, 0.33, table);
  roundBox(0.35, 0.06, 0.18, 0.045, colors.dark, controller);
  sphere(0.09, colors.dark, controller, -0.14, 0, 0.05, 8).scale.y = 0.5;
  sphere(0.09, colors.dark, controller, 0.14, 0, 0.05, 8).scale.y = 0.5;
  box(0.07, 0.016, 0.024, 0xa8a5a2, controller, -0.09, 0.043, -0.015);
  box(0.024, 0.016, 0.07, 0xa8a5a2, controller, -0.09, 0.043, -0.015);
  for (let i = 0; i < 4; i++)
    sphere(
      0.014,
      [0xd99855, 0x86a173, 0xa15d4f, 0xd0b073][i],
      controller,
      0.095 + Math.cos((i * Math.PI) / 2) * 0.03,
      0.043,
      Math.sin((i * Math.PI) / 2) * 0.03,
      6
    );
  const rubik = group(0.44, 0.74, -0.07, table);
  rubik.rotation.y = 0.2;
  box(0.22, 0.22, 0.22, colors.black, rubik);
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++) {
      box(0.062, 0.062, 0.009, 0xd8b33a, rubik, -0.072 + a * 0.072, -0.072 + b * 0.072, 0.115);
      box(0.009, 0.062, 0.062, 0x528550, rubik, -0.115, -0.072 + a * 0.072, -0.072 + b * 0.072);
      box(0.062, 0.009, 0.062, 0xb34a35, rubik, -0.072 + a * 0.072, 0.115, -0.072 + b * 0.072);
    }
  action(rubik, 'cube', 'Rubik’s Cube · solving problems');
  rubik.userData.pinOffset = [10, -4];
  // Library cabinet, with a clear home for each personal object.
  const shelf = group(2.84, 0, 0.57);
  box(2.05, 0.11, 0.75, colors.cream, shelf, 0, 0.12, 0);
  box(2.05, 0.11, 0.75, colors.cream, shelf, 0, 0.76, 0);
  box(2.05, 0.13, 0.75, colors.cream, shelf, 0, 1.43, 0);
  box(0.11, 1.39, 0.75, colors.cream, shelf, -0.97, 0.75, 0);
  box(0.11, 1.39, 0.75, colors.cream, shelf, 0.97, 0.75, 0);
  box(1.92, 1.35, 0.06, 0xe3d6c2, shelf, 0, 0.73, -0.35);
  contactShadow(2.84, 0.57, 1.1, 0.55, 0.09);
  const books = group(-0.46, 0.82, 0, shelf);
  for (const [w, h, c, x] of [
    [0.15, 0.45, 0xf5ecd6, -0.3],
    [0.15, 0.49, colors.dark, -0.12],
    [0.17, 0.47, 0x6e8a5c, 0.07],
    [0.17, 0.43, 0xba7e5d, 0.27],
  ])
    box(w, h, 0.35, c, books, x, h / 2, 0);
  action(books, 'stack', 'My toolbox');
  const folio = group(-0.46, 0.23, 0.04, shelf);
  roundBox(0.72, 0.075, 0.42, 0.025, colors.dark, folio);
  box(0.06, 0.079, 0.08, 0xb38969, folio, 0.2, 0, 0.18);
  action(folio, 'resume', 'My résumé');
  box(0.53, 0.11, 0.4, 0x6d8154, shelf, 0.47, 0.24, 0.02);
  box(0.53, 0.1, 0.4, 0xe7d5b7, shelf, 0.47, 0.345, 0.02);
  box(0.45, 0.045, 0.35, 0xf5ecd7, shelf, 0.44, 0.42, 0.02);
  const phone = group(0.62, 0.94, 0.13, shelf);
  phone.rotation.x = -0.15;
  roundBox(0.23, 0.4, 0.035, 0.025, colors.dark, phone);
  addLabel(phone, { svg: ART.phone, width: 0.215, height: 0.383, z: 0.021 });
  box(0.29, 0.05, 0.2, colors.cream, shelf, 0.62, 0.805, 0.13);
  action(phone, 'contact', 'Say hello');
  const dish = cylinder(0.145, 0.11, 0.05, colors.cream, shelf, 0.63, 1.52, -0.02, 16);
  const tennis = sphere(0.11, 0xc7cf39, shelf, 0.63, 1.625, -0.02, 14);
  const seam = new T.Mesh(new T.TorusGeometry(0.111, 0.004, 4, 28), material(0xf8f3db));
  seam.rotation.x = 0.7;
  tennis.add(seam);
  // Home lab and its LEDs.
  const server = group(1.25, 0.68, -1.6);
  roundBox(0.48, 0.68, 0.54, 0.04, 0x55525b, server, 0, 0.34, 0);
  for (let i = 0; i < 3; i++) sphere(0.019, 0xa1d598, server, -0.13 + i * 0.13, 0.52, 0.277, 6);
  for (let i = 0; i < 3; i++) box(0.29, 0.012, 0.008, 0x44434b, server, 0, 0.17 + i * 0.055, 0.277);
  action(server, 'security', 'LogSentry · security lab');
  // Basketball with smoother panels and curved, recessed-looking seams.
  const basketball = group(3.04, 0.34, 2.12);
  const ball = mesh(new T.SphereGeometry(0.31, 32, 20), 0xd48639, basketball);
  ball.material = new T.MeshLambertMaterial({ color: 0xd48639, flatShading: false });
  function ballSeam(points) {
    const curve = new T.CatmullRomCurve3(points, true);
    const seam = mesh(new T.TubeGeometry(curve, 72, 0.0045, 4, true), 0x4b3025, basketball);
    return seam;
  }
  ballSeam(
    Array.from({ length: 72 }, (_, i) => {
      const t = (i / 72) * Math.PI * 2;
      return new T.Vector3(0.311 * Math.cos(t), 0, 0.311 * Math.sin(t));
    })
  );
  ballSeam(
    Array.from({ length: 72 }, (_, i) => {
      const t = (i / 72) * Math.PI * 2;
      return new T.Vector3(0, 0.311 * Math.cos(t), 0.311 * Math.sin(t));
    })
  );
  for (const direction of [-1, 1])
    ballSeam(
      Array.from({ length: 72 }, (_, i) => {
        const t = (i / 72) * Math.PI * 2;
        const longitude = direction * (0.65 + 0.32 * Math.sin(t * 2));
        return new T.Vector3(
          0.311 * Math.cos(t) * Math.cos(longitude),
          0.311 * Math.sin(t),
          0.311 * Math.cos(t) * Math.sin(longitude)
        );
      })
    );
  const stand = mesh(
    new T.TorusGeometry(0.24, 0.025, 6, 32),
    colors.dark,
    world,
    3.04,
    0.045,
    2.12
  );
  stand.rotation.x = Math.PI / 2;
  contactShadow(3.04, 2.12, 0.4, 0.3, 0.12);
  action(basketball, 'basketball', 'Basketball · playing as a team');
  // A five-leaf sculptural green plant.
  const plant = group(3.95, 0, 2.32);
  cylinder(0.26, 0.19, 0.44, colors.cream, plant, 0, 0.25, 0, 7);
  cylinder(0.22, 0.22, 0.015, 0x8e805e, plant, 0, 0.48, 0, 10);
  line([0, 0.45, 0], [0, 1.68, 0], 0.016, 0x657548, plant);
  function leaf(x, y, z, sign) {
    line([0, 0.65 + y * 0.4, 0], [x, y, z], 0.011, 0x657548, plant);
    const g = new T.SphereGeometry(0.3, 6, 4);
    g.scale(0.52, 1, 0.12);
    const m = mesh(g, sign ? 0x5c8437 : 0x6b9140, plant, x, y, z);
    m.rotation.z = sign ? -0.7 : 0.7;
    m.rotation.y = z * 1.4;
  }
  leaf(-0.24, 1.2, 0.02, 0);
  leaf(0.25, 1.48, 0.0, 1);
  leaf(-0.22, 1.76, -0.01, 0);
  leaf(0.29, 1.1, 0.14, 1);
  leaf(0.16, 1.92, -0.06, 1);
  // Graphic posters from repo-native vector artwork.
  const animePoster = poster(world, -3.05, 2.64, -3.25, 0.65, 1.0, ART.luffy);
  action(animePoster, 'anime', 'Anime · a few personal interests');
  const cards = group(0, 0, 0);
  poster(cards, -2.14, 2.99, -3.25, 0.42, 0.62, ART.belgium, { frame: colors.cream, border: 0.01 });
  poster(cards, -1.54, 3.13, -3.25, 0.42, 0.62, ART.montreal, {
    frame: colors.cream,
    border: 0.01,
  });
  action(cards, 'journey', 'My journey · Belgium to Montréal');
  const yPanel = poster(world, 4.36, 2.83, -2.14, 1.54, 1.12, ART.y, {
    rotation: -Math.PI / 2,
    border: 0.03,
  });
  action(yPanel, 'about', 'The person behind YUNS');
  const aliPoster = poster(world, 4.36, 2.63, -0.52, 0.68, 1.02, ART.ali, {
    rotation: -Math.PI / 2,
    border: 0.025,
  });
  action(aliPoster, 'boxing', 'Muhammad Ali · determination');
  if (svg) {
    const paint = (g, order) =>
      g.traverse((o) => {
        if (o.isMesh) o.renderOrder = order;
      });
    // Explicit layers prevent near-coplanar painter artifacts in the SVG fallback.
    base.renderOrder = -1000;
    floor.renderOrder = -980;
    for (const child of world.children) {
      if (child.isMesh && child !== base && child !== floor) {
        const y = child.position.y;
        if (y > 1.8 && child.geometry.type === 'BufferGeometry') child.renderOrder = -990;
        else if (y < 0.7) child.renderOrder = Math.abs(y - 0.677) < 0.001 ? -969 : -970;
      }
    }
    for (const child of world.children) {
      if (child.isGroup) {
        const p = child.position;
        paint(child, -500 + Math.round(p.z * 10 - p.x * 6));
      }
    }
    paint(arch, -420);
    paint(desk, -550);
    paint(computer, -535);
    computer.traverse((o) => {
      if (o.isMesh && o.material.color?.getHex() === colors.dark) o.renderOrder = -534;
    });
    paint(keyboard, -534);
    paint(bottle, -533);
    paint(chair, -520);
    paint(lamp, -560);
    paint(sofa, -300);
    paint(table, -280);
    paint(shelf, -480);
    paint(books, -475);
    paint(folio, -475);
    paint(phone, -470);
    paint(server, -510);
    paint(basketball, -320);
    paint(plant, -310);
    // The raised floor and walls remain beneath the furniture.
  }
  scene.updateMatrixWorld(true);
  return {
    world,
    interactive,
    animated,
    glow,
    effects: { basketball, rubik },
    materials: materialCache,
  };
}
