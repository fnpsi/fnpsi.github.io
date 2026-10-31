/* ==========================================================================
   Function Psi — Window Manager & OS Core
   ========================================================================== */

class WindowManager {
  constructor() {
    this.windows = new Map();       // id -> {el, appId, taskbarBtn}
    this.nextZ = 150;
    this.nextId = 1;
    this.minimized = new Set();

    // DOM refs
    this.desktop = document.getElementById('desktop');
    this.windowsContainer = document.getElementById('windows');
    this.desktopIcons = document.getElementById('desktop-icons');
    this.startMenu = document.getElementById('start-menu');
    this.startBackdrop = document.getElementById('start-backdrop');
    this.startClose = document.getElementById('start-close');
    this.taskbarStart = document.getElementById('taskbar-start');
    this.taskbarApps = document.getElementById('taskbar-apps');
    this.startSearch = document.getElementById('start-search');
    this.sysTheme = document.getElementById('sys-theme');
    this.startTheme = document.getElementById('start-theme');
    this.sysSocial = document.getElementById('sys-social');
    this.startSocial = document.getElementById('start-social');
    this.overlay = document.getElementById('overlay');
    this.overlayClose = document.getElementById('overlay-close');
    this.toast = document.getElementById('toast');
    this.body = document.body;
    this.logoClicks = 0;

    // App registry: id -> {title, icon, render(el)}
    this.apps = {
      'tool-vault': { title: 'Tool Vault', icon: '🛠️', render: renderToolVault },
      'psi-generator': { title: 'Ψ Generator', icon: '✨', render: renderGenerator },
      'code-editor': { title: 'Code Editor', icon: '💻', render: renderCodeEditor },
      'portfolio': { title: 'Portfolio Archive', icon: '📁', render: renderPortfolio },
      'course-catalog': { title: 'Course Catalog', icon: '🎓', render: renderCourseCatalog },
      'settings': { title: 'Settings', icon: '⚙️', render: renderSettings }
    };

    // Drag state
    this.drag = { active: false, win: null, startX: 0, startY: 0, elX: 0, elY: 0 };
    this.resize = { active: false, win: null, startX: 0, startY: 0, elW: 0, elH: 0 };
  }

  boot() {
    this.initClock();
    this.initTheme();
    this.renderStartApps();
    this.renderDesktopIcons();
    this.bindStartMenu();
    this.bindTaskbar();
    this.bindSocialOverlay();
    this.bindCoolEasterEgg();
    this.bindGlobal();
    this.openApp('tool-vault', true); // boot with one app open
  }

  /* ---------- Theme ---------- */
  initTheme() {
    const saved = localStorage.getItem('psi-theme');
    const isDark = saved !== 'light';
    if (!isDark) document.documentElement.classList.add('light');
  }
  toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('psi-theme', isLight ? 'light' : 'dark');
    if (typeof window.updateShaderColors === 'function') {
      window.updateShaderColors(isLight);
    }
  }

  /* ---------- Clock ---------- */
  initClock() {
    const tick = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      document.getElementById('sys-clock').textContent = time;
      document.getElementById('sys-date').textContent = date;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Start menu ---------- */
  bindStartMenu() {
    this.taskbarStart.addEventListener('click', () => this.toggleStart());
    this.startClose.addEventListener('click', () => this.closeStart());
    this.startBackdrop.addEventListener('click', () => this.closeStart());
    this.startSearch.addEventListener('input', (e) => this.filterStartApps(e.target.value));
    this.startTheme.addEventListener('click', () => { this.toggleTheme(); this.closeStart(); });
    this.startSocial.addEventListener('click', () => { this.openSocial(); this.closeStart(); });
  }

  toggleStart() {
    const open = !this.startMenu.classList.contains('open');
    if (open) {
      this.startMenu.classList.add('open');
      this.startBackdrop.classList.add('open');
      this.startSearch.focus();
    } else {
      this.closeStart();
    }
  }
  closeStart() {
    this.startMenu.classList.remove('open');
    this.startBackdrop.classList.remove('open');
    this.startSearch.value = '';
    this.filterStartApps('');
  }

  renderStartApps() {
    const container = document.getElementById('start-apps');
    container.innerHTML = '';
    Object.entries(this.apps).forEach(([id, app]) => {
      const el = document.createElement('button');
      el.className = 'start-app';
      el.innerHTML = `<span class="s-icon">${app.icon}</span><span>${app.title}</span>`;
      el.title = app.title;
      el.addEventListener('click', () => { this.openApp(id); this.closeStart(); });
      container.appendChild(el);
    });
  }

  filterStartApps(q) {
    q = q.toLowerCase().trim();
    document.querySelectorAll('.start-app').forEach((el) => {
      const match = el.textContent.toLowerCase().includes(q);
      el.style.display = match ? 'flex' : 'none';
    });
  }

  /* ---------- Taskbar ---------- */
  bindTaskbar() {
    this.sysTheme.addEventListener('click', () => this.toggleTheme());
    this.sysSocial.addEventListener('click', () => this.openSocial());
  }

  addTaskbarBtn(winId, appId) {
    const app = this.apps[appId];
    const btn = document.createElement('button');
    btn.className = 'taskbar-app active';
    btn.dataset.win = winId;
    btn.innerHTML = `<span class="t-icon">${app.icon}</span><span>${app.title}</span>`;
    btn.addEventListener('click', () => {
      const win = this.windows.get(winId);
      if (!win) return;
      if (this.minimized.has(winId)) {
        this.minimized.delete(winId);
        win.el.style.display = 'flex';
        this.focus(winId);
      } else {
        if (win.el === document.querySelector('.window:not(.minimized):last-child')) {
          this.minimize(winId);
        } else {
          this.focus(winId);
        }
      }
    });
    this.taskbarApps.appendChild(btn);
    return btn;
  }
  updateTaskbar() {
    document.querySelectorAll('.taskbar-app').forEach((b) => b.classList.remove('active'));
    const active = [...this.windows.values()].filter(w => !this.minimized.has(w.id));
    if (active.length) {
      const last = active[active.length - 1];
      const btn = document.querySelector(`.taskbar-app[data-win="${last.id}"]`);
      if (btn) btn.classList.add('active');
    }
  }

  /* ---------- Toast ---------- */
  showToast(message, cool = false) {
    this.toast.textContent = message;
    this.toast.className = 'toast show' + (cool ? ' cool' : '');
    setTimeout(() => {
      this.toast.className = 'toast';
    }, 2500);
  }

  /* ---------- Cool Mode easter egg ---------- */
  toggleCoolMode() {
    const on = this.body.dataset.coolMode === 'on';
    this.body.dataset.coolMode = on ? 'off' : 'on';
    this.showToast(on ? 'Cool mode deactivated' : 'COOL MODE ACTIVATED', !on);
  }

  /* ---------- Social ---------- */
  openSocial() {
    this.overlay.classList.add('open');
    this.closeStart();
  }

  bindSocialOverlay() {
    const closeSocial = () => { this.overlay.classList.remove('open'); };
    this.overlayClose.addEventListener('click', closeSocial);
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) closeSocial();
    });
  }

  /* ---------- Windows ---------- */
  openApp(appId, forceNew = false) {
    const app = this.apps[appId];
    if (!app) return;

    // Reuse existing non-minimized window unless forced
    let existing = null;
    for (const [id, w] of this.windows) {
      if (w.appId === appId && !this.minimized.has(id)) { existing = w; break; }
    }

    if (existing && !forceNew) {
      this.focus(existing.id);
      return;
    }

    const winId = `win-${this.nextId++}`;
    const el = document.createElement('article');
    el.className = 'window';
    el.dataset.id = winId;
    el.dataset.app = appId;

    // Default placement (cascade)
    const offset = (this.windows.size * 24) % 300;
    el.style.left = `${40 + offset}px`;
    el.style.top = `${40 + offset}px`;

    // Window chrome
    el.innerHTML = `
      <div class="window-bar" data-drag>
        <div class="window-icon">${app.icon}</div>
        <div class="window-title">${app.title}</div>
        <div class="window-controls">
          <button class="win-btn win-min" title="Minimize">─</button>
          <button class="win-btn win-max" title="Maximize/Restore">□</button>
          <button class="win-btn win-close" title="Close">✕</button>
        </div>
      </div>
      <div class="window-body" id="body-${winId}"></div>
      <div class="window-footer"><span id="status-${winId}">Ready</span></div>
      <div class="win-resize" data-resize se></div>
    `;

    // Render app content
    app.render(document.getElementById(`body-${winId}`), appId);

    this.windowsContainer.appendChild(el);
    this.focus(winId);

    const win = { id: winId, el, appId };
    this.windows.set(winId, win);
    this.addTaskbarBtn(winId, appId);
    this.setupWindowEvents(win);
    this.animateIn(el);

    // Status
    const status = document.getElementById(`status-${winId}`);
    if (status) status.textContent = `${app.title} • ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  }

  animateIn(el) {
    requestAnimationFrame(() => {
      el.classList.add('window-entering');
      requestAnimationFrame(() => el.classList.remove('window-entering'));
    });
  }

  focus(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    this.nextZ++;
    win.el.style.zIndex = this.nextZ;
    this.windowsContainer.appendChild(win.el); // paint on top
    this.updateTaskbar();
  }

  close(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    this.minimized.delete(winId);
    win.el.remove();
    const btn = document.querySelector(`.taskbar-app[data-win="${winId}"]`);
    if (btn) btn.remove();
    this.windows.delete(winId);
    this.updateTaskbar();
  }

  minimize(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    this.minimized.add(winId);
    win.el.style.display = 'none';
    this.updateTaskbar();
  }

  setupWindowEvents(win) {
    const { el, id } = win;
    const bar = el.querySelector('[data-drag]');
    const minBtn = el.querySelector('.win-min');
    const maxBtn = el.querySelector('.win-max');
    const closeBtn = el.querySelector('.win-close');
    const resizeHandle = el.querySelector('[data-resize]');

    // Click anywhere to focus
    el.addEventListener('mousedown', () => this.focus(id));
    el.addEventListener('click', (e) => {
      if (e.target.closest('.win-btn') || e.target.closest('[data-resize]')) return;
      this.focus(id);
    });

    // Minimize
    minBtn.addEventListener('click', (e) => { e.stopPropagation(); this.minimize(id); });
    // Close
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(id); });
    // Maximize toggle
    let maxed = false;
    let prevRect = {};
    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!maxed) {
        prevRect = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
        el.style.left = '20px';
        el.style.top = '10px';
        el.style.width = `calc(100vw - 40px)`;
        el.style.height = `calc(100vh - 70px)`;
        el.style.borderRadius = '0';
        maxed = true;
      } else {
        el.style.left = prevRect.left;
        el.style.top = prevRect.top;
        el.style.width = prevRect.width;
        el.style.height = prevRect.height;
        el.style.borderRadius = '';
        maxed = false;
      }
      this.focus(id);
    });

    // Drag
    bar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-btn') || e.target.closest('[data-resize]')) return;
      this.focus(id);
      this.drag.active = true;
      this.drag.win = el;
      this.drag.startX = e.clientX;
      this.drag.startY = e.clientY;
      const cs = getComputedStyle(el);
      this.drag.elX = parseFloat(cs.left);
      this.drag.elY = parseFloat(cs.top);
      el.classList.add('dragging');
    });

    // Resize (SE corner)
    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.focus(id);
      this.resize.active = true;
      this.resize.win = el;
      this.resize.startX = e.clientX;
      this.resize.startY = e.clientY;
      this.resize.elW = el.offsetWidth;
      this.resize.elH = el.offsetHeight;
      el.classList.add('dragging');
    });
  }

  /* ---------- Cool mode easter egg ---------- */
  bindCoolEasterEgg() {
    const triggers = [this.taskbarStart, this.startClose];
    // Start avatar is inside start menu; bind when menu opens
    const handleLogoClick = () => {
      this.logoClicks++;
      if (this.logoClicks >= 5) {
        this.logoClicks = 0;
        this.toggleCoolMode();
      }
    };
    triggers.forEach((el) => {
      if (el) el.addEventListener('click', (e) => {
        // Only count if not the close button closing the menu
        handleLogoClick();
      });
    });
    this.startMenu.addEventListener('click', (e) => {
      if (e.target.closest('#start-avatar')) handleLogoClick();
    });
  }

  /* ---------- Global bindings ---------- */
  bindGlobal() {
    window.addEventListener('mousemove', (e) => {
      if (this.drag.active && this.drag.win) {
        const dx = e.clientX - this.drag.startX;
        const dy = e.clientY - this.drag.startY;
        this.drag.win.style.left = `${this.drag.elX + dx}px`;
        this.drag.win.style.top = `${this.drag.elY + dy}px`;
      }
      if (this.resize.active && this.resize.win) {
        const dx = e.clientX - this.resize.startX;
        const dy = e.clientY - this.resize.startY;
        const w = Math.max(320, this.resize.elW + dx);
        const h = Math.max(260, this.resize.elH + dy);
        this.resize.win.style.width = `${w}px`;
        this.resize.win.style.height = `${h}px`;
      }
    });
    window.addEventListener('mouseup', () => {
      this.drag.active = false;
      this.resize.active = false;
      if (this.drag.win) this.drag.win.classList.remove('dragging');
      this.drag.win = null;
      this.resize.win = null;
    });

    // Escape closes start / overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeStart();
        document.getElementById('overlay').classList.remove('open');
      }
    });
  }

  /* ---------- Desktop icons ---------- */
  renderDesktopIcons() {
    const order = ['tool-vault', 'psi-generator', 'portfolio', 'course-catalog', 'settings'];
    this.desktopIcons.innerHTML = '';
    order.forEach((id) => {
      const app = this.apps[id];
      const wrap = document.createElement('div');
      wrap.className = 'desk-icon';
      wrap.title = app.title;
      wrap.innerHTML = `<div class="desk-img">${app.icon}</div><div>${app.title}</div>`;
      wrap.addEventListener('click', () => { this.openApp(id); });
      this.desktopIcons.appendChild(wrap);
    });
  }
}
