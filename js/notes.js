/* ==========================================================================
   Function Psi — Notes App
   Sticky notes with localStorage persistence
   ========================================================================== */

function renderNotes(container) {
  const id = 'notes-' + Date.now();
  const STORAGE_KEY = 'psi-notes';

  let notes = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) notes = JSON.parse(raw);
  } catch (e) { /* use empty */ }

  const colors = ['#8b5cf6', '#06b6d4', '#d946ef', '#22c55e', '#f59e0b', '#ef4444'];

  container.innerHTML = `
    <div class="notes-header">
      <div class="notes-title">Notes</div>
      <button class="notes-btn primary" id="notes-add-${id}">+ New Note</button>
    </div>
    <div class="notes-grid" id="notes-grid-${id}"></div>
  `;

  const grid = document.getElementById(`notes-grid-${id}`);
  const addBtn = document.getElementById(`notes-add-${id}`);

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch (e) {}
  }

  function render() {
    grid.innerHTML = '';
    if (notes.length === 0) {
      grid.innerHTML = '<div class="notes-empty">No notes yet. Create one!</div>';
      return;
    }
    notes.forEach((note, idx) => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.style.background = note.color || colors[idx % colors.length];
      card.innerHTML = `
        <div class="note-content" contenteditable="true" data-idx="${idx}">${escapeHtml(note.text)}</div>
        <div class="note-meta">
          <span class="note-date">${note.date}</span>
          <button class="note-delete" data-idx="${idx}" title="Delete">×</button>
        </div>
      `;
      const content = card.querySelector('.note-content');
      content.addEventListener('input', () => {
        notes[idx].text = content.textContent;
        save();
      });
      card.querySelector('.note-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        notes.splice(idx, 1);
        save();
        render();
      });
      grid.appendChild(card);
    });
  }

  addBtn.addEventListener('click', () => {
    const text = prompt('Note content:', '');
    if (text === null) return;
    notes.unshift({
      text: text || 'New note',
      color: colors[Math.floor(Math.random() * colors.length)],
      date: new Date().toLocaleDateString()
    });
    save();
    render();
  });

  render();
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
