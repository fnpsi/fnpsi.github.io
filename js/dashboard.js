/* ==========================================================================
   Function Psi — Dashboard
   Consumes Personal API endpoints, real-time widgets via realtimeDashboard
   ========================================================================== */

function initDashboard() {
  const container = document.getElementById('dashboard-section');
  if (!container) return;

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

  // Wait for realtimeDashboard to be ready
  function waitForRealtime() {
    return new Promise((resolve) => {
      if (window.realtimeDashboard) {
        resolve(window.realtimeDashboard);
      } else {
        const check = setInterval(() => {
          if (window.realtimeDashboard) {
            clearInterval(check);
            resolve(window.realtimeDashboard);
          }
        }, 50);
      }
    });
  }

  waitForRealtime().then((realtime) => {
    // Subscribe to live metrics
    realtime.on('live', (metrics) => {
      renderLive(metrics);
    });

    // Subscribe to API data
    realtime.on('api', (data) => {
      if (data.profile) renderProfile(data.profile);
      if (data.stats) renderStats(data.stats);
      if (data.skills) renderSkills(data.skills);
      if (data.projects) renderProjects(data.projects);
      if (data.socials) renderSocials(data.socials);
    });

    // Subscribe to generative updates
    realtime.on('generative', (data) => {
      console.log('Generative art refreshed:', data);
    });

    // Initial render (will be populated when events fire)
  });

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

  function renderLive(metrics) {
    const liveEl = document.getElementById('dash-live');
    const indicator = document.getElementById('live-indicator');

    const items = [
      { label: 'Time', value: metrics.time },
      { label: 'Uptime', value: metrics.uptime },
      { label: 'Memory', value: metrics.memory },
      { label: 'FPS', value: metrics.fps }
    ];

    liveEl.innerHTML = items.map(m => `
      <div class="live-metric">
        <span class="live-label">${m.label}</span>
        <span class="live-value">${m.value}</span>
      </div>
    `).join('');

    // Pulse indicator
    indicator.classList.toggle('pulse');
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

window.initDashboard = initDashboard;