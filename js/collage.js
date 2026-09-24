(() => {
  if (window.__collageBound) {
    return;
  }

  window.__collageBound = true;

  function steps(ctx, w, h) {
    const x = w * 0.28;
    const y = h * 0.72;
    const rise = 28;
    const run = 46;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 4; i += 1) {
      ctx.lineTo(x + run * i, y - rise * i);
      ctx.lineTo(x + run * (i + 1), y - rise * i);
    }
    ctx.stroke();
    ctx.fillText("01", x - 8, y + 18);
    ctx.fillText("04", x + run * 4 - 8, y - rise * 3 - 10);
  }

  function ladder(ctx, w, h) {
    const x = w * 0.46;
    const top = h * 0.28;
    const bottom = h * 0.78;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.moveTo(x + 54, top);
    ctx.lineTo(x + 54, bottom);
    for (let y = top + 18; y < bottom; y += 28) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 54, y);
    }
    ctx.stroke();
  }

  function path(ctx, w, h) {
    const points = [
      [w * 0.22, h * 0.7],
      [w * 0.4, h * 0.48],
      [w * 0.58, h * 0.58],
      [w * 0.76, h * 0.34],
    ];
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    });
    arrow(ctx, points[2][0], points[2][1], points[3][0], points[3][1]);
  }

  function compass(ctx, w, h) {
    const cx = w * 0.55;
    const cy = h * 0.55;
    const r = Math.min(w, h) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx, cy + r * 0.35);
    ctx.lineTo(cx - 10, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText("N", cx - 4, cy - r - 10);
  }

  function blocks(ctx, w, h) {
    const x = w * 0.32;
    const y = h * 0.66;
    const size = 54;
    for (let row = 0; row < 3; row += 1) {
      const count = 3 - row;
      for (let col = 0; col < count; col += 1) {
        ctx.strokeRect(x + col * (size + 8) + row * 18, y - row * (size * 0.72), size, size * 0.62);
      }
    }
  }

  function blueprint(ctx, w, h) {
    const x = w * 0.28;
    const y = h * 0.32;
    const bw = w * 0.46;
    const bh = h * 0.4;
    ctx.strokeRect(x, y, bw, bh);
    ctx.beginPath();
    for (let i = 1; i < 4; i += 1) {
      ctx.moveTo(x, y + (bh / 4) * i);
      ctx.lineTo(x + bw, y + (bh / 4) * i);
    }
    ctx.moveTo(x + bw * 0.45, y);
    ctx.lineTo(x + bw * 0.45, y + bh);
    ctx.stroke();
    ctx.fillText("A", x + 10, y + 22);
  }

  function folder(ctx, w, h) {
    const x = w * 0.3;
    const y = h * 0.36;
    const fw = w * 0.4;
    const fh = h * 0.38;
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + 48, y + 18);
    ctx.lineTo(x + 64, y);
    ctx.lineTo(x + fw, y);
    ctx.lineTo(x + fw, y + fh);
    ctx.lineTo(x, y + fh);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 48);
    ctx.lineTo(x + fw - 16, y + 48);
    ctx.moveTo(x + 16, y + 70);
    ctx.lineTo(x + fw * 0.62, y + 70);
    ctx.stroke();
  }

  function assembly(ctx, w, h) {
    const cx = w * 0.55;
    const cy = h * 0.55;
    ctx.strokeRect(cx - 70, cy - 28, 70, 56);
    ctx.strokeRect(cx + 16, cy - 46, 64, 40);
    ctx.strokeRect(cx + 20, cy + 16, 78, 48);
    arrow(ctx, cx, cy, cx + 16, cy - 26);
    arrow(ctx, cx, cy + 10, cx + 20, cy + 30);
  }

  const motifSets = {
    desk: [gear, shaft, circuit, wave, bracket, caliper, spring, linkage],
    experience: [steps, ladder, path, compass, gear],
    projects: [blocks, blueprint, folder, assembly, circuit],
  };

  function mulberry32(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let rng = Math.random;

  function rand(min, max) {
    return min + rng() * (max - min);
  }

  function irand(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function sheet(ctx, w, h, label) {
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText(label, 26, 36);
    ctx.beginPath();
    ctx.moveTo(22, 22);
    ctx.lineTo(22, 34);
    ctx.moveTo(22, 22);
    ctx.lineTo(34, 22);
    ctx.moveTo(w - 22, h - 22);
    ctx.lineTo(w - 22, h - 34);
    ctx.moveTo(w - 22, h - 22);
    ctx.lineTo(w - 34, h - 22);
    ctx.stroke();
  }

  function arrow(ctx, x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(angle - 0.45),
      y2 - head * Math.sin(angle - 0.45)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(angle + 0.45),
      y2 - head * Math.sin(angle + 0.45)
    );
    ctx.stroke();
  }

  function hatch(ctx, x, y, w, h, gap) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    for (let i = -h; i < w + h; i += gap) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
    }
    ctx.stroke();
    ctx.restore();
  }

  function gear(ctx, w, h) {
    const cx = w * 0.52;
    const cy = h * 0.56;
    const radius = Math.min(w, h) * 0.26;
    const teeth = irand(8, 14);
    ctx.beginPath();
    for (let i = 0; i < teeth; i += 1) {
      const step = (Math.PI * 2) / teeth;
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.55;
      const a3 = a0 + step;
      const inner = radius * 0.8;
      const outer = radius;
      const point = (angle, r) => [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
      const p0 = point(a0, inner);
      const p1 = point(a1, outer);
      const p2 = point(a2, outer);
      const p3 = point(a3, inner);
      if (i === 0) ctx.moveTo(p0[0], p0[1]);
      else ctx.lineTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.38, 0, Math.PI * 2);
    ctx.moveTo(cx + radius * 0.14, cy);
    ctx.arc(cx, cy, radius * 0.14, 0, Math.PI * 2);
    ctx.stroke();
    arrow(ctx, cx + radius + 28, cy - radius, cx + radius + 28, cy + radius);
    ctx.fillText("Ø", cx + radius + 36, cy);
  }

  function shaft(ctx, w, h) {
    const x = 70;
    const y = h * 0.42;
    const steps = [
      [70, 28],
      [90, 46],
      [120, 18],
      [80, 36],
    ];
    let cursor = x;
    ctx.beginPath();
    ctx.moveTo(cursor, y);
    steps.forEach(([width, height], index) => {
      ctx.lineTo(cursor, y - height / 2);
      ctx.lineTo(cursor + width, y - height / 2);
      ctx.lineTo(cursor + width, y + height / 2);
      ctx.lineTo(cursor, y + height / 2);
      ctx.lineTo(cursor, y);
      cursor += width;
      if (index < steps.length - 1) ctx.lineTo(cursor, y);
    });
    ctx.stroke();
    cursor = x;
    steps.forEach(([width, height]) => {
      ctx.beginPath();
      ctx.moveTo(cursor + 8, y - height / 2 - 16);
      ctx.lineTo(cursor + width - 8, y - height / 2 - 16);
      ctx.moveTo(cursor + 8, y - height / 2 - 16);
      ctx.lineTo(cursor + 8, y - height / 2 - 8);
      ctx.moveTo(cursor + width - 8, y - height / 2 - 16);
      ctx.lineTo(cursor + width - 8, y - height / 2 - 8);
      ctx.stroke();
      ctx.fillText(String(width), cursor + width / 2 - 10, y - height / 2 - 22);
      cursor += width;
    });
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x + steps.reduce((sum, step) => sum + step[0], 0) + 24, y);
    ctx.stroke();
  }

  function circuit(ctx, w, h) {
    const nodes = Array.from({ length: irand(6, 9) }, () => [
      rand(50, w - 50),
      rand(58, h - 40),
    ]);
    ctx.beginPath();
    for (let i = 1; i < nodes.length; i += 1) {
      const [x1, y1] = nodes[i - 1];
      const [x2, y2] = nodes[i];
      const midX = x1 + (x2 - x1) * rand(0.3, 0.7);
      ctx.moveTo(x1, y1);
      ctx.lineTo(midX, y1);
      ctx.lineTo(midX, y2);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    nodes.forEach(([x, y], index) => {
      ctx.beginPath();
      if (index % 3 === 0) {
        ctx.rect(x - 7, y - 7, 14, 14);
      } else {
        ctx.arc(x, y, 5, 0, Math.PI * 2);
      }
      ctx.stroke();
    });
  }

  function wave(ctx, w, h) {
    const left = 48;
    const right = w - 36;
    const mid = h * 0.58;
    ctx.beginPath();
    ctx.moveTo(left, mid);
    ctx.lineTo(right, mid);
    ctx.moveTo(left + 12, 58);
    ctx.lineTo(left + 12, h - 36);
    ctx.stroke();
    ctx.beginPath();
    const amp = rand(28, 52);
    const freq = rand(0.018, 0.032);
    for (let x = left + 20; x < right - 8; x += 2) {
      const y = mid + Math.sin(x * freq) * amp + Math.sin(x * freq * 2.3) * amp * 0.25;
      if (x === left + 20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < 5; i += 1) {
      const x = left + 40 + i * ((right - left - 60) / 4);
      ctx.beginPath();
      ctx.moveTo(x, mid - 4);
      ctx.lineTo(x, mid + 4);
      ctx.stroke();
    }
  }

  function bracket(ctx, w, h) {
    const x = 78;
    const y = 78;
    const bw = w * 0.55;
    const bh = h * 0.48;
    ctx.strokeRect(x, y, bw, bh);
    ctx.strokeRect(x + 22, y + 22, bw * 0.42, bh - 44);
    hatch(ctx, x + bw * 0.62, y, bw * 0.38, bh, 8);
    ctx.beginPath();
    ctx.arc(x + 36, y + bh * 0.5, 10, 0, Math.PI * 2);
    ctx.moveTo(x + bw - 28, y + 24);
    ctx.arc(x + bw - 28, y + 36, 8, 0, Math.PI * 2);
    ctx.stroke();
    arrow(ctx, x, y + bh + 28, x + bw, y + bh + 28);
    ctx.fillText("A", x + bw / 2 - 4, y + bh + 48);
  }

  function caliper(ctx, w, h) {
    const x = 64;
    const y = h * 0.34;
    const span = w * 0.62;
    ctx.strokeRect(x + span * 0.28, y + 36, span * 0.28, 54);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + span, y);
    ctx.lineTo(x + span, y + 18);
    ctx.lineTo(x + 18, y + 18);
    ctx.lineTo(x + 18, y + 110);
    ctx.lineTo(x, y + 110);
    ctx.closePath();
    ctx.moveTo(x + span * 0.55, y);
    ctx.lineTo(x + span * 0.55, y + 18);
    ctx.lineTo(x + span * 0.55, y + 90);
    ctx.stroke();
    for (let i = 0; i < 12; i += 1) {
      const tick = x + 24 + i * 18;
      ctx.beginPath();
      ctx.moveTo(tick, y + 4);
      ctx.lineTo(tick, y + (i % 2 ? 10 : 14));
      ctx.stroke();
    }
    ctx.fillText("0.02", x + span * 0.62, y + 70);
  }

  function spring(ctx, w, h) {
    const cx = w * 0.5;
    const top = 64;
    const coils = irand(6, 9);
    const pitch = (h - 130) / coils;
    const radius = Math.min(w, h) * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, top + 16);
    for (let i = 0; i < coils; i += 1) {
      const y = top + 16 + i * pitch;
      ctx.bezierCurveTo(cx + radius, y, cx + radius, y + pitch * 0.5, cx, y + pitch * 0.5);
      ctx.bezierCurveTo(
        cx - radius,
        y + pitch * 0.5,
        cx - radius,
        y + pitch,
        cx,
        y + pitch
      );
    }
    ctx.lineTo(cx, h - 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 28, h - 48);
    ctx.lineTo(cx + 28, h - 48);
    ctx.moveTo(cx - 18, top);
    ctx.lineTo(cx + 18, top);
    ctx.stroke();
  }

  function linkage(ctx, w, h) {
    const joints = [
      [70, h * 0.7],
      [w * 0.38, h * 0.38],
      [w * 0.62, h * 0.62],
      [w * 0.82, h * 0.34],
    ];
    ctx.beginPath();
    joints.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.moveTo(joints[1][0], joints[1][1]);
    ctx.lineTo(joints[2][0], joints[2][1] - 70);
    ctx.stroke();
    joints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(50, h * 0.7);
    ctx.lineTo(100, h * 0.7);
    ctx.stroke();
  }

  function renderMotif(draw, color, soft, scale) {
    const tile = document.createElement("canvas");
    tile.width = 520;
    tile.height = 360;
    const ctx = tile.getContext("2d", { willReadFrequently: true });
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const reference = scale < 0.5 ? 0.38 : 0.47;
    ctx.lineWidth = (soft ? 2.35 : 2.5) * (reference / scale);
    if (soft) {
      ctx.globalAlpha = 1;
    }
    ctx.lineJoin = "miter";
    ctx.lineCap = "square";
    const fig = String(irand(1, 24)).padStart(2, "0");
    sheet(ctx, tile.width, tile.height, `FIG. ${fig}`);
    ctx.save();
    ctx.translate(0, 8);
    draw(ctx, tile.width, tile.height);
    ctx.restore();
    glitch(tile);
    return tile;
  }

  function glitch(tile) {
    const ctx = tile.getContext("2d", { willReadFrequently: true });
    const { width, height } = tile;
    const bands = irand(3, 6);
    for (let i = 0; i < bands; i += 1) {
      const y = irand(20, height - 24);
      const band = irand(3, 16);
      const shift = irand(-36, 36);
      const slice = ctx.getImageData(0, y, width, Math.min(band, height - y));
      ctx.clearRect(0, y, width, band);
      ctx.putImageData(slice, shift, y);
    }
    if (rng() > 0.45) {
      const y = irand(30, height - 40);
      const band = irand(6, 14);
      const slice = ctx.getImageData(0, y, width, band);
      ctx.putImageData(slice, irand(-18, 18), Math.min(height - band, y + irand(10, 28)));
    }
  }

  function compose(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) {
      return;
    }

    if (!canvas.dataset.seed) {
      canvas.dataset.seed = String(1 + Math.floor(Math.random() * 99));
    }
    const previousRng = rng;
    rng = mulberry32(Number(canvas.dataset.seed));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const kind = canvas.dataset.collage || "desk";
    const onDesk = kind === "desk";
    const color = getComputedStyle(canvas).getPropertyValue("--ink").trim() || "#1e1e1e";
    const pool = motifSets[kind] || motifSets.desk;

    const count = width < 720 ? Math.min(4, pool.length) : Math.min(onDesk ? 8 : 5, pool.length);
    const order = pool
      .map((draw) => ({ draw, sort: rng() }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, count);

    const topInset = onDesk ? 0 : 96;
    const usable = Math.max(160, height - topInset);
    const cols = Math.max(2, Math.floor(width / 300));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cells.push({ col, row });
      }
    }
    for (let i = cells.length - 1; i > 0; i -= 1) {
      const j = irand(0, i);
      const swap = cells[i];
      cells[i] = cells[j];
      cells[j] = swap;
    }

    const placements = [];
    order.forEach(({ draw }, index) => {
      const scale = width < 720 ? rand(0.46, 0.6) : rand(0.58, 0.74);
      const tile = renderMotif(draw, color, onDesk, scale);
      const dw = 460 * scale;
      const dh = 320 * scale;
      const cell = cells[index];
      const cellW = width / cols;
      const cellH = usable / rows;
      const x = cell.col * cellW + cellW * rand(0.38, 0.62);
      const y = topInset + cell.row * cellH + Math.max(12, cellH - dh) * rand(0.08, 0.86);
      const angle = rand(-0.1, 0.1);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue("--ink-shadow").trim();
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 7;
      ctx.drawImage(tile, -dw / 2, 0, dw, dh);
      ctx.restore();
      placements.push({ x, y, dw, dh });
    });

    const canvasRect = canvas.getBoundingClientRect();
    const cards = [...canvas.parentElement.querySelectorAll(".window")].map((el) =>
      el.getBoundingClientRect()
    );
    const covered = (spot) => {
      const left = canvasRect.left + spot.x - spot.dw / 2;
      const top = canvasRect.top + spot.y + spot.dh;
      const right = left + 72;
      const bottom = top + 18;
      return cards.reduce((sum, card) => {
        const overlapW = Math.max(0, Math.min(right, card.right) - Math.max(left, card.left));
        const overlapH = Math.max(0, Math.min(bottom, card.bottom) - Math.max(top, card.top));
        return sum + overlapW * overlapH;
      }, 0);
    };
    const spot = placements.reduce((best, item) => (covered(item) < covered(best) ? item : best));
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = "top";
    ctx.fillText(
      `seed ${canvas.dataset.seed}`,
      Math.max(8, spot.x - spot.dw / 2),
      Math.min(height - 18, spot.y + spot.dh + 4)
    );
    ctx.restore();
    rng = previousRng;
  }

  function mount(canvas) {
    let waits = 0;
    let lastSize = "";
    let frame = 0;
    const redraw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if ((!width || !height) && waits < 8) {
        waits += 1;
        window.requestAnimationFrame(redraw);
        return;
      }
      const size = `${width}x${height}`;
      if (!width || !height || size === lastSize) {
        return;
      }
      waits = 0;
      lastSize = size;
      compose(canvas);
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(redraw);
    };

    schedule();
    window.addEventListener("resize", schedule);
    if (document.fonts) {
      document.fonts.ready.then(() => {
        lastSize = "";
        schedule();
      });
    }
    if (canvas.parentElement && "ResizeObserver" in window) {
      const observer = new ResizeObserver(schedule);
      observer.observe(canvas.parentElement);
    }
  }

  function start() {
    document.querySelectorAll("[data-collage]").forEach((canvas) => {
      if (canvas.dataset.collageReady === "true") {
        return;
      }
      canvas.dataset.collageReady = "true";
      mount(canvas);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
