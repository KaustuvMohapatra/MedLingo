/**
 * PixelBlast — fires a pixel explosion from a given x,y coordinate.
 * Call the exported `firePixelBlast(x, y, color?)` function directly.
 * No component needed — pure DOM injection.
 */

export function firePixelBlast(x, y, color = "#FFC107") {
  const colors = color === "green"
    ? ["#22C55E","#86EFAC","#FFC107","#F9FAFB"]
    : color === "red"
    ? ["#EF4444","#FCA5A5","#F9FAFB","#FFC107"]
    : ["#FFC107","#FFD54F","#5B21B6","#A78BFA","#F9FAFB"];

  for (let i = 0; i < 22; i++) {
    const el    = document.createElement("div");
    const sz    = 4 + Math.floor(Math.random() * 8);
    const angle = (i / 22) * 360 + Math.random() * 15;
    const dist  = 45 + Math.random() * 65;
    const rad   = (angle * Math.PI) / 180;
    const col   = colors[Math.floor(Math.random() * colors.length)];

    el.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:${sz}px;height:${sz}px;border-radius:1px;
      background:${col};image-rendering:pixelated;
      left:${x - sz/2}px;top:${y - sz/2}px;
      transition:transform 0.55s cubic-bezier(0,.9,.57,1), opacity 0.55s ease-out;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${Math.cos(rad)*dist}px, ${Math.sin(rad)*dist}px) rotate(${angle}deg) scale(0)`;
      el.style.opacity   = "0";
    });
    setTimeout(() => el.remove(), 600);
  }
}

export function fireConfettiBlast() {
  const colors = ["#FFC107","#5B21B6","#22C55E","#F9FAFB","#EF4444","#7C3AED","#FFD54F","#A78BFA"];
  for (let i = 0; i < 55; i++) {
    const el  = document.createElement("div");
    const sz  = 5 + Math.random() * 10;
    const del = Math.random() * 0.6;
    const dur = 1.4 + Math.random() * 1.8;
    el.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:${sz}px;height:${sz}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}vw;top:-16px;
      border-radius:${Math.random()>.5?"50%":"2px"};
      animation:pixel-confetti-fall ${dur}s ${del}s linear forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (del+dur+.3)*1000);
  }
}

// Inject keyframes once
if (!document.getElementById("pixel-blast-styles")) {
  const s = document.createElement("style");
  s.id = "pixel-blast-styles";
  s.textContent = `
    @keyframes pixel-confetti-fall {
      0%  { transform:translateY(-20px) rotate(0deg);   opacity:1; }
      100%{ transform:translateY(100vh) rotate(720deg); opacity:0; }
    }
  `;
  document.head.appendChild(s);
}
