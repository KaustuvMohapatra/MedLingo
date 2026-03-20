import { useEffect, useState } from "react";

/**
 * PixelTransition — wraps page content in a pixel-dissolve
 * enter/exit animation. Use as a wrapper around screen content.
 *
 * Props:
 *   children  — page content
 *   id        — unique key; change this to trigger a new transition
 */
export default function PixelTransition({ children, id }) {
  const [phase, setPhase] = useState("enter"); // "enter" | "visible" | "exit"

  useEffect(() => {
    setPhase("enter");
    const t1 = setTimeout(() => setPhase("visible"), 350);
    return () => clearTimeout(t1);
  }, [id]);

  const style = {
    enter:   { opacity:0, transform:"scale(0.97) translateY(8px)", filter:"blur(4px)" },
    visible: { opacity:1, transform:"scale(1) translateY(0)",      filter:"blur(0)"   },
    exit:    { opacity:0, transform:"scale(1.02) translateY(-6px)", filter:"blur(2px)" },
  }[phase];

  return (
    <div style={{
      transition:"opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease",
      ...style,
      width:"100%",
    }}>
      {children}
    </div>
  );
}
