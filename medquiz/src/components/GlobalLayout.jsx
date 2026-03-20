import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────────
   PixelSnow — pure canvas, matches react-bits PixelSnow aesthetic
   PixelTrail — DOM dot trail following cursor
   Aurora — animated radial gradient background
────────────────────────────────────────────────────────────── */

function PixelTrail() {
  useEffect(() => {
    const MAX = 16;
    const pool = [];

    const onMove = (e) => {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed;pointer-events:none;z-index:9998;
        width:6px;height:6px;background:#111827;
        image-rendering:pixelated;border-radius:0;
        left:${e.clientX - 3}px;top:${e.clientY - 3}px;
        transition:opacity 0.35s;
      `;
      document.body.appendChild(el);
      pool.push(el);
      if (pool.length > MAX) pool.shift()?.remove();
      requestAnimationFrame(() => (el.style.opacity = "0"));
      setTimeout(() => el.remove(), 400);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return null;
}

function PixelSnow() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#5B21B6","#7C3AED","#FFC107","#374151","#4B5563","#6D28D9"];
    const COUNT  = 55;
    const SZ     = 4;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const flakes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.15 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: 0.1 + Math.random() * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => {
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle   = f.color;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), SZ, SZ);
        f.y += f.speed; f.x += f.drift;
        if (f.y > canvas.height + 8) { f.y = -8; f.x = Math.random() * canvas.width; }
        if (f.x < -8 || f.x > canvas.width + 8) f.x = Math.random() * canvas.width;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.7 }} />;
}

export default function GlobalLayout({ children }) {
  return (
    <div style={{ position:"relative", minHeight:"100vh", width:"100%", overflowX:"hidden" }}>
      {/* Aurora */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:`
          radial-gradient(ellipse 80% 55% at 15% 25%, rgba(91,33,182,0.5) 0%, transparent 58%),
          radial-gradient(ellipse 65% 50% at 85% 75%, rgba(109,40,217,0.38) 0%, transparent 55%),
          radial-gradient(ellipse 50% 70% at 50% 5%,  rgba(255,193,7,0.07) 0%, transparent 55%),
          #0d1117
        `,
        animation:"aurora 14s ease-in-out infinite alternate",
      }}/>

      <PixelSnow />
      <PixelTrail />

      <div style={{ position:"relative", zIndex:10, width:"100%" }}>
        {children}
      </div>

      <style>{`
        @keyframes aurora {
          0%  { filter:hue-rotate(0deg) brightness(1); }
          50% { filter:hue-rotate(18deg) brightness(1.06); }
          100%{ filter:hue-rotate(-12deg) brightness(0.96); }
        }
      `}</style>
    </div>
  );
}
