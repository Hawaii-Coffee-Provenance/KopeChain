export function formatTMKInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  const cuts = [1, 2, 3, 6, 9, 13];
  const parts: string[] = [];

  let prev = 0;
  for (const cut of cuts) {
    const chunk = digits.slice(prev, cut);

    if (!chunk) break;

    parts.push(chunk);

    prev = cut;
  }

  return parts.join("-");
}

export function isLookupReady(formatted: string): boolean {
  return formatted.replace(/\D/g, "").length >= 9;
}
