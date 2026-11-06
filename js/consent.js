/* =========================================================
   Function Psi — cookie consent + optional local memory
   ========================================================= */
(function () {
  "use strict";

  var CONSENT_KEY = "fnpsi-consent-v1";
  var RECENT_KEY = "fnpsi-recent-work-v1";
  var VERSION = 1;
  var banner = document.querySelector("[data-cookie-banner]");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-consent]"));
  var settingsButtons = Array.prototype.slice.call(document.querySelectorAll("[data-cookie-settings]"));
  var currentLabel = document.querySelector("[data-consent-current]");
  var choice = null;
  var hideTimer = 0;
  var showTimer = 0;
  var bannerVisible = false;

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) return null;
      if (parsed.choice !== "accepted" && parsed.choice !== "essential") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeConsent(nextChoice) {
    choice = nextChoice;
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: VERSION,
        choice: nextChoice,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      // Private browsing can block storage. The choice still applies for this page.
    }
  }

  function readRecent() {
    if (choice !== "accepted") return [];
    try {
      var raw = window.localStorage.getItem(RECENT_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (item) {
        return typeof item === "string" && item.length > 0;
      }).slice(0, 3) : [];
    } catch (error) {
      return [];
    }
  }

  function writeRecent(items) {
    if (choice !== "accepted") return;
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 3)));
    } catch (error) {
      // Ignore unavailable storage.
    }
  }

  function clearRecent() {
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch (error) {
      // Ignore unavailable storage.
    }
    window.dispatchEvent(new CustomEvent("fnpsi:recent-changed"));
  }

  function recordProject() {
    if (choice !== "accepted") return;
    var slug = document.body.getAttribute("data-project");
    if (!slug) return;

    var recent = readRecent().filter(function (item) {
      return item !== slug;
    });
    recent.unshift(slug);
    writeRecent(recent);
    window.dispatchEvent(new CustomEvent("fnpsi:recent-changed"));
  }

  function applyChoice(nextChoice) {
    if (nextChoice === "accepted") {
      recordProject();
    } else {
      clearRecent();
    }

    window.dispatchEvent(new CustomEvent("fnpsi:consent-changed", {
      detail: { choice: nextChoice }
    }));
  }

  function updateCurrentLabel() {
    if (!currentLabel) return;
    if (choice === "accepted") {
      currentLabel.textContent = "Current choice: accepted all optional local memory.";
    } else if (choice === "essential") {
      currentLabel.textContent = "Current choice: essential storage only.";
    } else {
      currentLabel.textContent = "No preference saved yet.";
    }
  }

  function showBanner(focus) {
    if (!banner) return;
    window.clearTimeout(hideTimer);
    window.clearTimeout(showTimer);
    banner.hidden = false;
    updateCurrentLabel();

    // Force a style flush so the entrance transition runs even if the tab is
    // backgrounded and requestAnimationFrame is paused.
    void banner.offsetWidth;
    banner.classList.add("is-visible");
    bannerVisible = true;

    if (focus) {
      var first = banner.querySelector("[data-consent]");
      if (first) first.focus();
    }
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove("is-visible");
    bannerVisible = false;
    hideTimer = window.setTimeout(function () {
      if (!bannerVisible) banner.hidden = true;
    }, 500);
  }

  function choose(nextChoice) {
    writeConsent(nextChoice);
    applyChoice(nextChoice);
    hideBanner();
  }

  function waitForPage() {
    if (!document.documentElement.classList.contains("is-loading")) {
      showTimer = window.setTimeout(function () {
        if (!choice) showBanner(false);
      }, 900);
      return;
    }

    window.addEventListener("fnpsi:page-ready", function () {
      showTimer = window.setTimeout(function () {
        if (!choice) showBanner(false);
      }, 650);
    }, { once: true });

    window.setTimeout(function () {
      if (!choice && !bannerVisible) showBanner(false);
    }, 8400);
  }

  function init() {
    var saved = readConsent();
    if (saved) {
      choice = saved.choice;
      updateCurrentLabel();
      if (choice === "accepted") recordProject();
    } else {
      waitForPage();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        choose(button.getAttribute("data-consent"));
      });
    });

    settingsButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        showBanner(true);
      });
    });

    window.addEventListener("fnpsi:consent-changed", function () {
      updateCurrentLabel();
    });
  }

  window.FNPsiConsent = {
    get choice() {
      return choice;
    },
    get recent() {
      return readRecent();
    },
    open: function () {
      showBanner(true);
    },
    clear: function () {
      try {
        window.localStorage.removeItem(CONSENT_KEY);
        window.localStorage.removeItem(RECENT_KEY);
      } catch (error) {
        // Ignore unavailable storage.
      }
      choice = null;
      updateCurrentLabel();
      showBanner(true);
      window.dispatchEvent(new CustomEvent("fnpsi:recent-changed"));
    }
  };

  init();
})();
