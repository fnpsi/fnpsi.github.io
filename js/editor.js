/* ==========================================================================
   Function Psi — Code Editor App (in-browser dev environment)
   ========================================================================== */

function renderCodeEditor(container) {
  const id = 'editor-' + Date.now();
  container.innerHTML = `
    <div class="editor-header">
      <div class="editor-tabs">
        <button class="editor-tab active" data-lang="html">index.html</button>
        <button class="editor-tab" data-lang="css">style.css</button>
        <button class="editor-tab" data-lang="js">script.js</button>
        <button class="editor-tab" data-lang="preview">Preview</button>
      </div>
      <div class="editor-actions">
        <button class="editor-btn" id="editor-run-${id}" title="Run">▶ Run</button>
        <button class="editor-btn primary" id="editor-newwin-${id}" title="Open in New Tab">🔗 New Tab</button>
      </div>
    </div>
    <div class="editor-pane" id="editor-pane-${id}">
      <textarea class="editor-code html-code" id="html-${id}" placeholder="<h1>Hello, Ψ</h1>" spellcheck="false"></textarea>
      <textarea class="editor-code css-code hidden" id="css-${id}" placeholder="body { color: #8b5cf6; }" spellcheck="false"></textarea>
      <textarea class="editor-code js-code hidden" id="js-${id}" placeholder="console.log('Hello from Function Psi');" spellcheck="false"></textarea>
      <div class="editor-preview hidden" id="preview-${id}">
        <iframe class="editor-frame" id="frame-${id}" src="about:blank" title="Live preview"></iframe>
      </div>
    </div>
    <div class="editor-status" id="editor-status-${id}">Ready</div>
  `;

  const htmlEl = document.getElementById(`html-${id}`);
  const cssEl = document.getElementById(`css-${id}`);
  const jsEl = document.getElementById(`js-${id}`);
  const previewEl = document.getElementById(`preview-${id}`);
  const frameEl = document.getElementById(`frame-${id}`);
  const statusEl = document.getElementById(`editor-status-${id}`);
  const tabs = container.querySelectorAll('.editor-tab');
  const runBtn = document.getElementById(`editor-run-${id}`);
  const newWinBtn = document.getElementById(`editor-newwin-${id}`);

  // Default starter code
  htmlEl.value = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ψ Editor</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1 style="color: #8b5cf6">Hello, Function Psi</h1>
  <p>Edit the code on the left and watch it live here.</p>
  <button id="btn">Click Me</button>
  <script src="script.js"></script>
</body>
</html>`;

  cssEl.value = `body {
  font-family: 'Inter', sans-serif;
  background: #05060b;
  color: #e8eaf2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  gap: 16px;
}

h1 {
  font-size: 2rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

button {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  filter: brightness(1.15);
}`;

  jsEl.value = `document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from Function Psi! 👋');
  document.body.style.background = '#1a0a33';
});`;

  let currentLang = 'html';

  function showLang(lang) {
    currentLang = lang;
    tabs.forEach((t) => {
      t.classList.toggle('active', t.dataset.lang === lang);
    });
    [htmlEl, cssEl, jsEl, previewEl].forEach((el) => el.classList.add('hidden'));
    const target = document.getElementById(`${lang === 'preview' ? 'preview' : lang}-${id}`);
    if (target) target.classList.remove('hidden');
    if (lang === 'preview') renderPreview();
  }

  tabs.forEach((t) => {
    t.addEventListener('click', () => showLang(t.dataset.lang));
  });

  function renderPreview() {
    const doc = frameEl.contentDocument || frameEl.contentWindow.document;
    const html = htmlEl.value;
    const css = `<style>${cssEl.value}</style>`;
    const js = `<script>${jsEl.value}</script>`;
    doc.open();
    doc.write(html + css + js);
    doc.close();
    statusEl.textContent = 'Preview updated';
  }

  function runCode() {
    showLang('preview');
    renderPreview();
  }

  function openNewTab() {
    const html = htmlEl.value;
    const css = `<style>${cssEl.value}</style>`;
    const js = `<script>${jsEl.value}</script>`;
    const full = `<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  runBtn.addEventListener('click', runCode);
  newWinBtn.addEventListener('click', openNewTab);

  // Auto-preview on change (debounced)
  let debounce;
  [htmlEl, cssEl, jsEl].forEach((el) => {
    el.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(renderPreview, 500);
    });
  });

  // Initial render
  renderPreview();
}
