'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function TracerPage() {
  useEffect(() => {
    // --- DOM Elements ---
    const letterCanvas = document.getElementById('drawing-canvas') as HTMLCanvasElement,
      userCanvas = document.getElementById('user-canvas') as HTMLCanvasElement;
    const lCtx = letterCanvas.getContext('2d')!,
      uCtx = userCanvas.getContext('2d')!;
    const instructionText = document.getElementById('instruction-text')!,
      canvasContainer = document.getElementById('canvas-container')!;
    const alphabetSelector = document.getElementById('alphabet-selector')!,
      successModalEl = document.getElementById('successModal')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(successModalEl);
    const animationContainer = document.getElementById('animation-container')!,
      modalTitle = document.getElementById('modal-title')!;
    const nextLetterBtn = document.getElementById('next-letter-btn')!,
      resetBtn = document.getElementById('reset-btn')!,
      showExampleBtn = document.getElementById('show-example-btn')!;

    // --- State & Config ---
    let isDrawing = false,
      isAnimatingGuide = false,
      currentLetter = 'A';
    let dots: ({ x: number; y: number } | null)[] = [],
      dotNumbers: (number | null)[] = [],
      keyPoints: ({ x: number; y: number } | null)[] = [];
    let nextDotIndex = 0;
    const HIT_RADIUS = 30,
      DOT_SPACING = 35;
    let gameLoopRaf = 0;
    let demoRaf = 0;
    let cancelled = false;

    // --- KEY POINTS & ANIMATION DATA (Scaled 400/450) ---
    const keyPointsData: Record<
      string,
      { points: ({ x: number; y: number } | null)[]; emoji: string; word: string }
    > = {
      A: { points: [{ x: 200, y: 71 }, { x: 89, y: 338 }, null, { x: 200, y: 71 }, { x: 311, y: 338 }, null, { x: 133, y: 231 }, { x: 267, y: 231 }], emoji: '🍎', word: 'Apple' },
      B: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 231, y: 53 }, { x: 293, y: 98 }, { x: 293, y: 160 }, { x: 231, y: 196 }, { x: 124, y: 196 }, null, { x: 124, y: 196 }, { x: 249, y: 196 }, { x: 311, y: 249 }, { x: 311, y: 302 }, { x: 249, y: 338 }, { x: 124, y: 338 }], emoji: '⚽', word: 'Ball' },
      C: { points: [{ x: 311, y: 107 }, { x: 293, y: 80 }, { x: 249, y: 58 }, { x: 200, y: 53 }, { x: 151, y: 58 }, { x: 107, y: 80 }, { x: 89, y: 133 }, { x: 89, y: 249 }, { x: 107, y: 302 }, { x: 151, y: 329 }, { x: 200, y: 347 }, { x: 249, y: 342 }, { x: 293, y: 320 }, { x: 311, y: 293 }], emoji: '🐱', word: 'Cat' },
      D: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 249, y: 53 }, { x: 320, y: 124 }, { x: 320, y: 267 }, { x: 249, y: 338 }, { x: 124, y: 338 }], emoji: '🐶', word: 'Dog' },
      E: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 311, y: 53 }, null, { x: 124, y: 196 }, { x: 284, y: 196 }, null, { x: 124, y: 338 }, { x: 311, y: 338 }], emoji: '🐘', word: 'Elephant' },
      F: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 311, y: 53 }, null, { x: 124, y: 196 }, { x: 284, y: 196 }], emoji: '🐟', word: 'Fish' },
      G: { points: [{ x: 311, y: 107 }, { x: 293, y: 80 }, { x: 249, y: 58 }, { x: 200, y: 53 }, { x: 151, y: 58 }, { x: 107, y: 80 }, { x: 89, y: 133 }, { x: 89, y: 249 }, { x: 107, y: 302 }, { x: 151, y: 329 }, { x: 200, y: 347 }, { x: 249, y: 347 }, { x: 311, y: 347 }, { x: 311, y: 213 }, { x: 231, y: 213 }], emoji: '🍇', word: 'Grapes' },
      H: { points: [{ x: 107, y: 53 }, { x: 107, y: 338 }, null, { x: 293, y: 53 }, { x: 293, y: 338 }, null, { x: 107, y: 196 }, { x: 293, y: 196 }], emoji: '🏠', word: 'House' },
      I: { points: [{ x: 142, y: 53 }, { x: 258, y: 53 }, null, { x: 200, y: 53 }, { x: 200, y: 338 }, null, { x: 142, y: 338 }, { x: 258, y: 338 }], emoji: '🧊', word: 'Igloo' },
      J: { points: [{ x: 160, y: 53 }, { x: 293, y: 53 }, null, { x: 249, y: 53 }, { x: 249, y: 284 }, { x: 240, y: 311 }, { x: 213, y: 338 }, { x: 178, y: 347 }, { x: 133, y: 338 }, { x: 107, y: 293 }], emoji: '🏺', word: 'Jug' },
      K: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 311, y: 53 }, { x: 124, y: 196 }, { x: 311, y: 338 }], emoji: '🪁', word: 'Kite' },
      L: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, { x: 311, y: 338 }], emoji: '🦁', word: 'Lion' },
      M: { points: [{ x: 89, y: 338 }, { x: 89, y: 53 }, { x: 200, y: 196 }, { x: 311, y: 53 }, { x: 311, y: 338 }], emoji: '🐒', word: 'Monkey' },
      N: { points: [{ x: 107, y: 338 }, { x: 107, y: 53 }, { x: 293, y: 338 }, { x: 293, y: 53 }], emoji: '🕸️', word: 'Net' },
      O: { points: [{ x: 200, y: 53 }, { x: 249, y: 58 }, { x: 293, y: 80 }, { x: 311, y: 133 }, { x: 311, y: 200 }, { x: 311, y: 267 }, { x: 293, y: 320 }, { x: 249, y: 342 }, { x: 200, y: 347 }, { x: 151, y: 342 }, { x: 107, y: 320 }, { x: 89, y: 267 }, { x: 89, y: 200 }, { x: 89, y: 133 }, { x: 107, y: 80 }, { x: 151, y: 58 }, { x: 200, y: 53 }], emoji: '🍊', word: 'Orange' },
      P: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 249, y: 53 }, { x: 311, y: 116 }, { x: 249, y: 178 }, { x: 124, y: 178 }], emoji: '🦜', word: 'Parrot' },
      Q: { points: [{ x: 200, y: 53 }, { x: 249, y: 58 }, { x: 293, y: 80 }, { x: 311, y: 133 }, { x: 311, y: 200 }, { x: 311, y: 267 }, { x: 293, y: 320 }, { x: 249, y: 342 }, { x: 200, y: 347 }, { x: 151, y: 342 }, { x: 107, y: 320 }, { x: 89, y: 267 }, { x: 89, y: 200 }, { x: 89, y: 133 }, { x: 107, y: 80 }, { x: 151, y: 58 }, { x: 200, y: 53 }, null, { x: 249, y: 276 }, { x: 338, y: 356 }], emoji: '👸', word: 'Queen' },
      R: { points: [{ x: 124, y: 53 }, { x: 124, y: 338 }, null, { x: 124, y: 53 }, { x: 249, y: 53 }, { x: 311, y: 116 }, { x: 249, y: 178 }, { x: 124, y: 178 }, null, { x: 178, y: 178 }, { x: 311, y: 338 }], emoji: '🐰', word: 'Rabbit' },
      S: { points: [{ x: 311, y: 107 }, { x: 267, y: 67 }, { x: 213, y: 53 }, { x: 160, y: 62 }, { x: 124, y: 98 }, { x: 124, y: 160 }, { x: 160, y: 196 }, { x: 213, y: 213 }, { x: 267, y: 231 }, { x: 293, y: 293 }, { x: 267, y: 329 }, { x: 196, y: 347 }, { x: 133, y: 329 }, { x: 98, y: 293 }], emoji: '☀️', word: 'Sun' },
      T: { points: [{ x: 107, y: 53 }, { x: 293, y: 53 }, null, { x: 200, y: 53 }, { x: 200, y: 338 }], emoji: '🐯', word: 'Tiger' },
      U: { points: [{ x: 107, y: 53 }, { x: 107, y: 249 }, { x: 116, y: 284 }, { x: 142, y: 320 }, { x: 200, y: 347 }, { x: 258, y: 320 }, { x: 284, y: 284 }, { x: 293, y: 249 }, { x: 293, y: 53 }], emoji: '☂️', word: 'Umbrella' },
      V: { points: [{ x: 89, y: 53 }, { x: 200, y: 338 }, { x: 311, y: 53 }], emoji: '🚐', word: 'Van' },
      W: { points: [{ x: 71, y: 53 }, { x: 133, y: 338 }, { x: 200, y: 133 }, { x: 267, y: 338 }, { x: 329, y: 53 }], emoji: '⌚', word: 'Watch' },
      X: { points: [{ x: 89, y: 53 }, { x: 311, y: 338 }, null, { x: 311, y: 53 }, { x: 89, y: 338 }], emoji: '🎹', word: 'Xylophone' },
      Y: { points: [{ x: 89, y: 53 }, { x: 200, y: 196 }, { x: 311, y: 53 }, null, { x: 200, y: 196 }, { x: 200, y: 338 }], emoji: '🪀', word: 'Yo-yo' },
      Z: { points: [{ x: 107, y: 53 }, { x: 293, y: 53 }, { x: 107, y: 338 }, { x: 293, y: 338 }], emoji: '🦓', word: 'Zebra' },
    };

    // --- Dot Generation & Drawing ---
    function generateDetailedPath(kp: ({ x: number; y: number } | null)[]) {
      const path: { dots: ({ x: number; y: number } | null)[]; dotNumbers: (number | null)[] } = { dots: [], dotNumbers: [] };
      let dotIdx = 1;
      for (let i = 0; i < kp.length - 1; i++) {
        const p1 = kp[i],
          p2 = kp[i + 1];
        if (!p1) continue;
        if (!p2) {
          path.dots.push(p1);
          path.dotNumbers.push(dotIdx++);
          path.dots.push(null);
          path.dotNumbers.push(null);
          continue;
        }

        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const segments = Math.max(1, Math.floor(dist / DOT_SPACING));
        for (let j = 0; j < segments; j++) {
          path.dots.push({ x: p1.x + (p2.x - p1.x) * (j / segments), y: p1.y + (p2.y - p1.y) * (j / segments) });
          path.dotNumbers.push(dotIdx++);
        }
      }
      if (kp[kp.length - 1]) {
        path.dots.push(kp[kp.length - 1]);
        path.dotNumbers.push(dotIdx);
      }
      return path;
    }

    function drawLetterShadow() {
      lCtx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      lCtx.lineWidth = 25;
      lCtx.lineCap = 'round';
      lCtx.lineJoin = 'round';
      lCtx.beginPath();
      let started = false;
      keyPoints.forEach((p) => {
        if (!p) {
          started = false;
          return;
        }
        if (!started) {
          lCtx.moveTo(p.x, p.y);
          started = true;
        } else {
          lCtx.lineTo(p.x, p.y);
        }
      });
      lCtx.stroke();
    }

    function drawLetterGuide(pulse = 0) {
      lCtx.clearRect(0, 0, 400, 400);
      drawLetterShadow();

      // 1. Dotted Path
      lCtx.beginPath();
      lCtx.setLineDash([5, 10]);
      lCtx.strokeStyle = 'rgba(0,0,0,0.1)';
      lCtx.lineWidth = 20;
      lCtx.lineCap = 'round';
      let started = false;
      keyPoints.forEach((p) => {
        if (!p) {
          started = false;
          return;
        }
        if (!started) {
          lCtx.moveTo(p.x, p.y);
          started = true;
        } else lCtx.lineTo(p.x, p.y);
      });
      lCtx.stroke();
      lCtx.setLineDash([]);

      // 2. User progress path
      lCtx.lineWidth = 20;
      lCtx.lineCap = 'round';
      lCtx.lineJoin = 'round';
      lCtx.strokeStyle = '#28a745';
      lCtx.beginPath();
      started = false;
      for (let i = 0; i < nextDotIndex; i++) {
        if (!dots[i]) {
          started = false;
          continue;
        }
        if (!started) {
          lCtx.moveTo(dots[i]!.x, dots[i]!.y);
          started = true;
        } else {
          lCtx.lineTo(dots[i]!.x, dots[i]!.y);
        }
      }
      lCtx.stroke();

      // 3. Numbered Dots
      for (let i = 0; i < dots.length; i++) {
        if (!dots[i]) continue;
        let radius = 12;
        if (i < nextDotIndex) lCtx.fillStyle = '#28a745';
        else if (i === nextDotIndex) {
          lCtx.fillStyle = '#1e90ff';
          radius += pulse;
        } else lCtx.fillStyle = '#ffc107';

        lCtx.beginPath();
        lCtx.arc(dots[i]!.x, dots[i]!.y, radius, 0, Math.PI * 2);
        lCtx.fill();
        lCtx.strokeStyle = 'white';
        lCtx.lineWidth = 2;
        lCtx.stroke();

        lCtx.fillStyle = i === nextDotIndex ? 'white' : '#343a40';
        lCtx.font = 'bold 13px Arial';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        const num = i < nextDotIndex ? '✓' : dotNumbers[i];
        lCtx.fillText(String(num), dots[i]!.x, dots[i]!.y + 1);
      }
    }

    function gameLoop() {
      if (cancelled) return;
      if (!isAnimatingGuide) {
        const pulse = Math.sin(Date.now() * 0.01) * 3;
        drawLetterGuide(pulse);
      }
      gameLoopRaf = requestAnimationFrame(gameLoop);
    }

    function loadLetter(letter: string) {
      currentLetter = letter;
      keyPoints = keyPointsData[letter].points;
      const path = generateDetailedPath(keyPoints);
      dots = path.dots;
      dotNumbers = path.dotNumbers;
      nextDotIndex = 0;
      instructionText.textContent = `Let's draw ${letter}! Click "Watch How" or start tracing.`;
      document.querySelectorAll('.alphabet-btn').forEach((b) => b.classList.toggle('active', b.textContent === letter));
      uCtx.clearRect(0, 0, 400, 400);
    }

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = userCanvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) * (400 / rect.width), y: (cy - rect.top) * (400 / rect.height) };
    };

    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing || isAnimatingGuide) return;
      e.preventDefault();
      const pos = getMousePos(e);
      uCtx.clearRect(0, 0, 400, 400);
      uCtx.beginPath();
      uCtx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      uCtx.fillStyle = '#ff6347';
      uCtx.fill();

      const target = dots[nextDotIndex];
      if (target && Math.hypot(pos.x - target.x, pos.y - target.y) < HIT_RADIUS) {
        nextDotIndex++;
        while (dots[nextDotIndex] === null && nextDotIndex < dots.length) nextDotIndex++;
        if (nextDotIndex >= dots.length) {
          isDrawing = false;
          setTimeout(showSuccess, 400);
        }
      }
    }

    function showSuccess() {
      modalTitle.innerHTML = `🎉 You traced <span class="text-warning">${currentLetter}</span>! 🎉`;
      animationContainer.innerHTML = '';
      successModal.show();
    }

    function runGuideAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;
      canvasContainer.classList.add('disabled');
      let startTime: number | null = null;
      const duration = 2500;
      const segments: { s: { x: number; y: number }; e: { x: number; y: number }; len: number; isNew: boolean }[] = [];
      let totalLength = 0;
      let isNewStroke = true;

      for (let i = 0; i < keyPoints.length - 1; i++) {
        if (keyPoints[i] === null) {
          isNewStroke = true;
          continue;
        }
        if (keyPoints[i + 1] === null) {
          isNewStroke = true;
          continue;
        }

        const length = Math.hypot(keyPoints[i + 1]!.x - keyPoints[i]!.x, keyPoints[i + 1]!.y - keyPoints[i]!.y);
        segments.push({ s: keyPoints[i]!, e: keyPoints[i + 1]!, len: length, isNew: isNewStroke });
        totalLength += length;
        isNewStroke = false;
      }

      function animateFrame(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        lCtx.clearRect(0, 0, 400, 400);
        drawLetterGuide(0);
        const lengthToShow = totalLength * progress;
        let currentLen = 0;
        let curPos = segments[0] ? segments[0].s : { x: 0, y: 0 };

        lCtx.strokeStyle = '#0dcaf0';
        lCtx.lineWidth = 20;
        lCtx.lineCap = 'round';
        lCtx.beginPath();

        for (const seg of segments) {
          if (seg.isNew) lCtx.moveTo(seg.s.x, seg.s.y);

          if (currentLen + seg.len > lengthToShow) {
            const sp = (lengthToShow - currentLen) / seg.len;
            curPos = { x: seg.s.x + (seg.e.x - seg.s.x) * sp, y: seg.s.y + (seg.e.y - seg.s.y) * sp };
            lCtx.lineTo(curPos.x, curPos.y);
            break;
          }
          lCtx.lineTo(seg.e.x, seg.e.y);
          currentLen += seg.len;
          curPos = seg.e;
        }
        lCtx.stroke();

        // Interaction feedback ball
        uCtx.clearRect(0, 0, 400, 400);
        uCtx.beginPath();
        uCtx.arc(curPos.x, curPos.y, 15, 0, Math.PI * 2);
        uCtx.fillStyle = 'rgba(13, 202, 240, 0.7)';
        uCtx.fill();

        if (progress < 1) {
          demoRaf = requestAnimationFrame(animateFrame);
        } else {
          isAnimatingGuide = false;
          canvasContainer.classList.remove('disabled');
          uCtx.clearRect(0, 0, 400, 400);
        }
      }
      demoRaf = requestAnimationFrame(animateFrame);
    }

    function init() {
      alphabetSelector.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        .split('')
        .map((l) => `<button class="alphabet-btn">${l}</button>`)
        .join('');
      alphabetSelector.addEventListener('click', onSelectorClick);
      nextLetterBtn.addEventListener('click', onNextLetter);
      resetBtn.addEventListener('click', onReset);
      showExampleBtn.addEventListener('click', runGuideAnimation);
      userCanvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      userCanvas.addEventListener('mousemove', draw);
      userCanvas.addEventListener('touchstart', onTouchStart);
      userCanvas.addEventListener('touchend', onMouseUp);
      userCanvas.addEventListener('touchmove', draw);
      loadLetter('A');
      gameLoop();
    }

    function onSelectorClick(e: Event) {
      const target = e.target as HTMLElement;
      if (target.matches('.alphabet-btn')) loadLetter(target.textContent!);
    }
    function onNextLetter() {
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const idx = (alpha.indexOf(currentLetter) + 1) % alpha.length;
      successModal.hide();
      loadLetter(alpha[idx]);
    }
    function onReset() {
      loadLetter(currentLetter);
    }
    function onMouseDown() {
      isDrawing = true;
    }
    function onMouseUp() {
      isDrawing = false;
      uCtx.clearRect(0, 0, 400, 400);
    }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      isDrawing = true;
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(gameLoopRaf);
      cancelAnimationFrame(demoRaf);
      alphabetSelector.removeEventListener('click', onSelectorClick);
      nextLetterBtn.removeEventListener('click', onNextLetter);
      resetBtn.removeEventListener('click', onReset);
      showExampleBtn.removeEventListener('click', runGuideAnimation);
      userCanvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      userCanvas.removeEventListener('mousemove', draw);
      userCanvas.removeEventListener('touchstart', onTouchStart);
      userCanvas.removeEventListener('touchend', onMouseUp);
      userCanvas.removeEventListener('touchmove', draw);
    };
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet" />
      <style>{`
        body {
            background: #f0f5ff;
            font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
            overflow-x: hidden;
        }

        h1 {
            font-family: 'Lilita One', cursive;
            font-size: clamp(2.5rem, 8vw, 4rem);
            color: #ff8c00;
            text-shadow: 3px 3px 0 #ffd700;
        }

        #instruction-box {
            background: #fff;
            border-radius: 50px;
            padding: 8px 20px;
            border: 3px solid #ffd700;
            display: inline-block;
        }

        #instruction-text {
            margin: 0;
            font-size: clamp(1rem, 4vw, 1.3rem);
            color: #007bff;
            font-weight: bold;
        }

        .canvas-container {
            position: relative;
            display: inline-block;
            width: 400px;
            height: 400px;
            border: 10px solid #ffd700;
            border-radius: 30px;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: opacity 0.3s ease-in-out;
        }
        .canvas-container.disabled { opacity: 0.7; pointer-events: none; }

        canvas { position: absolute; top: 0; left: 0; }
        #drawing-canvas { z-index: 1; }
        #user-canvas {
            z-index: 2;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="rgba(255, 99, 71, 0.8)" stroke="white" stroke-width="4"/></svg>') 20 20, crosshair;
        }

        .alphabet-btn {
            width: 48px; height: 48px; margin: 5px;
            font-size: 1.6rem; font-weight: bold;
            border-radius: 50%;
            border: none;
            background-color: #007bff;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transition: all 0.2s ease-in-out;
        }
        .alphabet-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }

        .alphabet-btn.active {
            background-color: #28a745;
            transform: scale(1.15);
            box-shadow: 0 0 20px 5px rgba(40, 167, 69, 0.7);
        }

        .action-buttons button {
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }
        .action-buttons button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.25); }

        #show-example-btn { background-color: #17a2b8; }
        #show-example-btn::before { content: '📺 '; }
        #reset-btn { background-color: #ffc107; color: #333; }
        #reset-btn::before { content: '🔄 '; }

        .modal-content { border-radius: 20px; border: 5px solid #ffd700; }
        .modal-title { font-size: 2.5rem; font-weight: bold; }
      `}</style>

      <div className="container text-center my-3">
        <h1>✨ Alphabet Tracer Adventure ✨</h1>
        <div className="d-flex justify-content-center gap-2 mb-3">
          <Link href="/" className="btn btn-outline-primary">
            🏠 Home Menu
          </Link>
          <Link href="/numbers" className="btn btn-outline-success">
            🔢 Switch to Numbers (1-20)
          </Link>
        </div>

        <div id="instruction-box" className="my-3">
          <p id="instruction-text" className="lead fw-bold">
            Select a letter to begin!
          </p>
        </div>

        <div id="alphabet-selector" className="my-4 d-flex flex-wrap justify-content-center"></div>

        <div id="canvas-container" className="canvas-container">
          <canvas id="drawing-canvas" width={400} height={400}></canvas>
          <canvas id="user-canvas" width={400} height={400}></canvas>
        </div>

        <div className="mt-3 action-buttons">
          <button id="show-example-btn">Watch How</button>
          <button id="reset-btn">Reset</button>
        </div>
      </div>

      <div className="modal fade" id="successModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="modal-title">
                🎉 AMAZING! 🎉
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body text-center" id="animation-container"></div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary btn-lg" data-bs-dismiss="modal">
                Trace Again
              </button>
              <button type="button" className="btn btn-primary btn-lg" id="next-letter-btn">
                Next Letter →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
