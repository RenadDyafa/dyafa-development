import { AscentBlock } from "./AscentBlock";

const HEIGHTS = [28, 46, 66, 88, 112];
const BLOCK_WIDTH = 34;
const GAP = 14;
const FLOOR_Y = 132;
const VIEW_HEIGHT = 140;

export function AscentMotif({
  locale,
  className,
  tone = "light",
}: {
  locale: string;
  className?: string;
  tone?: "light" | "onDark";
}) {
  const width = HEIGHTS.length * BLOCK_WIDTH + (HEIGHTS.length - 1) * GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
      width="100%"
      role="img"
      aria-label={
        locale === "ar"
          ? "رسم توضيحي لكتل معيارية تتصاعد من الأرض إلى أصل تشغيلي"
          : "Illustration of modular blocks rising from land into an operating asset"
      }
      className={className}
      style={locale === "ar" ? { transform: "scaleX(-1)" } : undefined}
    >
      <line x1={0} y1={FLOOR_Y} x2={width} y2={FLOOR_Y} className={tone === "onDark" ? "stroke-stone-050/20" : "stroke-grey-200"} strokeWidth={2} />
      {HEIGHTS.map((h, i) => (
        <AscentBlock
          key={i}
          x={i * (BLOCK_WIDTH + GAP)}
          width={BLOCK_WIDTH}
          height={h}
          floorY={FLOOR_Y}
          delayMs={i * 110}
        />
      ))}
    </svg>
  );
}
