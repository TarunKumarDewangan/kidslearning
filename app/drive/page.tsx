'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';

export default function DrivePage() {
  useEffect(() => {
    const cv = document.getElementById('game') as HTMLCanvasElement,
      cx = cv.getContext('2d')!;
    let W = 0,
      H = 0;
    function resize() {
      const r = cv.getBoundingClientRect();
      W = cv.width = r.width * devicePixelRatio;
      H = cv.height = r.height * devicePixelRatio;
    }
    addEventListener('resize', resize);
    resize();

    let mainRaf = 0;
    let cancelled = false;

    // ---------- State ----------
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const S: any = {};
    function reset() {
      S.playerX = 0; // -1 .. 1
      S.speed = 0; // units/sec
      S.maxSpeed = 48;
      S.dist = 0; // meters
      S.money = 0;
      S.curve = 0;
      S.targetCurve = 0;
      S.curveTimer = 0;
      S.letterIdx = 0; // next letter to spawn (0=A)
      S.nextLetterAt = 100; // meters
      S.objects = []; // {type:'coin'|'letter'|'obstacle', z, x, ch}
      S.spawnT = 0;
      S.running = true;
      S.paused = false;
      S.stars = Array.from({ length: 40 }, () => [Math.random(), Math.random() * 0.4]);
      S.level = 1;
    }
    reset();
    S.best = +(localStorage.getItem('abcdrive_best') || 0);

    // ---------- Input ----------
    let steer = 0;
    const hold: any = { l: false, r: false };
    const btnCleanups: (() => void)[] = [];
    function bindBtn(id: string, key: string) {
      const el = document.getElementById(id)!;
      const downs = ['pointerdown', 'touchstart'];
      const ups = ['pointerup', 'pointerleave', 'touchend', 'touchcancel'];
      const onDown = (ev: Event) => {
        ev.preventDefault();
        hold[key] = true;
      };
      const onUp = () => (hold[key] = false);
      downs.forEach((e) => el.addEventListener(e, onDown));
      ups.forEach((e) => el.addEventListener(e, onUp));
      btnCleanups.push(() => {
        downs.forEach((e) => el.removeEventListener(e, onDown));
        ups.forEach((e) => el.removeEventListener(e, onUp));
      });
    }
    bindBtn('leftBtn', 'l');
    bindBtn('rightBtn', 'r');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') hold.l = true;
      if (e.key === 'ArrowRight') hold.r = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') hold.l = false;
      if (e.key === 'ArrowRight') hold.r = false;
    };
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);

    // finger drag on road -> car follows finger
    let touchX: number | null = null; // target playerX (-1..1) while finger is down
    function fingerX(e: PointerEvent) {
      const r = cv.getBoundingClientRect();
      return Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width * 0.36)));
    }
    const onCvDown = (e: PointerEvent) => {
      e.preventDefault();
      touchX = fingerX(e);
    };
    const onCvMove = (e: PointerEvent) => {
      if (touchX !== null) touchX = fingerX(e);
    };
    const onCvUp = () => (touchX = null);
    cv.addEventListener('pointerdown', onCvDown);
    cv.addEventListener('pointermove', onCvMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => cv.addEventListener(ev, onCvUp));

    // ---------- Spawning ----------
    function spawn(dt: number) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        S.spawnT = 0.9 + Math.random() * 0.8;
        const x = [-0.6, 0, 0.6][Math.floor(Math.random() * 3)];
        if (Math.random() < 0.55) {
          for (let i = 0; i < 4; i++) S.objects.push({ type: 'coin', z: 120 + i * 7, x });
        } else if (S.dist > 60) {
          S.objects.push({ type: 'obstacle', z: 130, x });
        }
      }
      // letter checkpoint every 100 m
      if (S.letterIdx < 26 && S.dist >= S.nextLetterAt && !S.objects.some((o: any) => o.type === 'letter')) {
        S.objects.push({ type: 'letter', z: 140, x: 0, ch: LETTERS[S.letterIdx] });
      }
    }

    // ---------- Update ----------
    function update(dt: number) {
      if (!S.running || S.paused) return;
      steer = (hold.r ? 1 : 0) - (hold.l ? 1 : 0);
      S.speed = Math.min(S.maxSpeed + S.level * 5, S.speed + dt * 20);
      if (touchX !== null) {
        // car smoothly follows the finger
        const d = touchX - S.playerX;
        S.playerX += d * Math.min(1, dt * 10);
        steer = Math.abs(d) > 0.05 ? Math.sign(d) : 0; // for car tilt
      } else {
        S.playerX += steer * dt * 2.4;
      }
      S.playerX = Math.max(-1, Math.min(1, S.playerX));

      // curve changes
      S.curveTimer -= dt;
      if (S.curveTimer <= 0) {
        S.curveTimer = 3 + Math.random() * 4;
        S.targetCurve = (Math.random() * 2 - 1) * 0.9;
      }
      S.curve += (S.targetCurve - S.curve) * dt * 0.5;
      // road pushes car on curves
      S.playerX -= S.curve * dt * 0.55 * (S.speed / S.maxSpeed);

      S.dist += S.speed * dt * 0.6;
      spawn(dt);

      for (const o of S.objects) {
        o.z -= S.speed * dt;
        if (o.z < 3 && o.z > -3 && Math.abs(o.x - S.playerX) < 0.34) {
          if (o.type === 'coin') {
            S.money += 10;
            o.dead = true;
          } else if (o.type === 'letter') {
            o.dead = true;
            startTrace(o.ch);
          } else if (o.type === 'obstacle') {
            o.dead = true;
            crash();
          }
        }
      }
      S.objects = S.objects.filter((o: any) => !o.dead && o.z > -8);

      document.getElementById('money')!.textContent = '$' + S.money;
      document.getElementById('best')!.textContent = 'BEST $' + S.best;
      document.getElementById('level')!.textContent = '🔥 LEVEL ' + S.level;
      document.getElementById('dist')!.innerHTML =
        Math.floor(S.dist) + ' m &nbsp;•&nbsp; ' + (S.letterIdx < 26 ? 'Next: ' + LETTERS[S.letterIdx] : '⭐ All letters done!');
    }

    function crash() {
      S.running = false;
      if (S.money > S.best) {
        S.best = S.money;
        localStorage.setItem('abcdrive_best', S.best);
      }
      document.getElementById('overStats')!.innerHTML =
        'Distance: <b>' + Math.floor(S.dist) + ' m</b><br>Money: <b>$' + S.money + '</b><br>Letters learned: <b>' + S.letterIdx + '</b>';
      document.getElementById('over')!.style.display = 'flex';
    }
    const restartBtn = document.getElementById('restartBtn')!;
    const onRestart = () => {
      document.getElementById('over')!.style.display = 'none';
      const best = S.best;
      reset();
      S.best = best;
    };
    restartBtn.addEventListener('click', onRestart);

    // ---------- Render (pseudo-3D) ----------
    function hillAt(z: number) {
      // vertical road undulation
      const s = S.dist / 0.6 + z;
      return Math.sin(s * 0.035) * 0.5 + Math.sin(s * 0.013) * 0.5;
    }
    function project(z: number, x: number) {
      const horizon = H * 0.4;
      const t = 1 / (1 + z * 0.05); // 0..1 near
      const hill = hillAt(z) * H * 0.055 * (1 - t); // far strips move up/down
      const y = horizon + (H - horizon) * t + hill;
      const roadW = W * 0.04 + W * 1.45 * t * t; // t^2 -> stronger perspective
      const curveOff = S.curve * (1 - t) * (1 - t) * W * 0.55;
      const sx = W / 2 + curveOff + x * roadW * 0.5;
      return { x: sx, y, w: roadW, t };
    }
    function fog(hex: string, t: number, fogHex: string) {
      // lerp color toward fog by depth
      const f = Math.pow(1 - t, 1.6);
      const a = parseInt(hex.slice(1), 16),
        b = parseInt(fogHex.slice(1), 16);
      const r = ((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * f;
      const g = ((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * f;
      const bl = (a & 255) + ((b & 255) - (a & 255)) * f;
      return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ')';
    }
    const FOG = '#3d1216';
    function render() {
      const hz = H * 0.4;
      // sky
      const g = cx.createLinearGradient(0, 0, 0, hz * 1.15);
      g.addColorStop(0, '#0d060f');
      g.addColorStop(0.55, '#33101a');
      g.addColorStop(1, '#6b2015');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, hz * 1.2);
      // stars
      cx.fillStyle = '#fff';
      for (const [sx, sy] of S.stars) {
        cx.globalAlpha = 0.25 + ((sx * 7) % 1) * 0.5;
        cx.fillRect(sx * W, sy * H, 2, 2);
      }
      cx.globalAlpha = 1;
      // moon
      const mg = cx.createRadialGradient(W * 0.8, H * 0.09, 2, W * 0.8, H * 0.09, W * 0.09);
      mg.addColorStop(0, 'rgba(255,220,180,0.9)');
      mg.addColorStop(0.35, 'rgba(255,190,140,0.25)');
      mg.addColorStop(1, 'rgba(255,190,140,0)');
      cx.fillStyle = mg;
      cx.beginPath();
      cx.arc(W * 0.8, H * 0.09, W * 0.09, 0, 7);
      cx.fill();

      // far mountains (parallax with curve)
      const par = -S.curve * W * 0.06;
      cx.fillStyle = '#200b12';
      cx.beginPath();
      cx.moveTo(0, hz);
      cx.lineTo(W * 0.1 + par, H * 0.3);
      cx.lineTo(W * 0.3 + par, hz);
      cx.lineTo(W * 0.72 + par, H * 0.33);
      cx.lineTo(W, hz);
      cx.closePath();
      cx.fill();
      // volcano
      cx.fillStyle = '#2e0e0e';
      cx.beginPath();
      cx.moveTo(W * 0.18 + par * 2, hz);
      cx.lineTo(W * 0.545 + par * 2, H * 0.15);
      cx.lineTo(W * 0.635 + par * 2, H * 0.15);
      cx.lineTo(W * 0.98 + par * 2, hz);
      cx.closePath();
      cx.fill();
      // lava glow
      const lg = cx.createRadialGradient(W * 0.59 + par * 2, H * 0.15, 2, W * 0.59 + par * 2, H * 0.15, W * 0.16);
      lg.addColorStop(0, 'rgba(255,90,30,0.8)');
      lg.addColorStop(1, 'rgba(255,90,30,0)');
      cx.fillStyle = lg;
      cx.beginPath();
      cx.arc(W * 0.59 + par * 2, H * 0.15, W * 0.16, 0, 7);
      cx.fill();
      cx.fillStyle = '#ff5a1f';
      cx.beginPath();
      cx.ellipse(W * 0.59 + par * 2, H * 0.15, W * 0.05, H * 0.011, 0, 0, 7);
      cx.fill();

      // ground
      const gg = cx.createLinearGradient(0, hz, 0, H);
      gg.addColorStop(0, '#2c1016');
      gg.addColorStop(1, '#120810');
      cx.fillStyle = gg;
      cx.fillRect(0, hz - 2, W, H - hz + 2);

      // road strips (far -> near) with alternating shade + fog
      const steps = 110;
      for (let i = steps; i > 0; i--) {
        const z1 = i * 1.5,
          z0 = (i - 1) * 1.5;
        const p1 = project(z1, 0),
          p0 = project(z0, 0);
        const band = Math.floor((z1 + S.dist / 0.6) / 6) % 2 === 0;
        // grass band shading
        cx.fillStyle = fog(band ? '#1c0d16' : '#160a12', p0.t, FOG);
        cx.fillRect(0, p0.y - 1, W, Math.max(1.5, p1.y - p0.y + 2));
        // asphalt
        cx.fillStyle = fog(band ? '#262030' : '#1e1926', p0.t, FOG);
        cx.beginPath();
        cx.moveTo(p1.x - p1.w / 2, p1.y);
        cx.lineTo(p1.x + p1.w / 2, p1.y);
        cx.lineTo(p0.x + p0.w / 2, p0.y);
        cx.lineTo(p0.x - p0.w / 2, p0.y);
        cx.closePath();
        cx.fill();
        // rumble edges (red/white alternating)
        cx.fillStyle = fog(band ? '#ff9d4d' : '#e8e0d8', p0.t, FOG);
        const ew1 = p1.w * 0.04,
          ew0 = p0.w * 0.04;
        [[-1], [1]].forEach(([s]) => {
          cx.beginPath();
          cx.moveTo(p1.x + s * (p1.w / 2), p1.y);
          cx.lineTo(p1.x + s * (p1.w / 2 - ew1), p1.y);
          cx.lineTo(p0.x + s * (p0.w / 2 - ew0), p0.y);
          cx.lineTo(p0.x + s * (p0.w / 2), p0.y);
          cx.closePath();
          cx.fill();
        });
        // dashed lane lines
        if (band) {
          cx.fillStyle = fog('#ffcf8f', p0.t, FOG);
          [-0.33, 0.33].forEach((lx) => {
            const l1 = project(z1, lx),
              l0 = project(z0, lx);
            const w1 = p1.w * 0.011,
              w0 = p0.w * 0.011;
            cx.beginPath();
            cx.moveTo(l1.x - w1, l1.y);
            cx.lineTo(l1.x + w1, l1.y);
            cx.lineTo(l0.x + w0, l0.y);
            cx.lineTo(l0.x - w0, l0.y);
            cx.closePath();
            cx.fill();
          });
        }
      }

      // roadside trees/rocks (world-anchored)
      const zdist = S.dist / 0.6,
        spacing = 22;
      for (let k = 8; k >= 1; k--) {
        const wz = (Math.floor(zdist / spacing) + k) * spacing - zdist;
        if (wz < 1 || wz > 150) continue;
        const side = (Math.floor(zdist / spacing) + k) % 2 === 0 ? -1 : 1;
        const p = project(wz, side * 1.75);
        const s = p.w / 5;
        const al = 1 - Math.pow(1 - p.t, 1.8);
        cx.globalAlpha = Math.max(0.15, al);
        if ((Math.floor(zdist / spacing) + k) % 3 === 0) {
          // rock
          cx.fillStyle = '#3a2430';
          cx.beginPath();
          cx.moveTo(p.x - s * 0.3, p.y);
          cx.lineTo(p.x - s * 0.1, p.y - s * 0.28);
          cx.lineTo(p.x + s * 0.15, p.y - s * 0.2);
          cx.lineTo(p.x + s * 0.3, p.y);
          cx.closePath();
          cx.fill();
        } else {
          // dead tree
          cx.strokeStyle = '#40222e';
          cx.lineWidth = Math.max(1.5, s * 0.07);
          cx.lineCap = 'round';
          cx.beginPath();
          cx.moveTo(p.x, p.y);
          cx.lineTo(p.x, p.y - s * 0.75);
          cx.moveTo(p.x, p.y - s * 0.45);
          cx.lineTo(p.x - s * 0.25, p.y - s * 0.68);
          cx.moveTo(p.x, p.y - s * 0.55);
          cx.lineTo(p.x + s * 0.22, p.y - s * 0.8);
          cx.stroke();
        }
        cx.globalAlpha = 1;
      }

      // objects (far to near)
      const objs = [...S.objects].sort((a: any, b: any) => b.z - a.z);
      for (const o of objs) {
        const p = project(o.z, o.x);
        const s = p.w / 6;
        // ground shadow
        cx.fillStyle = 'rgba(0,0,0,0.4)';
        cx.beginPath();
        cx.ellipse(p.x, p.y, s * 0.32, s * 0.09, 0, 0, 7);
        cx.fill();
        if (o.type === 'coin') {
          const spin = 0.55 + 0.45 * Math.abs(Math.sin(Date.now() / 300 + o.z));
          const cgr = cx.createRadialGradient(p.x - s * 0.08, p.y - s * 0.38, 1, p.x, p.y - s * 0.3, s * 0.26);
          cgr.addColorStop(0, '#ffd9a0');
          cgr.addColorStop(0.5, '#ff9d42');
          cgr.addColorStop(1, '#c9601a');
          cx.fillStyle = cgr;
          cx.beginPath();
          cx.ellipse(p.x, p.y - s * 0.3, s * 0.22 * spin, s * 0.22, 0, 0, 7);
          cx.fill();
          cx.fillStyle = '#5a2508';
          cx.font = 'bold ' + Math.max(8, s * 0.26) + 'px Arial';
          cx.textAlign = 'center';
          cx.textBaseline = 'middle';
          if (spin > 0.75) cx.fillText('$', p.x, p.y - s * 0.3);
        } else if (o.type === 'obstacle') {
          // 3D-ish rival car (back view)
          const w = s * 0.78,
            h = s * 0.62;
          cx.fillStyle = '#15151d'; // tires
          cx.fillRect(p.x - w / 2 - s * 0.05, p.y - h * 0.35, s * 0.1, h * 0.4);
          cx.fillRect(p.x + w / 2 - s * 0.05, p.y - h * 0.35, s * 0.1, h * 0.4);
          const bg = cx.createLinearGradient(p.x - w / 2, 0, p.x + w / 2, 0);
          bg.addColorStop(0, '#2b2b3a');
          bg.addColorStop(0.5, '#4a4a60');
          bg.addColorStop(1, '#2b2b3a');
          cx.fillStyle = bg;
          roundRect(p.x - w / 2, p.y - h, w, h, s * 0.09);
          cx.fill();
          cx.fillStyle = '#1a1a26'; // rear window
          roundRect(p.x - w * 0.33, p.y - h * 0.92, w * 0.66, h * 0.34, s * 0.05);
          cx.fill();
          cx.fillStyle = '#ff3b3b'; // tail lights
          cx.fillRect(p.x - w * 0.42, p.y - h * 0.38, w * 0.2, h * 0.12);
          cx.fillRect(p.x + w * 0.22, p.y - h * 0.38, w * 0.2, h * 0.12);
          cx.globalAlpha = 0.35;
          cx.fillStyle = '#ff3b3b'; // light glow
          cx.beginPath();
          cx.arc(p.x - w * 0.32, p.y - h * 0.32, s * 0.12, 0, 7);
          cx.fill();
          cx.beginPath();
          cx.arc(p.x + w * 0.32, p.y - h * 0.32, s * 0.12, 0, 7);
          cx.fill();
          cx.globalAlpha = 1;
        } else {
          // letter
          const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
          const gl = cx.createRadialGradient(p.x, p.y - s * 0.4, 1, p.x, p.y - s * 0.4, s * 0.7 * pulse);
          gl.addColorStop(0, 'rgba(255,210,90,0.55)');
          gl.addColorStop(1, 'rgba(255,210,90,0)');
          cx.fillStyle = gl;
          cx.beginPath();
          cx.arc(p.x, p.y - s * 0.4, s * 0.7 * pulse, 0, 7);
          cx.fill();
          cx.fillStyle = '#5a3c00';
          cx.font = 'bold ' + Math.max(10, s * 0.8) + 'px Arial';
          cx.textAlign = 'center';
          cx.textBaseline = 'middle';
          cx.fillText(o.ch, p.x + s * 0.03, p.y - s * 0.37);
          cx.fillStyle = '#ffd24d';
          cx.fillText(o.ch, p.x, p.y - s * 0.4);
        }
      }

      // player car (3D-ish top-back view)
      const pc = project(0, S.playerX);
      const cw = W * 0.16,
        ch = cw * 1.55;
      const cxp = pc.x,
        cyp = H * 0.88;
      const bob = Math.sin(Date.now() / 90) * (S.speed > 1 ? H * 0.002 : 0);
      cx.save();
      cx.translate(cxp, cyp + bob);
      cx.rotate(steer * 0.09 + S.curve * 0.03);
      // shadow
      cx.fillStyle = 'rgba(0,0,0,0.5)';
      cx.beginPath();
      cx.ellipse(0, ch * 0.42, cw * 0.62, ch * 0.1, 0, 0, 7);
      cx.fill();
      // tires
      cx.fillStyle = '#0c0c12';
      roundRect(-cw / 2 - cw * 0.06, -ch * 0.36, cw * 0.12, ch * 0.26, 4);
      cx.fill();
      roundRect(cw / 2 - cw * 0.06, -ch * 0.36, cw * 0.12, ch * 0.26, 4);
      cx.fill();
      roundRect(-cw / 2 - cw * 0.07, ch * 0.12, cw * 0.14, ch * 0.28, 4);
      cx.fill();
      roundRect(cw / 2 - cw * 0.07, ch * 0.12, cw * 0.14, ch * 0.28, 4);
      cx.fill();
      // body with 3D shading
      const cg2 = cx.createLinearGradient(-cw / 2, 0, cw / 2, 0);
      cg2.addColorStop(0, '#a63e14');
      cg2.addColorStop(0.28, '#ff8340');
      cg2.addColorStop(0.5, '#ffa568');
      cg2.addColorStop(0.72, '#ff8340');
      cg2.addColorStop(1, '#a63e14');
      cx.fillStyle = cg2;
      roundRect(-cw / 2, -ch / 2, cw, ch, cw * 0.22);
      cx.fill();
      // hood highlight
      cx.fillStyle = 'rgba(255,255,255,0.10)';
      roundRect(-cw * 0.36, -ch * 0.48, cw * 0.72, ch * 0.2, cw * 0.1);
      cx.fill();
      // cabin / windshield
      const wg = cx.createLinearGradient(0, -ch * 0.3, 0, ch * 0.05);
      wg.addColorStop(0, '#101422');
      wg.addColorStop(1, '#39304e');
      cx.fillStyle = wg;
      roundRect(-cw * 0.34, -ch * 0.3, cw * 0.68, ch * 0.36, cw * 0.1);
      cx.fill();
      // roof
      cx.fillStyle = '#c65a24';
      roundRect(-cw * 0.3, -ch * 0.16, cw * 0.6, ch * 0.18, cw * 0.08);
      cx.fill();
      // spoiler
      cx.fillStyle = '#7a2e10';
      roundRect(-cw * 0.44, ch * 0.36, cw * 0.88, ch * 0.08, 4);
      cx.fill();
      // headlights + beams
      cx.fillStyle = '#ffe9a8';
      cx.fillRect(-cw * 0.36, -ch / 2, cw * 0.18, ch * 0.035);
      cx.fillRect(cw * 0.18, -ch / 2, cw * 0.18, ch * 0.035);
      cx.globalAlpha = 0.12;
      cx.fillStyle = '#ffe9a8';
      cx.beginPath();
      cx.moveTo(-cw * 0.3, -ch / 2);
      cx.lineTo(-cw * 0.75, -ch * 1.6);
      cx.lineTo(-cw * 0.05, -ch * 1.6);
      cx.closePath();
      cx.fill();
      cx.beginPath();
      cx.moveTo(cw * 0.3, -ch / 2);
      cx.lineTo(cw * 0.75, -ch * 1.6);
      cx.lineTo(cw * 0.05, -ch * 1.6);
      cx.closePath();
      cx.fill();
      cx.globalAlpha = 1;
      cx.restore();

      // speed lines at screen edges
      if (S.speed > 30 && S.running && !S.paused) {
        cx.strokeStyle = 'rgba(255,180,120,0.12)';
        cx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          const yy = (Date.now() / 3 + i * 173) % H;
          cx.beginPath();
          cx.moveTo(W * 0.03, yy);
          cx.lineTo(W * 0.03, yy + H * 0.06);
          cx.stroke();
          cx.beginPath();
          cx.moveTo(W * 0.97, yy);
          cx.lineTo(W * 0.97, yy + H * 0.06);
          cx.stroke();
        }
      }
    }
    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      cx.beginPath();
      cx.moveTo(x + r, y);
      cx.arcTo(x + w, y, x + w, y + h, r);
      cx.arcTo(x + w, y + h, x, y + h, r);
      cx.arcTo(x, y + h, x, y, r);
      cx.arcTo(x, y, x + w, y, r);
      cx.closePath();
    }

    // ---------- Trace mini-game ----------
    // Letter stroke paths on a 0-100 grid (school-style writing order)
    const PATHS: Record<string, number[][][]> = {
      A: [[[50, 6], [16, 94]], [[50, 6], [84, 94]], [[28, 62], [72, 62]]],
      B: [[[22, 6], [22, 94]], [[22, 6], [60, 6], [74, 18], [74, 36], [60, 48], [22, 48]], [[22, 48], [64, 48], [80, 60], [80, 80], [64, 94], [22, 94]]],
      C: [[[80, 22], [64, 7], [38, 6], [20, 20], [14, 50], [20, 80], [38, 94], [64, 93], [80, 78]]],
      D: [[[22, 6], [22, 94]], [[22, 6], [54, 6], [76, 22], [82, 50], [76, 78], [54, 94], [22, 94]]],
      E: [[[76, 6], [22, 6], [22, 94], [76, 94]], [[22, 50], [66, 50]]],
      F: [[[76, 6], [22, 6], [22, 94]], [[22, 50], [66, 50]]],
      G: [[[80, 22], [64, 7], [38, 6], [20, 20], [14, 50], [20, 80], [38, 94], [64, 93], [80, 80], [80, 56], [54, 56]]],
      H: [[[20, 6], [20, 94]], [[80, 6], [80, 94]], [[20, 50], [80, 50]]],
      I: [[[30, 6], [70, 6]], [[50, 6], [50, 94]], [[30, 94], [70, 94]]],
      J: [[[70, 6], [70, 74], [60, 90], [42, 94], [30, 84], [27, 70]]],
      K: [[[22, 6], [22, 94]], [[76, 6], [24, 54]], [[38, 44], [78, 94]]],
      L: [[[26, 6], [26, 94], [78, 94]]],
      M: [[[14, 94], [14, 6], [50, 62], [86, 6], [86, 94]]],
      N: [[[20, 94], [20, 6], [80, 94], [80, 6]]],
      O: [[[50, 6], [26, 16], [15, 50], [26, 84], [50, 94], [74, 84], [85, 50], [74, 16], [50, 6]]],
      P: [[[22, 94], [22, 6], [62, 6], [78, 18], [78, 40], [62, 52], [22, 52]]],
      Q: [[[50, 6], [26, 16], [15, 50], [26, 84], [50, 94], [74, 84], [85, 50], [74, 16], [50, 6]], [[60, 70], [86, 96]]],
      R: [[[22, 94], [22, 6], [62, 6], [78, 18], [78, 38], [62, 50], [22, 50]], [[44, 50], [80, 94]]],
      S: [[[78, 20], [60, 6], [36, 6], [24, 20], [28, 38], [50, 48], [72, 58], [78, 76], [64, 92], [36, 94], [20, 80]]],
      T: [[[15, 6], [85, 6]], [[50, 6], [50, 94]]],
      U: [[[20, 6], [20, 70], [32, 90], [50, 94], [68, 90], [80, 70], [80, 6]]],
      V: [[[15, 6], [50, 94], [85, 6]]],
      W: [[[10, 6], [30, 94], [50, 40], [70, 94], [90, 6]]],
      X: [[[18, 6], [82, 94]], [[82, 6], [18, 94]]],
      Y: [[[15, 6], [50, 50]], [[85, 6], [50, 50], [50, 94]]],
      Z: [[[18, 6], [82, 6], [18, 94], [82, 94]]],
    };

    const tEl = document.getElementById('trace')!;
    const tCv = document.getElementById('traceCanvas') as HTMLCanvasElement,
      tCx = tCv.getContext('2d')!;
    const clearBtn = document.getElementById('clearBtn')!,
      resultEl = document.getElementById('result')!;
    let guidePts: number[][][] = [],
      numDots: any[] = [],
      strokePts: number[][][] = [],
      drawing = false,
      currentCh = 'A',
      traceDone = false;

    // map 0-100 grid to canvas
    const mapPt = ([x, y]: number[]) => [40 + x * 2.4, 40 + y * 3.0];

    function buildPaths(ch: string) {
      guidePts = [];
      numDots = [];
      let n = 0;
      for (const stroke of PATHS[ch]) {
        const pts = stroke.map(mapPt);
        // dense guide points (for drawing path + scoring)
        const dense: number[][] = [];
        for (let i = 1; i < pts.length; i++) {
          const [x0, y0] = pts[i - 1],
            [x1, y1] = pts[i];
          const d = Math.hypot(x1 - x0, y1 - y0),
            steps = Math.max(1, Math.round(d / 5));
          for (let k = 0; k <= steps; k++) dense.push([x0 + ((x1 - x0) * k) / steps, y0 + ((y1 - y0) * k) / steps]);
        }
        guidePts.push(dense);
        // numbered dots every ~34px along the stroke
        let acc = 999;
        for (let i = 0; i < dense.length; i++) {
          if (i > 0) acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
          if (acc >= 34 || i === dense.length - 1) {
            acc = 0;
            numDots.push({ x: dense[i][0], y: dense[i][1], n: ++n, hit: false });
          }
        }
      }
    }

    function startTrace(ch: string) {
      currentCh = ch;
      S.paused = true;
      traceDone = false;
      tEl.style.display = 'flex';
      document.getElementById('traceTitle')!.textContent = 'Draw the letter ' + ch;
      setupTraceCanvas(ch);
    }
    function setupTraceCanvas(ch: string) {
      clearTimeout(finishTimer);
      strokePts = [];
      resultEl.textContent = 'Follow the numbers 1 → 2 → 3 ...';
      buildPaths(ch);
      redrawTraceView();
    }
    function redrawTraceView(liveScore?: number) {
      tCx.clearRect(0, 0, 320, 380);
      // thick gray guide path
      tCx.strokeStyle = 'rgba(200,200,210,0.28)';
      tCx.lineWidth = 26;
      tCx.lineCap = 'round';
      tCx.lineJoin = 'round';
      for (const dense of guidePts) {
        tCx.beginPath();
        dense.forEach(([x, y], i) => (i ? tCx.lineTo(x, y) : tCx.moveTo(x, y)));
        tCx.stroke();
      }
      // kid's stroke
      tCx.strokeStyle = '#4dd2ff';
      tCx.lineWidth = 14;
      for (const seg of strokePts) {
        tCx.beginPath();
        seg.forEach(([x, y], i) => (i ? tCx.lineTo(x, y) : tCx.moveTo(x, y)));
        tCx.stroke();
      }
      // numbered dots on top
      for (const d of numDots) {
        tCx.fillStyle = d.hit ? '#5dff9d' : '#ffc107';
        tCx.beginPath();
        tCx.arc(d.x, d.y, 13, 0, 7);
        tCx.fill();
        tCx.strokeStyle = 'rgba(0,0,0,0.25)';
        tCx.lineWidth = 2;
        tCx.stroke();
        tCx.fillStyle = '#4a3200';
        tCx.font = 'bold 12px Arial';
        tCx.textAlign = 'center';
        tCx.textBaseline = 'middle';
        tCx.fillText(d.n, d.x, d.y);
      }
      if (liveScore !== undefined && !traceDone)
        resultEl.innerHTML =
          'Progress: <span style="color:' + (liveScore >= 80 ? '#5dff9d' : '#ffc107') + '">' + liveScore + '%</span> — need 80%';
    }
    function tPos(e: PointerEvent) {
      const r = tCv.getBoundingClientRect();
      return [((e.clientX - r.left) * 320) / r.width, ((e.clientY - r.top) * 380) / r.height];
    }
    function allDrawnPts() {
      const pts: number[][] = [];
      for (const seg of strokePts)
        for (let i = 0; i < seg.length; i++) {
          pts.push(seg[i]);
          if (i > 0) {
            const [x0, y0] = seg[i - 1],
              [x1, y1] = seg[i];
            const d = Math.hypot(x1 - x0, y1 - y0),
              n = Math.floor(d / 6);
            for (let k = 1; k < n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
          }
        }
      return pts;
    }
    function scoreTrace() {
      const pts = allDrawnPts();
      if (!pts.length) return 0;
      const R = 22;
      // mark numbered dots as hit
      for (const d of numDots)
        if (!d.hit && pts.some(([px, py]) => (px - d.x) * (px - d.x) + (py - d.y) * (py - d.y) < R * R)) d.hit = true;
      // coverage over dense guide path
      let hit = 0,
        total = 0;
      for (const dense of guidePts)
        for (const [tx, ty] of dense) {
          total++;
          if (pts.some(([px, py]) => (px - tx) * (px - tx) + (py - ty) * (py - ty) < R * R)) hit++;
        }
      return Math.round((hit / total) * 100);
    }
    function guideLength() {
      let len = 0;
      for (const dense of guidePts)
        for (let i = 1; i < dense.length; i++) len += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
      return len;
    }
    function drawnLength() {
      let len = 0;
      for (const seg of strokePts) for (let i = 1; i < seg.length; i++) len += Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1]);
      return len;
    }
    let finishTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    function evaluate() {
      if (traceDone) return;
      const score = scoreTrace(); // updates dot colors too
      redrawTraceView(score);
      // finish instantly only when ALL numbered dots are hit (100%)
      if (numDots.every((d) => d.hit)) {
        finish(score);
      }
    }
    function finish(score: number) {
      clearTimeout(finishTimer);
      traceDone = true;
      resultEl.innerHTML = '🎉 Great! <span style="color:#5dff9d">' + score + '%</span> — Letter ' + currentCh + ' done!';
      setTimeout(continueRace, 1200); // AUTO continue race
    }
    function checkAfterPause() {
      if (traceDone || drawing) return;
      const score = scoreTrace();
      if (score >= 80) {
        finish(score); // kid stopped drawing & has 80%+ -> success
      } else if (drawnLength() > guideLength() * 1.6) {
        resultEl.innerHTML = '😅 Only <span style="color:#ff7b6b">' + score + "%</span> — let's try again!";
        setTimeout(() => setupTraceCanvas(currentCh), 1200); // AUTO redraw
      } else {
        resultEl.innerHTML = 'Progress: <span style="color:#ffc107">' + score + '%</span> — keep drawing! ✏️';
      }
    }
    const onTraceDown = (e: PointerEvent) => {
      e.preventDefault();
      if (traceDone) return;
      clearTimeout(finishTimer); // kid continues drawing -> cancel pending check
      drawing = true;
      strokePts.push([tPos(e)]);
    };
    const onTraceMove = (e: PointerEvent) => {
      if (!drawing || traceDone) return;
      e.preventDefault();
      strokePts[strokePts.length - 1].push(tPos(e));
      evaluate();
    };
    const onWindowPointerUp = () => {
      if (drawing) {
        drawing = false;
        evaluate();
        clearTimeout(finishTimer);
        finishTimer = setTimeout(checkAfterPause, 1500); // wait — kid may draw next stroke
      }
    };
    tCv.addEventListener('pointerdown', onTraceDown);
    tCv.addEventListener('pointermove', onTraceMove);
    addEventListener('pointerup', onWindowPointerUp);
    const onClear = () => {
      if (!traceDone) setupTraceCanvas(currentCh);
    };
    clearBtn.addEventListener('click', onClear);

    function continueRace() {
      tEl.style.display = 'none';
      S.paused = false;
      S.money += 50; // letter bonus
      S.letterIdx++;
      S.nextLetterAt = S.dist + 100; // next letter after 100 m
      S.level = 1 + Math.floor(S.letterIdx / 5);
      S.speed *= 0.5; // gentle restart
    }

    // ---------- Loop ----------
    let last = performance.now();
    function loop(now: number) {
      if (cancelled) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      render();
      mainRaf = requestAnimationFrame(loop);
    }
    mainRaf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(mainRaf);
      clearTimeout(finishTimer);
      removeEventListener('resize', resize);
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
      removeEventListener('pointerup', onWindowPointerUp);
      cv.removeEventListener('pointerdown', onCvDown);
      cv.removeEventListener('pointermove', onCvMove);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => cv.removeEventListener(ev, onCvUp));
      btnCleanups.forEach((fn) => fn());
      restartBtn.removeEventListener('click', onRestart);
      tCv.removeEventListener('pointerdown', onTraceDown);
      tCv.removeEventListener('pointermove', onTraceMove);
      clearBtn.removeEventListener('click', onClear);
    };
  }, []);

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        html,body { height:100%; background:#0a0a12; overflow:hidden; font-family:'Segoe UI',Arial,sans-serif; }
        #wrap { position:relative; margin:0 auto; height:100vh; max-width:480px; }
        #wrap canvas#game { display:block; width:100%; height:100%; touch-action:none; }

        /* HUD */
        #hud { position:absolute; top:0; left:0; right:0; padding:14px 16px; display:flex; justify-content:space-between; align-items:flex-start; pointer-events:none; color:#fff; }
        #money { font-size:30px; font-weight:800; }
        #best { font-size:11px; color:#c9a; letter-spacing:1px; }
        #level { background:rgba(0,0,0,.45); padding:6px 12px; border-radius:16px; font-size:13px; font-weight:700; color:#ffb347; }
        #banner { position:absolute; top:74px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.55); color:#eee; padding:7px 16px; border-radius:18px; font-size:12px; font-weight:600; white-space:nowrap; pointer-events:none; }
        #dist { position:absolute; top:110px; left:50%; transform:translateX(-50%); color:#ffcf9f; font-size:13px; font-weight:700; pointer-events:none; text-shadow:0 1px 3px #000; }

        /* Controls */
        .btn { position:absolute; bottom:26px; width:86px; height:86px; border-radius:50%; border:none;
          background:rgba(255,140,50,.18); border:2px solid rgba(255,160,80,.55); color:#ffb976;
          font-size:38px; font-weight:800; user-select:none; touch-action:none; }
        .btn:active { background:rgba(255,140,50,.45); }
        #leftBtn { left:20px; } #rightBtn { right:20px; }

        /* Trace overlay */
        #trace { position:absolute; inset:0; background:linear-gradient(#1a1026,#2b1230); display:none; flex-direction:column; align-items:center; z-index:10; }
        #trace h2 { color:#ffb347; margin-top:20px; font-size:22px; }
        #trace p { color:#d8c8e8; font-size:13px; margin:6px 14px 10px; text-align:center; }
        #traceCanvas { background:rgba(255,255,255,.05); border:2px dashed rgba(255,180,100,.4); border-radius:16px; touch-action:none; width:320px; height:380px; }
        #traceBtns { display:flex; gap:14px; margin-top:16px; }
        .tbtn { padding:13px 28px; border:none; border-radius:26px; font-size:16px; font-weight:800; color:#fff; }
        #clearBtn { background:#6c4bd3; }
        #result { color:#fff; font-size:18px; font-weight:800; margin-top:12px; min-height:24px; }

        /* Game over */
        #over { position:absolute; inset:0; background:rgba(5,3,10,.85); display:none; flex-direction:column; align-items:center; justify-content:center; z-index:20; color:#fff; }
        #over h1 { color:#ff6b4a; font-size:34px; } #over p { margin:10px; font-size:16px; }
        #restartBtn { margin-top:14px; padding:14px 40px; border:none; border-radius:28px; background:#ff8c32; color:#fff; font-size:18px; font-weight:800; }
      `}</style>

      <div id="wrap">
        <canvas id="game"></canvas>

        <div id="hud">
          <div>
            <div id="money">$0</div>
            <div id="best">BEST $0</div>
          </div>
          <div id="level">🔥 LEVEL 1</div>
        </div>
        <div id="banner">🏁 FREE DRIVE — collect letters A to Z!</div>
        <div id="dist">0 m • Next: A</div>

        <button className="btn" id="leftBtn">
          ◀
        </button>
        <button className="btn" id="rightBtn">
          ▶
        </button>

        <div id="trace">
          <h2 id="traceTitle">Draw the letter A</h2>
          <p>
            Trace over the dotted letter with your finger.
            <br />
            You need <b>80%</b> to continue the race!
          </p>
          <canvas id="traceCanvas" width={320} height={380}></canvas>
          <div id="result"></div>
          <div id="traceBtns">
            <button className="tbtn" id="clearBtn">
              ↺ Clear
            </button>
          </div>
        </div>

        <div id="over">
          <h1>💥 CRASH!</h1>
          <p id="overStats"></p>
          <button id="restartBtn">🔄 Play Again</button>
        </div>
      </div>
    </>
  );
}
