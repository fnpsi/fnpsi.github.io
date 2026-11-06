/* =========================================================
   Function Psi — work index filters + recent memory
   ========================================================= */
(function () {
  "use strict";

  var grid = document.querySelector("[data-work-grid]");
  if (!grid) return;

  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-project-card]"));
  var countNode = document.querySelector("[data-work-count]");
  var empty = document.querySelector("[data-work-empty]");
  var recentSection = document.querySelector("[data-recent-work]");
  var recentGrid = document.querySelector("[data-recent-grid]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = Boolean(window.gsap);
  var validFilters = ["all", "3d", "web3d", "web"];

  var projectMap = {};
  cards.forEach(function (card) {
    var slug = card.getAttribute("data-slug");
    if (!slug) return;
    projectMap[slug] = {
      title: card.getAttribute("data-title") || slug,
      category: card.getAttribute("data-category-label") || "",
      href: card.getAttribute("href")
    };
  });

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateUrl(filter) {
    if (!history.replaceState) return;
    var url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", filter);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function setCount(visible) {
    if (countNode) countNode.textContent = pad(visible);
    if (empty) empty.classList.toggle("is-visible", visible === 0);
  }

  function applyFilter(filter, immediate) {
    if (validFilters.indexOf(filter) === -1) filter = "all";
    var visible = 0;
    var index = 0;

    buttons.forEach(function (button) {
      var isActive = button.getAttribute("data-filter") === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-category") === filter;

      if (show) {
        card.hidden = false;
        visible += 1;

        if (hasGSAP && !reduceMotion && !immediate) {
          window.gsap.fromTo(card, {
            opacity: 0,
            y: 22
          }, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            delay: index * 0.055,
            ease: "power3.out",
            clearProps: "transform,opacity"
          });
        } else {
          card.style.removeProperty("opacity");
          card.style.removeProperty("transform");
        }
        index += 1;
      } else {
        card.hidden = true;
      }
    });

    setCount(visible);
    updateUrl(filter);

    if (hasGSAP && window.ScrollTrigger) {
      window.setTimeout(function () {
        window.ScrollTrigger.refresh();
      }, 100);
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-filter"), false);
    });
  });

  function renderRecent() {
    if (!recentSection || !recentGrid || !window.FNPsiConsent) return;

    var recent = window.FNPsiConsent.recent || [];
    var items = recent.map(function (slug) {
      return projectMap[slug];
    }).filter(Boolean).slice(0, 3);

    if (window.FNPsiConsent.choice !== "accepted" || !items.length) {
      recentSection.hidden = true;
      recentGrid.replaceChildren();
      return;
    }

    recentSection.hidden = false;
    recentGrid.replaceChildren();

    items.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "recent-item";
      link.href = item.href;

      var text = document.createElement("div");
      var category = document.createElement("span");
      category.textContent = item.category;
      var title = document.createElement("strong");
      title.textContent = item.title;
      text.append(category, title);

      var arrow = document.createElement("i");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";

      link.append(text, arrow);
      recentGrid.append(link);
    });
  }

  window.addEventListener("fnpsi:recent-changed", renderRecent);
  window.addEventListener("fnpsi:consent-changed", renderRecent);

  var initial = new URL(window.location.href).searchParams.get("category") || "all";
  if (validFilters.indexOf(initial) === -1) initial = "all";
  applyFilter(initial, true);
  renderRecent();
})();
