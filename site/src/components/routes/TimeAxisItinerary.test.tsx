import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimeAxisItinerary } from "./TimeAxisItinerary";

// Keep MediaFrame real: its native image/video and control behavior is part of the contract.
vi.mock("@/lib/motion", () => ({
  useGSAP: vi.fn(),
  gsap: {},
  motionEase: { enter: "power3.out" },
}));

type Stop = ComponentProps<typeof TimeAxisItinerary>["stops"][number];

function stop(overrides: Partial<Stop> = {}): Stop {
  return {
    time: "09:00",
    stop: "Ancestral hall",
    plan: "Walk through the courtyard with a local guide.",
    story: "The hall was rebuilt by families returning from overseas.",
    culturalStory: "The roof figures tell stories from Cantonese opera.",
    details: ["Look for glazed ceramic figures.", "Notice the carved wooden screens."],
    image: "/hall.jpg",
    placeDetail: "Enter through the east gate.",
    meal: "Lunch at the village kitchen.",
    hotel: "Stay in a restored village house.",
    transit: "Continue by minibus.",
    lat: null,
    lng: null,
    ...overrides,
  };
}

function itinerary(stops: Stop[], props: Partial<ComponentProps<typeof TimeAxisItinerary>> = {}) {
  return render(
    <TimeAxisItinerary
      stops={stops}
      routeTitle="Village heritage walk"
      routeStory="Follow the stories of the village."
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("TimeAxisItinerary", () => {
  it("keeps every ordinary-stop context field behind a native, accessible disclosure", () => {
    const ordinary = stop({ isFeatured: false });
    itinerary([ordinary]);
    const article = screen.getByRole("article", { name: ordinary.stop });
    const content = within(article);
    const summary = content.getByText("More from this place");
    const disclosure = summary.closest("details")!;
    const remaining = [ordinary.story, ordinary.culturalStory, ...ordinary.details,
      ordinary.placeDetail!, ordinary.meal!, ordinary.hotel!, ordinary.transit!];

    expect(summary.tagName).toBe("SUMMARY");
    expect(summary).toHaveTextContent(`More from this place: ${ordinary.stop}`);
    expect(disclosure).not.toHaveAttribute("open");
    expect(content.getByText(ordinary.plan!)).toBeVisible();
    for (const text of remaining) expect(content.getByText(text)).not.toBeVisible();

    fireEvent.click(summary);
    expect(disclosure).toHaveAttribute("open");
    for (const text of remaining) expect(content.getByText(text)).toBeVisible();

    fireEvent.click(summary);
    expect(disclosure).not.toHaveAttribute("open");
    expect(content.getByText(ordinary.plan!)).toBeVisible();
  });

  it("shows the full featured story, context and practical information immediately", () => {
    const featured = stop({ isFeatured: true });
    itinerary([featured]);
    const article = screen.getByRole("article", { name: featured.stop });
    const content = within(article);
    expect(article).toHaveAttribute("data-featured", "true");
    expect(article.querySelector("details")).toBeNull();
    for (const text of [featured.plan!, featured.story, featured.culturalStory, ...featured.details,
      featured.placeDetail!, featured.meal!, featured.hotel!, featured.transit!]) {
      expect(content.getByText(text)).toBeVisible();
    }
  });

  it("features only the first stop for a legacy itinerary with no flags", () => {
    itinerary([stop(), stop({ stop: "Village school", time: "11:00" })]);
    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveAttribute("data-featured", "true");
    expect(articles[1]).toHaveAttribute("data-featured", "false");
    expect(articles[0].querySelector("details")).toBeNull();
    expect(articles[1].querySelector("details")).not.toHaveAttribute("open");
  });

  it("honors explicit flags anywhere instead of also featuring the first stop", () => {
    itinerary([stop(), stop({ stop: "Village school", isFeatured: true })]);
    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveAttribute("data-featured", "false");
    expect(articles[1]).toHaveAttribute("data-featured", "true");
  });

  it("treats an explicit false anywhere as an editorial choice, not missing data", () => {
    itinerary([stop(), stop({ stop: "Village school", isFeatured: false })]);
    for (const article of screen.getAllByRole("article")) {
      expect(article).toHaveAttribute("data-featured", "false");
    }
  });

  it("keeps a distinct plan and story, but does not duplicate an identical story", () => {
    const ordinary = stop({ isFeatured: false, story: "Walk through the courtyard with a local guide." });
    itinerary([ordinary]);
    const article = screen.getByRole("article");
    expect(within(article).getAllByText(ordinary.story)).toHaveLength(1);
    expect(within(article).getByText(ordinary.story)).toBeVisible();
  });

  it("uses the story as the core experience when the plan is empty", () => {
    const ordinary = stop({ isFeatured: false, plan: "  " });
    itinerary([ordinary]);
    expect(within(screen.getByRole("article")).getByText(ordinary.story)).toBeVisible();
  });

  it("does not render an empty disclosure or a fabricated image when content is absent", () => {
    itinerary([stop({ isFeatured: false, story: "", culturalStory: "", details: [], image: undefined,
      placeDetail: "", meal: "", hotel: "", transit: "" })]);
    const article = screen.getByRole("article");
    expect(article.querySelector("details")).toBeNull();
    expect(within(article).queryByRole("figure")).not.toBeInTheDocument();
    expect(within(article).getByText("Walk through the courtyard with a local guide.")).toBeVisible();
  });

  it("preserves chronological time, place, image, experience DOM order while alternating desktop columns", () => {
    itinerary([stop(), stop({ stop: "Village school", time: "11:00" })]);
    const articles = screen.getAllByRole("article");
    articles.forEach((article, index) => {
      const time = article.querySelector("[data-route-time]")!;
      const heading = within(article).getByRole("heading", { level: 3 });
      const figure = within(article).getByRole("figure");
      const experience = article.querySelector("[data-route-experience]")!;
      for (const [first, second] of [[time, heading], [heading, figure], [figure, experience]]) {
        expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
      expect(figure).toHaveClass(index % 2 ? "lg:col-start-2" : "lg:col-start-1");
      expect(article.querySelector("[data-route-reading]")).toHaveClass(index % 2 ? "lg:col-start-1" : "lg:col-start-2");
    });
  });

  it("cycles through the full deduplicated modern and legacy gallery including videos", () => {
    const galleryStop = stop({
      primaryMedia: { type: "image", url: "/hall.jpg", alt: "Courtyard entrance" },
      media: [
        { type: "image", url: "/hall.jpg" },
        { type: "image", url: "/roof.jpg", alt: "Ceramic roof figures" },
        { type: "video", url: "/tour.mp4", poster: "/tour-poster.jpg" },
        { type: "image", url: "/screen.jpg" },
      ],
      images: ["/screen.jpg", "/kitchen.jpg"],
    });
    itinerary([galleryStop]);
    const article = screen.getByRole("article");
    const content = within(article);
    const next = content.getByRole("button", { name: "Show next media for Ancestral hall" });
    const previous = content.getByRole("button", { name: "Show previous media for Ancestral hall" });
    const media = article.querySelector(`[id="${next.getAttribute("aria-controls")}"]`)!;

    expect(next).toHaveClass("min-h-11", "min-w-11");
    expect(previous).toHaveClass("min-h-11", "min-w-11");
    expect(content.getByRole("img", { name: "Courtyard entrance" })).toHaveAttribute("src", "/hall.jpg");
    expect(content.getByRole("status")).toHaveTextContent("Media 1 of 5");
    fireEvent.click(next);
    expect(content.getByRole("img", { name: "Ceramic roof figures" })).toHaveAttribute("src", "/roof.jpg");
    fireEvent.click(next);
    const video = media.querySelector("video")!;
    expect(video).toHaveAttribute("src", "/tour.mp4");
    expect(video).toHaveAttribute("poster", "/tour-poster.jpg");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    // Reduced motion does not remove user-operated video controls.
    expect(content.getByRole("status")).toHaveTextContent("Media 3 of 5");
    fireEvent.click(next);
    expect(media.querySelector("video")).toBeNull();
    expect(content.getByRole("img")).toHaveAttribute("src", "/screen.jpg");
    fireEvent.click(next);
    expect(content.getByRole("img")).toHaveAttribute("src", "/kitchen.jpg");
    fireEvent.click(next);
    expect(content.getByRole("img")).toHaveAttribute("src", "/hall.jpg");
    fireEvent.click(previous);
    expect(content.getByRole("img")).toHaveAttribute("src", "/kitchen.jpg");
  });

  it("falls back to the first available frame when the selected media is removed", () => {
    const initial = stop({ images: ["/roof.jpg", "/school.jpg"] });
    const { rerender } = itinerary([initial]);
    fireEvent.click(within(screen.getByRole("article")).getByRole("button", { name: /Show next media/ }));
    rerender(<TimeAxisItinerary stops={[stop()]} routeTitle="Village heritage walk" routeStory="" />);
    const content = within(screen.getByRole("article"));
    expect(content.getByRole("img")).toHaveAttribute("src", "/hall.jpg");
    expect(content.queryByRole("button", { name: /Show next media/ })).not.toBeInTheDocument();
  });

  it("passes the original stop object and stable index to note calls after expansion and cycling", () => {
    const first = stop();
    const second = stop({ stop: "Village school", time: "11:00", images: ["/school.jpg"], isFeatured: false });
    const onAddStopNote = vi.fn();
    itinerary([first, second], { onAddStopNote });
    const content = within(screen.getByRole("article", { name: "Village school" }));
    fireEvent.click(content.getByText("More from this place"));
    fireEvent.click(content.getByRole("button", { name: /Show next media/ }));
    fireEvent.click(content.getByRole("button", { name: "Note this stop" }));
    expect(onAddStopNote).toHaveBeenCalledExactlyOnceWith(second, 1);
    expect(onAddStopNote.mock.calls[0][0]).toBe(second);
    expect(screen.getByRole("article", { name: "Village school" })).toHaveAttribute("id", "stop-1");
  });

  it("omits note actions when no callback is supplied", () => {
    itinerary([stop()]);
    expect(screen.queryByRole("button", { name: "Note this stop" })).not.toBeInTheDocument();
  });

  it("renders the caller's map slot beside the final stop lead media and route title", () => {
    itinerary([stop(), stop({ stop: "Village school", image: "/school.jpg" })], {
      routeMap: <div role="region" aria-label="Caller route map">Map supplied by the route page</div>,
    });
    const footer = screen.getByRole("region", { name: "Route overview" });
    expect(within(footer).getByRole("img", { name: "Village school" })).toHaveAttribute("src", "/school.jpg");
    expect(within(footer).getByRole("heading", { name: "Village heritage walk" })).toBeVisible();
    expect(within(footer).getByRole("region", { name: "Caller route map" })).toBeVisible();
    expect(footer).toHaveClass("lg:grid-cols-2", "lg:h-[30rem]");
    expect(within(footer).queryByText(/Route Complete|Archive note|coast/)).not.toBeInTheDocument();
  });

  it("leaves an omitted map slot empty rather than fabricating geographic content", () => {
    const { container } = itinerary([stop()]);
    expect(container.querySelector("[data-route-map-slot]")).toBeEmptyDOMElement();
    expect(container.querySelectorAll("[data-route-spine]")).toHaveLength(1);
  });

  it("renders nothing for zero stops, even when the caller supplies map content", () => {
    const { container } = itinerary([], { routeMap: <div>Map content</div> });
    expect(container).toBeEmptyDOMElement();
  });
});
