/* ==========================================================================
   Psi Tools — Application Logic
   ========================================================================== */

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const state = {
    tools: [],
    sources: [],
    activeCategory: "all",
    searchQuery: "",
  };

  // ------------------------------------------------------------------
  // DOM elements
  // ------------------------------------------------------------------
  const els = {
    html: document.documentElement,
    themeToggle: document.getElementById("theme-toggle"),
    searchForm: document.getElementById("search-form"),
    searchInput: document.getElementById("search-input"),
    searchClear: document.getElementById("search-clear"),
    chips: document.querySelectorAll(".chip"),
    toolsGrid: document.getElementById("tools-grid"),
    sourcesGrid: document.getElementById("sources-grid"),
    emptyState: document.getElementById("empty-state"),
    statTools: document.getElementById("stat-tools"),
    modal: document.getElementById("tool-modal"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalClose: document.getElementById("modal-close"),
    mobileMenuBtn: document.getElementById("mobile-menu-btn"),
    nav: document.getElementById("main-nav"),
    hamburger: document.querySelector(".hamburger"),
    header: document.getElementById("header"),
    year: document.getElementById("year"),
  };

  // ------------------------------------------------------------------
  // Theme handling
  // ------------------------------------------------------------------
  function initTheme() {
    const saved = localStorage.getItem("psi-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    if (isDark) els.html.classList.add("dark");
  }

  function toggleTheme() {
    const isDark = els.html.classList.toggle("dark");
    localStorage.setItem("psi-theme", isDark ? "dark" : "light");
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderTools() {
    const filtered = state.tools.filter((tool) => {
      const matchCategory =
        state.activeCategory === "all" || tool.category === state.activeCategory;
      const q = state.searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });

    els.toolsGrid.innerHTML = "";

    if (filtered.length === 0) {
      els.emptyState.style.display = "block";
      els.toolsGrid.style.display = "none";
      return;
    }

    els.emptyState.style.display = "none";
    els.toolsGrid.style.display = "grid";

    const fragment = document.createDocumentFragment();

    filtered.forEach((tool) => {
      const card = document.createElement("article");
      card.className = `tool-card${tool.featured ? " featured" : ""}`;
      card.setAttribute("role", "gridcell");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${tool.name}, ${tool.category}`);
      card.dataset.id = tool.id;

      const avatar = tool.emoji || "🛠️";

      card.innerHTML = `
        <div class="tool-avatar" aria-hidden="true">${avatar}</div>
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.description)}</p>
        <div class="tool-meta">
          <span class="tool-category">${escapeHtml(tool.category)}</span>
          <span class="tool-external" aria-hidden="true">Open →</span>
        </div>
      `;

      card.addEventListener("click", () => openModal(tool));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(tool);
        }
      });

      fragment.appendChild(card);
    });

    els.toolsGrid.appendChild(fragment);
    animateCounter(els.statTools, state.tools.length);
  }

  function renderSources() {
    els.sourcesGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();

    state.sources.forEach((source) => {
      const card = document.createElement("article");
      card.className = "source-card";
      card.setAttribute("role", "gridcell");
      card.dataset.id = source.id;

      card.innerHTML = `
        <h3>${escapeHtml(source.name)}</h3>
        <p>${escapeHtml(source.description)}</p>
        <div class="source-meta">
          <span class="source-category">${escapeHtml(source.category)}</span>
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener" class="source-external">Visit →</a>
        </div>
      `;

      fragment.appendChild(card);
    });

    els.sourcesGrid.appendChild(fragment);
  }

  // Simple counting animation for the stat
  function animateCounter(el, target) {
    if (!el) return;
    let current = +el.textContent || 0;
    const increment = Math.ceil((target - current) / 15);
    if (increment <= 0) {
      el.textContent = target;
      return;
    }
    const step = () => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = current;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Modal
  // ------------------------------------------------------------------
  function openModal(tool) {
    const modal = els.modal;
    const title = document.getElementById("modal-title");
    const category = document.getElementById("modal-category");
    const desc = document.getElementById("modal-desc");
    const url = document.getElementById("modal-url");
    const tags = document.getElementById("modal-tags");
    const avatar = document.getElementById("modal-avatar");

    title.textContent = tool.name;
    category.textContent = tool.category;
    desc.textContent = tool.description;
    url.href = tool.url;
    avatar.innerHTML = tool.emoji || "🛠️";

    tags.innerHTML = "";
    (tool.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "modal-tag";
      span.textContent = tag;
      tags.appendChild(span);
    });

    modal.classList.add("open");
    modal.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.close();
    els.modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  // ------------------------------------------------------------------
  // Search
  // ------------------------------------------------------------------
  function handleSearch() {
    state.searchQuery = els.searchInput.value.toLowerCase().trim();
    els.searchClear.classList.toggle("visible", !!state.searchQuery);
    renderTools();
  }

  function clearSearch() {
    els.searchInput.value = "";
    state.searchQuery = "";
    els.searchClear.classList.remove("visible");
    renderTools();
    els.searchInput.focus();
  }

  // ------------------------------------------------------------------
  // Category chips
  // ------------------------------------------------------------------
  function setupChips() {
    els.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.activeCategory = chip.dataset.category;
        els.chips.forEach((c) => c.classList.remove("chip-active"));
        chip.classList.add("chip-active");
        renderTools();
      });
    });
  }

  // ------------------------------------------------------------------
  // Mobile menu
  // ------------------------------------------------------------------
  function toggleMobileMenu() {
    const open = els.nav.classList.toggle("open");
    els.mobileMenuBtn.setAttribute("aria-expanded", open);
    const expanded = open;
    // Animate hamburger
    if (expanded) {
      els.hamburger.style.background = "transparent";
      els.hamburger.style.transform = "rotate(45deg)";
      els.hamburger.style.transition = "0.3s";
      setTimeout(() => {
        els.hamburger.style.transform = "rotate(0)";
        els.hamburger.style.background = "currentColor";
      }, 300);
    }
  }

  // ------------------------------------------------------------------
  // Header scroll effect
  // ------------------------------------------------------------------
  function onScroll() {
    if (window.scrollY > 20) {
      els.header.style.boxShadow = "var(--shadow-sm)";
    } else {
      els.header.style.boxShadow = "none";
    }
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  function init() {
    initTheme();
    renderTools();
    renderSources();
    setupChips();

    // Theme toggle
    els.themeToggle.addEventListener("click", toggleTheme);

    // Search
    els.searchInput.addEventListener("input", handleSearch);
    els.searchClear.addEventListener("click", clearSearch);

    // Modal close
    els.modalClose.addEventListener("click", closeModal);
    els.modalBackdrop.addEventListener("click", closeModal);
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.modal.open) closeModal();
    });

    // Mobile menu
    if (els.mobileMenuBtn) {
      els.mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }

    // Close mobile menu on nav link click
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        els.nav.classList.remove("open");
      });
    });

    // Scroll
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Year
    if (els.year) els.year.textContent = new Date().getFullYear();

    // Load data
    if (typeof window.toolsData !== "undefined") {
      state.tools = window.toolsData.tools || [];
      state.sources = window.toolsData.sources || [];
      renderTools();
      renderSources();
    }
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
