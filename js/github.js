/* =========================================================
   Function Psi — live GitHub workbench
   Public profile + repositories, with a session cache and
   an honest snapshot fallback when the API is unavailable.
   ========================================================= */
(function () {
  "use strict";

  var grid = document.querySelector("[data-gh-repos]");
  if (!grid) return;

  var status = document.querySelector("[data-gh-status]");
  var statusText = document.querySelector("[data-gh-status-text]");
  var statsRoot = document.querySelector("[data-gh-stats]");
  var searchInput = document.querySelector("[data-gh-search]");
  var sortSelect = document.querySelector("[data-gh-sort]");
  var refreshButton = document.querySelector("[data-gh-refresh]");
  var languageRoot = document.querySelector("[data-gh-languages]");
  var empty = document.querySelector("[data-gh-empty]");
  var heroCount = document.querySelector("[data-gh-repo-count]");

  var API_LOGIN = "functionpsi";
  var API_PROFILE = "https://api.github.com/users/" + API_LOGIN;
  var API_REPOS = API_PROFILE + "/repos?per_page=100&sort=updated";
  var CACHE_KEY = "fnpsi-gh-cache-v1";
  var CACHE_TTL = 10 * 60 * 1000;

  var languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    GLSL: "#5686a5",
    C: "#555555",
    "C++": "#f34b7d",
    Rust: "#dea584",
    Go: "#00ADD8",
    Shell: "#89e051",
    Ruby: "#701516",
    PHP: "#4F5D95"
  };

  var snapshot = {
    fetchedAt: 0,
    profile: {
      login: "functionpsi",
      name: "Function Psi",
      public_repos: 2,
      followers: 0,
      following: 0
    },
    repos: [
      {
        name: "fnpsi.github.io",
        description: "One of the coolest websites out there.",
        language: "HTML",
        stargazers_count: 1,
        forks_count: 0,
        updated_at: "2026-11-06T17:12:40Z",
        html_url: "https://github.com/functionpsi/fnpsi.github.io",
        homepage: "https://fnpsi.env.pm/",
        topics: ["cool", "cool-stuff", "fnpsi", "in-development", "learning-by-doing", "tools", "toolset", "website"],
        fork: false,
        archived: false
      },
      {
        name: "fnpsi",
        description: "About me.",
        language: null,
        stargazers_count: 1,
        forks_count: 0,
        updated_at: "2026-10-31T19:12:04Z",
        html_url: "https://github.com/functionpsi/fnpsi",
        homepage: null,
        topics: [],
        fork: false,
        archived: false
      }
    ]
  };

  var state = {
    profile: null,
    repos: [],
    query: "",
    language: "all",
    sort: "updated",
    source: "loading",
    fetchedAt: 0
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function formatNumber(value) {
    if (value === null || value === undefined || isNaN(Number(value))) return "—";
    return new Intl.NumberFormat("en-GB").format(Number(value));
  }

  function relativeTime(dateString) {
    var timestamp = new Date(dateString).getTime();
    if (!timestamp || isNaN(timestamp)) return "Unknown";

    var diff = Math.max(0, Date.now() - timestamp);
    var minutes = Math.round(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";

    var hours = Math.round(minutes / 60);
    if (hours < 24) return hours + "h ago";

    var days = Math.round(hours / 24);
    if (days < 30) return days + "d ago";

    var months = Math.round(days / 30);
    if (months < 12) return months + "mo ago";

    return Math.round(months / 12) + "y ago";
  }

  function exactDate(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function setStatus(message, source) {
    state.source = source;
    if (status) status.setAttribute("data-state", source);
    if (statusText) statusText.textContent = message;
  }

  function readCache() {
    try {
      var raw = window.sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.repos) || !parsed.fetchedAt) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCache(payload) {
    try {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      /* Storage can be blocked. The page still works without it. */
    }
  }

  function applyPayload(payload, source) {
    state.profile = payload.profile || snapshot.profile;
    state.repos = payload.repos.slice();
    state.fetchedAt = payload.fetchedAt || Date.now();
    state.source = source;

    if (heroCount) heroCount.textContent = String(state.repos.length).padStart(2, "0");

    renderStats();
    renderLanguages();
    renderRepos();
  }

  function renderStats() {
    if (!statsRoot) return;

    var repos = state.repos;
    var stars = repos.reduce(function (total, repo) {
      return total + (Number(repo.stargazers_count) || 0);
    }, 0);
    var latest = repos.reduce(function (newest, repo) {
      return !newest || new Date(repo.updated_at) > new Date(newest) ? repo.updated_at : newest;
    }, "");

    var cells = [
      { value: formatNumber((state.profile && state.profile.public_repos) || repos.length), label: "Public repos" },
      { value: formatNumber(stars), label: "Stars earned" },
      { value: formatNumber(state.profile ? state.profile.followers : null), label: "Followers" },
      { value: latest ? relativeTime(latest) : "—", label: "Latest push" }
    ];

    statsRoot.replaceChildren();

    cells.forEach(function (cell) {
      var item = el("div", "lab-stat");
      item.append(el("span", "lab-stat__value", cell.value), el("span", "lab-stat__label", cell.label));
      statsRoot.append(item);
    });
  }

  function languagesInUse() {
    var seen = {};
    state.repos.forEach(function (repo) {
      if (!repo.language) return;
      seen[repo.language] = (seen[repo.language] || 0) + 1;
    });
    return Object.keys(seen).sort().map(function (name) {
      return { name: name, count: seen[name] };
    });
  }

  function renderLanguages() {
    if (!languageRoot) return;

    var languages = languagesInUse();
    languageRoot.replaceChildren();

    if (!languages.length) return;

    if (state.language !== "all" && !languages.some(function (item) { return item.name === state.language; })) {
      state.language = "all";
    }

    var all = el("button", "lang-chip" + (state.language === "all" ? " is-active" : ""), "All");
    all.type = "button";
    all.setAttribute("data-gh-language", "all");
    all.setAttribute("aria-pressed", String(state.language === "all"));
    languageRoot.append(all);

    languages.forEach(function (item) {
      var button = el("button", "lang-chip" + (state.language === item.name ? " is-active" : ""), item.name);
      button.type = "button";
      button.setAttribute("data-gh-language", item.name);
      button.setAttribute("aria-pressed", String(state.language === item.name));
      languageRoot.append(button);
    });
  }

  function matches(repo) {
    if (state.language !== "all" && repo.language !== state.language) return false;

    var query = state.query.trim().toLowerCase();
    if (!query) return true;

    var haystack = [
      repo.name,
      repo.description || "",
      repo.language || "",
      (repo.topics || []).join(" ")
    ].join(" ").toLowerCase();

    return haystack.indexOf(query) !== -1;
  }

  function sorted(repos) {
    return repos.slice().sort(function (a, b) {
      if (state.sort === "stars") {
        return (Number(b.stargazers_count) || 0) - (Number(a.stargazers_count) || 0);
      }
      if (state.sort === "name") {
        return String(a.name).localeCompare(String(b.name));
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }

  function repoCard(repo, index) {
    var card = el("article", "repo-card");

    var top = el("div", "repo-card__top");
    top.append(
      el("span", "repo-card__index", String(index + 1).padStart(2, "0")),
      el("span", "repo-card__state", repo.archived ? "Archived" : repo.fork ? "Fork" : "Public")
    );

    var title = el("h3", "repo-card__title");
    var titleLink = el("a", null, repo.name);
    titleLink.href = repo.html_url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.setAttribute("data-cursor-label", "GitHub");
    titleLink.append(el("span", "repo-card__arrow", "↗"));
    title.append(titleLink);

    var description = el("p", "repo-card__desc", repo.description || "No description yet. The code is the description.");

    var topics = el("div", "repo-card__topics");
    (repo.topics || []).slice(0, 6).forEach(function (topic) {
      topics.append(el("span", null, topic));
    });

    var meta = el("div", "repo-card__meta");

    if (repo.language) {
      var language = el("span", "repo-card__lang");
      var dot = el("i");
      dot.style.backgroundColor = languageColors[repo.language] || "#8b949e";
      dot.setAttribute("aria-hidden", "true");
      language.append(dot, document.createTextNode(repo.language));
      meta.append(language);
    }

    var stars = el("span", "repo-card__stat");
    stars.append(el("span", "repo-card__symbol", "★"), document.createTextNode(formatNumber(repo.stargazers_count)));
    stars.title = formatNumber(repo.stargazers_count) + " stars";

    var forks = el("span", "repo-card__stat");
    forks.append(el("span", "repo-card__symbol", "⑂"), document.createTextNode(formatNumber(repo.forks_count)));
    forks.title = formatNumber(repo.forks_count) + " forks";

    var updated = el("span", "repo-card__updated", "Updated " + relativeTime(repo.updated_at));
    updated.title = exactDate(repo.updated_at);

    meta.append(stars, forks, updated);

    var foot = el("div", "repo-card__foot");
    var repoLink = el("a", "repo-card__link", "Repository");
    repoLink.href = repo.html_url;
    repoLink.target = "_blank";
    repoLink.rel = "noopener noreferrer";
    repoLink.append(el("span", null, "↗"));
    foot.append(repoLink);

    if (repo.homepage) {
      var live = el("a", "repo-card__link repo-card__link--live", "Live site");
      live.href = repo.homepage;
      live.target = "_blank";
      live.rel = "noopener noreferrer";
      live.append(el("span", null, "↗"));
      foot.append(live);
    }

    card.append(top, title, description, topics, meta, foot);
    return card;
  }

  function renderRepos() {
    var visible = sorted(state.repos.filter(matches));

    grid.replaceChildren();
    grid.setAttribute("aria-busy", "false");

    visible.forEach(function (repo, index) {
      grid.append(repoCard(repo, index));
    });

    if (empty) empty.hidden = visible.length > 0;
  }

  function renderError(message) {
    var cached = readCache();
    if (cached) {
      applyPayload(cached, "cache");
      setStatus("Cached snapshot / " + relativeTime(new Date(cached.fetchedAt).toISOString()), "cache");
      return;
    }

    applyPayload(snapshot, "snapshot");
    setStatus("Snapshot / API unavailable", "snapshot");
    if (status) status.title = message;
  }

  function load(force) {
    var cached = readCache();
    var fresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL;

    if (cached && !force) {
      applyPayload(cached, "cache");
      setStatus(
        (fresh ? "Cached / " : "Stale cache / ") + relativeTime(new Date(cached.fetchedAt).toISOString()),
        "cache"
      );
    }

    if (cached && fresh && !force) return;

    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Refreshing…";
    }
    if (!cached) setStatus("Connecting to api.github.com", "loading");

    var profileRequest = fetch(API_PROFILE, {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("GitHub profile request failed: " + response.status);
      return response.json();
    });

    var repoRequest = fetch(API_REPOS, {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("GitHub repository request failed: " + response.status);
      return response.json();
    });

    Promise.all([
      profileRequest.catch(function () { return null; }),
      repoRequest
    ]).then(function (results) {
      var profile = results[0];
      var repos = results[1];

      if (!Array.isArray(repos)) throw new Error("GitHub returned an unexpected repository payload.");

      var payload = {
        fetchedAt: Date.now(),
        profile: profile || (cached && cached.profile) || snapshot.profile,
        repos: repos
      };

      writeCache(payload);
      applyPayload(payload, "live");
      setStatus("Live / api.github.com", "live");
    }).catch(function (error) {
      renderError(error && error.message ? error.message : "GitHub request failed.");
    }).then(function () {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value;
      renderRepos();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      renderRepos();
    });
  }

  if (languageRoot) {
    languageRoot.addEventListener("click", function (event) {
      var button = event.target.closest("[data-gh-language]");
      if (!button) return;

      state.language = button.getAttribute("data-gh-language");

      Array.prototype.forEach.call(languageRoot.querySelectorAll("[data-gh-language]"), function (chip) {
        var active = chip.getAttribute("data-gh-language") === state.language;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });

      renderRepos();
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      load(true);
    });
  }

  load(false);
})();
