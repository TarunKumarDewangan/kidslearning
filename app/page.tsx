import Link from "next/link";

export default function MenuPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body {
            background-color: #f0f7ff;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            overflow-x: hidden;
        }

        .menu-container {
            max-width: 900px;
            padding: 40px;
            text-align: center;
        }

        h1 {
            font-family: 'Lilita One', cursive;
            font-size: clamp(3rem, 10vw, 4.5rem);
            color: #ff6b6b;
            text-shadow: 4px 4px 0px #fff, 8px 8px 15px rgba(255,107,107,0.3);
            margin-bottom: 50px;
            animation: bounce 2s infinite ease-in-out;
        }

        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }

        .menu-card {
            background: white;
            border-radius: 30px;
            padding: 30px;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 15px 35px rgba(0,0,0,0.08);
            border: 8px solid transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .menu-card:hover {
            transform: scale(1.05) translateY(-10px);
            box-shadow: 0 20px 45px rgba(0,0,0,0.15);
        }

        .card-alphabet { border-color: #4dabf7; background: #e7f5ff; }
        .card-numbers { border-color: #9c27b0; background: #f3e5f5; }
        .card-practice { border-color: #ff922b; background: #fff4e6; }
        .card-hindi { border-color: #2b8a3e; background: #ebfbee; }

        .card-icon { font-size: 5rem; margin-bottom: 20px; }
        .card-title {
            font-family: 'Lilita One', cursive;
            font-size: 2rem;
            color: #343a40;
            margin-bottom: 10px;
        }
        .card-desc { color: #666; font-size: 1.1rem; }

        .btn-start {
            margin-top: 20px;
            padding: 10px 30px;
            border-radius: 50px;
            font-weight: bold;
            color: white;
            border: none;
            font-size: 1.2rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .btn-alphabet { background: #4dabf7; }
        .btn-numbers { background: #9c27b0; }
        .btn-practice { background: #ff922b; }
        .btn-hindi { background: #2b8a3e; }
      `}</style>

      <div className="menu-container">
        <h1>✨ Kids Learning Hub ✨</h1>

        <div className="menu-grid">
          {/* Basic Patterns */}
          <Link
            href="/patterns"
            className="menu-card"
            style={{ borderColor: "#a29bfe", background: "#f3f0ff" }}
          >
            <div className="card-icon">〰️</div>
            <div className="card-title">Basic Patterns</div>
            <div className="card-desc">Trace lines and curves!</div>
            <button className="btn-start" style={{ background: "#a29bfe" }}>
              Start Drawing
            </button>
          </Link>

          {/* Alphabet Tracer */}
          <Link href="/tracer" className="menu-card card-alphabet">
            <div className="card-icon">🔤</div>
            <div className="card-title">Alphabet Tracer</div>
            <div className="card-desc">Learn to write A to Z!</div>
            <button className="btn-start btn-alphabet">Start Tracing</button>
          </Link>

          {/* Alphabet Coloring */}
          <Link
            href="/coloring"
            className="menu-card card-practice"
            style={{ borderColor: "#ff6b6b", background: "#fff5f5" }}
          >
            <div className="card-icon">🎨</div>
            <div className="card-title">Coloring Fun</div>
            <div className="card-desc">Color objects and learn A-Z!</div>
            <button className="btn-start" style={{ background: "#ff6b6b" }}>
              Let&apos;s Color!
            </button>
          </Link>

          {/* Numbers Tracer */}
          <Link href="/numbers" className="menu-card card-numbers">
            <div className="card-icon">🔢</div>
            <div className="card-title">Number Fun</div>
            <div className="card-desc">Trace 1 to 20 and count!</div>
            <button className="btn-start btn-numbers">Start Counting</button>
          </Link>

          {/* Handwriting Workbook */}
          <Link
            href="/practice"
            className="menu-card"
            style={{ borderColor: "#74b9ff", background: "#f1f7ff" }}
          >
            <div className="card-icon">✍️</div>
            <div className="card-title">Workbook</div>
            <div className="card-desc">Practice on a 4-line grid!</div>
            <button className="btn-start" style={{ background: "#74b9ff" }}>
              Open Workbook
            </button>
          </Link>

          {/* Hindi Swar */}
          <Link href="/hindi" className="menu-card card-hindi">
            <div className="card-icon">🕉️</div>
            <div className="card-title">Hindi Swar</div>
            <div className="card-desc">Practice Hindi Vowels!</div>
            <button className="btn-start btn-hindi">Chalo Seekhen!</button>
          </Link>

          {/* ABC Drive */}
          <Link
            href="/drive"
            className="menu-card"
            style={{ borderColor: "#ff8c32", background: "#fff1e6" }}
          >
            <div className="card-icon">🏎️</div>
            <div className="card-title">ABC Drive</div>
            <div className="card-desc">Race, collect &amp; trace letters!</div>
            <button className="btn-start" style={{ background: "#ff8c32" }}>
              Start Racing
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
