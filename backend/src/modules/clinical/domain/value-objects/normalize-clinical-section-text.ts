export function normalizeClinicalSectionText(value: string): string | null {
  const normalizedLineEndings = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedLineEndings.split('\n');
  const normalizedLines = lines.map((line) => line.trim().replace(/[ \t]+/g, ' '));

  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of normalizedLines) {
    if (line.length === 0) {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join('\n'));
        currentParagraph = [];
      }
      continue;
    }

    currentParagraph.push(line);
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('\n'));
  }

  if (paragraphs.length === 0) {
    return null;
  }

  return paragraphs.join('\n\n');
}
