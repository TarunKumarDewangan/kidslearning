'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function HindiPage() {
  useEffect(() => {
    const drawingCanvas = document.getElementById('drawing-canvas') as HTMLCanvasElement,
      userCanvas = document.getElementById('user-canvas') as HTMLCanvasElement;
    const dCtx = drawingCanvas.getContext('2d')!,
      uCtx = userCanvas.getContext('2d')!;
    const instructionText = document.getElementById('instruction-text')!,
      canvasContainer = document.getElementById('canvas-container')!;
    const swarSelector = document.getElementById('swar-selector')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const animationContainer = document.getElementById('animation-container')!,
      modalTitle = document.getElementById('modal-title')!;
    const resetBtn = document.getElementById('reset-btn')!,
      showExampleBtn = document.getElementById('show-example-btn')!;
    const nextSwarBtn = document.getElementById('next-swar-btn')!;

    let isDrawing = false,
      isAnimatingGuide = false,
      currentSwar = 'अ';
    let dots: ({ x: number; y: number } | null)[] = [],
      keyPoints: ({ x: number; y: number } | null)[] = [];
    let nextDotIndex = 0;
    const HIT_RADIUS = 35,
      DOT_SPACING = 10;
    let cancelled = false;
    let loopRaf = 0;
    let demoRaf = 0;

    // --- KEY POINTS for Hindi Swar (Detailed Paths) ---
    type SwarData = { points: ({ x: number; y: number } | null)[]; name: string };
    const keyPointsData: Record<string, SwarData> = {
      अ: {
        points: [
          { x: 120, y: 170 }, { x: 130, y: 140 }, { x: 170, y: 120 }, { x: 210, y: 140 }, { x: 220, y: 170 }, { x: 210, y: 200 }, { x: 170, y: 220 },
          null, { x: 170, y: 220 }, { x: 230, y: 235 }, { x: 250, y: 275 }, { x: 230, y: 315 }, { x: 170, y: 350 }, { x: 95, y: 320 },
          null, { x: 175, y: 230 }, { x: 260, y: 230 },
          null, { x: 260, y: 120 }, { x: 260, y: 350 },
          null, { x: 90, y: 120 }, { x: 320, y: 120 },
        ],
        name: 'A',
      },
      आ: {
        points: [
          { x: 100, y: 170 }, { x: 110, y: 140 }, { x: 150, y: 120 }, { x: 190, y: 140 }, { x: 200, y: 170 }, { x: 190, y: 200 }, { x: 150, y: 220 },
          null, { x: 150, y: 220 }, { x: 210, y: 235 }, { x: 230, y: 275 }, { x: 210, y: 315 }, { x: 150, y: 350 }, { x: 80, y: 320 },
          null, { x: 155, y: 230 }, { x: 240, y: 230 },
          null, { x: 240, y: 120 }, { x: 240, y: 350 },
          null, { x: 310, y: 120 }, { x: 310, y: 350 },
          null, { x: 70, y: 120 }, { x: 350, y: 120 },
        ],
        name: 'AA',
      },
      इ: {
        points: [
          { x: 200, y: 120 }, { x: 200, y: 150 },
          null, { x: 200, y: 150 }, { x: 160, y: 155 }, { x: 140, y: 180 }, { x: 140, y: 210 }, { x: 180, y: 235 },
          { x: 230, y: 250 }, { x: 250, y: 280 }, { x: 250, y: 320 }, { x: 210, y: 345 },
          { x: 160, y: 360 }, { x: 130, y: 335 }, { x: 230, y: 390 },
          null, { x: 110, y: 120 }, { x: 290, y: 120 },
        ],
        name: 'I',
      },
      ई: {
        points: [
          { x: 200, y: 120 }, { x: 200, y: 150 },
          null, { x: 200, y: 150 }, { x: 160, y: 155 }, { x: 140, y: 180 }, { x: 140, y: 210 }, { x: 180, y: 235 },
          { x: 230, y: 250 }, { x: 250, y: 280 }, { x: 250, y: 320 }, { x: 210, y: 345 },
          { x: 160, y: 360 }, { x: 130, y: 335 }, { x: 230, y: 390 },
          null, { x: 110, y: 120 }, { x: 290, y: 120 },
          null, { x: 200, y: 120 }, { x: 210, y: 80 }, { x: 240, y: 65 }, { x: 270, y: 90 },
        ],
        name: 'EE',
      },
      उ: {
        points: [
          { x: 150, y: 170 }, { x: 160, y: 140 }, { x: 210, y: 120 }, { x: 260, y: 140 }, { x: 270, y: 170 }, { x: 260, y: 200 }, { x: 210, y: 220 },
          null, { x: 210, y: 220 }, { x: 280, y: 235 }, { x: 300, y: 275 }, { x: 280, y: 315 }, { x: 210, y: 350 }, { x: 140, y: 320 },
          null, { x: 110, y: 120 }, { x: 320, y: 120 },
        ],
        name: 'U',
      },
      ऊ: {
        points: [
          { x: 150, y: 170 }, { x: 160, y: 140 }, { x: 210, y: 120 }, { x: 260, y: 140 }, { x: 270, y: 170 }, { x: 260, y: 200 }, { x: 210, y: 220 },
          null, { x: 210, y: 220 }, { x: 280, y: 235 }, { x: 300, y: 275 }, { x: 280, y: 315 }, { x: 210, y: 350 }, { x: 140, y: 320 },
          null, { x: 245, y: 230 }, { x: 300, y: 260 }, { x: 340, y: 240 },
          null, { x: 110, y: 120 }, { x: 340, y: 120 },
        ],
        name: 'OO',
      },
      ऋ: {
        points: [
          { x: 250, y: 130 }, { x: 250, y: 350 },
          null, { x: 250, y: 240 }, { x: 180, y: 180 }, { x: 130, y: 190 },
          null, { x: 250, y: 240 }, { x: 180, y: 300 }, { x: 130, y: 290 },
          null, { x: 250, y: 220 }, { x: 290, y: 190 }, { x: 330, y: 190 }, { x: 300, y: 250 }, { x: 350, y: 310 },
          null, { x: 120, y: 130 }, { x: 360, y: 130 },
        ],
        name: 'RI',
      },
      ए: {
        points: [
          { x: 220, y: 130 }, { x: 220, y: 230 }, { x: 130, y: 350 },
          null, { x: 310, y: 130 }, { x: 310, y: 250 }, { x: 220, y: 250 },
          null, { x: 120, y: 130 }, { x: 360, y: 130 },
        ],
        name: 'E',
      },
      ऐ: {
        points: [
          { x: 220, y: 130 }, { x: 220, y: 230 }, { x: 130, y: 350 },
          null, { x: 310, y: 130 }, { x: 310, y: 250 }, { x: 220, y: 250 },
          null, { x: 120, y: 130 }, { x: 360, y: 130 },
          null, { x: 260, y: 130 }, { x: 210, y: 60 },
        ],
        name: 'AI',
      },
      ओ: {
        points: [
          { x: 100, y: 170 }, { x: 110, y: 140 }, { x: 150, y: 120 }, { x: 190, y: 140 }, { x: 200, y: 170 }, { x: 190, y: 200 }, { x: 150, y: 220 },
          null, { x: 150, y: 220 }, { x: 210, y: 235 }, { x: 230, y: 275 }, { x: 210, y: 315 }, { x: 150, y: 350 }, { x: 80, y: 320 },
          null, { x: 155, y: 230 }, { x: 240, y: 230 },
          null, { x: 240, y: 120 }, { x: 240, y: 350 },
          null, { x: 310, y: 120 }, { x: 310, y: 350 },
          null, { x: 260, y: 60 }, { x: 310, y: 120 },
          null, { x: 70, y: 120 }, { x: 350, y: 120 },
        ],
        name: 'O',
      },
      औ: {
        points: [
          { x: 100, y: 170 }, { x: 110, y: 140 }, { x: 150, y: 120 }, { x: 190, y: 140 }, { x: 200, y: 170 }, { x: 190, y: 200 }, { x: 150, y: 220 },
          null, { x: 150, y: 220 }, { x: 210, y: 235 }, { x: 230, y: 275 }, { x: 210, y: 315 }, { x: 150, y: 350 }, { x: 80, y: 320 },
          null, { x: 155, y: 230 }, { x: 240, y: 230 },
          null, { x: 240, y: 120 }, { x: 240, y: 350 },
          null, { x: 310, y: 120 }, { x: 310, y: 350 },
          null, { x: 260, y: 60 }, { x: 310, y: 120 }, null, { x: 210, y: 60 }, { x: 310, y: 120 },
          null, { x: 70, y: 120 }, { x: 350, y: 120 },
        ],
        name: 'AU',
      },
      अं: {
        points: [
          { x: 120, y: 170 }, { x: 130, y: 140 }, { x: 170, y: 120 }, { x: 210, y: 140 }, { x: 220, y: 170 }, { x: 210, y: 200 }, { x: 170, y: 220 },
          null, { x: 170, y: 220 }, { x: 230, y: 235 }, { x: 250, y: 275 }, { x: 230, y: 315 }, { x: 170, y: 350 }, { x: 95, y: 320 },
          null, { x: 175, y: 230 }, { x: 260, y: 230 },
          null, { x: 260, y: 120 }, { x: 260, y: 350 },
          null, { x: 260, y: 80 }, { x: 260, y: 81 },
          null, { x: 90, y: 120 }, { x: 320, y: 120 },
        ],
        name: 'AM',
      },
      अः: {
        points: [
          { x: 120, y: 170 }, { x: 130, y: 140 }, { x: 170, y: 120 }, { x: 210, y: 140 }, { x: 220, y: 170 }, { x: 210, y: 200 }, { x: 170, y: 220 },
          null, { x: 170, y: 220 }, { x: 230, y: 235 }, { x: 250, y: 275 }, { x: 230, y: 315 }, { x: 170, y: 350 }, { x: 95, y: 320 },
          null, { x: 175, y: 230 }, { x: 260, y: 230 },
          null, { x: 260, y: 120 }, { x: 260, y: 350 },
          null, { x: 330, y: 200 }, { x: 330, y: 201 }, null, { x: 330, y: 270 }, { x: 330, y: 271 },
          null, { x: 90, y: 120 }, { x: 320, y: 120 },
        ],
        name: 'AH',
      },
    };

    function generateDetailedPath(kp: ({ x: number; y: number } | null)[]) {
      const path: { dots: ({ x: number; y: number } | null)[] } = { dots: [] };
      for (let i = 0; i < kp.length - 1; i++) {
        const p1 = kp[i],
          p2 = kp[i + 1];
        if (!p1) continue;
        if (!p2) {
          path.dots.push(p1);
          path.dots.push(null);
          continue;
        }
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const segments = Math.max(1, Math.floor(dist / DOT_SPACING));
        for (let j = 0; j < segments; j++) {
          const t = j / segments;
          path.dots.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
        }
      }
      path.dots.push(kp[kp.length - 1]);
      return path;
    }

    function drawSmoothLine(
      ctx: CanvasRenderingContext2D,
      points: ({ x: number; y: number } | null)[],
      color: string,
      width: number,
      upToIndex = points.length
    ) {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < upToIndex; i++) {
        const p = points[i];
        if (!p) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    function drawGuide(pulse = 0) {
      dCtx.clearRect(0, 0, 400, 400);
      drawSmoothLine(dCtx, keyPoints, 'rgba(255, 255, 255, 0.08)', 45);
      drawSmoothLine(dCtx, keyPoints, 'rgba(255, 255, 255, 0.05)', 35);
      dCtx.shadowBlur = 15;
      dCtx.shadowColor = '#51cf66';
      drawSmoothLine(dCtx, dots, '#51cf66', 22, nextDotIndex);
      dCtx.shadowBlur = 0;
      const target = dots[nextDotIndex];
      if (target && !isAnimatingGuide) {
        dCtx.fillStyle = `rgba(255, 146, 43, ${0.4 + pulse * 0.1})`;
        dCtx.beginPath();
        dCtx.arc(target.x, target.y, 14 + pulse, 0, Math.PI * 2);
        dCtx.fill();
        dCtx.strokeStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.1})`;
        dCtx.lineWidth = 2;
        dCtx.beginPath();
        dCtx.arc(target.x, target.y, 20 + pulse * 2, 0, Math.PI * 2);
        dCtx.stroke();
      }
    }

    function loadSwar(s: string) {
      currentSwar = s;
      keyPoints = keyPointsData[s].points;
      const path = generateDetailedPath(keyPoints);
      dots = path.dots;
      nextDotIndex = 0;
      instructionText.textContent = `Excellent! Now trace ${currentSwar}!`;
      document.querySelectorAll('.swar-btn').forEach((b) => b.classList.toggle('active', b.textContent === s));
    }

    function showSuccess() {
      modalTitle.innerHTML = `🎉 Amazing! <span class="text-warning">${currentSwar}</span>! 🎉`;
      animationContainer.innerHTML = `<div class="shape-wrapper"><div class="reward-text-big">${currentSwar}</div></div>`;
      playSuccessChime();
      speak(currentSwar);
      successModal.show();
    }

    function playSuccessChime() {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const aCtx = new AudioCtx();
      const osc = aCtx.createOscillator();
      const gain = aCtx.createGain();
      osc.connect(gain);
      gain.connect(aCtx.destination);
      osc.frequency.setValueAtTime(523, aCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046, aCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, aCtx.currentTime);
      osc.start();
      osc.stop(aCtx.currentTime + 0.3);
    }

    function speak(text: string) {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'hi-IN';
        utter.rate = 0.8;
        window.speechSynthesis.speak(utter);
      }
    }

    function getMousePos(e: MouseEvent | TouchEvent) {
      const rect = userCanvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) * (400 / rect.width), y: (cy - rect.top) * (400 / rect.height) };
    }

    function startDrawing(e: MouseEvent | TouchEvent) {
      isDrawing = true;
      void e;
    }

    function stopDrawing() {
      isDrawing = false;
      uCtx.clearRect(0, 0, 400, 400);
    }

    function handleDrawing(e: MouseEvent | TouchEvent) {
      if (!isDrawing || isAnimatingGuide) return;
      const pos = getMousePos(e);
      uCtx.clearRect(0, 0, 400, 400);
      uCtx.shadowBlur = 10;
      uCtx.shadowColor = 'white';
      uCtx.strokeStyle = 'white';
      uCtx.lineWidth = 14;
      uCtx.lineCap = 'round';
      uCtx.beginPath();
      uCtx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      uCtx.fillStyle = 'white';
      uCtx.fill();
      uCtx.shadowBlur = 0;
      const target = dots[nextDotIndex];
      if (target && Math.hypot(pos.x - target.x, pos.y - target.y) < HIT_RADIUS) {
        nextDotIndex++;
        while (dots[nextDotIndex] === null && nextDotIndex < dots.length) nextDotIndex++;
        if (nextDotIndex >= dots.length) showSuccess();
      }
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      startDrawing(e);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      handleDrawing(e);
    }

    userCanvas.addEventListener('mousedown', startDrawing);
    window.addEventListener('mouseup', stopDrawing);
    userCanvas.addEventListener('mousemove', handleDrawing);
    userCanvas.addEventListener('touchstart', onTouchStart);
    userCanvas.addEventListener('touchend', stopDrawing);
    userCanvas.addEventListener('touchmove', onTouchMove);

    function runGuideAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;
      canvasContainer.classList.add('disabled');
      instructionText.textContent = `Watch and learn! Tracing ${currentSwar}...`;
      let startTime: number | null = null;
      const duration = 2500;
      const segments: { s: { x: number; y: number }; e: { x: number; y: number }; len: number }[] = [];
      let totalLength = 0;
      for (let i = 0; i < keyPoints.length - 1; i++) {
        if (keyPoints[i] && keyPoints[i + 1]) {
          const len = Math.hypot(keyPoints[i + 1]!.x - keyPoints[i]!.x, keyPoints[i + 1]!.y - keyPoints[i]!.y);
          segments.push({ s: keyPoints[i]!, e: keyPoints[i + 1]!, len });
          totalLength += len;
        }
      }
      function animate(ts: number) {
        if (!startTime) startTime = ts;
        const prog = Math.min((ts - startTime) / duration, 1);
        dCtx.clearRect(0, 0, 400, 400);
        drawGuide(0);
        const showLen = totalLength * prog;
        let currentLen = 0;
        let curPos = segments[0] ? segments[0].s : { x: 200, y: 200 };
        dCtx.strokeStyle = '#339af0';
        dCtx.lineWidth = 25;
        dCtx.lineCap = 'round';
        dCtx.beginPath();
        let started = false;
        for (const seg of segments) {
          if (currentLen + seg.len > showLen) {
            const sp = (showLen - currentLen) / seg.len;
            curPos = { x: seg.s.x + (seg.e.x - seg.s.x) * sp, y: seg.s.y + (seg.e.y - seg.s.y) * sp };
            if (!started) {
              dCtx.moveTo(seg.s.x, seg.s.y);
              started = true;
            }
            dCtx.lineTo(curPos.x, curPos.y);
            break;
          }
          if (!started) {
            dCtx.moveTo(seg.s.x, seg.s.y);
            started = true;
          } else dCtx.lineTo(seg.e.x, seg.e.y);
          currentLen += seg.len;
          curPos = seg.e;
        }
        dCtx.stroke();
        uCtx.clearRect(0, 0, 400, 400);
        uCtx.beginPath();
        uCtx.arc(curPos.x, curPos.y, 18, 0, Math.PI * 2);
        uCtx.fillStyle = 'rgba(51, 154, 240, 0.8)';
        uCtx.fill();
        uCtx.shadowBlur = 10;
        uCtx.shadowColor = 'white';
        uCtx.strokeStyle = 'white';
        uCtx.lineWidth = 4;
        uCtx.stroke();
        uCtx.shadowBlur = 0;
        if (prog < 1) {
          demoRaf = requestAnimationFrame(animate);
        } else {
          isAnimatingGuide = false;
          canvasContainer.classList.remove('disabled');
          instructionText.textContent = `Your turn! Trace ${currentSwar}!`;
          uCtx.clearRect(0, 0, 400, 400);
        }
      }
      demoRaf = requestAnimationFrame(animate);
    }

    function onSelectorClick(e: Event) {
      const target = e.target as HTMLElement;
      if (target.matches('.swar-btn')) loadSwar(target.textContent!);
    }
    function onReset() {
      nextDotIndex = 0;
      uCtx.clearRect(0, 0, 400, 400);
    }
    function onNextSwar() {
      const swars = Object.keys(keyPointsData);
      const idx = (swars.indexOf(currentSwar) + 1) % swars.length;
      successModal.hide();
      loadSwar(swars[idx]);
    }

    swarSelector.innerHTML = Object.keys(keyPointsData)
      .map((s) => `<button class="swar-btn">${s}</button>`)
      .join('');
    swarSelector.addEventListener('click', onSelectorClick);
    resetBtn.addEventListener('click', onReset);
    showExampleBtn.addEventListener('click', runGuideAnimation);
    nextSwarBtn.addEventListener('click', onNextSwar);

    function loop() {
      if (cancelled) return;
      drawGuide(Math.sin(Date.now() * 0.008) * 3);
      loopRaf = requestAnimationFrame(loop);
    }
    loadSwar('अ');
    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(loopRaf);
      cancelAnimationFrame(demoRaf);
      userCanvas.removeEventListener('mousedown', startDrawing);
      window.removeEventListener('mouseup', stopDrawing);
      userCanvas.removeEventListener('mousemove', handleDrawing);
      userCanvas.removeEventListener('touchstart', onTouchStart);
      userCanvas.removeEventListener('touchend', stopDrawing);
      userCanvas.removeEventListener('touchmove', onTouchMove);
      swarSelector.removeEventListener('click', onSelectorClick);
      resetBtn.removeEventListener('click', onReset);
      showExampleBtn.removeEventListener('click', runGuideAnimation);
      nextSwarBtn.removeEventListener('click', onNextSwar);
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body {
            background: #1a1a1a;
            font-family: 'Noto Sans Devanagari', 'Outfit', sans-serif;
            color: white;
        }

        .hindi-title {
            font-family: 'Lilita One', cursive;
            color: #ffd43b;
            text-shadow: 2px 2px 0px #e67e22, 4px 4px 10px rgba(0, 0, 0, 0.5);
        }

        .canvas-container {
            position: relative;
            display: inline-block;
            width: 400px;
            height: 400px;
            background-color: #2b2b2b;
            background-image:
                radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
            border: 15px solid #5d4037;
            border-radius: 10px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.8);
            overflow: hidden;
        }

        .canvas-container.disabled {
            opacity: 0.8;
            pointer-events: none;
        }

        canvas {
            position: absolute;
            top: 0;
            left: 0;
            transition: filter 0.3s ease;
        }

        #drawing-canvas {
            z-index: 1;
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
        }

        #user-canvas {
            z-index: 2;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="rgba(255, 255, 255, 0.4)" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="2" fill="white"/></svg>') 20 20, crosshair;
        }

        .swar-btn {
            width: 55px;
            height: 55px;
            border-radius: 12px;
            border: 3px solid #51cf66;
            background: #2b2b2b;
            color: #51cf66;
            font-weight: bold;
            font-size: 1.6rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .swar-btn:hover {
            background: #343a40;
            transform: translateY(-3px);
        }

        .swar-btn.active {
            background: #51cf66;
            color: white;
            box-shadow: 0 8px 20px rgba(81, 207, 102, 0.4);
            transform: scale(1.1);
        }

        .action-buttons button {
            border: none;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            color: white;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
            transition: all 0.2s;
            margin: 0 10px;
        }

        .btn-watch {
            background: #339af0;
        }

        .btn-reset {
            background: #fa5252;
        }

        .btn-watch:hover,
        .btn-reset:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }

        .modal-content {
            border-radius: 30px;
            border: 8px solid #51cf66;
            background: #2b2b2b;
            color: white;
        }

        .modal-title {
            font-family: 'Lilita One', cursive;
            font-size: 2.8rem;
            color: #51cf66;
        }

        .shape-wrapper {
            width: 280px;
            height: 280px;
            margin: 30px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 40px;
            background: #343a40;
            border: 5px dashed #51cf66;
            animation: slate-pulse 2s infinite alternate;
        }

        @keyframes slate-pulse {
            from {
                box-shadow: 0 0 20px rgba(81, 207, 102, 0.2);
            }

            to {
                box-shadow: 0 0 40px rgba(81, 207, 102, 0.5);
            }
        }

        .reward-text-big {
            font-size: 10rem;
            color: white;
            text-shadow: 0 0 20px #51cf66;
        }

        .text-label {
            font-size: 2rem;
            font-weight: bold;
            margin-top: 20px;
            color: #ffd43b;
        }
      `}</style>

      <div className="container text-center my-3">
        <div className="d-flex justify-content-center gap-2 mb-3">
          <Link href="/" className="btn btn-outline-light">
            🏠 Home Menu
          </Link>
        </div>
        <h1 className="hindi-title">🕉️ Hindi Swar Adventure 🕉️</h1>

        <div id="instruction-box" className="my-3">
          <p id="instruction-text" className="lead fw-bold text-white">
            Select a Swar to begin!
          </p>
        </div>

        <div id="swar-selector" className="my-4 d-flex flex-wrap justify-content-center gap-2"></div>

        <div id="canvas-wrapper">
          <div className="canvas-container" id="canvas-container">
            <canvas id="drawing-canvas" width={400} height={400}></canvas>
            <canvas id="user-canvas" width={400} height={400}></canvas>
          </div>

          <div className="mt-4 action-buttons">
            <button id="show-example-btn" className="btn-watch">
              Watch How
            </button>
            <button id="reset-btn" className="btn-reset">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="modal fade" id="successModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title w-100 text-center" id="modal-title">
                🎉 Shabash! 🎉
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body text-center" id="animation-container"></div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-success btn-lg w-100" id="next-swar-btn">
                Next Swar →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
