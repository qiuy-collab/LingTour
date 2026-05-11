export function CarouselRuntime() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (() => {
            if (window.__lingtourCarouselRuntimeReady) return;
            window.__lingtourCarouselRuntimeReady = true;

            function moveCarousel(root, direction) {
              const track = root.querySelector("[data-carousel-track]");
              const copyTrack = root.querySelector("[data-carousel-copy-track]");
              if (!track) return;

              const max = Number(root.getAttribute("data-carousel-max") || "0");
              const step = root.getAttribute("data-carousel-step") || "100%";
              const copyStep = root.getAttribute("data-carousel-copy-step") || "100%";
              const current = Number(root.getAttribute("data-carousel-index") || "0");
              let next = current + direction;
              if (next > max) next = 0;
              if (next < 0) next = max;
              root.setAttribute("data-carousel-index", String(next));

              if (step === "auto") {
                const cards = Array.from(track.children);
                const first = cards[0];
                const second = cards[1];
                const measuredStep = first && second
                  ? second.offsetLeft - first.offsetLeft
                  : first
                    ? first.getBoundingClientRect().width
                    : 0;
                track.style.transform = "translateX(-" + (next * measuredStep) + "px)";
              } else {
                track.style.transform = "translateX(calc(-" + next + " * " + step + "))";
              }

              if (copyTrack) {
                copyTrack.style.transform = "translateX(calc(-" + next + " * " + copyStep + "))";
              }

              root.querySelectorAll("[data-carousel-prev]").forEach((button) => {
                button.hidden = next <= 0;
              });
            }

            document.addEventListener("click", (event) => {
              const target = event.target;
              const nextButton = target && target.closest ? target.closest("[data-carousel-next]") : null;
              const prevButton = target && target.closest ? target.closest("[data-carousel-prev]") : null;
              const button = nextButton || prevButton;
              if (!button) return;

              const root = button.closest("[data-carousel-root]");
              if (!root) return;
              event.preventDefault();
              event.stopPropagation();
              moveCarousel(root, nextButton ? 1 : -1);
            }, true);
          })();
        `,
      }}
    />
  );
}
