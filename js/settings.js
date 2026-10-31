/* ==========================================================================
   Function Psi — Settings App
   Theme, cool mode, accent color
   ========================================================================== */

function renderSettings(container) {
  const id = 'settings-' + Date.now();
  const isLight = document.documentElement.classList.contains('light');
  const coolMode = document.body.dataset.coolMode === 'on';

  container.innerHTML = `
    <div class="settings-header">
      <div class="settings-title">Settings</div>
    </div>
    <div class="settings-body">
      <div class="settings-section">
        <div class="settings-section-title">Appearance</div>
        <div class="settings-row">
          <div class="settings-row-label">Theme</div>
          <div class="settings-row-control">
            <button class="settings-toggle ${isLight ? 'active' : ''}" id="settings-theme-${id}">
              ${isLight ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Cool Mode</div>
          <div class="settings-row-control">
            <button class="settings-toggle ${coolMode ? 'active' : ''}" id="settings-cool-${id}">
              ${coolMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <span class="settings-hint">Click FxΨ logo 5× to toggle</span>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Accent Color</div>
          <div class="settings-row-control accent-picker">
            <button class="accent-swatch accent-active" style="background:#8b5cf6" data-color="#8b5cf6"></button>
            <button class="accent-swatch" style="background:#06b6d4" data-color="#06b6d4"></button>
            <button class="accent-swatch" style="background:#d946ef" data-color="#d946ef"></button>
            <button class="accent-swatch" style="background:#22c55e" data-color="#22c55e"></button>
            <button class="accent-swatch" style="background:#f59e0b" data-color="#f59e0b"></button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">System</div>
        <div class="settings-row">
          <div class="settings-row-label">Owner</div>
          <div class="settings-row-control">Function Psi (FxΨ)</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Version</div>
          <div class="settings-row-control">1.0.0</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Socials</div>
          <div class="settings-row-control social-row">
            <a href="https://x.com/fnpsi_" target="_blank" rel="noopener" class="settings-social">𝕏 @fnpsi_</a>
            <a href="https://instagram.com/fnpsi" target="_blank" rel="noopener" class="settings-social">IG fnpsi</a>
            <a href="https://youtube.com/@fnpsi" target="_blank" rel="noopener" class="settings-social">YT @fnpsi</a>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Danger Zone</div>
        <div class="settings-row">
          <div class="settings-row-label">Reset All</div>
          <div class="settings-row-control">
            <button class="settings-btn-danger" id="settings-reset-${id}">Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const themeBtn = document.getElementById(`settings-theme-${id}`);
  const coolBtn = document.getElementById(`settings-cool-${id}`);
  const resetBtn = document.getElementById(`settings-reset-${id}`);

  themeBtn.addEventListener('click', () => {
    const wm = window.wmInstance;
    if (wm) wm.toggleTheme();
    themeBtn.textContent = document.documentElement.classList.contains('light') ? 'Light' : 'Dark';
    themeBtn.classList.toggle('active', document.documentElement.classList.contains('light'));
  });

  coolBtn.addEventListener('click', () => {
    const wm = window.wmInstance;
    if (wm) wm.toggleCoolMode();
    coolBtn.textContent = document.body.dataset.coolMode === 'on' ? 'ON' : 'OFF';
    coolBtn.classList.toggle('active', document.body.dataset.coolMode === 'on');
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all settings and clear localStorage data?')) return;
    localStorage.clear();
    location.reload();
  });

  // Accent color picker
  container.querySelectorAll('.accent-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const color = swatch.dataset.color;
      document.documentElement.style.setProperty('--brand', color);
      // Update other brand variants
      document.documentElement.style.setProperty('--brand-glow', `rgba(${hexToRgb(color)}, 0.45)`);
      container.querySelectorAll('.accent-swatch').forEach((s) => s.classList.toggle('accent-active', s === swatch));
    });
  });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
