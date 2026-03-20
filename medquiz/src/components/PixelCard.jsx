import { useRef, useEffect } from "react";

/**
 * PixelCard — 8-bit jagged-edge card with animated pixel border.
 * Self-contained canvas-based component inspired by react-bits PixelCard.
 *
 * Props:
 *   children, className, style, variant, onClick, active
 */
export default function PixelCard({
  children,
  style = {},
  variant = "default",   // "default" | "gold" | "green" | "red" | "purple"
  onClick,
  active = false,
  className = "",
}) {
  const canvasRef = useRef(null);

  const COLORS = {
    default: { border:"#374151", glow:"#5B21B6", shadow:"#111827" },
    gold:    { border:"#FFC107", glow:"#FFD54F", shadow:"#92610A" },
    green:   { border:"#22C55E", glow:"#86EFAC", shadow:"#14532D" },
    red:     { border:"#EF4444", glow:"#FCA5A5", shadow:"#7F1D1D" },
    purple:  { border:"#7C3AED", glow:"#A78BFA", shadow:"#2E1065" },
  };
  const c = COLORS[variant] ?? COLORS.default;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const PX = 4;
    let raf;
    let tick = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Animated pixel border march
      const perimeter = 2 * (W + H);
      const count = Math.floor(perimeter / (PX * 3));
      for (let i = 0; i < count; i++) {
        const pos = ((i * PX * 3) + tick * 2) % perimeter;
        let x, y;
        if (pos < W)            { x = pos;     y = 0; }
        else if (pos < W + H)   { x = W - PX;  y = pos - W; }
        else if (pos < 2*W + H) { x = 2*W + H - pos; y = H - PX; }
        else                    { x = 0;        y = perimeter - pos; }
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin((i + tick * 0.1) * 0.8);
        ctx.fillStyle = c.glow;
        ctx.fillRect(Math.round(x), Math.round(y), PX, PX);
      }
      ctx.globalAlpha = 1;
      tick++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, variant]);

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: "relative",
        backgroundColor: "#1a2235",
        border: `4px solid ${c.border}`,
        borderRadius: "16px",
        boxShadow: `0px 6px 0px 0px ${c.shadow}, 0 0 ${active ? "20px" : "0px"} ${c.glow}40`,
        transition: "box-shadow 0.3s, transform 0.1s",
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 8-bit corner notches */}
      {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
        <span key={i} style={{ position:"absolute", ...pos, width:"10px", height:"10px", backgroundColor:"#111827", zIndex:2 }}/>
      ))}

      {/* Animated border canvas (only when active) */}
      {active && (
        <canvas
          ref={canvasRef}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1 }}
        />
      )}

      <div style={{ position:"relative", zIndex:3 }}>
        {children}
      </div>
    </div>
  );
}
