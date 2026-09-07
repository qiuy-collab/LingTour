import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownRenderer, markdownUrl } from "../components/culture/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders GFM, controlled underline, images and code as semantic content", () => {
    const { container } = render(<MarkdownRenderer content={'# City\n\n**Bold** *italic* ~~removed~~ <u>underlined</u>\n\n- [x] Complete\n- [ ] Pending\n\n> Quote\n\n| Place | Visit |\n| --- | --- |\n| Danxia | Morning |\n\n![Mountain](/uploads/city.jpg)\n\n```js\nconst x = 1;\n```\n\n[Culture](/culture)'} />);
    expect(screen.getByRole("heading", { name: "City", level: 2 })).toBeInTheDocument();
    expect(container.querySelector("u")).toHaveTextContent("underlined");
    expect(container.querySelector("del")).toHaveTextContent("removed");
    expect(screen.getByRole("table")).toHaveTextContent("Danxia");
    expect(screen.getByRole("region", { name: "Article table" })).toHaveAttribute("tabindex", "0");
    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    expect(screen.getAllByRole("checkbox")[1]).not.toBeChecked();
    expect(screen.getByRole("img", { name: "Mountain" })).toHaveAttribute("src", "/uploads/city.jpg");
    expect(container.querySelector("pre code")).toHaveTextContent("const x = 1;");
    expect(screen.getByRole("link", { name: "Culture" })).toHaveAttribute("href", "/culture");
  });

  it("strips scripts, event handlers, iframes, svg and unsafe URLs", () => {
    const { container } = render(<MarkdownRenderer content={'<script>alert(1)</script><iframe src="https://example.com"></iframe><svg onload="alert(1)"></svg>\n\n<u onclick="alert(1)">Safe underline</u>\n\n<img src="javascript:alert(1)" onerror="alert(1)">\n\n[bad](javascript:alert)\n\n![data](data:image/svg+xml,hello)'} />);
    expect(container.querySelector("script,iframe,svg,[onclick],[onerror]")).toBeNull();
    expect(container.querySelector("u")).toHaveTextContent("Safe underline");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("bad")).not.toHaveAttribute("href");
  });

  it.each(["javascript:alert(1)", "data:text/html,bad", "//example.com/a", "\\example.com", "java\nscript:alert"])("rejects %s", url => {
    expect(markdownUrl(url, "href")).toBeUndefined();
  });
  it("permits safe relative and email links but never email images", () => {
    expect(markdownUrl("/culture/shaoguan", "href")).toBe("/culture/shaoguan");
    expect(markdownUrl("mailto:hello@example.com", "href")).toBe("mailto:hello@example.com");
    expect(markdownUrl("mailto:hello@example.com", "src")).toBeUndefined();
  });
});
