'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function NumbersPage() {
  useEffect(() => {
    const drawingCanvas = document.getElementById('drawing-canvas') as HTMLCanvasElement,
      userCanvas = document.getElementById('user-canvas') as HTMLCanvasElement;
    const dCtx = drawingCanvas.getContext('2d')!,
      uCtx = userCanvas.getContext('2d')!;
    const instructionText = document.getElementById('instruction-text')!,
      canvasContainer = document.getElementById('canvas-container')!;
    const numberSelector = document.getElementById('number-selector')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const animationContainer = document.getElementById('animation-container')!,
      modalTitle = document.getElementById('modal-title')!;
    const nextNumberBtn = document.getElementById('next-number-btn')!,
      resetBtn = document.getElementById('reset-btn')!,
      showExampleBtn = document.getElementById('show-example-btn')!;

    let isDrawing = false,
      isAnimatingGuide = false,
      currentNumber = '1';
    let dots: ({ x: number; y: number } | null)[] = [],
      dotNumbers: (number | null)[] = [],
      keyPoints: ({ x: number; y: number } | null)[] = [];
    let nextDotIndex = 0;
    const HIT_RADIUS = 30,
      DOT_SPACING = 35;
    let cancelled = false;
    let loopRaf = 0;
    let demoRaf = 0;

    type NumData = { points: ({ x: number; y: number } | null)[]; reward: string; word: string };
    const keyPointsData: Record<string, NumData> = {
      '1': { points: [{ x: 200, y: 60 }, { x: 200, y: 340 }], reward: '1', word: 'One' },
      '2': { points: [{ x: 120, y: 120 }, { x: 140, y: 80 }, { x: 200, y: 60 }, { x: 260, y: 80 }, { x: 280, y: 140 }, { x: 120, y: 340 }, { x: 280, y: 340 }], reward: '2', word: 'Two' },
      '3': { points: [{ x: 120, y: 100 }, { x: 160, y: 65 }, { x: 220, y: 60 }, { x: 270, y: 85 }, { x: 280, y: 135 }, { x: 230, y: 185 }, { x: 200, y: 200 }, null, { x: 200, y: 200 }, { x: 260, y: 225 }, { x: 285, y: 275 }, { x: 270, y: 335 }, { x: 200, y: 370 }, { x: 120, y: 330 }], reward: '3', word: 'Three' },
      '4': { points: [{ x: 250, y: 60 }, { x: 100, y: 240 }, { x: 300, y: 240 }, null, { x: 250, y: 60 }, { x: 250, y: 340 }], reward: '4', word: 'Four' },
      '5': { points: [{ x: 280, y: 60 }, { x: 140, y: 60 }, { x: 140, y: 180 }, { x: 200, y: 180 }, { x: 260, y: 200 }, { x: 290, y: 260 }, { x: 270, y: 320 }, { x: 200, y: 350 }, { x: 140, y: 330 }], reward: '5', word: 'Five' },
      '6': { points: [{ x: 260, y: 80 }, { x: 200, y: 70 }, { x: 140, y: 120 }, { x: 120, y: 240 }, { x: 120, y: 320 }, { x: 160, y: 360 }, { x: 240, y: 360 }, { x: 280, y: 320 }, { x: 280, y: 240 }, { x: 240, y: 200 }, { x: 120, y: 220 }], reward: '6', word: 'Six' },
      '7': { points: [{ x: 120, y: 60 }, { x: 280, y: 60 }, { x: 140, y: 340 }], reward: '7', word: 'Seven' },
      '8': { points: [{ x: 200, y: 200 }, { x: 160, y: 180 }, { x: 120, y: 130 }, { x: 140, y: 80 }, { x: 200, y: 60 }, { x: 260, y: 80 }, { x: 280, y: 130 }, { x: 240, y: 180 }, { x: 200, y: 200 }, null, { x: 200, y: 200 }, { x: 260, y: 220 }, { x: 300, y: 270 }, { x: 280, y: 330 }, { x: 200, y: 360 }, { x: 120, y: 330 }, { x: 100, y: 270 }, { x: 140, y: 220 }, { x: 200, y: 200 }], reward: '8', word: 'Eight' },
      '9': { points: [{ x: 280, y: 180 }, { x: 240, y: 220 }, { x: 160, y: 220 }, { x: 120, y: 180 }, { x: 120, y: 100 }, { x: 160, y: 60 }, { x: 240, y: 60 }, { x: 280, y: 100 }, { x: 280, y: 340 }], reward: '9', word: 'Nine' },
      '10': { points: [{ x: 150, y: 60 }, { x: 150, y: 340 }, null, { x: 300, y: 60 }, { x: 240, y: 100 }, { x: 220, y: 200 }, { x: 240, y: 300 }, { x: 300, y: 340 }, { x: 360, y: 300 }, { x: 380, y: 200 }, { x: 360, y: 100 }, { x: 300, y: 60 }], reward: '10', word: 'Ten' },
      '11': { points: [{ x: 150, y: 60 }, { x: 150, y: 340 }, null, { x: 250, y: 60 }, { x: 250, y: 340 }], reward: '11', word: 'Eleven' },
      '12': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 220, y: 120 }, { x: 260, y: 80 }, { x: 310, y: 60 }, { x: 360, y: 80 }, { x: 380, y: 140 }, { x: 220, y: 340 }, { x: 380, y: 340 }], reward: '12', word: 'Twelve' },
      '13': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 220, y: 100 }, { x: 280, y: 65 }, { x: 330, y: 100 }, { x: 300, y: 185 }, { x: 240, y: 200 }, null, { x: 240, y: 200 }, { x: 300, y: 215 }, { x: 330, y: 275 }, { x: 280, y: 335 }, { x: 220, y: 300 }], reward: '13', word: 'Thirteen' },
      '14': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 300, y: 60 }, { x: 200, y: 240 }, { x: 350, y: 240 }, null, { x: 300, y: 60 }, { x: 300, y: 340 }], reward: '14', word: 'Fourteen' },
      '15': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 320, y: 60 }, { x: 220, y: 60 }, { x: 220, y: 180 }, { x: 270, y: 180 }, { x: 330, y: 220 }, { x: 330, y: 300 }, { x: 270, y: 350 }, { x: 220, y: 330 }], reward: '15', word: 'Fifteen' },
      '16': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 320, y: 80 }, { x: 260, y: 140 }, { x: 220, y: 220 }, { x: 220, y: 320 }, { x: 260, y: 360 }, { x: 340, y: 360 }, { x: 380, y: 320 }, { x: 380, y: 240 }, { x: 340, y: 200 }, { x: 220, y: 220 }], reward: '16', word: 'Sixteen' },
      '17': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 220, y: 60 }, { x: 350, y: 60 }, { x: 250, y: 340 }], reward: '17', word: 'Seventeen' },
      '18': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 300, y: 200 }, { x: 260, y: 180 }, { x: 220, y: 130 }, { x: 240, y: 80 }, { x: 300, y: 60 }, { x: 360, y: 80 }, { x: 380, y: 130 }, { x: 340, y: 180 }, { x: 300, y: 200 }, null, { x: 300, y: 200 }, { x: 360, y: 220 }, { x: 400, y: 270 }, { x: 380, y: 330 }, { x: 300, y: 360 }, { x: 220, y: 330 }, { x: 200, y: 270 }, { x: 240, y: 220 }, { x: 300, y: 200 }], reward: '18', word: 'Eighteen' },
      '19': { points: [{ x: 120, y: 60 }, { x: 120, y: 340 }, null, { x: 360, y: 180 }, { x: 320, y: 220 }, { x: 240, y: 220 }, { x: 200, y: 180 }, { x: 200, y: 100 }, { x: 240, y: 60 }, { x: 320, y: 60 }, { x: 360, y: 100 }, { x: 360, y: 340 }], reward: '19', word: 'Nineteen' },
      '20': { points: [{ x: 80, y: 120 }, { x: 100, y: 80 }, { x: 160, y: 60 }, { x: 220, y: 80 }, { x: 240, y: 140 }, { x: 100, y: 340 }, { x: 240, y: 340 }, null, { x: 320, y: 60 }, { x: 260, y: 100 }, { x: 240, y: 200 }, { x: 260, y: 300 }, { x: 320, y: 340 }, { x: 380, y: 300 }, { x: 400, y: 200 }, { x: 380, y: 100 }, { x: 320, y: 60 }], reward: '20', word: 'Twenty' },
    };

    function generateDetailedPath(kp: ({ x: number; y: number } | null)[]) {
      const path: { dots: ({ x: number; y: number } | null)[]; dotNumbers: (number | null)[] } = { dots: [], dotNumbers: [] };
      let strokeNumber = 1;
      for (let i = 0; i < kp.length - 1; i++) {
        const p1 = kp[i],
          p2 = kp[i + 1];
        if (!p1) {
          strokeNumber = 1;
          continue;
        }
        if (!p2) {
          path.dots.push(p1);
          path.dotNumbers.push(strokeNumber);
          path.dots.push(null);
          path.dotNumbers.push(null);
          continue;
        }
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const segments = Math.max(1, Math.floor(dist / DOT_SPACING));
        for (let j = 0; j < segments; j++) {
          const t = j / segments;
          path.dots.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
          path.dotNumbers.push(strokeNumber++);
        }
      }
      path.dots.push(kp[kp.length - 1]);
      path.dotNumbers.push(strokeNumber);
      return path;
    }

    function drawGuide(pulse = 0) {
      dCtx.clearRect(0, 0, 400, 400);
      dCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      dCtx.lineWidth = 20;
      dCtx.lineCap = 'round';
      dCtx.beginPath();
      let started = false;
      keyPoints.forEach((p) => {
        if (!p) {
          started = false;
          return;
        }
        if (!started) {
          dCtx.moveTo(p.x, p.y);
          started = true;
        } else {
          dCtx.lineTo(p.x, p.y);
        }
      });
      dCtx.stroke();

      dCtx.lineWidth = 20;
      dCtx.lineCap = 'round';
      dCtx.strokeStyle = '#28a745';
      dCtx.beginPath();
      started = false;
      for (let i = 0; i < nextDotIndex; i++) {
        if (!dots[i]) {
          started = false;
          continue;
        }
        if (!started) {
          dCtx.moveTo(dots[i]!.x, dots[i]!.y);
          started = true;
        } else {
          dCtx.lineTo(dots[i]!.x, dots[i]!.y);
        }
      }
      dCtx.stroke();

      dots.forEach((dot, i) => {
        if (!dot) return;
        let radius = 10;
        if (i < nextDotIndex) dCtx.fillStyle = '#28a745';
        else if (i === nextDotIndex) {
          dCtx.fillStyle = '#1e90ff';
          radius += pulse;
        } else dCtx.fillStyle = '#ffc107';
        dCtx.beginPath();
        dCtx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        dCtx.fill();
        dCtx.strokeStyle = '#343a40';
        dCtx.lineWidth = 2;
        dCtx.stroke();
        dCtx.fillStyle = i === nextDotIndex ? 'white' : '#343a40';
        dCtx.font = 'bold 12px Arial';
        dCtx.textAlign = 'center';
        dCtx.textBaseline = 'middle';
        dCtx.fillText(i < nextDotIndex ? '✓' : String(dotNumbers[i]), dot.x, dot.y + 1);
      });
    }

    function loadNumber(num: string) {
      currentNumber = num;
      keyPoints = keyPointsData[num].points;
      const path = generateDetailedPath(keyPoints);
      dots = path.dots;
      dotNumbers = path.dotNumbers;
      nextDotIndex = 0;
      instructionText.textContent = `Let's trace number ${num}!`;
      document.querySelectorAll('.number-btn').forEach((b) => b.classList.toggle('active', b.textContent === num));
      uCtx.clearRect(0, 0, 400, 400);
    }

    function checkCollision(pos: { x: number; y: number }) {
      const target = dots[nextDotIndex];
      if (!target) return;
      if (Math.hypot(pos.x - target.x, pos.y - target.y) < HIT_RADIUS) {
        nextDotIndex++;
        while (dots[nextDotIndex] === null && nextDotIndex < dots.length) nextDotIndex++;
        if (nextDotIndex >= dots.length) showSuccess();
      }
    }

    function showSuccess() {
      const data = keyPointsData[currentNumber];
      modalTitle.innerHTML = `🎉 You traced <span class="text-warning">${currentNumber}</span>! 🎉`;
      animationContainer.innerHTML = `
            <div class="shape-wrapper highlight-purple">
                <div class="reward-emoji-big">${data.reward}</div>
            </div>
            <div class="text-label">Number ${data.reward}</div>`;

      successModal.show();
    }

    function getMousePos(e: MouseEvent | TouchEvent) {
      const rect = userCanvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) * (400 / rect.width), y: (cy - rect.top) * (400 / rect.height) };
    }

    function onMouseDown() {
      isDrawing = true;
    }
    function onMouseUp() {
      isDrawing = false;
      uCtx.clearRect(0, 0, 400, 400);
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDrawing || isAnimatingGuide) return;
      const pos = getMousePos(e);
      uCtx.clearRect(0, 0, 400, 400);
      uCtx.beginPath();
      uCtx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      uCtx.fillStyle = '#ff6347';
      uCtx.fill();
      checkCollision(pos);
    }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      isDrawing = true;
    }
    function onTouchEnd() {
      isDrawing = false;
      uCtx.clearRect(0, 0, 400, 400);
    }
    function onTouchMove(e: TouchEvent) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getMousePos(e);
      checkCollision(pos);
    }

    userCanvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    userCanvas.addEventListener('mousemove', onMouseMove);
    userCanvas.addEventListener('touchstart', onTouchStart);
    userCanvas.addEventListener('touchend', onTouchEnd);
    userCanvas.addEventListener('touchmove', onTouchMove);

    function runGuideAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;
      canvasContainer.classList.add('disabled');
      instructionText.textContent = `Watch carefully! Here's how to trace number ${currentNumber}...`;
      let startTime: number | null = null;
      const totalDuration = 2500;
      const segments: { start: { x: number; y: number }; end: { x: number; y: number }; length: number }[] = [];
      let totalLength = 0;
      for (let i = 0; i < keyPoints.length - 1; i++) {
        if (keyPoints[i] && keyPoints[i + 1]) {
          const length = Math.hypot(keyPoints[i + 1]!.x - keyPoints[i]!.x, keyPoints[i + 1]!.y - keyPoints[i]!.y);
          segments.push({ start: keyPoints[i]!, end: keyPoints[i + 1]!, length });
          totalLength += length;
        }
      }
      function animateFrame(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / totalDuration, 1);
        dCtx.clearRect(0, 0, 400, 400);
        drawGuide(0);
        const lengthToShow = totalLength * progress;
        let lengthTraveled = 0;
        let currentPos = segments.length > 0 ? segments[0].start : { x: 0, y: 0 };
        dCtx.strokeStyle = '#0dcaf0';
        dCtx.lineWidth = 20;
        dCtx.beginPath();
        for (const seg of segments) {
          if (lengthTraveled + seg.length > lengthToShow) {
            const segmentProgress = (lengthToShow - lengthTraveled) / seg.length;
            currentPos = {
              x: seg.start.x + (seg.end.x - seg.start.x) * segmentProgress,
              y: seg.start.y + (seg.end.y - seg.start.y) * segmentProgress,
            };
            dCtx.moveTo(seg.start.x, seg.start.y);
            dCtx.lineTo(currentPos.x, currentPos.y);
            break;
          }
          dCtx.moveTo(seg.start.x, seg.start.y);
          dCtx.lineTo(seg.end.x, seg.end.y);
          lengthTraveled += seg.length;
          currentPos = seg.end;
        }
        dCtx.stroke();
        uCtx.clearRect(0, 0, 400, 400);
        uCtx.beginPath();
        uCtx.arc(currentPos.x, currentPos.y, 15, 0, Math.PI * 2);
        uCtx.fillStyle = 'rgba(13, 202, 240, 0.7)';
        uCtx.fill();
        uCtx.strokeStyle = 'white';
        uCtx.lineWidth = 3;
        uCtx.stroke();
        if (progress < 1) {
          demoRaf = requestAnimationFrame(animateFrame);
        } else {
          isAnimatingGuide = false;
          canvasContainer.classList.remove('disabled');
          instructionText.textContent = `Great! Now it's YOUR turn to trace ${currentNumber}!`;
          uCtx.clearRect(0, 0, 400, 400);
        }
      }
      demoRaf = requestAnimationFrame(animateFrame);
    }

    function onNextNumber() {
      let next = parseInt(currentNumber) + 1;
      if (next > 20) next = 1;
      successModal.hide();
      loadNumber(next.toString());
    }
    function onReset() {
      loadNumber(currentNumber);
    }

    nextNumberBtn.addEventListener('click', onNextNumber);
    resetBtn.addEventListener('click', onReset);
    showExampleBtn.addEventListener('click', runGuideAnimation);

    function loop() {
      if (cancelled) return;
      if (!isAnimatingGuide) drawGuide(Math.sin(Date.now() * 0.01) * 3);
      loopRaf = requestAnimationFrame(loop);
    }

    function onSelectorClick(e: Event) {
      const target = e.target as HTMLElement;
      if (target.matches('.number-btn')) loadNumber(target.textContent!);
    }

    numberSelector.innerHTML = Array.from({ length: 20 }, (_, i) => `<button class="number-btn">${i + 1}</button>`).join('');
    numberSelector.addEventListener('click', onSelectorClick);
    loadNumber('1');
    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(loopRaf);
      cancelAnimationFrame(demoRaf);
      userCanvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      userCanvas.removeEventListener('mousemove', onMouseMove);
      userCanvas.removeEventListener('touchstart', onTouchStart);
      userCanvas.removeEventListener('touchend', onTouchEnd);
      userCanvas.removeEventListener('touchmove', onTouchMove);
      nextNumberBtn.removeEventListener('click', onNextNumber);
      resetBtn.removeEventListener('click', onReset);
      showExampleBtn.removeEventListener('click', runGuideAnimation);
      numberSelector.removeEventListener('click', onSelectorClick);
    };
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet" />
      <style>{`
        body {
            background: #fdf5ff;
            font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
            overflow-x: hidden;
        }

        h1 {
            font-family: 'Lilita One', cursive;
            font-size: clamp(2.5rem, 8vw, 4rem);
            color: #9c27b0;
            text-shadow: 3px 3px 0 #e1bee7;
        }

        #instruction-box {
            background: #fff;
            border-radius: 50px;
            padding: 8px 20px;
            border: 3px solid #ce93d8;
            display: inline-block;
        }

        #instruction-text {
            margin: 0;
            font-size: clamp(1rem, 4vw, 1.3rem);
            color: #6a1b9a;
            font-weight: bold;
        }

        .canvas-container {
            position: relative;
            display: inline-block;
            width: 400px;
            height: 400px;
            border: 10px solid #ce93d8;
            border-radius: 30px;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(156, 39, 176, 0.1);
            overflow: hidden;
            transition: opacity 0.3s ease-in-out;
        }
        .canvas-container.disabled { opacity: 0.7; pointer-events: none; }

        canvas { position: absolute; top: 0; left: 0; }
        #drawing-canvas { z-index: 1; }
        #user-canvas {
            z-index: 2;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="rgba(156, 39, 176, 0.8)" stroke="white" stroke-width="4"/></svg>') 20 20, crosshair;
        }

        .number-btn {
            width: 54px; height: 54px; margin: 6px;
            font-size: 1.6rem; font-weight: bold;
            border-radius: 50%;
            border: none;
            background-color: #9c27b0;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transition: all 0.2s ease-in-out;
        }
        .number-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }

        .number-btn.active {
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

        .modal-content { border-radius: 20px; border: 5px solid #ce93d8; }
        .modal-title { font-size: 2.5rem; font-weight: bold; }

        .shape-wrapper {
            position: relative;
            width: 250px;
            height: 250px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: pop-in 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6);
            border-radius: 50%;
        }

        @keyframes pop-in { 0% { transform: scale(0) rotate(-270deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .text-label { font-size: 2.5rem; font-weight: bold; color: #9c27b0; text-shadow: 2px 2px 0 #fff; margin-top: 20px; }

        .highlight-purple {
            background: radial-gradient(circle, #e1bee7 0%, #9c27b0 100%);
            box-shadow: 0 0 50px rgba(156, 39, 176, 0.6);
            border: 8px solid white;
            animation: pop-in 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6), purple-pulse 2s infinite ease-in-out;
        }

        @keyframes purple-pulse {
            0% { transform: scale(1); box-shadow: 0 0 30px rgba(156, 39, 176, 0.6); }
            50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(225, 190, 231, 0.8); }
            100% { transform: scale(1); box-shadow: 0 0 30px rgba(156, 39, 176, 0.6); }
        }

        .reward-emoji-big {
            font-size: 9rem;
            filter: drop-shadow(0 5px 15px rgba(0,0,0,0.2));
        }

        .text-warning { color: #9c27b0 !important; }
      `}</style>

      <div className="container text-center my-3">
        <div className="d-flex justify-content-center gap-2 mb-3">
          <Link href="/" className="btn btn-outline-primary">
            🏠 Home Menu
          </Link>
          <Link href="/tracer" className="btn btn-outline-success">
            🔤 Switch to Alphabet (A-Z)
          </Link>
        </div>
        <h1>🔢 Numbers Tracer Adventure 🔢</h1>

        <div id="instruction-box" className="my-3">
          <p id="instruction-text" className="lead fw-bold">
            Select a number to begin!
          </p>
        </div>

        <div id="number-selector" className="my-4 d-flex flex-wrap justify-content-center"></div>

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
              <button type="button" className="btn btn-primary btn-lg" id="next-number-btn">
                Next Number →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
