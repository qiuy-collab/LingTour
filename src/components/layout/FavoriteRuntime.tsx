export function FavoriteRuntime() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (() => {
            if (window.__lingtourFavoriteRuntimeReady) return;
            window.__lingtourFavoriteRuntimeReady = true;
            const key = "lingtour-favorites";

            function readFavorites() {
              try {
                const raw = window.localStorage.getItem(key);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }

            function writeFavorites(items) {
              try {
                window.localStorage.setItem(key, JSON.stringify(items));
                window.dispatchEvent(new Event("lingtour-favorites"));
              } catch {
                // localStorage unavailable
              }
            }

            function isSaved(button, items) {
              const id = button.getAttribute("data-favorite-id");
              const type = button.getAttribute("data-favorite-type");
              return items.some(function (item) { return item && item.id === id && item.type === type; });
            }

            function paintButton(button, saved) {
              button.setAttribute("aria-pressed", saved ? "true" : "false");
              const label = button.querySelector("[data-favorite-label]");
              if (label) label.textContent = saved ? "Saved" : "Save";
              const icon = button.querySelector("svg");
              if (icon) icon.setAttribute("fill", saved ? "currentColor" : "none");
            }

            function syncButtons() {
              const favorites = readFavorites();
              document.querySelectorAll('[data-favorite-button="true"]').forEach(function (button) {
                paintButton(button, isSaved(button, favorites));
              });
            }

            function favoriteHref(item) {
              return item.type === "route" ? "/routes/" + item.id + "/" : "/checkout/?product=" + item.id;
            }

            function escapeHtml(value) {
              return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
            }

            function renderAccountFavorites() {
              const list = document.querySelector("[data-account-favorites-list]");
              const empty = document.querySelector("[data-account-favorites-empty]");
              if (!list || !empty) return;

              const favorites = readFavorites().filter(function (item) {
                return item && typeof item.id === "string" && typeof item.title === "string" && (item.type === "route" || item.type === "product");
              });

              if (!favorites.length) {
                list.innerHTML = "";
                list.hidden = true;
                empty.hidden = false;
                return;
              }

              empty.hidden = true;
              list.hidden = false;
              list.innerHTML = favorites.map(function (item) {
                const label = item.type === "route" ? "Saved route" : "Saved object";
                const href = favoriteHref(item);
                return '<article class="grid gap-5 border border-[var(--line)] bg-[var(--paper)] p-6 transition hover:bg-white">' +
                  '<div>' +
                    '<p class="text-label text-[var(--cinnabar)]">' + label + '</p>' +
                    '<h3 class="mt-4 font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] sm:text-3xl">' + escapeHtml(item.title) + '</h3>' +
                  '</div>' +
                  '<div class="flex flex-col gap-3 sm:flex-row">' +
                    '<a href="' + escapeHtml(href) + '" class="bg-[var(--river-deep)] px-5 py-3 text-center text-sm font-semibold text-white">Open</a>' +
                    '<button type="button" data-account-favorite-remove="true" data-favorite-id="' + escapeHtml(item.id) + '" data-favorite-type="' + escapeHtml(item.type) + '" class="border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]">Remove</button>' +
                  '</div>' +
                '</article>';
              }).join("");
            }

            function syncFavorites() {
              syncButtons();
              renderAccountFavorites();
            }

            document.addEventListener("click", function (event) {
              const target = event.target;
              const removeBtn = target && target.closest ? target.closest('[data-account-favorite-remove="true"]') : null;

              if (removeBtn) {
                event.preventDefault();
                const id = removeBtn.getAttribute("data-favorite-id");
                const type = removeBtn.getAttribute("data-favorite-type");
                if (id && (type === "route" || type === "product")) {
                  const favorites = readFavorites();
                  const next = favorites.filter(function (item) { return !(item.id === id && item.type === type); });
                  writeFavorites(next);
                  syncFavorites();
                }
                return;
              }

              const favBtn = target && target.closest ? target.closest('[data-favorite-button="true"]') : null;
              if (favBtn && !favBtn.hasAttribute("data-react-favorite")) {
                event.preventDefault();
                event.stopPropagation();
                const id = favBtn.getAttribute("data-favorite-id");
                const type = favBtn.getAttribute("data-favorite-type");
                const title = favBtn.getAttribute("data-favorite-title") || "";
                if (id && (type === "route" || type === "product")) {
                  const favorites = readFavorites();
                  const exists = favorites.some(function (item) { return item && item.id === id && item.type === type; });
                  const next = exists
                    ? favorites.filter(function (item) { return !(item && item.id === id && item.type === type); })
                    : favorites.concat([{ id: id, type: type, title: title }]);
                  writeFavorites(next);
                  syncFavorites();
                }
              }
            }, true);

            window.addEventListener("storage", syncFavorites);
            window.addEventListener("lingtour-favorites", syncFavorites);
            window.addEventListener("pageshow", syncFavorites);
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", syncFavorites, { once: true });
            } else {
              syncFavorites();
            }
          })();
        `,
      }}
    />
  );
}
