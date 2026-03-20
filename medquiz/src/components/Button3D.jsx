/**
 * Button3D — chunky retro button with physical press-down effect.
 *
 * Props:
 *   onClick        - click handler
 *   children       - button label / content
 *   variant        - "gold" | "purple" | "green" | "red" | "gray" | "white"
 *   className      - extra Tailwind classes
 *   disabled       - disables interaction
 *   fullWidth      - stretches to 100%
 */
export default function Button3D({
  onClick,
  children,
  variant = "gold",
  className = "",
  disabled = false,
  fullWidth = false,
}) {
  const variants = {
    gold: {
      bg: "bg-med-gold",
      border: "border-med-black",
      shadow: "shadow-3d-gold",
      text: "text-med-black",
      hover: "hover:brightness-105",
    },
    purple: {
      bg: "bg-med-purple",
      border: "border-med-black",
      shadow: "shadow-3d-purple",
      text: "text-white",
      hover: "hover:brightness-110",
    },
    green: {
      bg: "bg-med-green",
      border: "border-med-black",
      shadow: "shadow-3d-green",
      text: "text-white",
      hover: "hover:brightness-105",
    },
    red: {
      bg: "bg-med-red",
      border: "border-med-black",
      shadow: "shadow-3d-red",
      text: "text-white",
      hover: "hover:brightness-105",
    },
    gray: {
      bg: "bg-med-gray",
      border: "border-med-black",
      shadow: "shadow-3d-gray",
      text: "text-white",
      hover: "hover:brightness-105",
    },
    white: {
      bg: "bg-med-white",
      border: "border-med-black",
      shadow: "shadow-3d",
      text: "text-med-black",
      hover: "hover:brightness-95",
    },
  };

  const v = variants[variant] ?? variants.gold;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        // Base
        "relative font-body font-800 text-base rounded-xl border-4",
        "px-5 py-3 select-none transition-all duration-75 cursor-pointer",
        // Variant
        v.bg, v.border, v.shadow, v.text, v.hover,
        // 3D press: translate down + remove shadow on active
        "active:translate-y-[6px] active:shadow-none",
        // Disabled
        disabled ? "opacity-40 cursor-not-allowed active:translate-y-0 active:shadow-3d" : "",
        // Width
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
