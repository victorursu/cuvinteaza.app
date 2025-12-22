import { Text, type TextStyle } from "react-native";

type Segment = {
  text: string;
  bold: boolean;
  italic: boolean;
};

function tokenize(input: string) {
  // Only support a small safe subset.
  // We keep tags as tokens, everything else is text.
  return input.split(/(<\/?(?:strong|em|b|i)>)/g).filter((t) => t.length > 0);
}

function segmentsFromHtml(input: string): Segment[] {
  const tokens = tokenize(input);
  const out: Segment[] = [];

  let boldDepth = 0;
  let italicDepth = 0;

  const pushText = (text: string) => {
    if (!text) return;
    out.push({
      text,
      bold: boldDepth > 0,
      italic: italicDepth > 0,
    });
  };

  for (const t of tokens) {
    switch (t) {
      case "<strong>":
      case "<b>":
        boldDepth += 1;
        break;
      case "</strong>":
      case "</b>":
        boldDepth = Math.max(0, boldDepth - 1);
        break;
      case "<em>":
      case "<i>":
        italicDepth += 1;
        break;
      case "</em>":
      case "</i>":
        italicDepth = Math.max(0, italicDepth - 1);
        break;
      default:
        // Unknown tags will arrive here too (if any). Treat as plain text.
        pushText(t);
    }
  }

  return out;
}

export function InlineRichText({
  text,
  style,
  strongStyle,
  emStyle,
}: {
  text: string;
  style?: TextStyle;
  strongStyle?: TextStyle;
  emStyle?: TextStyle;
}) {
  const segments = segmentsFromHtml(text);
  return (
    <Text style={style}>
      {segments.map((s, idx) => {
        const segStyle: TextStyle[] = [];
        if (s.bold)
          segStyle.push(
            {
              fontWeight: "900",
              fontStyle: "italic",
              borderWidth: 1,
              borderColor: "rgba(238, 243, 255, 0.55)",
              borderRadius: 6,
              paddingHorizontal: 4,
              paddingVertical: 1,
            },
            strongStyle ?? {}
          );
        if (s.italic) segStyle.push({ fontStyle: "italic" }, emStyle ?? {});
        return (
          <Text key={idx} style={segStyle}>
            {s.text}
          </Text>
        );
      })}
    </Text>
  );
}


