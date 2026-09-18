import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/locale-context", () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/Avatar", () => ({
  Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

const toggleLike = vi.fn().mockResolvedValue({ liked: true, likes: 4 });
const toggleSave = vi.fn().mockResolvedValue({ saved: true, saves: 2 });

vi.mock("@/lib/api-data", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-data")>();
  return {
    ...original,
    toggleCommunityPostLike: (...args: unknown[]) => toggleLike(...args),
    toggleCommunityPostSave: (...args: unknown[]) => toggleSave(...args),
  };
});

import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import type { CommunityFeedPost } from "@/lib/api-data";

const post: CommunityFeedPost = {
  id: "post-1",
  title: "A market morning in Zhanjiang",
  excerpt: "Foam boxes, shouted prices, and the speed of distribution.",
  channel: "Field Notes",
  user: { name: "Ravi", handle: "@ravi" },
  image: "https://example.com/market.jpg",
  media: [{ type: "image", url: "https://example.com/market.jpg" }],
  location: "Zhanjiang",
  route: "A Southern Sea Table",
  createdAt: "2026-09-16T08:00:00Z",
  date: "2026-09-16",
  readTime: "2 min",
  mood: "Awake",
  tags: ["market", "zhanjiang"],
  likes: 3,
  saves: 1,
  liked: false,
  saved: false,
  prompt: "What did the market teach you today?",
  status: "published",
};

function Scenario({
  post,
  onClose,
  isLoggedIn,
}: {
  post: CommunityFeedPost | null;
  onClose: () => void;
  isLoggedIn?: boolean;
}) {
  return (
    <>
      <button type="button">Open post</button>
      <PostDetailDialog post={post} onClose={onClose} isLoggedIn={isLoggedIn} />
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

  it("renders no replies section and keeps like/save as the only interactions", () => {
    render(<Scenario post={post} onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog", { name: "A market morning in Zhanjiang" });
    expect(within(dialog).queryByText("community.replies.label")).toBeNull();
    expect(within(dialog).queryByText("community.replies.unavailable")).toBeNull();

    expect(within(dialog).getByRole("button", { name: /Likes/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Saved/ })).toBeInTheDocument();
  });

  it("toggles like with the logged-in user and reports the engagement", async () => {
    render(
      <Scenario
        post={post}
        onClose={vi.fn()}
        isLoggedIn
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "A market morning in Zhanjiang" });
    fireEvent.click(within(dialog).getByRole("button", { name: /Likes/ }));

    await waitFor(() => expect(toggleLike).toHaveBeenCalledWith("post-1"));
  });
});
