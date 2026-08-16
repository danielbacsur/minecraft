export function normalize(string: string) {
  return string.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}
