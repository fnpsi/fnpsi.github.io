/* ==========================================================================
   Function Psi — Personal API
   Single endpoint for Rendani Manugeni
   ========================================================================== */

const PERSONAL_DATA = {
  profile: {
    name: "Rendani Manugeni",
    handle: "fnpsi",
    title: "Function Psi",
    bio: "Builder of weird, wonderful, and useful things on the internet.",
    tagline: "One of the coolest websites out there.",
    location: "South Africa",
    timezone: "UTC+2",
    since: 2026,
    avatar: "FxΨ",
    website: "https://fnpsi.github.io"
  },
  socials: {
    x: { handle: "@fnpsi_", url: "https://x.com/fnpsi_" },
    instagram: { handle: "fnpsi", url: "https://instagram.com/fnpsi" },
    youtube: { handle: "@fnpsi", url: "https://youtube.com/@fnpsi" },
    github: { handle: "fnpsi", url: "https://github.com/fnpsi" }
  },
  skills: [
    { name: "JavaScript", level: 90, category: "language" },
    { name: "HTML/CSS", level: 85, category: "language" },
    { name: "React", level: 70, category: "framework" },
    { name: "Node.js", level: 60, category: "runtime" },
    { name: "Three.js", level: 75, category: "library" },
    { name: "Git", level: 80, category: "tool" },
    { name: "Figma", level: 65, category: "design" },
    { name: "WebGL", level: 55, category: "graphics" }
  ],
  projects: [
    { name: "Ψ Digital Lab", category: "Operating System", status: "live", url: "https://fnpsi.github.io" },
    { name: "Personal API", category: "Backend", status: "active", url: "/api" },
    { name: "Generative Art System", category: "Creative Code", status: "active", url: "/generative" },
    { name: "Ψ Generator", category: "AI Tool", status: "live", url: "/generator" }
  ],
  stats: {
    appsBuilt: 11,
    linesOfCode: "10k+",
    deployments: 1,
    coolModeActivations: 0,
    lastUpdated: new Date().toISOString()
  },
  endpoints: [
    { path: "/api", description: "Root API info", method: "GET" },
    { path: "/api/profile", description: "Personal profile", method: "GET" },
    { path: "/api/socials", description: "Social media links", method: "GET" },
    { path: "/api/skills", description: "Skills and levels", method: "GET" },
    { path: "/api/projects", description: "Project list", method: "GET" },
    { path: "/api/stats", description: "System statistics", method: "GET" }
  ]
};

function initAPI() {
  const sidebar = document.getElementById('api-endpoint-list');
  const jsonView = document.getElementById('api-json-view');
  const copyBtn = document.getElementById('api-copy');
  if (!sidebar || !jsonView) return;

  let currentEndpoint = '/api';

  function renderEndpoints() {
    sidebar.innerHTML = '';
    PERSONAL_DATA.endpoints.forEach((ep) => {
      const item = document.createElement('div');
      item.className = `api-endpoint-item ${currentEndpoint === ep.path ? 'active' : ''}`;
      item.innerHTML = `
        <span class="api-method">${ep.method}</span>
        <span class="api-path">${escapeHtml(ep.path)}</span>
      `;
      item.addEventListener('click', () => {
        currentEndpoint = ep.path;
        renderEndpoints();
        renderData(ep.path);
      });
      sidebar.appendChild(item);
    });
  }

  function getDataForPath(path) {
    const map = {
      '/api': () => ({
        name: PERSONAL_DATA.profile.name,
        handle: PERSONAL_DATA.profile.handle,
        title: PERSONAL_DATA.profile.title,
        tagline: PERSONAL_DATA.profile.tagline,
        website: PERSONAL_DATA.profile.website,
        endpoints: PERSONAL_DATA.endpoints.length,
        status: 'online',
        timestamp: new Date().toISOString()
      }),
      '/api/profile': () => PERSONAL_DATA.profile,
      '/api/socials': () => PERSONAL_DATA.socials,
      '/api/skills': () => PERSONAL_DATA.skills,
      '/api/projects': () => PERSONAL_DATA.projects,
      '/api/stats': () => PERSONAL_DATA.stats
    };
    const fn = map[path];
    return fn ? fn() : { error: 'Endpoint not found' };
  }

  function renderData(path) {
    const data = getDataForPath(path);
    jsonView.innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
  }

  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\]*)"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        cls = match.endsWith(':') ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  copyBtn.addEventListener('click', () => {
    const text = jsonView.textContent || jsonView.innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy JSON', 1500);
    });
  });

  renderEndpoints();
  renderData(currentEndpoint);
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

window.initAPI = initAPI;