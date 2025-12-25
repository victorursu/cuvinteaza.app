import Svg, { Path, Rect } from "react-native-svg";

export function StatisticsIcon({
  size = 22,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bar chart bars */}
      <Rect
        x="3"
        y="18"
        width="3"
        height="4"
        fill={color}
        opacity="0.8"
      />
      <Rect
        x="7"
        y="14"
        width="3"
        height="8"
        fill={color}
        opacity="0.8"
      />
      <Rect
        x="11"
        y="10"
        width="3"
        height="12"
        fill={color}
        opacity="0.8"
      />
      <Rect
        x="15"
        y="6"
        width="3"
        height="16"
        fill={color}
        opacity="0.8"
      />
      <Rect
        x="19"
        y="12"
        width="3"
        height="10"
        fill={color}
        opacity="0.8"
      />
      {/* Base line */}
      <Path
        d="M2 20h20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

