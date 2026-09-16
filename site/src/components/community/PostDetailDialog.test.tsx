import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/locale-context", () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/Avatar", () => ({
  Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import type { CommunityFeedPost } from "@/lib/api-data";

const post: CommunityFeedPost = {
  id: "post-1",
  title: "A market morning in Zhanjiang",
  excerpt: "Foam boxes, shouted prices, and the speed of distribution.",
  channel: "Field Notes",
  user: { name: "Ravi", handle: "@ravi" },
  image: "https://example.com/market.jpg",
  location: "Zhanjiang",
  route: "A Southern Sea Table",
  createdAt: "2026-09-16T08:00:00Z",
  date: "2026-09-16",
  readTime: "2 min",
  mood: "Awake",
  tags: ["market", "zhanjiang"],
  likes: 3,
  comments: 0,
  saves: 1,
  prompt: "What did the market teach you today?",
  status: "published",
};

function Scenario({ post, onClose }: { post: CommunityFeedPost | null; onClose: () => void }) {
  return (
    <>
      <button type="button">Open post</button>
      <PostDetailDialog post={post} onClose={onClose} />
    </>
  );
}

describe("PostDetailDialog focus management", () => {
  it("moves focus into the dialog, traps Tab, closes on Escape, and restores focus", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Scenario post={null} onClose={onClose} />);

    const opener = screen.getByRole("button", { name: "Open post" });
    opener.focus();
    rerender(<Scenario post={post} onClose={onClose} />);

    const dialog = screen.getByRole("dialog", { name: "A market morning in Zhanjiang" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");

    const close = within(dialog).getByRole("button", { name: "Close post detail" });
    await waitFor(() => expect(close).toHaveFocus());

    // Tab from the last focusable wraps back into the dialog container.
    fireEvent.keyDown(document, { key: "Tab" });
    await waitFor(() => expect(close).toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<Scenario post={null} onClose={onClose} />);
    await waitFor(() => expect(opener).toHaveFocus());
    expect(document.body.style.overflow).toBe("");
  });
});
