import Svg, { Path } from "react-native-svg";

export function BookIcon({
  size = 22,
  color = "#EEF3FF",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 5.5c0-1.1.9-2 2-2H19v17.5H6.5c-1.1 0-2-.9-2-2V5.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M19 19H6.5c-1.1 0-2 .9-2 2"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M8 7.5h7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}




