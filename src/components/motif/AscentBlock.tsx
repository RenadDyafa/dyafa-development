type AscentBlockProps = {
  x: number;
  width: number;
  height: number;
  floorY: number;
  delayMs?: number;
  filled?: boolean;
};

/**
 * Single riser block: the one shared primitive behind both the animated
 * hero motif (AscentMotif) and the static 5-gate diagram (GateDiagram), so
 * the two required "modular grid" usages never visually drift apart.
 */
export function AscentBlock({ x, width, height, floorY, delayMs = 0, filled = true }: AscentBlockProps) {
  const y = floorY - height;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      className={filled ? "fill-teal-500" : "fill-none stroke-teal-300"}
      style={{
        transformOrigin: `${x + width / 2}px ${floorY}px`,
        animation: `ascent-rise 620ms cubic-bezier(0.22,1,0.36,1) both`,
        animationDelay: `${delayMs}ms`,
      }}
    />
  );
}
