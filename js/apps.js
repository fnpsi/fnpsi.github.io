/* ==========================================================================
   Function Psi — Built-in Apps
   ========================================================================== */

/* ---- Tool Vault (grid of tools from data/tools.json) ---- */
function renderToolVault(container) {
  const tools = (window.toolsData && window.toolsData.tools) || [];
  const cats = [...new Set(tools.map((t) => t.category))];

  let html = `
    <div class="section-title">Tool Vault</div>
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
      <button class="chip chip-active" data-cat="all">All</button>
      ${cats.map((c) => `<button class="chip" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
    </div>
    <div class="tools-grid" id="vault-grid">
      ${renderToolTiles(tools)}
    </div>
    <div id="vault-empty" class="app-empty" style="display:none;">
      <div class="e-icon">🔍</div>
      <div>No tools match.</div>
    </div>
  `;
  container.innerHTML = html;

  const grid = document.getElementById('vault-grid');
  const empty = document.getElementById('vault-empty');
  const chips = container.querySelectorAll('.chip');

  const filter = (cat) => {
    chips.forEach((c) => c.classList.toggle('chip-active', c.dataset.cat === cat));
    const filtered = cat === 'all' ? tools : tools.filter((t) => t.category === cat);
    grid.innerHTML = renderToolTiles(filtered);
    if (filtered.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'flex';
    } else {
      grid.style.display = 'grid';
      empty.style.display = 'none';
    }
  };

  chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.cat)));
}

function renderToolTiles(tools) {
  if (!tools.length) return '';
  return tools.map((t) => `
    <button class="tool-tile" data-url="${escapeHtml(t.url)}" title="${escapeHtml(t.name)}">
      <span class="t-emoji">${t.emoji || '🛠️'}</span>
      <span style="font-size:0.72rem;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(t.name)}</span>
    </button>
  `).join('');
}

/* ---- Portfolio (from data/portfolio.js) ---- */
function renderPortfolio(container) {
  const p = window.portfolioData || {};
  const social = p.social || {};
  const projects = p.projects || [];

  let html = `
    <div class="section-title">Portfolio Archive</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--brand),var(--brand-2));display:grid;place-items:center;color:#fff;font-weight:800;">FxΨ</div>
      <div>
        <div style="font-weight:700">${escapeHtml(p.owner || 'Function Psi')}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">Builder of weird & useful things</div>
      </div>
    </div>
    <div class="section-title" style="margin-top:6px;">Projects</div>
    <div class="proj-grid" id="proj-grid">
      ${renderProjectCards(projects)}
    </div>
    <div class="section-title" style="margin-top:18px;">Connect</div>
    <div class="social-group" style="margin-top:8px;">
      ${social.x ? `<a href="${escapeHtml(social.x)}" target="_blank" rel="noopener" class="social-link"><span class="s-icon">𝕏</span><span class="s-label">X / Twitter</span><span class="s-value">@fnpsi_</span></a>` : ''}
      ${social.ig ? `<a href="${escapeHtml(social.ig)}" target="_blank" rel="noopener" class="social-link"><span class="s-icon">📷</span><span class="s-label">Instagram</span><span class="s-value">fnpsi</span></a>` : ''}
      ${social.yt ? `<a href="${escapeHtml(social.yt)}" target="_blank" rel="noopener" class="social-link"><span class="s-icon">▶️</span><span class="s-label">YouTube</span><span class="s-value">@fnpsi</span></a>` : ''}
    </div>
  `;
  container.innerHTML = html;

  // Open external links from project cards
  container.querySelectorAll('.proj-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

function renderProjectCards(projects) {
  if (!projects.length) return '<div style="color:var(--text-muted);font-size:0.8rem">No projects yet. Add them in data/portfolio.js</div>';
  return projects.map((p) => `
    <div class="proj-card">
      <div class="proj-top">
        <div class="proj-img">${p.emoji || '📦'}</div>
        <div class="proj-cat">${escapeHtml(p.category || 'Project')}</div>
      </div>
      <div class="proj-title">${escapeHtml(p.title || 'Untitled')}</div>
      <div class="proj-desc">${escapeHtml(p.description || '')}</div>
      <div class="proj-footer">
        ${p.url ? `<button class="proj-link" data-url="${escapeHtml(p.url)}">Open →</button>` : ''}
        ${p.github ? `<button class="proj-link" data-url="${escapeHtml(p.github)}">GitHub →</button>` : ''}
      </div>
    </div>
  `).join('');
}

/* ---- Course Catalog (why.university style) ---- */
function renderCourseCatalog(container) {
  const courses = [
    { emoji: '🌀', title: 'Glitch Aesthetics', desc: 'Breaking things on purpose.' },
    { emoji: '🧬', title: 'Generative UI', desc: 'Code that writes code.' },
    { emoji: '☁️', title: 'Cloud Daydreaming', desc: 'Deploying vibes to production.' },
    { emoji: '🔮', title: 'Psi Logic', desc: 'Functional thinking for the web.' },
    { emoji: '🌐', title: 'Decentralized Everything', desc: 'Own your corner of the net.' },
    { emoji: '🎨', title: 'Color Theory 3000', desc: 'Violet is the only color.' },
  ];

  let html = `<div class="section-title">Course Catalog</div>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">Enroll in anything. Nothing is required. Everything is experimental.</p>
    <div class="course-grid">`;
  courses.forEach((c) => {
    html += `
      <div class="course" onclick="alert('${escapeHtml(c.title)}: ${escapeHtml(c.desc)}\\n\\n(Coming soon — build it yourself in the Ψ Generator.)')">
        <span class="c-emoji">${c.emoji}</span>
        <div>${escapeHtml(c.title)}</div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

/* ---- Settings ---- */
function renderSettings(container) {
  const isLight = document.documentElement.classList.contains('light');
  container.innerHTML = `
    <div class="section-title">Settings</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="width:36px;height:36px;border-radius:8px;background:var(--border);display:grid;place-items:center;">🌓</div>
      <div>
        <div style="font-weight:700">Theme</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">Current: ${isLight ? 'Light' : 'Dark'}</div>
      </div>
    </div>
    <button class="gen-btn primary" id="btn-toggle-theme" style="width:auto;padding:8px 16px;">
      Switch to ${isLight ? 'Dark' : 'Light'} Mode
    </button>
    <div style="margin-top:18px;">
      <div class="section-title">About</div>
      <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.6">
        Function Psi Digital Lab — a personal OS for tools, projects, and experiments.<br>
        Owner: Function Psi (FxΨ)<br>
        Socials: X @fnpsi_ · IG fnpsi · YT @fnpsi
      </p>
    </div>
  `;
  container.querySelector('#btn-toggle-theme').addEventListener('click', () => {
    window.wmInstance.toggleTheme();
  });
}

// expose for inline handlers if needed
window.escapeHtml = function (text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
};

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
