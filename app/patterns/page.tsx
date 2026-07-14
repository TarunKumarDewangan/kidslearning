'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PatternsPage() {
  useEffect(() => {
    const bCanvas = document.getElementById('bottom-canvas') as HTMLCanvasElement,
      gCanvas = document.getElementById('guide-canvas') as HTMLCanvasElement,
      uCanvas = document.getElementById('user-canvas') as HTMLCanvasElement,
      iCanvas = document.getElementById('interaction-canvas') as HTMLCanvasElement;

    const gCtx = gCanvas.getContext('2d')!,
      uCtx = uCanvas.getContext('2d')!,
      iCtx = iCanvas.getContext('2d')!;
    void bCanvas;

    const patternsList = document.getElementById('patterns-list')!,
      patternTitle = document.getElementById('pattern-title')!,
      showGuideBtn = document.getElementById('show-guide')!,
      resetBtn = document.getElementById('reset-trace')!,
      nextBtn = document.getElementById('modal-next-btn')!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bootstrap = (window as any).bootstrap;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    function generateCurve(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
      const pts: { x: number; y: number }[] = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / steps);
        pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      }
      return pts;
    }

    const patterns = [
      { id: 'standing', name: 'Standing Line', symbol: '❘', points: [{ x: 300, y: 100 }, { x: 300, y: 500 }] },
      { id: 'sleeping', name: 'Sleeping Line', symbol: '➖', points: [{ x: 100, y: 300 }, { x: 500, y: 300 }] },
      { id: 'slant-right', name: 'Right Slant', symbol: '╱', points: [{ x: 450, y: 100 }, { x: 150, y: 500 }] },
      { id: 'slant-left', name: 'Left Slant', symbol: '╲', points: [{ x: 150, y: 100 }, { x: 450, y: 500 }] },
      { id: 'curve-right', name: 'Right Curve', symbol: '◗', points: generateCurve(300, 300, 200, -Math.PI / 2, Math.PI / 2) },
      { id: 'curve-left', name: 'Left Curve', symbol: '◖', points: generateCurve(300, 300, 200, Math.PI / 2, (3 * Math.PI) / 2) },
    ];

    let currentPatternIndex = 0;
    let isDrawing = false,
      isAnimating = false;
    let traceDots: { x: number; y: number }[] = [],
      nextDotIndex = 0;
    let demoRaf = 0;
    let cancelled = false;

    function initSidebar() {
      patternsList.innerHTML = '';
      patterns.forEach((p, idx) => {
        const btn = document.createElement('button');
        btn.className = `list-group-item list-group-item-action ${idx === currentPatternIndex ? 'active' : ''}`;
        btn.innerHTML = `<span class="fs-4 me-3">${p.symbol}</span> ${p.name}`;
        btn.onclick = () => loadPattern(idx);
        patternsList.appendChild(btn);
      });
    }

    function loadPattern(idx: number) {
      currentPatternIndex = idx;
      const p = patterns[idx];
      patternTitle.textContent = p.name;

      document.querySelectorAll('.list-group-item').forEach((b, i) => b.classList.toggle('active', i === idx));

      traceDots = [];
      nextDotIndex = 0;
      const kp = p.points;
      const spacing = 40;
      for (let i = 0; i < kp.length - 1; i++) {
        const d = Math.hypot(kp[i + 1].x - kp[i].x, kp[i + 1].y - kp[i].y);
        const steps = Math.max(1, Math.floor(d / spacing));
        for (let j = 0; j < steps; j++) {
          traceDots.push({ x: kp[i].x + (kp[i + 1].x - kp[i].x) * (j / steps), y: kp[i].y + (kp[i + 1].y - kp[i].y) * (j / steps) });
        }
      }
      traceDots.push(kp[kp.length - 1]);

      resetDrawing();
      drawGuide();
    }

    function resetDrawing() {
      nextDotIndex = 0;
      uCtx.clearRect(0, 0, 600, 600);
      iCtx.clearRect(0, 0, 600, 600);
      gCtx.clearRect(0, 0, 600, 600);
    }

    function drawGuide() {
      gCtx.clearRect(0, 0, 600, 600);
      const p = patterns[currentPatternIndex];

      gCtx.beginPath();
      gCtx.setLineDash([15, 15]);
      gCtx.strokeStyle = '#dfe6e9';
      gCtx.lineWidth = 30;
      gCtx.lineCap = 'round';
      gCtx.lineJoin = 'round';
      gCtx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) gCtx.lineTo(p.points[i].x, p.points[i].y);
      gCtx.stroke();
      gCtx.setLineDash([]);

      p.points.forEach((pt, i) => {
        gCtx.fillStyle = '#ffc107';
        gCtx.beginPath();
        gCtx.arc(pt.x, pt.y, 20, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.strokeStyle = 'white';
        gCtx.lineWidth = 4;
        gCtx.stroke();
        gCtx.fillStyle = '#2d3436';
        gCtx.font = 'bold 20px Outfit';
        gCtx.textAlign = 'center';
        gCtx.textBaseline = 'middle';
        gCtx.fillText(String(i + 1), pt.x, pt.y);
      });
    }

    function runWatchHow() {
      if (isAnimating) return;
      isAnimating = true;
      uCtx.clearRect(0, 0, 600, 600);
      let startTime: number | null = null;
      const duration = 2000;
      const pts = patterns[currentPatternIndex].points;

      function animate(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const prog = Math.min((timestamp - startTime) / duration, 1);

        uCtx.clearRect(0, 0, 600, 600);
        uCtx.strokeStyle = 'rgba(77, 171, 247, 0.4)';
        uCtx.lineWidth = 25;
        uCtx.lineCap = 'round';
        uCtx.beginPath();

        const totalLen = pts.reduce((acc, p, i) => (i > 0 ? acc + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);
        const targetLen = totalLen * prog;

        let currentLen = 0;
        uCtx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          if (currentLen + segLen > targetLen) {
            const sp = (targetLen - currentLen) / segLen;
            uCtx.lineTo(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * sp, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * sp);
            break;
          }
          uCtx.lineTo(pts[i].x, pts[i].y);
          currentLen += segLen;
        }
        uCtx.stroke();

        if (prog < 1) {
          demoRaf = requestAnimationFrame(animate);
        } else {
          isAnimating = false;
          uCtx.clearRect(0, 0, 600, 600);
        }
      }
      demoRaf = requestAnimationFrame(animate);
    }

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = iCanvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) * (600 / rect.width), y: (cy - rect.top) * (600 / rect.height) };
    }

    function handleDraw(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;
      const pos = getPos(e);

      iCtx.clearRect(0, 0, 600, 600);
      iCtx.beginPath();
      iCtx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      iCtx.fillStyle = 'rgba(77, 171, 247, 0.2)';
      iCtx.fill();

      const target = traceDots[nextDotIndex];
      if (target && Math.hypot(pos.x - target.x, pos.y - target.y) < 50) {
        uCtx.strokeStyle = '#4dabf7';
        uCtx.lineWidth = 20;
        uCtx.lineCap = 'round';
        uCtx.lineJoin = 'round';
        if (nextDotIndex > 0) {
          uCtx.beginPath();
          uCtx.moveTo(traceDots[nextDotIndex - 1].x, traceDots[nextDotIndex - 1].y);
          uCtx.lineTo(target.x, target.y);
          uCtx.stroke();
        }
        nextDotIndex++;
        if (nextDotIndex >= traceDots.length) successModal.show();
      }
    }

    function onMouseDown() {
      isDrawing = true;
    }
    function onMouseUp() {
      isDrawing = false;
      iCtx.clearRect(0, 0, 600, 600);
    }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      isDrawing = true;
      handleDraw(e);
    }
    function onTouchEnd() {
      isDrawing = false;
    }

    iCanvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    iCanvas.addEventListener('mousemove', handleDraw);
    iCanvas.addEventListener('touchstart', onTouchStart);
    iCanvas.addEventListener('touchmove', handleDraw);
    window.addEventListener('touchend', onTouchEnd);

    function onNext() {
      successModal.hide();
      loadPattern((currentPatternIndex + 1) % patterns.length);
    }
    function onReset() {
      loadPattern(currentPatternIndex);
    }

    showGuideBtn.addEventListener('click', runWatchHow);
    resetBtn.addEventListener('click', onReset);
    nextBtn.addEventListener('click', onNext);

    void cancelled;
    initSidebar();
    loadPattern(0);

    return () => {
      cancelled = true;
      cancelAnimationFrame(demoRaf);
      iCanvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      iCanvas.removeEventListener('mousemove', handleDraw);
      iCanvas.removeEventListener('touchstart', onTouchStart);
      iCanvas.removeEventListener('touchmove', handleDraw);
      window.removeEventListener('touchend', onTouchEnd);
      showGuideBtn.removeEventListener('click', runWatchHow);
      resetBtn.removeEventListener('click', onReset);
      nextBtn.removeEventListener('click', onNext);
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
            --bg-color: #f0f7ff;
            --primary-color: #4dabf7;
            --secondary-color: #ff922b;
            --success-color: #55efc4;
            --text-color: #2d3436;
        }

        body {
            background-color: var(--bg-color);
            font-family: 'Outfit', sans-serif;
            color: var(--text-color);
            margin: 0; padding: 0;
            height: 100vh;
            overflow: hidden;
        }

        .navbar-custom {
            background: white;
            padding: 1rem 2rem;
            z-index: 100;
        }

        .title {
            font-family: 'Lilita One', cursive;
            font-size: 2rem;
            color: var(--text-color);
        }

        .btn-home {
            text-decoration: none;
            font-weight: bold;
            color: var(--primary-color);
            font-size: 1.2rem;
        }

        .header-actions .btn-action {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: bold;
            margin-left: 10px;
            transition: 0.2s;
        }

        .header-actions .btn-reset { background: #fab1a0; }
        .header-actions .btn-action:hover { transform: scale(1.05); }

        .main-layout {
            display: flex;
            height: calc(100vh - 80px);
        }

        .sidebar-patterns {
            width: 250px;
            background: white;
            overflow-y: auto;
            border-right: 1px solid #eee;
        }

        .list-group-item {
            border: none;
            padding: 15px 20px;
            font-weight: bold;
            color: #636e72;
            cursor: pointer;
            border-radius: 12px;
            margin-bottom: 5px;
            transition: 0.2s;
        }

        .list-group-item:hover { background: #f1f2f6; }
        .list-group-item.active {
            background: var(--primary-color) !important;
            color: white !important;
        }

        .tracing-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .canvas-wrap {
            position: relative;
            background: white;
            border-radius: 30px;
            width: 600px;
            height: 600px;
            cursor: crosshair;
        }

        canvas {
            position: absolute;
            top: 0;
            left: 0;
        }

        .instruction-text {
            font-size: 1.5rem;
            color: #636e72;
            font-weight: bold;
        }

        .reward-card {
            border-radius: 50px;
            border: 10px solid var(--success-color);
        }

        .star-burst {
            font-size: 6rem;
            animation: bounce 1.5s infinite;
        }

        @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }

        .reward-title {
            font-family: 'Lilita One', cursive;
            font-size: 3.5rem;
            color: var(--success-color);
        }

        .btn-next {
            background: var(--success-color);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.5rem;
        }
      `}</style>

      <div className="app-container">
        <div className="navbar-custom py-3 shadow-sm bg-white">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <Link href="/" className="btn-home">
              🏠 Menu
            </Link>
            <h1 id="pattern-title" className="title m-0">
              Standing Line
            </h1>
            <div className="header-actions">
              <button id="show-guide" className="btn-action">
                Watch How
              </button>
              <button id="reset-trace" className="btn-action btn-reset">
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="main-layout">
          <div className="sidebar-patterns shadow-sm">
            <div id="patterns-list" className="list-group p-3"></div>
          </div>

          <div className="tracing-content">
            <div className="canvas-wrap shadow-sm">
              <canvas id="bottom-canvas" width={600} height={600}></canvas>
              <canvas id="guide-canvas" width={600} height={600}></canvas>
              <canvas id="user-canvas" width={600} height={600}></canvas>
              <canvas id="interaction-canvas" width={600} height={600}></canvas>
            </div>
            <div className="instruction-text mt-3">Follow the dots to trace the line! ✨</div>
          </div>
        </div>

        <div className="modal fade" id="successModal" tabIndex={-1} data-bs-backdrop="static">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content reward-card">
              <div className="modal-body text-center p-5">
                <div className="star-burst">🌟</div>
                <h2 className="reward-title">EXCELLENT!</h2>
                <p className="fs-4 fw-bold">You traced the pattern perfectly!</p>
                <button id="modal-next-btn" className="btn-next w-100 mt-4">
                  Next Pattern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
