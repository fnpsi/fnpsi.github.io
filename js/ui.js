/* ==========================================================================
   Function Psi — Main UI
   Navigation, tools, modals, smooth scroll
   ========================================================================== */

function initUI() {
  // DOM
  const navCenter = document.getElementById('nav-center');
  const toolsGrid = document.getElementById('tools-grid');
  const portfolioGrid = document.getElementById('portfolio-grid');
  const statTools = document.getElementById('stat-tools');
  const statApps = document.getElementById('stat-apps');
  const statProjects = document.getElementById('stat-projects');
  const socialBtn = document.getElementById('nav-social');
  const socialModal = document.getElementById('social-modal');
  const socialClose = document.getElementById('social-close');
  const toolModal = document.getElementById('tool-modal');
  const toolClose = document.getElementById('tool-close');
  const themeBtn = document.getElementById('nav-theme');

  // Tools data
  const tools = window.toolsData?.tools || [];

  // Stats
  if (statTools) statTools.textContent = tools.length;
  if (statApps) statApps.textContent = 11; // hardcoded for now
  if (statProjects) statProjects.textContent = window.portfolioData?.projects?.length || 0;

  // Render nav
  const navItems = [
    { id: 'tools', label: 'Tools' },
    { id: 'generative', label: 'Generative' },
    { id: 'api', label: 'API' },
    { id: 'portfolio', label: 'Portfolio' }
  ];
  navItems.forEach((item) => {
    const btn = document.createElement('a');
    btn.href = `#${item.id}`;
    btn.className = 'nav-item';
    btn.textContent = item.label;
    btn.style.cssText = `
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 100px;
      transition: all var(--transition);
      border: 1px solid transparent;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.color = 'var(--accent)';
      btn.style.borderColor = 'var(--accent)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = 'var(--text-muted)';
      btn.style.borderColor = 'transparent';
    });
    navCenter.appendChild(btn);
  });

  // Render tools
  if (toolsGrid) {
    tools.forEach((tool) => {
      const card = document.createElement('article');
      card.className = 'tool-card';
      card.innerHTML = `
        <span class="tool-card-icon">${tool.emoji || '🛠️'}</span>
        <h3 class="tool-card-title">${escapeHtml(tool.name)}</h3>
        <p class="tool-card-desc">${escapeHtml(tool.description)}</p>
        <span class="tool-card-category">${escapeHtml(tool.category)}</span>
      `;
      card.addEventListener('click', () => openToolModal(tool));
      card.style.cursor = 'pointer';
      toolsGrid.appendChild(card);
    });
  }

  // Render portfolio
  const projects = window.portfolioData?.projects || [];
  if (portfolioGrid) {
    projects.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'portfolio-card';
      card.innerHTML = `
        <div class="portfolio-card-header">
          <span class="portfolio-card-icon">${project.emoji || '📦'}</span>
          <span class="portfolio-card-category">${escapeHtml(project.category)}</span>
        </div>
        <h3 class="portfolio-card-title">${escapeHtml(project.title)}</h3>
        <p class="portfolio-card-desc">${escapeHtml(project.description)}</p>
        <div class="portfolio-card-links">
          ${project.url && project.url !== '#' ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener" class="portfolio-link">View Live →</a>` : ''}
          ${project.github && project.github !== '#' ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener" class="portfolio-link">GitHub →</a>` : ''}
        </div>
      `;
      portfolioGrid.appendChild(card);
    });
  }

  // Modal functions
  function openModal(modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Social modal
  socialBtn.addEventListener('click', () => openModal(socialModal));
  socialClose.addEventListener('click', () => closeModal(socialModal));
  socialModal.addEventListener('click', (e) => {
    if (e.target === socialModal) closeModal(socialModal);
  });

  // Tool modal
  function openToolModal(tool) {
    document.getElementById('tool-modal-avatar').textContent = tool.emoji || '🛠️';
    document.getElementById('tool-modal-title').textContent = tool.name;
    document.getElementById('tool-modal-category').textContent = tool.category;
    document.getElementById('tool-modal-desc').textContent = tool.description;
    document.getElementById('tool-modal-link').href = tool.url;

    const tagsEl = document.getElementById('tool-modal-tags');
    tagsEl.innerHTML = '';
    (tool.tags || []).forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'tool-modal-tag';
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    openModal(toolModal);
  }
  toolClose.addEventListener('click', () => closeModal(toolModal));
  toolModal.addEventListener('click', (e) => {
    if (e.target === toolModal) closeModal(toolModal);
  });

  // Theme toggle (light/dark - but why.zero is light only)
  // We'll just toggle a subtle accent shift
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('cool-mode');
    themeBtn.textContent = document.body.classList.contains('cool-mode') ? '☀️' : '🌓';
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(socialModal);
      closeModal(toolModal);
    }
  });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.tool-card, .portfolio-card, .section-header, .hero-section').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s var(--transition), transform 0.6s var(--transition)';
    observer.observe(el);
  });

  // Hero is immediately visible
  const hero = document.querySelector('.hero-section');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

window.initUI = initUI;