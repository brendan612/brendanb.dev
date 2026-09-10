import * as THREE from "three";

export type SignId = "about" | "projects" | "contact";

// Keep a visitor on the bank and inside the small garden.
export function canWalk(x: number, z: number) {
  return (
    x * x + z * z < 17 * 17 &&
    (x * x) / (6.25 * 6.25) + (z * z) / (4.7 * 4.7) > 1
  );
}

export function createGarden(
  canvas: HTMLCanvasElement,
  open: (id: SignId) => void,
  panelOpen: () => boolean,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#263e47");
  scene.fog = new THREE.FogExp2("#263e47", 0.027);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 90);
  camera.rotation.order = "YXZ";
  const start = new THREE.Vector3(9, 4.2, 11);
  let yaw = 0,
    pitch = 0;
  const reset = () => {
    camera.position.copy(start);
    camera.lookAt(0, 0.25, 0);
    yaw = camera.rotation.y;
    pitch = camera.rotation.x;
    keys.clear();
  };
  const keys = new Set<string>();
  const touch = new Set<string>();
  reset();
  scene.add(new THREE.HemisphereLight("#d4e8df", "#243728", 2.4));
  const sun = new THREE.DirectionalLight("#ffdab2", 3.1);
  sun.position.set(-8, 13, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const material = (color: string, roughness = 1) =>
    new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
  const moss = material("#394f38"),
    grassMat = material("#4d6944"),
    rockMats = ["#61756b", "#798678", "#4f655f"].map((c) => material(c));
  const timber = material("#654831"),
    darkWood = material("#392e25");
  const mesh = (
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D = scene,
  ) => {
    const m = new THREE.Mesh(geometry, mat);
    parent.add(m);
    return m;
  };
  const disc = (radius: number, y: number, mat: THREE.Material) => {
    const m = mesh(new THREE.CircleGeometry(radius, 80), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  };
  disc(24, -0.31, moss);
  const path = mesh(
    new THREE.RingGeometry(7.1, 9.25, 100),
    material("#8b8970"),
  );
  path.rotation.x = -Math.PI / 2;
  path.scale.y = 0.79;
  path.position.y = -0.285;
  path.receiveShadow = true;
  const bed = disc(5.65, -0.35, material("#45695e"));
  bed.scale.y = 0.72;
  // A low-cost water shader with moving highlights, not an expensive reflection pass.
  const waterMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      deep: { value: new THREE.Color("#1b5555") },
      shallow: { value: new THREE.Color("#5b9b83") },
    },
    vertexShader: `varying vec2 vUv; uniform float time; void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*1.7+time*.5)*cos(p.y*1.3+time*.4)*.023;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float time;uniform vec3 deep;uniform vec3 shallow;void main(){vec2 p=vUv*18.;float waves=sin(p.x+sin(p.y*.8+time*.22)*1.7+time*.32)*cos(p.y*1.2+time*.2);float glint=pow(max(0.,sin(p.x*1.4-p.y*.6+time*.35)),28.)*.13;float d=length(vUv-.5)*2.;vec3 c=mix(deep,shallow,smoothstep(.35,1.,d));c+=waves*.025+glint;gl_FragColor=vec4(c,.65);}`,
  });
  const water = disc(5.6, 0.02, waterMaterial);
  water.scale.y = 0.72;
  water.renderOrder = 2;
  let seed = 392;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const stoneGeo = new THREE.IcosahedronGeometry(1, 1);
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2,
      r = 1 + rand() * 0.065;
    const rock = mesh(stoneGeo, rockMats[i % 3]);
    rock.position.set(
      Math.cos(a) * 5.87 * r,
      -0.04 + rand() * 0.1,
      Math.sin(a) * 4.28 * r,
    );
    rock.scale.set(
      0.28 + rand() * 0.36,
      0.18 + rand() * 0.29,
      0.3 + rand() * 0.35,
    );
    rock.rotation.set(rand(), rand() * 6, rand());
    rock.castShadow = true;
    rock.receiveShadow = true;
  }
  // Worn stepping stones break up the ring path.
  for (let i = 0; i < 55; i++) {
    const a = (i / 55) * Math.PI * 2;
    const m = mesh(
      new THREE.CylinderGeometry(0.35 + rand() * 0.2, 0.4, 0.07, 6),
      rockMats[i % 3],
    );
    m.position.set(Math.cos(a) * 8.2, -0.21, Math.sin(a) * 6.4);
    m.scale.z = 0.7;
    m.rotation.y = rand() * 6;
    m.receiveShadow = true;
  }
  // Instanced grass keeps the scene inexpensive on a phone.
  const bladeGeo = new THREE.ConeGeometry(0.065, 0.6, 3);
  const grass = new THREE.InstancedMesh(bladeGeo, grassMat, 600);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 600; i++) {
    const a = rand() * Math.PI * 2,
      r = 10 + rand() * 9;
    dummy.position.set(Math.cos(a) * r, -0.06, Math.sin(a) * r * 0.82);
    dummy.scale.setScalar(0.55 + rand() * 1.3);
    dummy.rotation.set((rand() - 0.5) * 0.4, rand() * 6, (rand() - 0.5) * 0.4);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
    grass.setColorAt(
      i,
      new THREE.Color().setHSL(0.24 + rand() * 0.07, 0.2, 0.23 + rand() * 0.12),
    );
  }
  scene.add(grass);
  // Trees frame the garden; varied round canopies keep the silhouette gentle.
  const trunkGeo = new THREE.CylinderGeometry(0.17, 0.28, 2.8, 7),
    canopyGeo = new THREE.IcosahedronGeometry(1, 1);
  for (let i = 0; i < 17; i++) {
    const a = (i / 17) * Math.PI * 2,
      r = 14 + rand() * 5;
    const tree = new THREE.Group();
    tree.position.set(Math.cos(a) * r, -0.3, Math.sin(a) * r);
    scene.add(tree);
    const trunk = mesh(trunkGeo, timber, tree);
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    for (let j = 0; j < 3; j++) {
      const leaf = mesh(
        canopyGeo,
        material(["#365645", "#496448", "#58714c"][j]),
        tree,
      );
      leaf.position.set(
        (rand() - 0.5) * 1.5,
        3 + j * 0.48,
        (rand() - 0.5) * 1.3,
      );
      leaf.scale.set(1.5 + rand(), 1.15 + rand() * 0.6, 1.5 + rand());
      leaf.castShadow = true;
    }
  }
  // Surface lilies, clustered near the bank.
  const lilyMat = material("#5c8450");
  lilyMat.side = THREE.DoubleSide;
  for (let i = 0; i < 17; i++) {
    const a = rand() * Math.PI * 2,
      r = 2.9 + rand() * 1.5;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, 0.25 + rand() * 0.2, 0.14, Math.PI * 2 - 0.14, false);
    shape.lineTo(0, 0);
    const pad = mesh(new THREE.ShapeGeometry(shape), lilyMat);
    pad.rotation.x = -Math.PI / 2;
    pad.rotation.z = rand() * 6;
    pad.position.set(Math.cos(a) * r, 0.09, Math.sin(a) * r * 0.7);
    pad.renderOrder = 3;
    if (i % 5 === 0) {
      const flower = mesh(
        new THREE.IcosahedronGeometry(0.1, 0),
        material("#e4c0ab"),
      );
      flower.position.copy(pad.position).y += 0.08;
      flower.scale.y = 0.65;
      flower.renderOrder = 3;
    }
  }
  // Small reeds at the banks.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    for (let j = 0; j < 6; j++) {
      const reed = mesh(
        new THREE.CylinderGeometry(0.012, 0.023, 0.55 + rand() * 0.65, 4),
        material("#71885c"),
      );
      reed.position.set(
        Math.cos(a) * 6.5 + (rand() - 0.5) * 0.7,
        0.23,
        Math.sin(a) * 4.65 + (rand() - 0.5) * 0.6,
      );
      reed.rotation.z = (rand() - 0.5) * 0.3;
    }
  }
  // Lanterns cast warm pools of light on the path.
  const lanternGlow = new THREE.MeshBasicMaterial({ color: "#ffcf89" });
  for (const [x, z] of [
    [-6.7, -3.8],
    [5.6, 4.5],
    [-4, 5.7],
    [4, -5.5],
  ]) {
    const pole = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 6), darkWood);
    pole.position.set(x, 0.2, z);
    const lamp = mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), lanternGlow);
    lamp.position.set(x, 0.8, z);
    const roof = mesh(new THREE.ConeGeometry(0.35, 0.18, 4), darkWood);
    roof.position.set(x, 1.07, z);
    roof.rotation.y = Math.PI / 4;
    const light = new THREE.PointLight("#f6c786", 5, 4, 2);
    light.position.set(x, 0.9, z);
    scene.add(light);
  }
  const signTargets: THREE.Object3D[] = [];
  function sign(id: SignId, label: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = Math.atan2(start.x - x, start.z - z);
    scene.add(group);
    for (const px of [-0.86, 0.86]) {
      const post = mesh(new THREE.BoxGeometry(0.12, 2, 0.13), timber, group);
      post.position.set(px, 0.7, 0);
      post.castShadow = true;
    }
    const board = mesh(new THREE.BoxGeometry(2.6, 1.05, 0.18), timber, group);
    board.position.y = 1.95;
    board.castShadow = true;
    const image = document.createElement("canvas");
    image.width = 768;
    image.height = 300;
    const c = image.getContext("2d")!;
    c.fillStyle = "#684b33";
    c.fillRect(0, 0, 768, 300);
    for (let i = 0; i < 26; i++) {
      c.strokeStyle = i % 2 ? "#725239" : "#5a402e";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, i * 12);
      c.bezierCurveTo(240, i * 12 + 8, 530, i * 12 - 6, 768, i * 12 + 2);
      c.stroke();
    }
    c.strokeStyle = "#c4a479";
    c.lineWidth = 2;
    c.strokeRect(20, 20, 728, 260);
    c.fillStyle = "#f1e4c9";
    c.textAlign = "center";
    c.font = "500 74px sans-serif";
    c.fillText(label, 384, 148);
    c.font = "26px sans-serif";
    c.fillStyle = "#dcc6a3";
    c.fillText("Click to read", 384, 216);
    const texture = new THREE.CanvasTexture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    const face = mesh(
      new THREE.PlaneGeometry(2.5, 0.98),
      new THREE.MeshBasicMaterial({ map: texture }),
      group,
    );
    face.position.set(0, 1.95, 0.1);
    face.userData.sign = id;
    board.userData.sign = id;
    signTargets.push(face, board);
  }
  sign("about", "About", -7, 2.3);
  sign("projects", "Projects", -0.8, -6);
  sign("contact", "Contact", 6.8, 0.4);
  const koi: Array<{
    group: THREE.Group;
    tail: THREE.Group;
    body: THREE.Mesh;
    phase: number;
    radius: number;
    rate: number;
  }> = [];
  const fishWhite = material("#eadbc0"),
    fishOrange = material("#d07842"),
    finMaterial = material("#b6c8ad");
  for (let i = 0; i < 6; i++) {
    const group = new THREE.Group();
    scene.add(group);
    const body = mesh(new THREE.SphereGeometry(1, 12, 8), fishWhite, group);
    body.scale.set(0.12, 0.055, 0.34);
    for (const z of [-0.15, 0.12]) {
      const patch = mesh(new THREE.SphereGeometry(1, 8, 6), fishOrange, group);
      patch.scale.set(0.085, 0.024, 0.1);
      patch.position.set(0.015, 0.045, z);
    }
    const tail = new THREE.Group();
    tail.position.z = -0.3;
    group.add(tail);
    for (const side of [-1, 1]) {
      const fin = mesh(new THREE.SphereGeometry(1, 6, 4), finMaterial, tail);
      fin.scale.set(0.07, 0.01, 0.16);
      fin.position.set(side * 0.06, 0, -0.09);
      fin.rotation.y = side * -0.5;
    }
    for (const side of [-1, 1]) {
      const fin = mesh(new THREE.SphereGeometry(1, 6, 4), finMaterial, group);
      fin.scale.set(0.1, 0.008, 0.09);
      fin.position.set(side * 0.13, 0, 0.08);
    }
    koi.push({
      group,
      tail,
      body,
      phase: i * 1.6,
      radius: 1.4 + i * 0.47,
      rate: 0.07 + i * 0.007,
    });
  }
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const hint = document.querySelector<HTMLElement>("#sign-hint")!;
  let down = false,
    dragged = false,
    lastX = 0,
    lastY = 0,
    startX = 0,
    startY = 0;
  const signAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      (-(clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(signTargets)[0]?.object.userData.sign as
      | SignId
      | undefined;
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (panelOpen()) return;
    down = true;
    dragged = false;
    lastX = startX = e.clientX;
    lastY = startY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener("pointermove", (e) => {
    if (down) {
      const dx = e.clientX - lastX,
        dy = e.clientY - lastY;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5)
        dragged = true;
      yaw -= dx * 0.004;
      pitch = Math.max(-1.12, Math.min(0.15, pitch - dy * 0.003));
      lastX = e.clientX;
      lastY = e.clientY;
      camera.rotation.set(pitch, yaw, 0);
      hint.hidden = true;
    } else {
      const id = signAt(e.clientX, e.clientY);
      hint.hidden = !id;
      canvas.style.cursor = id ? "pointer" : "grab";
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    if (down && !dragged) {
      const id = signAt(e.clientX, e.clientY);
      if (id) open(id);
    }
    down = false;
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointercancel", () => {
    down = false;
  });
  canvas.addEventListener("lostpointercapture", () => {
    down = false;
  });
  canvas.addEventListener("pointerleave", () => {
    hint.hidden = true;
  });
  const movementKeys = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ];
  window.addEventListener("keydown", (e) => {
    if (
      panelOpen() ||
      (e.target instanceof HTMLElement &&
        e.target.closest("button,a,input,textarea,select"))
    )
      return;
    if (movementKeys.includes(e.code)) {
      e.preventDefault();
      keys.add(e.code);
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  const clearInput = () => {
    keys.clear();
    touch.clear();
    down = false;
  };
  window.addEventListener("blur", clearInput);
  document
    .querySelectorAll<HTMLButtonElement>("[data-walk]")
    .forEach((button) => {
      const direction = button.dataset.walk!;
      button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        touch.add(direction);
      });
      for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
        button.addEventListener(event, () => touch.delete(direction));
    });
  document.querySelector("#reset-view")!.addEventListener("click", () => {
    reset();
    clearInput();
  });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches;
  const pauseButton =
    document.querySelector<HTMLButtonElement>("#motion-toggle")!;
  const syncPause = () => {
    pauseButton.textContent = paused ? "Resume pond" : "Pause pond";
    pauseButton.setAttribute("aria-pressed", String(paused));
  };
  syncPause();
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    syncPause();
  });
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    syncPause();
  });
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize);
  resize();
  let frame = 0,
    last = 0,
    elapsed = 0;
  function animate(time: number) {
    if (document.hidden) {
      frame = 0;
      return;
    }
    const dt = Math.min((time - (last || time)) / 1000, 0.05);
    last = time;
    if (!paused) elapsed += dt;
    if (panelOpen()) clearInput();
    else {
      let forward =
        Number(
          keys.has("KeyW") || keys.has("ArrowUp") || touch.has("forward"),
        ) -
        Number(keys.has("KeyS") || keys.has("ArrowDown") || touch.has("back"));
      let side =
        Number(
          keys.has("KeyD") || keys.has("ArrowRight") || touch.has("right"),
        ) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft") || touch.has("left"));
      const length = Math.hypot(forward, side);
      if (length) {
        forward /= length;
        side /= length;
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * dt * 2.5,
          dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * dt * 2.5;
        if (canWalk(camera.position.x + dx, camera.position.z))
          camera.position.x += dx;
        if (canWalk(camera.position.x, camera.position.z + dz))
          camera.position.z += dz;
      }
    }
    waterMaterial.uniforms.time.value = elapsed;
    koi.forEach((f) => {
      const a = elapsed * f.rate + f.phase;
      f.group.position.set(
        Math.cos(a) * f.radius,
        -0.11,
        Math.sin(a) * f.radius * 0.63,
      );
      f.group.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a) * 0.63);
      f.tail.rotation.y = Math.sin(elapsed * 2.8 + f.phase) * 0.45;
      f.body.rotation.y = Math.sin(elapsed * 2.8 + f.phase - 0.6) * 0.07;
    });
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    clearInput();
  };
  const resume = () => {
    if (!document.hidden && !frame) {
      last = 0;
      frame = requestAnimationFrame(animate);
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else resume();
  });
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", resume);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
    document.querySelector<HTMLElement>("#scene-error")!.hidden = false;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.querySelector<HTMLElement>("#scene-error")!.hidden = true;
    resume();
  });
}
