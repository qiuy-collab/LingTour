import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import styles from "./MarkdownRenderer.module.css";

const schema = {
  ...defaultSchema,
  tagNames: ["p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "del", "u", "blockquote", "ul", "ol", "li", "hr", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "input"],
  attributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title", "width", "height"],
    ol: ["start"],
    li: [["className", "task-list-item"]],
    ul: [["className", "contains-task-list"]],
    input: [["type", "checkbox"], "checked", "disabled"],
    th: ["align"],
    td: ["align"],
  },
  protocols: { href: ["http", "https", "mailto"], src: ["http", "https"] },
};

export function markdownUrl(url: string, key: string) {
  const value = url.trim();
  if (!value || /[\s\\]/.test(value) || value.startsWith("//")) return undefined;
  if (Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return undefined;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(value)?.[1]?.toLowerCase();
  if (!scheme || scheme === "https" || scheme === "http" || (key === "href" && scheme === "mailto")) return value;
  return undefined;
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className={styles.prose} data-markdown-article>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]} urlTransform={markdownUrl} components={{
        h1: ({ children }) => <h2>{children}</h2>,
        p: ({ node, children }) => node?.children.length === 1 && node.children[0]?.type === "element" && node.children[0].tagName === "img"
          ? <figure>{children}</figure> : <p>{children}</p>,
        img: ({ src, alt, title, width, height }) => typeof src === "string" && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} title={title} width={width} height={height} loading="lazy" decoding="async" />
        ) : null,
        table: ({ children }) => <div className={styles.tableScroll} role="region" aria-label="Article table" tabIndex={0}><table>{children}</table></div>,
        input: ({ checked }) => <input type="checkbox" checked={Boolean(checked)} disabled aria-label={checked ? "Completed item" : "Incomplete item"} />,
      }}>{content}</Markdown>
    </div>
  );
}
