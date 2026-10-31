/* ==========================================================================
   Function Psi — Dashboard
   Consumes Personal API endpoints, real-time widgets
   ========================================================================== */

function initDashboard() {
  const container = document.getElementById('dashboard-section');
  if (!container) return;

  const ENDPOINTS = {
    profile: '/api/profile',
    skills: '/api/skills',
    projects: '/api/projects',
    stats: '/api/stats',
    socials: '/api/socials'
  };

  let widgets = {};

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Dashboard</h2>
      <p class="section-desc">Real-time widgets powered by Personal API</p>
    </div>
    <div class="dashboard-grid" id="dashboard-grid">
      <article class="dash-widget" id="widget-profile">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">👤</span>
          <h3 class="dash-widget-title">Profile</h3>
        </div>
        <div class="dash-widget-content">
          <div class="profile-avatar" id="dash-avatar">FxΨ</div>
          <div class="profile-name" id="dash-name">Loading...</div>
          <div class="profile-tagline" id="dash-tagline"></div>
        </div>
      </article>

      <article class="dash-widget" id="widget-stats">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">📊</span>
          <h3 class="dash-widget-title">System Stats</h3>
        </div>
        <div class="dash-widget-content">
          <div class="stats-grid" id="dash-stats"></div>
        </div>
      </article>

      <article class="dash-widget" id="widget-skills">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">🛠️</span>
          <h3 class="dash-widget-title">Top Skills</h3>
        </div>
        <div class="dash-widget-content">
          <div class="skills-list" id="dash-skills"></div>
        </div>
      </article>

      <article class="dash-widget" id="widget-projects">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">🚀</span>
          <h3 class="dash-widget-title">Projects</h3>
        </div>
        <div class="dash-widget-content">
          <div class="projects-list" id="dash-projects"></div>
        </div>
      </article>

      <article class="dash-widget dash-widget-wide" id="widget-socials">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">🔗</span>
          <h3 class="dash-widget-title">Social</h3>
        </div>
        <div class="dash-widget-content">
          <div class="socials-grid" id="dash-socials"></div>
        </div>
      </article>

      <article class="dash-widget" id="widget-live">
        <div class="dash-widget-header">
          <span class="dash-widget-icon">⚡</span>
          <h3 class="dash-widget-title">Live Data</h3>
          <span class="live-indicator" id="live-indicator">
            <span class="live-dot"></span> LIVE
          </span>
        </div>
        <div class="dash-widget-content">
          <div class="live-metrics" id="dash-live"></div>
        </div>
      </article>
    </div>
  `;

  async function fetchEndpoint(path) {
    try {
      const res = await fetch(path);
      return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch ${path}:`, e);
      return null;
    }
  }

  async function loadAll() {
    const [profile, stats, skills, projects, socials] = await Promise.all([
      fetchEndpoint(ENDPOINTS.profile),
      fetchEndpoint(ENDPOINTS.stats),
      fetchEndpoint(ENDPOINTS.skills),
      fetchEndpoint(ENDPOINTS.projects),
      fetchEndpoint(ENDPOINTS.socials)
    ]);

    if (profile) renderProfile(profile);
    if (stats) renderStats(stats);
    if (skills) renderSkills(skills);
    if (projects) renderProjects(projects);
    if (socials) renderSocials(socials);

    // Start live updates
    startLiveUpdates();
  }

  function renderProfile(p) {
    document.getElementById('dash-avatar').textContent = p.avatar || 'FxΨ';
    document.getElementById('dash-name').textContent = p.name || 'Rendani Manugeni';
    document.getElementById('dash-tagline').textContent = p.tagline || 'One of the coolest websites out there.';
  }

  function renderStats(s) {
    const stats = [
      { label: 'Apps Built', value: s.appsBuilt || 11 },
      { label: 'Lines of Code', value: s.linesOfCode || '10k+' },
      { label: 'Deployments', value: s.deployments || 1 },
      { label: 'Cool Activations', value: s.coolModeActivations || 0 }
    ];
    const grid = document.getElementById('dash-stats');
    grid.innerHTML = stats.map(stat => `
      <div class="stat-item">
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  }

  function renderSkills(skills) {
    const top = skills.sort((a, b) => b.level - a.level).slice(0, 6);
    const list = document.getElementById('dash-skills');
    list.innerHTML = top.map(skill => `
      <div class="skill-item">
        <div class="skill-info">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-category">${skill.category}</span>
        </div>
        <div class="skill-bar-wrap">
          <div class="skill-bar" style="width: ${skill.level}%"></div>
        </div>
        <span class="skill-level">${skill.level}%</span>
      </div>
    `).join('');
  }

  function renderProjects(projects) {
    const list = document.getElementById('dash-projects');
    list.innerHTML = projects.map(p => `
      <div class="project-item">
        <div class="project-icon">${p.emoji || '📦'}</div>
        <div class="project-details">
          <div class="project-name">${p.name}</div>
          <div class="project-meta">${p.category} · ${p.status}</div>
        </div>
        ${p.url && p.url !== '#' ? `<a href="${p.url}" target="_blank" rel="noopener" class="project-link">→</a>` : ''}
      </div>
    `).join('');
  }

  function renderSocials(socials) {
    const grid = document.getElementById('dash-socials');
    const entries = Object.entries(socials).filter(([_, v]) => v?.url);
    grid.innerHTML = entries.map(([key, val]) => `
      <a href="${val.url}" target="_blank" rel="noopener" class="social-item">
        <span class="social-platform">${key}</span>
        <span class="social-handle">${val.handle}</span>
      </a>
    `).join('');
  }

  function startLiveUpdates() {
    // Update live metrics every 5 seconds
    const liveEl = document.getElementById('dash-live');
    const indicator = document.getElementById('live-indicator');

    function updateLive() {
      const now = new Date();
      const metrics = [
        { label: 'Time', value: now.toLocaleTimeString() },
        { label: 'Uptime', value: formatUptime(Date.now() - performance.now()) },
        { label: 'Memory', value: formatMemory() },
        { label: 'FPS', value: Math.floor(55 + Math.random() * 10) }
      ];

      liveEl.innerHTML = metrics.map(m => `
        <div class="live-metric">
          <span class="live-label">${m.label}</span>
          <span class="live-value">${m.value}</span>
        </div>
      `).join('');

      // Pulse indicator
      indicator.classList.toggle('pulse');
    }

    updateLive();
    setInterval(updateLive, 5000);

    // Refresh API data every 30 seconds
    setInterval(loadAll, 30000);
  }

  function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }

  function formatMemory() {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      return `${used} MB`;
    }
    return 'N/A';
  }

  // Load initial data
  loadAll();

  // Expose refresh
  window.dashboard = { refresh: loadAll };
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

window.initDashboard = initDashboard;