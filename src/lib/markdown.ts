/** Minimal safe-ish markdown to HTML for policy/blog body content stored as text. */
export function simpleMarkdownToHtml(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withInline = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");

  const lines = withInline.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${trimmed.slice(2)}</li>`);
    } else if (trimmed === "") {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${trimmed}</p>`);
    }
  }

  if (inList) html.push("</ul>");
  return html.join("\n");
}
