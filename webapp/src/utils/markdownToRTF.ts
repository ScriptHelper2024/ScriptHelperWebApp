export function markdownToRTF(markdown: string): string {
  let rtf = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Courier;}}\n";
  const lines = markdown.split("\n");

  lines.forEach((line) => {
    // Convert markdown headers to RTF bold
    if (line.startsWith("# ")) {
      rtf += `\\b ${line.substring(2)} \\b0\\par\n`;
    } else if (line.startsWith("## ")) {
      rtf += `\\b ${line.substring(3)} \\b0\\par\n`;
    } else {
      rtf += `${line}\\par\n`;
    }
  });

  rtf += "}";
  return rtf;
}
