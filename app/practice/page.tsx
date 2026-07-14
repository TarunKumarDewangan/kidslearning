'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PracticePage() {
  useEffect(() => {
    const gridCanvas = document.getElementById('grid-canvas') as HTMLCanvasElement,
      inkCanvas = document.getElementById('ink-canvas') as HTMLCanvasElement;
    const gCtx = gridCanvas.getContext('2d')!,
      iCtx = inkCanvas.getContext('2d')!;

    const sidebar = document.getElementById('alphabet-sidebar')!,
      charUpper = document.getElementById('char-upper')!,
      charLower = document.getElementById('char-lower')!,
      clearBtn = document.getElementById('clear-workbook')! as HTMLButtonElement,
      finishBtn = document.getElementById('finish-page')!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    let currentLetter = 'A';
    let currentStyle: 'caps' | 'small' | 'cursive' = 'caps';
    let isDrawing = false;
    let lastX = 0,
      lastY = 0;
    let isAnimatingGuide = false;
    let demoRaf = 0;
    let cancelled = false;

    const ROW_COUNT = 1;
    const ROW_HEIGHT = 700;
    const TOP_MARGIN = 60;
    const LINE_OFFSETS = [100, 250, 400, 550];

    const alphabetData: Record<string, { points: ({ x: number; y: number } | null)[] }> = {
      A: { points: [{ x: 225, y: 80 }, { x: 100, y: 380 }, null, { x: 225, y: 80 }, { x: 350, y: 380 }, null, { x: 150, y: 260 }, { x: 300, y: 260 }] },
      B: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 260, y: 60 }, { x: 330, y: 110 }, { x: 330, y: 180 }, { x: 260, y: 220 }, { x: 140, y: 220 }, null, { x: 140, y: 220 }, { x: 280, y: 220 }, { x: 350, y: 280 }, { x: 350, y: 340 }, { x: 280, y: 380 }, { x: 140, y: 380 }] },
      C: { points: [{ x: 350, y: 120 }, { x: 330, y: 90 }, { x: 280, y: 65 }, { x: 225, y: 60 }, { x: 170, y: 65 }, { x: 120, y: 90 }, { x: 100, y: 150 }, { x: 100, y: 280 }, { x: 120, y: 340 }, { x: 170, y: 370 }, { x: 225, y: 390 }, { x: 280, y: 385 }, { x: 330, y: 360 }, { x: 350, y: 330 }] },
      D: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 360, y: 140 }, { x: 360, y: 300 }, { x: 280, y: 380 }, { x: 140, y: 380 }] },
      E: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 350, y: 60 }, null, { x: 140, y: 220 }, { x: 320, y: 220 }, null, { x: 140, y: 380 }, { x: 350, y: 380 }] },
      F: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 350, y: 60 }, null, { x: 140, y: 220 }, { x: 320, y: 220 }] },
      G: { points: [{ x: 350, y: 120 }, { x: 330, y: 90 }, { x: 280, y: 65 }, { x: 225, y: 60 }, { x: 170, y: 65 }, { x: 120, y: 90 }, { x: 100, y: 150 }, { x: 100, y: 280 }, { x: 120, y: 340 }, { x: 170, y: 370 }, { x: 225, y: 390 }, { x: 280, y: 390 }, { x: 350, y: 390 }, { x: 350, y: 240 }, { x: 260, y: 240 }] },
      H: { points: [{ x: 120, y: 60 }, { x: 120, y: 380 }, null, { x: 330, y: 60 }, { x: 330, y: 380 }, null, { x: 120, y: 220 }, { x: 330, y: 220 }] },
      I: { points: [{ x: 160, y: 60 }, { x: 290, y: 60 }, null, { x: 225, y: 60 }, { x: 225, y: 380 }, null, { x: 160, y: 380 }, { x: 290, y: 380 }] },
      J: { points: [{ x: 180, y: 60 }, { x: 330, y: 60 }, null, { x: 280, y: 60 }, { x: 280, y: 320 }, { x: 270, y: 350 }, { x: 240, y: 380 }, { x: 200, y: 390 }, { x: 150, y: 380 }, { x: 120, y: 330 }] },
      K: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 350, y: 60 }, { x: 140, y: 220 }, { x: 350, y: 380 }] },
      L: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, { x: 350, y: 380 }] },
      M: { points: [{ x: 100, y: 380 }, { x: 100, y: 60 }, { x: 225, y: 220 }, { x: 350, y: 60 }, { x: 350, y: 380 }] },
      N: { points: [{ x: 120, y: 380 }, { x: 120, y: 60 }, { x: 330, y: 380 }, { x: 330, y: 60 }] },
      O: { points: [{ x: 225, y: 60 }, { x: 280, y: 65 }, { x: 330, y: 90 }, { x: 350, y: 150 }, { x: 355, y: 225 }, { x: 350, y: 300 }, { x: 330, y: 360 }, { x: 280, y: 385 }, { x: 225, y: 390 }, { x: 170, y: 385 }, { x: 120, y: 360 }, { x: 100, y: 300 }, { x: 95, y: 225 }, { x: 100, y: 150 }, { x: 120, y: 90 }, { x: 170, y: 65 }, { x: 225, y: 60 }] },
      P: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 350, y: 130 }, { x: 280, y: 200 }, { x: 140, y: 200 }] },
      Q: { points: [{ x: 225, y: 60 }, { x: 280, y: 65 }, { x: 330, y: 90 }, { x: 350, y: 150 }, { x: 355, y: 225 }, { x: 350, y: 300 }, { x: 330, y: 360 }, { x: 280, y: 385 }, { x: 225, y: 390 }, { x: 170, y: 385 }, { x: 120, y: 360 }, { x: 100, y: 300 }, { x: 95, y: 225 }, { x: 100, y: 150 }, { x: 120, y: 90 }, { x: 170, y: 65 }, { x: 225, y: 60 }, null, { x: 280, y: 310 }, { x: 380, y: 400 }] },
      R: { points: [{ x: 140, y: 60 }, { x: 140, y: 380 }, null, { x: 140, y: 60 }, { x: 280, y: 60 }, { x: 350, y: 130 }, { x: 280, y: 200 }, { x: 140, y: 200 }, null, { x: 200, y: 200 }, { x: 350, y: 380 }] },
      S: { points: [{ x: 350, y: 120 }, { x: 300, y: 75 }, { x: 240, y: 60 }, { x: 180, y: 70 }, { x: 140, y: 110 }, { x: 140, y: 180 }, { x: 180, y: 220 }, { x: 240, y: 240 }, { x: 300, y: 260 }, { x: 330, y: 330 }, { x: 300, y: 370 }, { x: 220, y: 390 }, { x: 150, y: 370 }, { x: 110, y: 330 }] },
      T: { points: [{ x: 120, y: 60 }, { x: 330, y: 60 }, null, { x: 225, y: 60 }, { x: 225, y: 380 }] },
      U: { points: [{ x: 120, y: 60 }, { x: 120, y: 280 }, { x: 130, y: 320 }, { x: 160, y: 360 }, { x: 225, y: 390 }, { x: 290, y: 360 }, { x: 320, y: 320 }, { x: 330, y: 280 }, { x: 330, y: 60 }] },
      V: { points: [{ x: 100, y: 60 }, { x: 225, y: 380 }, { x: 350, y: 60 }] },
      W: { points: [{ x: 80, y: 60 }, { x: 150, y: 380 }, { x: 225, y: 150 }, { x: 300, y: 380 }, { x: 370, y: 60 }] },
      X: { points: [{ x: 100, y: 60 }, { x: 350, y: 380 }, null, { x: 350, y: 60 }, { x: 100, y: 380 }] },
      Y: { points: [{ x: 100, y: 60 }, { x: 225, y: 220 }, { x: 350, y: 60 }, null, { x: 225, y: 220 }, { x: 225, y: 380 }] },
      Z: { points: [{ x: 120, y: 60 }, { x: 330, y: 60 }, { x: 120, y: 380 }, { x: 330, y: 380 }] },
    };

    function scalePoint(p: { x: number; y: number } | null) {
      if (!p) return null;
      const scale = 300 / 330;
      return {
        x: (p.x - 100) * scale + 100,
        y: (p.y - 60) * scale + 100,
      };
    }

    function initAlphabet() {
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l) => {
        const btn = document.createElement('button');
        btn.textContent = l;
        if (l === currentLetter) btn.classList.add('active');
        btn.onclick = () => loadLetter(l);
        sidebar.appendChild(btn);
      });

      document.querySelectorAll('.style-btn').forEach((btn) => {
        (btn as HTMLElement).onclick = () => {
          currentStyle = (btn as HTMLElement).dataset.style as 'caps' | 'small' | 'cursive';
          document.querySelectorAll('.style-btn').forEach((b) => b.classList.toggle('active', b === btn));
          drawGrid();
        };
      });
    }

    function drawGrid() {
      if (isAnimatingGuide) return;
      gCtx.clearRect(0, 0, 1000, 1500);

      for (let i = 0; i < ROW_COUNT; i++) {
        const yBase = TOP_MARGIN + i * ROW_HEIGHT;

        LINE_OFFSETS.forEach((offset, idx) => {
          gCtx.beginPath();
          gCtx.strokeStyle = idx === 0 || idx === 3 ? '#f3a683' : '#7ed6df';
          gCtx.lineWidth = idx === 0 || idx === 3 ? 4 : 2;
          gCtx.moveTo(50, yBase + offset);
          gCtx.lineTo(950, yBase + offset);
          gCtx.stroke();
        });

        gCtx.save();
        const xStart = 100;
        const baseline = yBase + 400;

        if (currentStyle === 'caps' && alphabetData[currentLetter]) {
          const kp = alphabetData[currentLetter].points;
          gCtx.strokeStyle = 'rgba(0,0,0,0.06)';
          gCtx.lineWidth = 40;
          gCtx.lineCap = 'round';
          gCtx.lineJoin = 'round';
          gCtx.beginPath();
          let started = false;
          kp.forEach((p) => {
            const sp = scalePoint(p);
            if (!sp) {
              started = false;
              return;
            }
            if (!started) {
              gCtx.moveTo(sp.x, sp.y);
              started = true;
            } else {
              gCtx.lineTo(sp.x, sp.y);
            }
          });
          gCtx.stroke();
        } else {
          gCtx.fillStyle = 'rgba(0,0,0,0.06)';
          if (currentStyle === 'small') {
            gCtx.font = '320px "Outfit", sans-serif';
            gCtx.fillText(currentLetter.toLowerCase(), xStart, baseline);
          } else {
            gCtx.font = '300px "Dancing Script", cursive';
            gCtx.fillText(currentLetter, xStart, baseline);
          }
        }
        gCtx.restore();

        gCtx.fillStyle = '#b2bec3';
        gCtx.font = 'bold 24px Outfit';
        gCtx.textAlign = 'right';
        gCtx.fillText('START HERE', 90, yBase + 80);
      }
    }

    function runGuideAnimation() {
      if (isAnimatingGuide) return;
      isAnimatingGuide = true;
      clearBtn.disabled = true;

      const data = alphabetData[currentLetter];
      if (!data || currentStyle !== 'caps') {
        alert('Watch How is currently available for CAPS mode!');
        isAnimatingGuide = false;
        clearBtn.disabled = false;
        return;
      }

      const rawPoints = data.points;
      const scaledPoints = rawPoints.map(scalePoint);
      const segments: { s: { x: number; y: number }; e: { x: number; y: number }; len: number; isNew: boolean }[] = [];
      let totalLen = 0;
      let isNew = true;

      for (let i = 0; i < scaledPoints.length - 1; i++) {
        if (!scaledPoints[i] || !scaledPoints[i + 1]) {
          isNew = true;
          continue;
        }
        const len = Math.hypot(scaledPoints[i + 1]!.x - scaledPoints[i]!.x, scaledPoints[i + 1]!.y - scaledPoints[i]!.y);
        segments.push({ s: scaledPoints[i]!, e: scaledPoints[i + 1]!, len, isNew });
        totalLen += len;
        isNew = false;
      }

      let startTime: number | null = null;
      const duration = 2500;

      function animate(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        drawGrid();
        const drawLen = totalLen * progress;
        let currentLen = 0;
        let curPos = segments[0] ? segments[0].s : { x: 0, y: 0 };

        gCtx.strokeStyle = '#0dcaf0';
        gCtx.lineWidth = 25;
        gCtx.lineCap = 'round';
        gCtx.beginPath();
        for (const seg of segments) {
          if (seg.isNew) gCtx.moveTo(seg.s.x, seg.s.y);
          if (currentLen + seg.len > drawLen) {
            const sp = (drawLen - currentLen) / seg.len;
            curPos = { x: seg.s.x + (seg.e.x - seg.s.x) * sp, y: seg.s.y + (seg.e.y - seg.s.y) * sp };
            gCtx.lineTo(curPos.x, curPos.y);
            break;
          }
          gCtx.lineTo(seg.e.x, seg.e.y);
          currentLen += seg.len;
          curPos = seg.e;
        }
        gCtx.stroke();

        gCtx.beginPath();
        gCtx.arc(curPos.x, curPos.y, 20, 0, Math.PI * 2);
        gCtx.fillStyle = 'rgba(13, 202, 240, 0.7)';
        gCtx.fill();

        if (progress < 1) {
          demoRaf = requestAnimationFrame(animate);
        } else {
          isAnimatingGuide = false;
          clearBtn.disabled = false;
        }
      }
      demoRaf = requestAnimationFrame(animate);
    }

    function loadLetter(l: string) {
      currentLetter = l;
      charUpper.textContent = l;
      charLower.textContent = l.toLowerCase();
      document.getElementById('char-cursive')!.textContent = l;

      document.querySelectorAll('.alphabet-list button').forEach((b) => b.classList.toggle('active', b.textContent === l));

      iCtx.clearRect(0, 0, 1000, 1500);
      drawGrid();

      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(`${l} as in ${getWord(l)}`);
        window.speechSynthesis.speak(utter);
      }
    }

    function getWord(l: string) {
      const words: Record<string, string> = {
        A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Fish', G: 'Grapes', H: 'Hat', I: 'Igloo', J: 'Jug',
        K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Net', O: 'Orange', P: 'Parrot', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
        U: 'Umbrella', V: 'Van', W: 'Watch', X: 'Xylophone', Y: 'Yo-yo', Z: 'Zebra',
      };
      return words[l] || 'Learn';
    }

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = inkCanvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const scaleX = inkCanvas.width / rect.width;
      const scaleY = inkCanvas.height / rect.height;
      return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
    }

    function startDraw(e: MouseEvent | TouchEvent) {
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }

    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;
      const pos = getPos(e);

      iCtx.strokeStyle = '#2d3436';
      iCtx.lineWidth = 4;
      iCtx.lineCap = 'round';
      iCtx.lineJoin = 'round';

      iCtx.beginPath();
      iCtx.moveTo(lastX, lastY);
      iCtx.lineTo(pos.x, pos.y);
      iCtx.stroke();

      lastX = pos.x;
      lastY = pos.y;
    }

    function endDraw() {
      isDrawing = false;
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      startDraw(e);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      draw(e);
    }

    inkCanvas.addEventListener('mousedown', startDraw);
    inkCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);
    inkCanvas.addEventListener('touchstart', onTouchStart);
    inkCanvas.addEventListener('touchmove', onTouchMove);
    inkCanvas.addEventListener('touchend', endDraw);

    function onShowExample() {
      runGuideAnimation();
    }
    function onClear() {
      iCtx.clearRect(0, 0, 1000, 1500);
    }
    function onFinish() {
      successModal.show();
    }

    const showExampleBtn = document.getElementById('show-example-btn')!;
    showExampleBtn.addEventListener('click', onShowExample);
    clearBtn.addEventListener('click', onClear);
    finishBtn.addEventListener('click', onFinish);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).nextLetter = () => {
      successModal.hide();
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const idx = (alpha.indexOf(currentLetter) + 1) % 26;
      loadLetter(alpha[idx]);
    };

    initAlphabet();
    loadLetter('A');

    return () => {
      cancelled = true;
      void cancelled;
      cancelAnimationFrame(demoRaf);
      inkCanvas.removeEventListener('mousedown', startDraw);
      inkCanvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', endDraw);
      inkCanvas.removeEventListener('touchstart', onTouchStart);
      inkCanvas.removeEventListener('touchmove', onTouchMove);
      inkCanvas.removeEventListener('touchend', endDraw);
      showExampleBtn.removeEventListener('click', onShowExample);
      clearBtn.removeEventListener('click', onClear);
      finishBtn.removeEventListener('click', onFinish);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).nextLetter;
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;700&family=Playfair+Display:ital,wght@1,700&family=Dancing+Script:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
            --paper-white: #fdfdfd;
            --red-line: #ff7675;
            --blue-line: #74b9ff;
            --ink-color: #2d3436;
            --sidebar-bg: #f1f2f6;
        }

        body {
            background-color: #cbdcf7;
            font-family: 'Outfit', sans-serif;
            margin: 0; padding: 0;
            height: 100vh;
            overflow: hidden;
        }

        .workbook-container {
            display: flex;
            height: 100vh;
        }

        .side-nav {
            width: 80px;
            background: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
            box-shadow: 2px 0 10px rgba(0,0,0,0.05);
            z-index: 10;
        }

        .nav-icon { font-size: 2rem; text-decoration: none; cursor: pointer; transition: 0.2s; }
        .nav-icon:hover { transform: scale(1.2); }

        .alphabet-list {
            flex-grow: 1;
            overflow-y: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 0 5px;
        }
        .alphabet-list::-webkit-scrollbar { width: 4px; }
        .alphabet-list button {
            background: white; border: none; border-radius: 12px;
            padding: 10px 0; font-family: 'Lilita One', cursive;
            font-size: 1.2rem; color: #636e72; transition: 0.2s;
        }
        .alphabet-list button.active { background: var(--blue-line); color: white; transform: scale(1.1); }

        .main-workbook {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 20px 40px;
        }

        .workbook-header { margin-bottom: 20px; }
        .workbook-title { font-family: 'Lilita One', cursive; font-size: 2.5rem; color: #2d3436; margin: 0; }
        .subtitle { font-size: 1.2rem; color: #636e72; }

        .current-char-display {
            background: white; padding: 20px 40px; border-radius: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            font-family: 'Outfit', sans-serif; font-size: 4.5rem;
            color: #2d3436; border: 4px solid #7ed6df;
        }
        .current-char-display span { margin: 0; display: block; line-height: 1; }

        .worksheet-area {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px 0 40px;
        }

        .style-btn {
            background: white; border: 2px solid #7ed6df; border-radius: 10px;
            padding: 5px 15px; font-weight: bold; font-size: 0.9rem;
            color: #636e72; transition: 0.2s;
        }
        .style-btn.active { background: #7ed6df; color: white; }

        .workbook-page {
            background-color: var(--paper-white);
            width: 100%;
            max-width: 1000px;
            margin: 40px auto;
            min-height: 800px;
            position: relative;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .drawing-wrap {
            position: relative; width: 1000px; height: 800px; cursor: crosshair;
        }

        canvas { position: absolute; top: 0; left: 0; }

        .btn-workbook {
            border: none; padding: 12px 30px; border-radius: 30px;
            font-weight: bold; font-size: 1.1rem; transition: 0.2s; margin-left: 10px;
        }
        .btn-clear { background: #f1f2f6; color: #636e72; }
        .btn-watch { background: #0dcaf0; color: white; box-shadow: 0 4px 15px rgba(13,202,240,0.3); }
        .btn-finish { background: #55efc4; color: white; box-shadow: 0 4px 15px rgba(85,239,196,0.3); }
        .btn-workbook:hover { transform: translateY(-3px); opacity: 0.9; }

        .reward-card { border-radius: 40px; border: 8px solid #55efc4; overflow: hidden; }
        .star-burst { font-size: 6rem; animation: rotate 4s infinite linear; margin-bottom: 20px; }
        @keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .reward-title { font-family: 'Lilita One', cursive; font-size: 3.5rem; color: #55efc4; }
        .btn-next {
            background: #55efc4; border: none; padding: 15px; border-radius: 20px;
            color: white; font-weight: bold; font-size: 1.5rem;
        }
      `}</style>

      <div className="workbook-container">
        <div className="side-nav">
          <Link href="/" className="nav-icon mb-4">
            🏠
          </Link>
          <div id="alphabet-sidebar" className="alphabet-list"></div>
        </div>

        <div className="main-workbook">
          <header className="workbook-header d-flex justify-content-between align-items-center">
            <div className="title-group">
              <h1 className="workbook-title">Writing Practice</h1>
              <div className="style-selector d-flex gap-2 mt-2">
                <button className="style-btn active" data-style="caps">
                  CAPS
                </button>
                <button className="style-btn" data-style="small">
                  small
                </button>
                <button className="style-btn" data-style="cursive">
                  Cursive
                </button>
              </div>
            </div>
            <div className="current-char-display">
              <span id="char-upper">A</span>
              <span id="char-lower" className="d-none">
                a
              </span>
              <span id="char-cursive" className="d-none">
                A
              </span>
            </div>
            <div className="header-actions">
              <button id="show-example-btn" className="btn-workbook btn-watch">
                Watch How 📺
              </button>
              <button id="clear-workbook" className="btn-workbook btn-clear">
                Clear Page
              </button>
              <button id="finish-page" className="btn-workbook btn-finish">
                Finish Page 🎉
              </button>
            </div>
          </header>

          <div className="worksheet-area" id="worksheet-area">
            <div className="workbook-page shadow">
              <div id="drawing-wrap" className="drawing-wrap">
                <canvas id="grid-canvas" width={1000} height={1500}></canvas>
                <canvas id="ink-canvas" width={1000} height={1500}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="successModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content reward-card">
            <div className="modal-body text-center p-5">
              <div className="star-burst">⭐</div>
              <h2 className="reward-title">EXCELLENT!</h2>
              <p className="reward-sub">You practiced 10 times! Your handwriting is getting better! ✍️</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <button className="btn-next w-100 mt-4" onClick={() => (window as any).nextLetter?.()}>
                Next Letter →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
