'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ColoringPage() {
  useEffect(() => {
    // --- ELEMENTS ---
    const bCanvas = document.getElementById('bottom-canvas') as HTMLCanvasElement,
      tCanvas = document.getElementById('top-canvas') as HTMLCanvasElement,
      iCanvas = document.getElementById('interaction-canvas') as HTMLCanvasElement,
      tgCanvas = document.getElementById('tracing-guide-canvas') as HTMLCanvasElement,
      tuCanvas = document.getElementById('tracing-user-canvas') as HTMLCanvasElement;

    const bCtx = bCanvas.getContext('2d')!,
      tcCtx = tCanvas.getContext('2d')!,
      icCtx = iCanvas.getContext('2d')!,
      tgCtx = tgCanvas.getContext('2d')!,
      tuCtx = tuCanvas.getContext('2d')!;

    const activityTitle = document.getElementById('activity-title')!,
      progressFill = document.getElementById('progress-fill')! as HTMLElement,
      navContainer = document.getElementById('alphabet-nav')!,
      cGroup = document.getElementById('coloring-group')!,
      tGroup = document.getElementById('tracing-group')!,
      step1Dot = document.getElementById('step-1-dot')!,
      step2Dot = document.getElementById('step-2-dot')!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const rewardEmoji = document.getElementById('reward-emoji')!,
      modalNextBtn = document.getElementById('modal-next-btn')!;

    // --- DATA ---
    type LetterData = { word: string; emoji: string; color: string; points: ({ x: number; y: number } | null)[] };
    const alphabetData: Record<string, LetterData> = {
      A: { word: 'Apple', emoji: '🍎', color: '#ff7675', points: [{ x: 225, y: 80 }, { x: 100, y: 380 }, null, { x: 225, y: 80 }, { x: 350, y: 380 }, null, { x: 150, y: 260 }, { x: 300, y: 260 }] },
      B: { word: 'Ball', emoji: '⚽', color: '#74b9ff', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 260, y: 60 }, { x: 330, y: 110 }, { x: 330, y: 180 }, { x: 260, y: 220 }, { x: 140, y: 220 }, null, { x: 140, y: 220 }, { x: 280, y: 220 }, { x: 350, y: 280 }, { x: 350, y: 340 }, { x: 280, y: 380 }, { x: 140, y: 380 }] },
      C: { word: 'Cat', emoji: '🐱', color: '#ffeaa7', points: [{ x: 350, y: 120 }, { x: 330, y: 90 }, { x: 280, y: 65 }, { x: 225, y: 60 }, { x: 170, y: 65 }, { x: 120, y: 90 }, { x: 100, y: 150 }, { x: 100, y: 280 }, { x: 120, y: 340 }, { x: 170, y: 370 }, { x: 225, y: 390 }, { x: 280, y: 385 }, { x: 330, y: 360 }, { x: 350, y: 330 }] },
      D: { word: 'Dog', emoji: '🐶', color: '#d2b48c', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 360, y: 140 }, { x: 360, y: 300 }, { x: 280, y: 380 }, { x: 140, y: 380 }] },
      E: { word: 'Elephant', emoji: '🐘', color: '#a29bfe', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 350, y: 60 }, null, { x: 140, y: 220 }, { x: 320, y: 220 }, null, { x: 140, y: 380 }, { x: 350, y: 380 }] },
      F: { word: 'Fish', emoji: '🐟', color: '#81ecec', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 350, y: 60 }, null, { x: 140, y: 220 }, { x: 320, y: 220 }] },
      G: { word: 'Grapes', emoji: '🍇', color: '#6c5ce7', points: [{ x: 350, y: 120 }, { x: 330, y: 90 }, { x: 280, y: 65 }, { x: 225, y: 60 }, { x: 170, y: 65 }, { x: 120, y: 90 }, { x: 100, y: 150 }, { x: 100, y: 280 }, { x: 120, y: 340 }, { x: 170, y: 370 }, { x: 225, y: 390 }, { x: 280, y: 390 }, { x: 350, y: 390 }, { x: 350, y: 240 }, { x: 260, y: 240 }] },
      H: { word: 'Hat', emoji: '👒', color: '#2d3436', points: [{ x: 120, y: 60 }, { x: 120, y: 380 }, null, { x: 330, y: 60 }, { x: 330, y: 380 }, null, { x: 120, y: 220 }, { x: 330, y: 220 }] },
      I: { word: 'Igloo', emoji: '🧊', color: '#00cec9', points: [{ x: 160, y: 60 }, { x: 290, y: 60 }, null, { x: 225, y: 60 }, { x: 225, y: 380 }, null, { x: 160, y: 380 }, { x: 290, y: 380 }] },
      J: { word: 'Jug', emoji: '🏺', color: '#fdcb6e', points: [{ x: 180, y: 60 }, { x: 330, y: 60 }, null, { x: 280, y: 60 }, { x: 280, y: 320 }, { x: 270, y: 350 }, { x: 240, y: 380 }, { x: 200, y: 390 }, { x: 150, y: 380 }, { x: 120, y: 330 }] },
      K: { word: 'Kite', emoji: '🪁', color: '#ff7675', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 350, y: 60 }, { x: 140, y: 220 }, { x: 350, y: 380 }] },
      L: { word: 'Lion', emoji: '🦁', color: '#fab1a0', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, { x: 350, y: 380 }] },
      M: { word: 'Monkey', emoji: '🐒', color: '#e17055', points: [{ x: 100, y: 380 }, { x: 100, y: 60 }, { x: 225, y: 220 }, { x: 350, y: 60 }, { x: 350, y: 380 }] },
      N: { word: 'Net', emoji: '🕸️', color: '#dfe6e9', points: [{ x: 120, y: 380 }, { x: 120, y: 60 }, { x: 330, y: 380 }, { x: 330, y: 60 }] },
      O: { word: 'Orange', emoji: '🍊', color: '#fd9644', points: [{ x: 225, y: 60 }, { x: 280, y: 65 }, { x: 330, y: 90 }, { x: 350, y: 150 }, { x: 355, y: 225 }, { x: 350, y: 300 }, { x: 330, y: 360 }, { x: 280, y: 385 }, { x: 225, y: 390 }, { x: 170, y: 385 }, { x: 120, y: 360 }, { x: 100, y: 300 }, { x: 95, y: 225 }, { x: 100, y: 150 }, { x: 120, y: 90 }, { x: 170, y: 65 }, { x: 225, y: 60 }] },
      P: { word: 'Parrot', emoji: '🦜', color: '#26de81', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 350, y: 130 }, { x: 280, y: 200 }, { x: 140, y: 200 }] },
      Q: { word: 'Queen', emoji: '👸', color: '#fed330', points: [{ x: 225, y: 60 }, { x: 280, y: 65 }, { x: 330, y: 90 }, { x: 350, y: 150 }, { x: 355, y: 225 }, { x: 350, y: 300 }, { x: 330, y: 360 }, { x: 280, y: 385 }, { x: 225, y: 390 }, { x: 170, y: 385 }, { x: 120, y: 360 }, { x: 100, y: 300 }, { x: 95, y: 225 }, { x: 100, y: 150 }, { x: 120, y: 90 }, { x: 170, y: 65 }, { x: 225, y: 60 }, null, { x: 280, y: 310 }, { x: 380, y: 400 }] },
      R: { word: 'Rabbit', emoji: '🐰', color: '#f7f1e3', points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 350, y: 130 }, { x: 280, y: 200 }, { x: 140, y: 200 }, null, { x: 200, y: 200 }, { x: 350, y: 380 }] },
      S: { word: 'Sun', emoji: '☀️', color: '#ffee58', points: [{ x: 350, y: 120 }, { x: 300, y: 75 }, { x: 240, y: 60 }, { x: 180, y: 70 }, { x: 140, y: 110 }, { x: 140, y: 180 }, { x: 180, y: 220 }, { x: 240, y: 240 }, { x: 300, y: 260 }, { x: 330, y: 330 }, { x: 300, y: 370 }, { x: 220, y: 390 }, { x: 150, y: 370 }, { x: 110, y: 330 }] },
      T: { word: 'Tiger', emoji: '🐯', color: '#fa8231', points: [{ x: 120, y: 60 }, { x: 330, y: 60 }, null, { x: 225, y: 60 }, { x: 225, y: 380 }] },
      U: { word: 'Umbrella', emoji: '☂️', color: '#a55eea', points: [{ x: 120, y: 60 }, { x: 120, y: 280 }, { x: 130, y: 320 }, { x: 160, y: 360 }, { x: 225, y: 390 }, { x: 290, y: 360 }, { x: 320, y: 320 }, { x: 330, y: 280 }, { x: 330, y: 60 }] },
      V: { word: 'Van', emoji: '🚐', color: '#778ca3', points: [{ x: 100, y: 60 }, { x: 225, y: 380 }, { x: 350, y: 60 }] },
      W: { word: 'Watch', emoji: '⌚', color: '#4b6584', points: [{ x: 80, y: 60 }, { x: 150, y: 380 }, { x: 225, y: 150 }, { x: 300, y: 380 }, { x: 370, y: 60 }] },
      X: { word: 'Xylophone', emoji: '🎹', color: '#45aaf2', points: [{ x: 100, y: 60 }, { x: 350, y: 380 }, null, { x: 350, y: 60 }, { x: 100, y: 380 }] },
      Y: { word: 'Yo-yo', emoji: '🪀', color: '#eb3b5a', points: [{ x: 100, y: 60 }, { x: 225, y: 220 }, { x: 350, y: 60 }, null, { x: 225, y: 220 }, { x: 225, y: 380 }] },
      Z: { word: 'Zebra', emoji: '🦓', color: '#4b4b4b', points: [{ x: 120, y: 60 }, { x: 330, y: 60 }, { x: 120, y: 380 }, { x: 330, y: 380 }] },
    };

    // --- STATE ---
    let currentLetter = 'A';
    let currentStep = 1; // 1: Coloring, 2: Tracing
    let isDrawing = false,
      isAnimatingTrace = false;
    let traceDots: ({ x: number; y: number } | null)[] = [],
      nextDotIndex = 0;
    let totalColorPixels = 0;
    let cancelled = false;
    let loopRaf = 0;
    let demoRaf = 0;

    // --- NAVIGATION ---
    function initNav() {
      navContainer.innerHTML = '';
      Object.keys(alphabetData).forEach((l) => {
        const btn = document.createElement('button');
        btn.textContent = l;
        btn.classList.add('btn');
        if (l === currentLetter) btn.classList.add('active');
        btn.onclick = () => loadLetter(l);
        navContainer.appendChild(btn);
      });
    }

    function loadLetter(l: string) {
      currentLetter = l;
      currentStep = 1;

      const trio = document.getElementById('letter-display-box')!;
      trio.querySelector('.caps')!.textContent = l;
      trio.querySelector('.small')!.textContent = l.toLowerCase();
      trio.querySelector('.cursive')!.textContent = l;

      const data = alphabetData[l];

      cGroup.classList.remove('d-none');
      tGroup.classList.add('d-none');
      step1Dot.classList.add('active');
      step2Dot.classList.remove('active');
      progressFill.style.width = '0%';
      activityTitle.textContent = `Step 1: Color to reveal the ${data.word}! 🎨`;

      document.querySelectorAll('#alphabet-nav button').forEach((b) => b.classList.toggle('active', b.textContent === l));

      initColoring(data);
      initTracing(data);
    }

    // --- COLORING ENGINE ---
    function initColoring(data: LetterData) {
      bCtx.clearRect(0, 0, 450, 450);
      tcCtx.clearRect(0, 0, 450, 450);
      icCtx.clearRect(0, 0, 450, 450);

      tcCtx.globalCompositeOperation = 'source-over';

      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.font = '320px Arial';
      bCtx.shadowBlur = 30;
      bCtx.shadowColor = data.color + '88';
      bCtx.fillText(data.emoji, 225, 225);
      bCtx.shadowBlur = 0;

      tcCtx.fillStyle = '#ffffff';
      tcCtx.fillRect(0, 0, 450, 450);
      tcCtx.strokeStyle = '#000000';
      tcCtx.lineWidth = 10;
      tcCtx.lineJoin = 'round';
      tcCtx.strokeText(data.emoji, 225, 225);
      tcCtx.fillStyle = '#f9f9f9';
      tcCtx.fillText(data.emoji, 225, 225);

      const imgData = tcCtx.getImageData(0, 0, 450, 450);
      totalColorPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 4) if (imgData.data[i] > 0) totalColorPixels++;
    }

    // --- TRACING ENGINE ---
    function initTracing(data: LetterData) {
      tgCtx.clearRect(0, 0, 450, 450);
      tuCtx.clearRect(0, 0, 450, 450);
      traceDots = [];
      nextDotIndex = 0;
      const kp = data.points;
      const spacing = 30;
      for (let i = 0; i < kp.length - 1; i++) {
        const p1 = kp[i],
          p2 = kp[i + 1];
        if (!p1) continue;
        if (!p2) {
          traceDots.push(p1);
          traceDots.push(null);
          continue;
        }
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const segments = Math.max(1, Math.floor(dist / spacing));
        for (let j = 0; j < segments; j++) {
          traceDots.push({ x: p1.x + (p2.x - p1.x) * (j / segments), y: p1.y + (p2.y - p1.y) * (j / segments) });
        }
      }
      traceDots.push(kp[kp.length - 1]);
    }

    function drawDottedGuide(pulse = 0) {
      tgCtx.clearRect(0, 0, 450, 450);
      const data = alphabetData[currentLetter];

      // 1. Draw DASHED Guideline
      tgCtx.beginPath();
      tgCtx.setLineDash([10, 10]);
      tgCtx.strokeStyle = 'rgba(255,255,255,0.1)';
      tgCtx.lineWidth = 30;
      tgCtx.lineCap = 'round';
      let started = false;
      data.points.forEach((p) => {
        if (!p) {
          started = false;
          return;
        }
        if (!started) {
          tgCtx.moveTo(p.x, p.y);
          started = true;
        } else tgCtx.lineTo(p.x, p.y);
      });
      tgCtx.stroke();
      tgCtx.setLineDash([]);

      // 2. Draw Numbered Dots
      let dotCounter = 1;
      data.points.forEach((p) => {
        if (!p) return;
        const isTarget = !!(traceDots[nextDotIndex] && traceDots[nextDotIndex]!.x === p.x && traceDots[nextDotIndex]!.y === p.y);

        tgCtx.fillStyle = '#ffc107';
        tgCtx.beginPath();
        tgCtx.arc(p.x, p.y, 16 + (isTarget ? pulse : 0), 0, Math.PI * 2);
        tgCtx.fill();
        tgCtx.strokeStyle = 'white';
        tgCtx.lineWidth = 3;
        tgCtx.stroke();

        tgCtx.fillStyle = '#2d3436';
        tgCtx.font = 'bold 18px Outfit';
        tgCtx.textAlign = 'center';
        tgCtx.textBaseline = 'middle';
        tgCtx.fillText(String(dotCounter++), p.x, p.y);
      });

      // 3. User Progress Trail
      tuCtx.clearRect(0, 0, 450, 450);
      tuCtx.shadowBlur = 10;
      tuCtx.shadowColor = '#55efc4';
      tuCtx.strokeStyle = '#55efc4';
      tuCtx.lineWidth = 15;
      tuCtx.lineCap = 'round';
      tuCtx.lineJoin = 'round';
      tuCtx.beginPath();
      started = false;
      for (let i = 0; i < nextDotIndex; i++) {
        if (!traceDots[i]) {
          started = false;
          continue;
        }
        if (!started) {
          tuCtx.moveTo(traceDots[i]!.x, traceDots[i]!.y);
          started = true;
        } else tuCtx.lineTo(traceDots[i]!.x, traceDots[i]!.y);
      }
      tuCtx.stroke();
    }

    // --- TRANSITIONS ---
    function finishColoring() {
      if (currentStep !== 1) return;
      currentStep = 2;
      progressFill.style.width = '100%';
      activityTitle.textContent = `Well Done! Now trace the letter '${currentLetter}'! ✏️`;

      cGroup.classList.add('shake');
      setTimeout(() => {
        cGroup.classList.add('d-none');
        tGroup.classList.remove('d-none');
        step2Dot.classList.add('active');
        cGroup.classList.remove('shake');
      }, 800);
    }

    function checkSuccess() {
      const data = alphabetData[currentLetter];

      const rTrio = document.getElementById('reward-letter')!;
      rTrio.querySelector('.caps')!.textContent = currentLetter;
      rTrio.querySelector('.small')!.textContent = currentLetter.toLowerCase();
      rTrio.querySelector('.cursive')!.textContent = currentLetter;

      document.querySelector('.reward-text')!.innerHTML = `You colored the <b>${data.word}</b> and traced <b>${currentLetter}</b>!`;
      rewardEmoji.textContent = data.emoji;
      successModal.show();
    }

    // --- INPUT HANDLING ---
    function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) * (450 / rect.width), y: (cy - rect.top) * (450 / rect.height) };
    }

    function handleInput(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;
      const pos = getPos(e, e.target as HTMLCanvasElement);

      if (currentStep === 1) {
        // Coloring
        tcCtx.globalCompositeOperation = 'destination-out';
        tcCtx.beginPath();
        tcCtx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        tcCtx.fill();

        icCtx.clearRect(0, 0, 450, 450);
        icCtx.beginPath();
        icCtx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        icCtx.fillStyle = 'rgba(0,0,0,0.1)';
        icCtx.fill();

        if (Math.random() > 0.9) {
          const imgData = tcCtx.getImageData(0, 0, 450, 450);
          let alpha = 0;
          for (let i = 3; i < imgData.data.length; i += 4) if (imgData.data[i] > 0) alpha++;
          const p = ((totalColorPixels - alpha) / totalColorPixels) * 100;
          progressFill.style.width = p + '%';
          if (p > 60) finishColoring();
        }
      } else {
        // Tracing
        const target = traceDots[nextDotIndex];
        if (target && Math.hypot(pos.x - target.x, pos.y - target.y) < 40) {
          nextDotIndex++;
          while (traceDots[nextDotIndex] === null) nextDotIndex++;
          if (nextDotIndex >= traceDots.length) checkSuccess();
        }
      }
    }

    // --- EVENTS ---
    function onMouseDown() {
      isDrawing = true;
    }
    function onMouseUp() {
      isDrawing = false;
      icCtx.clearRect(0, 0, 450, 450);
    }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      isDrawing = true;
      handleInput(e);
    }

    const interactionEls = [iCanvas, tuCanvas];
    interactionEls.forEach((c) => {
      c.addEventListener('mousedown', onMouseDown);
      c.addEventListener('mousemove', handleInput);
      c.addEventListener('touchstart', onTouchStart);
      c.addEventListener('touchmove', handleInput);
    });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);

    function onResetActivity() {
      loadLetter(currentLetter);
    }
    function onResetTrace() {
      nextDotIndex = 0;
      tuCtx.clearRect(0, 0, 450, 450);
    }

    const resetActivityBtn = document.getElementById('reset-activity')!;
    const resetTraceBtn = document.getElementById('reset-trace')!;
    resetActivityBtn.addEventListener('click', onResetActivity);
    resetTraceBtn.addEventListener('click', onResetTrace);

    function runGuideAnimation() {
      if (isAnimatingTrace) return;
      isAnimatingTrace = true;
      tGroup.classList.add('disabled');
      let startTime: number | null = null;
      const duration = 2500;
      const kp = alphabetData[currentLetter].points;
      const segments: { s: { x: number; y: number }; e: { x: number; y: number }; len: number; isNew: boolean }[] = [];
      let totalLength = 0;
      let isNewStroke = true;

      for (let i = 0; i < kp.length - 1; i++) {
        if (kp[i] === null) {
          isNewStroke = true;
          continue;
        }
        if (kp[i + 1] === null) {
          isNewStroke = true;
          continue;
        }

        const length = Math.hypot(kp[i + 1]!.x - kp[i]!.x, kp[i + 1]!.y - kp[i]!.y);
        segments.push({ s: kp[i]!, e: kp[i + 1]!, len: length, isNew: isNewStroke });
        totalLength += length;
        isNewStroke = false;
      }

      function animateFrame(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        tgCtx.clearRect(0, 0, 450, 450);
        drawDottedGuide(0);
        const lengthToShow = totalLength * progress;
        let currentLen = 0;

        tgCtx.strokeStyle = '#0dcaf0';
        tgCtx.lineWidth = 25;
        tgCtx.lineCap = 'round';
        tgCtx.beginPath();

        for (const seg of segments) {
          if (seg.isNew) tgCtx.moveTo(seg.s.x, seg.s.y);

          if (currentLen + seg.len > lengthToShow) {
            const sp = (lengthToShow - currentLen) / seg.len;
            const curPos = { x: seg.s.x + (seg.e.x - seg.s.x) * sp, y: seg.s.y + (seg.e.y - seg.s.y) * sp };
            tgCtx.lineTo(curPos.x, curPos.y);
            break;
          }
          tgCtx.lineTo(seg.e.x, seg.e.y);
          currentLen += seg.len;
        }
        tgCtx.stroke();
        if (progress < 1) {
          demoRaf = requestAnimationFrame(animateFrame);
        } else {
          isAnimatingTrace = false;
          tGroup.classList.remove('disabled');
        }
      }
      demoRaf = requestAnimationFrame(animateFrame);
    }

    const showTraceExampleBtn = document.getElementById('show-trace-example')!;
    showTraceExampleBtn.addEventListener('click', runGuideAnimation);

    function onModalNext() {
      successModal.hide();
      const keys = Object.keys(alphabetData);
      const idx = (keys.indexOf(currentLetter) + 1) % keys.length;
      loadLetter(keys[idx]);
    }
    modalNextBtn.addEventListener('click', onModalNext);

    function loop() {
      if (cancelled) return;
      if (currentStep === 2) drawDottedGuide(Math.sin(Date.now() * 0.01) * 4);
      loopRaf = requestAnimationFrame(loop);
    }

    initNav();
    loadLetter('A');
    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(loopRaf);
      cancelAnimationFrame(demoRaf);
      interactionEls.forEach((c) => {
        c.removeEventListener('mousedown', onMouseDown);
        c.removeEventListener('mousemove', handleInput);
        c.removeEventListener('touchstart', onTouchStart);
        c.removeEventListener('touchmove', handleInput);
      });
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
      resetActivityBtn.removeEventListener('click', onResetActivity);
      resetTraceBtn.removeEventListener('click', onResetTrace);
      showTraceExampleBtn.removeEventListener('click', runGuideAnimation);
      modalNextBtn.removeEventListener('click', onModalNext);
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;700&family=Dancing+Script:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
            --bg-color: #f8fbff;
            --accent-primary: #ff7675;
            --accent-secondary: #74b9ff;
            --slate-bg: #2d3436;
        }

        body {
            background-color: var(--bg-color);
            font-family: 'Outfit', sans-serif;
            color: #2d3436;
            overflow: hidden;
            height: 100vh;
        }

        .app-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .btn-home {
            background: white; border-radius: 50px; padding: 10px 20px;
            text-decoration: none; color: var(--accent-secondary);
            font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .step-indicator { display: flex; align-items: center; gap: 10px; }
        .step-indicator .dot { width: 14px; height: 14px; border-radius: 50%; background: #dfe6e9; transition: 0.3s; }
        .step-indicator .dot.active { background: #55efc4; box-shadow: 0 0 10px #55efc4; }
        .step-indicator .line { width: 40px; height: 4px; background: #dfe6e9; border-radius: 2px; }

        .current-letter-box {
            background: white; border: 4px solid #fab1a0; border-radius: 15px;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            padding: 0 15px; min-width: 140px; height: 60px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .trio-display .caps { font-family: 'Lilita One', cursive; font-size: 1.8rem; color: #ff7675; }
        .trio-display .small { font-family: 'Outfit', sans-serif; font-size: 1.8rem; color: #74b9ff; }
        .trio-display .cursive { font-family: 'Dancing Script', cursive; font-size: 2.2rem; color: #6c5ce7; }

        .activity-card {
            background: white; border-radius: 40px; padding: 30px;
            border: 1px solid rgba(0,0,0,0.05);
        }

        .activity-instruction {
            font-family: 'Lilita One', cursive; font-size: 1.8rem;
            color: #2d3436; margin-bottom: 25px; text-align: center;
        }

        .canvas-stage {
            display: flex; justify-content: center; align-items: center; min-height: 450px;
        }

        .canvas-wrapper {
            position: relative; width: 450px; height: 450px;
            border-radius: 30px; box-shadow: 0 15px 45px rgba(0,0,0,0.1);
            background: white; overflow: hidden;
        }
        .slate-bg { background: var(--slate-bg); box-shadow: inset 0 0 50px rgba(0,0,0,0.4); }

        canvas { position: absolute; top: 0; left: 0; }

        .progress-bar-container {
            width: 100%; height: 12px; background: #f1f2f6;
            border-radius: 6px; overflow: hidden;
        }
        .progress-fill { width: 0%; height: 100%; background: #55efc4; transition: width 0.3s; }

        .btn-bubble {
            border: none; padding: 12px 30px; border-radius: 50px;
            font-weight: bold; color: white; transition: 0.2s; margin: 0 5px;
        }
        .bubble-blue { background: var(--accent-secondary); }
        .bubble-orange { background: #fab1a0; }
        .btn-bubble:hover { transform: scale(1.05); }

        .btn-reset {
            background: none; border: 2px dashed #b2bec3; padding: 8px 20px;
            border-radius: 20px; color: #636e72; font-weight: bold;
        }

        .alphabet-nav-wrapper { background: white; border-top: 2px solid #f1f2f6; }
        .nav-scroll::-webkit-scrollbar { height: 6px; }
        .nav-scroll button {
            min-width: 50px; height: 50px; border-radius: 15px;
            border: 2px solid #f1f2f6; background: white;
            font-family: 'Lilita One', cursive; font-size: 1.4rem; color: #b2bec3;
        }
        .nav-scroll button.active { background: #74b9ff; color: white; border-color: #74b9ff; transform: scale(1.1); }

        .reward-card { border-radius: 40px; border: 8px solid #55efc4; }
        .reward-spark { font-family: 'Lilita One', cursive; font-size: 3rem; color: #55efc4; }
        .reward-media { margin: 30px 0; display: flex; justify-content: center; align-items: center; gap: 20px; }
        .big-trio { transform: scale(3.5); }
        .big-emoji { font-size: 8rem; margin-left: 20px; }
        .reward-text { font-size: 1.5rem; font-weight: bold; margin-top: 40px; }

        .btn-start {
            background: #55efc4; color: white; padding: 15px; border-radius: 20px;
            border: none; font-weight: bold; font-size: 1.5rem;
        }

        .shake { animation: shake 0.4s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>

      <div className="app-container">
        <div className="container-fluid text-center py-3">
          <div className="d-flex justify-content-between align-items-center">
            <Link href="/" className="btn-home">
              🏠 Menu
            </Link>
            <div className="step-indicator">
              <span id="step-1-dot" className="dot active"></span>
              <span id="step-connector" className="line"></span>
              <span id="step-2-dot" className="dot"></span>
            </div>
            <div id="letter-display-box" className="current-letter-box trio-display">
              <span className="caps">A</span>
              <span className="small">a</span>
              <span className="cursive">A</span>
            </div>
          </div>
        </div>

        <div className="main-activity-container container mt-2">
          <div className="activity-card shadow-lg">
            <div className="activity-instruction" id="activity-title">
              Step 1: Color to reveal the Apple! 🎨
            </div>

            <div className="canvas-stage">
              <div id="coloring-group" className="activity-group">
                <div className="canvas-wrapper">
                  <canvas id="bottom-canvas" width={450} height={450}></canvas>
                  <canvas id="top-canvas" width={450} height={450}></canvas>
                  <canvas id="interaction-canvas" width={450} height={450}></canvas>
                </div>
                <div className="mt-3">
                  <div className="progress-bar-container">
                    <div className="progress-fill" id="progress-fill"></div>
                  </div>
                  <p className="mt-2 text-muted">Keep coloring to unlock tracing!</p>
                </div>
              </div>

              <div id="tracing-group" className="activity-group d-none">
                <div className="canvas-wrapper slate-bg">
                  <canvas id="tracing-guide-canvas" width={450} height={450}></canvas>
                  <canvas id="tracing-user-canvas" width={450} height={450}></canvas>
                </div>
                <div className="mt-3 group-controls">
                  <button id="show-trace-example" className="btn-bubble bubble-blue">
                    Watch How
                  </button>
                  <button id="reset-trace" className="btn-bubble bubble-orange">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="activity-footer mt-4">
              <button id="reset-activity" className="btn-reset">
                🔄 Clear Page
              </button>
            </div>
          </div>
        </div>

        <div className="alphabet-nav-wrapper mt-auto">
          <div id="alphabet-nav" className="nav-scroll d-flex gap-3 px-4 py-3"></div>
        </div>
      </div>

      <div className="modal fade" id="successModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content reward-card">
            <div className="modal-body text-center p-5">
              <h2 className="reward-spark">🌟 SUPERB! 🌟</h2>
              <div className="reward-media">
                <div id="reward-letter" className="trio-display big-trio">
                  <span className="caps">A</span>
                  <span className="small">a</span>
                  <span className="cursive">A</span>
                </div>
                <span id="reward-emoji" className="big-emoji">
                  🍎
                </span>
              </div>
              <p className="reward-text">
                You colored the <b>Apple</b> and traced <b>A</b>!
              </p>
              <button id="modal-next-btn" className="btn-start w-100 mt-4">
                Next Letter →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
