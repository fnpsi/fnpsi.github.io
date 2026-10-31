/* ==========================================================================
   Function Psi — File Manager
   localStorage-backed virtual filesystem
   ========================================================================== */

function renderFileManager(container) {
  const id = 'fm-' + Date.now();
  const STORAGE_KEY = 'psi-fm-files';

  // Default files
  const defaults = {
    'README.md': '# Function Psi Digital Lab\n\nWelcome to your virtual file system. Create, edit, and organize your projects here.\n\nFiles persist in your browser via localStorage.',
    'notes.txt': 'My notes:\n- Remember to push to GitHub\n- Add custom projects to portfolio\n- Build cool things',
    'config.json': '{\n  "theme": "dark",\n  "owner": "Function Psi",\n  "coolMode": false\n}',
  };

  let files = { ...defaults };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) files = JSON.parse(raw);
    } catch (e) { /* use defaults */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch (e) {}
  }
  load();

  container.innerHTML = `
    <div class="fm-header">
      <div class="fm-title">File Manager</div>
      <div class="fm-actions">
        <button class="fm-btn" id="fm-new-${id}" title="New File">+ File</button>
        <button class="fm-btn primary" id="fm-refresh-${id}" title="Refresh">↻</button>
      </div>
    </div>
    <div class="fm-body" id="fm-body-${id}">
      <div class="fm-list" id="fm-list-${id}"></div>
    </div>
    <div class="fm-editor-wrap hidden" id="fm-editor-wrap-${id}">
      <div class="fm-editor-header">
        <span class="fm-filename" id="fm-filename-${id}">untitled.txt</span>
        <div class="fm-editor-actions">
          <button class="fm-btn" id="fm-back-${id}" title="Back">← Back</button>
          <button class="fm-btn primary" id="fm-save-${id}" title="Save">Save</button>
        </div>
      </div>
      <textarea class="fm-code" id="fm-code-${id}" spellcheck="false"></textarea>
    </div>
  `;

  const listEl = document.getElementById(`fm-list-${id}`);
  const editorWrap = document.getElementById(`fm-editor-wrap-${id}`);
  const editorHeader = document.getElementById(`fm-editor-header-${id}`) || container.querySelector('.fm-editor-header');
  const filenameEl = document.getElementById(`fm-filename-${id}`);
  const codeEl = document.getElementById(`fm-code-${id}`);
  const backBtn = document.getElementById(`fm-back-${id}`);
  const saveBtn = document.getElementById(`fm-save-${id}`);
  const newBtn = document.getElementById(`fm-new-${id}`);
  const refreshBtn = document.getElementById(`fm-refresh-${id}`);

  let editingFile = null;

  function renderList() {
    listEl.innerHTML = '';
    const names = Object.keys(files).sort();
    if (names.length === 0) {
      listEl.innerHTML = '<div class="fm-empty">No files yet. Create one with "+ File".</div>';
      return;
    }
    names.forEach((name) => {
      const item = document.createElement('div');
      item.className = 'fm-item';
      item.innerHTML = `
        <span class="fm-icon">📄</span>
        <span class="fm-name">${escapeHtml(name)}</span>
        <button class="fm-delete" data-name="${escapeHtml(name)}" title="Delete">×</button>
      `;
      item.querySelector('.fm-name').addEventListener('click', () => openFile(name));
      item.querySelector('.fm-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${name}"?`)) {
          delete files[name];
          save();
          renderList();
          if (editingFile === name) closeEditor();
        }
      });
      listEl.appendChild(item);
    });
  }

  function openFile(name) {
    editingFile = name;
    codeEl.value = files[name] || '';
    filenameEl.textContent = name;
    listEl.style.display = 'none';
    editorWrap.classList.remove('hidden');
    codeEl.focus();
  }

  function closeEditor() {
    editingFile = null;
    editorWrap.classList.add('hidden');
    listEl.style.display = 'block';
    renderList();
  }

  function createFile() {
    const name = prompt('File name:', 'untitled.txt');
    if (!name) return;
    if (files[name]) { alert('File already exists'); return; }
    files[name] = '';
    save();
    renderList();
    openFile(name);
  }

  backBtn.addEventListener('click', closeEditor);
  saveBtn.addEventListener('click', () => {
    if (!editingFile) return;
    files[editingFile] = codeEl.value;
    save();
    renderList();
    closeEditor();
  });
  newBtn.addEventListener('click', createFile);
  refreshBtn.addEventListener('click', () => { load(); renderList(); });

  renderList();
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
