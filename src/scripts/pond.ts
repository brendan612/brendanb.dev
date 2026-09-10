type Wake = { x: number; y: number; born: number; angle: number };
const TAU = Math.PI * 2;

export function paintWater(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  light: boolean,
) {
  ctx.clearRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(
    w * 0.8,
    h * 0.25,
    0,
    w * 0.65,
    h * 0.4,
    w * 0.8,
  );
  glow.addColorStop(0, light ? "#c6d6b5" : "#25463f");
  glow.addColorStop(1, light ? "#8caea7" : "#0d1e29");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  let seed = 217;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // Fine silt and gravel give the shallows texture without filling the reading area.
  ctx.save();
  for (let i = 0; i < 850; i++) {
    const x = random() * w,
      y = random() * h;
    const edge = Math.pow(Math.abs(x / w - 0.5) * 2, 3);
    ctx.globalAlpha = (0.025 + edge * 0.13) * random();
    ctx.fillStyle = i % 3 ? (light ? "#455f51" : "#98ac8d") : "#d3c5a0";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      0.5 + random() * 1.5,
      0.4 + random(),
      random() * TAU,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.restore();
  // Submerged rounded pebbles are concentrated along the banks.
  for (let i = 0; i < 95; i++) {
    const x =
        random() > 0.5
          ? w - random() ** 2 * w * 0.16
          : random() ** 2 * w * 0.16,
      y = random() * h,
      r = 5 + random() * 22;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * TAU);
    ctx.globalAlpha = 0.12 + random() * 0.2;
    ctx.fillStyle = light ? "#536f65" : "#618078";
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.63, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = light ? "#e0e2ba" : "#99aa8a";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(-1, -1, r * 0.87, r * 0.5, 0, Math.PI, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // Curved fronds and small leaves growing between stones along the banks.
  for (const [px, py, rotation] of [
    [0.018, 0.55, -0.8],
    [0.06, 0.88, -1.4],
    [0.975, 0.37, 2.4],
    [0.96, 0.94, 3.6],
  ]) {
    ctx.save();
    ctx.translate(w * px, h * py);
    ctx.rotate(rotation);
    const scale = Math.min(1, w / 650);
    ctx.scale(scale, scale);
    for (let stem = 0; stem < 7; stem++) {
      const length = 40 + random() * 75,
        bend = (random() - 0.5) * 55;
      ctx.save();
      ctx.rotate((stem - 3) * 0.22);
      ctx.strokeStyle = light ? "#416950" : "#648b69";
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(bend, -length * 0.6, bend * 0.6, -length);
      ctx.stroke();
      for (let leaf = 1; leaf <= 5; leaf++) {
        const t = leaf / 6,
          lx = bend * t * (1 - 0.4 * t),
          ly = -length * t;
        for (const side of [-1, 1]) {
          ctx.fillStyle = stem % 2 ? "#638f72" : "#3c786c";
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.quadraticCurveTo(lx + side * 17, ly - 2, lx + side * 19, ly - 14);
          ctx.quadraticCurveTo(lx + side * 5, ly - 12, lx, ly);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }
  // A few fallen leaves float separately from the submerged plants.
  for (const [px, py, angle] of [
    [0.12, 0.17, 0.6],
    [0.88, 0.51, 2.2],
    [0.09, 0.72, -0.6],
  ]) {
    ctx.save();
    ctx.translate(w * px, h * py);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = light ? "#8c7950" : "#9a8c5f";
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(0, -10, 15, 0);
    ctx.quadraticCurveTo(0, 8, -12, 0);
    ctx.fill();
    ctx.strokeStyle = "#b5b187";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
    ctx.restore();
  }
  // Reflected water light, quiet enough to sit under text.
  ctx.save();
  ctx.strokeStyle = light ? "#f2f2d0" : "#80b6a0";
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i++) {
    const x = random() * w,
      y = random() * h,
      r = 30 + random() * 110;
    ctx.globalAlpha = 0.025 + random() * 0.035;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.bezierCurveTo(
      x - r * 0.4,
      y - r * 0.5,
      x + r * 0.15,
      y + r * 0.5,
      x + r,
      y,
    );
    ctx.stroke();
  }
  ctx.restore();
  // Notched lily pads, with veins and shadows below the surface.
  for (const [px, py, size, angle] of [
    [0.025, 0.23, 34, 0.3],
    [0.07, 0.31, 23, 1.2],
    [0.965, 0.68, 43, 2.5],
    [0.92, 0.76, 27, 1.8],
    [0.985, 0.11, 23, 3.4],
  ]) {
    ctx.save();
    ctx.translate(w * px, h * py);
    ctx.rotate(angle);
    const r = size * Math.min(1, w / 700);
    ctx.shadowColor = "#061918";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 7;
    const pad = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r);
    pad.addColorStop(0, light ? "#78965b" : "#527960");
    pad.addColorStop(1, light ? "#4e7859" : "#254c42");
    ctx.fillStyle = pad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, 0.18, TAU - 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = light ? "#a4b780" : "#83a180";
    ctx.lineWidth = 0.65;
    ctx.globalAlpha = 0.3;
    for (let j = 1; j < 10; j++) {
      const a = (j * TAU) / 10;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.quadraticCurveTo(
        Math.cos(a + 0.2) * r * 0.5,
        Math.sin(a) * r * 0.5,
        Math.cos(a) * r * 0.9,
        Math.sin(a) * r * 0.9,
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  const shade = ctx.createRadialGradient(
    w * 0.48,
    h * 0.45,
    w * 0.13,
    w * 0.48,
    h * 0.45,
    w * 0.65,
  );
  shade.addColorStop(0, light ? "#eef0f7d9" : "#151923dd");
  shade.addColorStop(1, "#15192300");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

export function paintKoi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  phase: number,
  effort: number,
  opacity: number,
) {
  // A travelling wave deforms the entire spine, strongest near the tail.
  const spine = (t: number) =>
    Math.sin(phase - t * 5.2) * Math.pow(t, 1.45) * (11 + effort * 7);
  const point = (t: number, across = 0) => ({
    x: 28 - t * 68,
    y: spine(t) + across,
  });
  const widths = [1, 7.5, 10.4, 10.9, 10.3, 8.8, 7, 5.1, 3.5, 2.2, 1.3];
  const body = () => {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const p = point(i / 10, widths[i]);
      if (!i) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    for (let i = 10; i >= 0; i--) {
      const p = point(i / 10, -widths[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.globalAlpha = opacity;
  ctx.save();
  ctx.translate(5, 9);
  ctx.filter = "blur(5px)";
  ctx.fillStyle = "#051716";
  ctx.globalAlpha = opacity * 0.27;
  body();
  ctx.fill();
  ctx.restore();
  // Paired pectoral fins seen from directly above, with translucent fin rays.
  for (const side of [-1, 1]) {
    const fin = Math.sin(phase * 0.65 + side * 0.6) * 2;
    ctx.fillStyle = "#e8d9b96b";
    ctx.strokeStyle = "#f1e7cf48";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(9, side * 7);
    ctx.bezierCurveTo(
      4,
      side * (18 + fin),
      -7,
      side * (24 + fin),
      -12,
      side * 18,
    );
    ctx.quadraticCurveTo(-6, side * 10, -3, side * 8);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(5, side * 8);
      ctx.lineTo(-9 + i * 4, side * (17 + fin));
      ctx.stroke();
    }
  }
  const tail = point(1),
    swing = Math.sin(phase - 5.8) * (4 + effort * 5);
  ctx.fillStyle = "#dbd8bfaa";
  ctx.strokeStyle = "#f0e2c269";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(tail.x + 2, tail.y);
  ctx.bezierCurveTo(
    tail.x - 7,
    tail.y - 4,
    tail.x - 19,
    tail.y + swing - 14,
    tail.x - 22,
    tail.y + swing - 10,
  );
  ctx.quadraticCurveTo(
    tail.x - 15,
    tail.y + swing,
    tail.x - 22,
    tail.y + swing + 10,
  );
  ctx.bezierCurveTo(
    tail.x - 19,
    tail.y + swing + 14,
    tail.x - 7,
    tail.y + 4,
    tail.x + 2,
    tail.y,
  );
  ctx.fill();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(tail.x - 17, tail.y + swing + i * 4);
    ctx.stroke();
  }
  const skin = ctx.createLinearGradient(0, -12, 0, 12);
  skin.addColorStop(0, "#a3b7ad");
  skin.addColorStop(0.4, "#f2ead6");
  skin.addColorStop(0.65, "#e1e1ca");
  skin.addColorStop(1, "#79968d");
  ctx.fillStyle = skin;
  body();
  ctx.fill();
  ctx.save();
  body();
  ctx.clip();
  // Irregular orange saddles follow the bending body, with subtle scales.
  for (const [t, length, width] of [
    [0.19, 10, 8],
    [0.46, 10, 9],
    [0.74, 7, 5],
  ]) {
    const p = point(t);
    ctx.fillStyle = t < 0.3 ? "#cc6534" : "#b84b2c";
    ctx.beginPath();
    ctx.moveTo(p.x + length, p.y - width * 0.3);
    ctx.bezierCurveTo(
      p.x + 4,
      p.y - width * 1.3,
      p.x - length,
      p.y - width,
      p.x - length,
      p.y + 1,
    );
    ctx.bezierCurveTo(
      p.x - length * 0.5,
      p.y + width,
      p.x + 4,
      p.y + width * 0.5,
      p.x + length,
      p.y - width * 0.3,
    );
    ctx.fill();
  }
  ctx.strokeStyle = "#fff9dd40";
  ctx.lineWidth = 0.7;
  for (let i = 3; i < 12; i++) {
    const t = i / 15,
      p = point(t);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2, 7 * (1 - t), 0.1, -0.9, 1.1);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#1b302e";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(20, side * 5, 1.5, 1, side * 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "#425b5266";
  ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(10, side * 3);
    ctx.quadraticCurveTo(7, side * 6, 10, side * 9);
    ctx.stroke();
  }
  ctx.restore();
}

export function initPond() {
  const canvas =
      document.querySelector<HTMLCanvasElement>("[data-cursor-pond]"),
    water = document.querySelector<HTMLCanvasElement>("[data-pond-water]");
  const ctx = canvas?.getContext("2d"),
    pond = water?.getContext("2d");
  if (!canvas || !water || !ctx || !pond) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    previous = 0,
    lastMove = -Infinity,
    lastAim = 0,
    lastWake = 0,
    phase = 0,
    speed = 0;
  let active = false,
    x = 0,
    y = 0,
    targetX = 0,
    targetY = 0,
    aimTargetX = 0,
    aimTargetY = 0,
    heading = 0;
  let wakes: Wake[] = [];
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    wakes = [];
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  };
  const background = () =>
    paintWater(
      pond,
      innerWidth,
      innerHeight,
      document.documentElement.dataset.theme === "light",
    );
  const resize = () => {
    clear();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    for (const [el, context] of [
      [canvas, ctx],
      [water, pond],
    ] as const) {
      el.width = Math.round(innerWidth * ratio);
      el.height = Math.round(innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    background();
    if (!active) {
      x = innerWidth * 0.65;
      y = innerHeight * 0.6;
      heading = -2;
      active = true;
    }
    x = Math.max(40, Math.min(innerWidth - 40, x));
    y = Math.max(40, Math.min(innerHeight - 40, y));
    if (!document.hidden) frame = requestAnimationFrame(draw);
  };
  const draw = (time: number) => {
    frame = 0;
    if (document.hidden) {
      clear();
      return;
    }
    const dt = Math.min((time - (previous || time)) / 1000, 0.04);
    previous = time;
    // Reconsider the destination only a few times a second, not on every mouse event.
    const roaming = time - lastMove > 12000;
    if (time - lastAim > 350 || roaming) {
      aimTargetX = roaming
        ? innerWidth * (0.5 + 0.27 * Math.sin(time / 17000))
        : targetX;
      aimTargetY = roaming
        ? innerHeight * (0.5 + 0.25 * Math.sin(time / 23000 + 1.7))
        : targetY;
      lastAim = time;
    }
    const idle =
      !roaming &&
      time - lastMove > 1500 &&
      Math.hypot(aimTargetX - x, aimTargetY - y) < 85;
    // Circle gently near a still pointer rather than freeze mid-stroke.
    const marginX = Math.min(100, innerWidth * 0.25),
      marginY = Math.min(100, innerHeight * 0.25);
    const aimX = Math.max(
        marginX,
        Math.min(
          innerWidth - marginX,
          aimTargetX + (idle ? Math.cos(time / 4200) * 52 : 0),
        ),
      ),
      aimY = Math.max(
        marginY,
        Math.min(
          innerHeight - marginY,
          aimTargetY + (idle ? Math.sin(time / 4200) * 38 : 0),
        ),
      );
    const dx = aimX - x,
      dy = aimY - y,
      distance = Math.hypot(dx, dy),
      desired = Math.atan2(dy, dx);
    const turn = Math.atan2(
      Math.sin(desired - heading),
      Math.cos(desired - heading),
    );
    heading += Math.max(-dt * 0.8, Math.min(dt * 0.8, turn));
    const maxSpeed = motion.matches ? 30 : 45;
    const goal = Math.min(
      maxSpeed,
      Math.max(roaming || idle ? 18 : 8, (distance - 30) * 0.45),
    );
    speed += (goal - speed) * (1 - Math.exp(-dt * 0.75));
    {
      x += Math.cos(heading) * speed * dt;
      y += Math.sin(heading) * speed * dt;
      phase += dt * (motion.matches ? 1.7 : 2.4 + speed / 45);
    }
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (speed > 5 && time - lastWake > 550) {
      wakes.push({
        x: x - Math.cos(heading) * 44,
        y: y - Math.sin(heading) * 44,
        angle: heading,
        born: time,
      });
      lastWake = time;
    }
    wakes = wakes.filter((w) => time - w.born < 2800).slice(-12);
    ctx.strokeStyle = "#acd7c8";
    ctx.lineWidth = 0.75;
    for (const w of wakes) {
      const life = (time - w.born) / 2800;
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);
      ctx.globalAlpha = Math.sin(Math.PI * life) * 0.18;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 + life * 34, 8 + life * 40, 0, 0.5, TAU - 0.5);
      ctx.stroke();
      ctx.restore();
    }
    paintKoi(ctx, x, y, heading, phase, speed / 45, 0.8);
    frame = requestAnimationFrame(draw);
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || document.hidden) return;
      const now = performance.now();
      targetX = event.clientX;
      targetY = event.clientY;
      lastMove = now;
      if (!frame) frame = requestAnimationFrame(draw);
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    lastMove = -Infinity;
  });
  window.addEventListener("blur", () => {
    lastMove = -Infinity;
  });
  window.addEventListener("pagehide", clear);
  window.addEventListener("resize", resize, { passive: true });
  const resume = () => {
    if (!document.hidden && !frame) {
      previous = 0;
      frame = requestAnimationFrame(draw);
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
    else resume();
  });
  window.addEventListener("pageshow", resume);
  new MutationObserver(background).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  resize();
}
