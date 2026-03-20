/**
 * Card3D — wraps content in a chunky 8-bit bordered card.
 *
 * Props:
 *   children   - card content
 *   className  - extra Tailwind classes
 *   variant    - "default" | "correct" | "incorrect"
 *   animate    - add pop-in animation on mount
 */
export default function Card3D({
  children,
  className = "",
  variant = "default",
  animate = false,
}) {
  const variants = {
    default: "bg-[#1F2937] border-[#374151]",
    correct: "bg-[#14532D] border-med-green",
    incorrect: "bg-[#7F1D1D] border-med-red",
  };

  return (
    <div
      className={[
        "relative rounded-2xl border-4 shadow-3d p-6",
        "transition-colors duration-300",
        variants[variant] ?? variants.default,
        animate ? "animate-pop-in" : "",
        className,
      ].join(" ")}
    >
      {/* 8-bit corner pixels */}
      <span className="absolute top-0 left-0 w-3 h-3 bg-med-black rounded-none" />
      <span className="absolute top-0 right-0 w-3 h-3 bg-med-black rounded-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 bg-med-black rounded-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-med-black rounded-none" />

      {children}
    </div>
  );
}
