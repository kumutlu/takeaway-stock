export function parseBrandTags(label: string) {
  return label
    .split(/\||,|\//)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
