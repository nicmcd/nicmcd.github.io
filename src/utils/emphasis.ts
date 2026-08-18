/**
 * Minimal inline markdown emphasis rendering for venue strings such as
 * "In *SC19*". Only single-asterisk italics are supported; input is
 * HTML-escaped first.
 */

export function renderEmphasis(text: string): string {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
