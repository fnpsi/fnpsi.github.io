/* ==========================================================================
   Function Psi — Ψ Generator (v0-style mini app builder)
   ========================================================================== */

function renderGenerator(container) {
  container.innerHTML = `
    <div class="section-title">Ψ Generator</div>
    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">
      Describe a tiny tool or widget. It generates HTML/CSS/JS you can preview and copy.
    </div>
    <div class="gen-layout">
      <div class="gen-chat">
        <div class="gen-messages" id="gen-messages">
          <div class="gen-msg">
            <div class="gen-bubble they">
              Hey, I'm Ψ Generator. Try: <br>
              • "a button that changes color"<br>
              • "a todo list"<br>
              • "a gradient text generator"<br>
              • "a dice roller"
            </div>
          </div>
        </div>
        <div class="gen-input-wrap">
          <input type="text" id="gen-input" placeholder="What should I build?" />
          <button class="gen-send" id="gen-send">▶</button>
        </div>
      </div>
      <div class="gen-preview">
        <div class="gen-preview-bar">
          <div class="gen-dot red"></div>
          <div class="gen-dot yel"></div>
          <div class="gen-dot grn"></div>
          <span style="margin-left:auto;font-size:0.7rem;color:#666;">preview.app</span>
        </div>
        <iframe class="gen-frame" id="gen-frame" src="about:blank" title="Generated preview"></iframe>
        <div class="gen-actions">
          <button class="gen-btn" id="gen-copy">Copy Code</button>
          <button class="gen-btn primary" id="gen-add-desktop">Add to Desktop</button>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('gen-input');
  const send = document.getElementById('gen-send');
  const messages = document.getElementById('gen-messages');
  const frame = document.getElementById('gen-frame');
  const copyBtn = document.getElementById('gen-copy');
  const addBtn = document.getElementById('gen-add-desktop');

  let currentCode = '';

  const addMsg = (text, me) => {
    const div = document.createElement('div');
    div.className = `gen-msg ${me ? 'me' : ''}`;
    div.innerHTML = `<div class="gen-bubble ${me ? 'me' : 'they'}">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const generate = (prompt) => {
    addMsg(prompt, true);
    addMsg('Building…', false);

    const code = buildMockApp(prompt);
    currentCode = code;

    setTimeout(() => {
      // Remove "Building…" bubble and show result
      const last = messages.lastElementChild;
      if (last && last.textContent.trim() === 'Building…') last.remove();

      const previewDoc = frame.contentDocument || frame.contentWindow.document;
      previewDoc.open();
      previewDoc.write(code);
      previewDoc.close();

      addMsg("Here's your tool. Copy the code or add it to your desktop.", false);
    }, 700);
  };

  const run = () => {
    const p = input.value.trim();
    if (!p) return;
    input.value = '';
    generate(p);
  };

  send.addEventListener('click', run);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy Code', 1200);
    });
  });

  addBtn.addEventListener('click', () => {
    const name = prompt('Name this mini-app:', 'My Ψ Tool');
    if (!name) return;
    const id = 'mini-' + Date.now();
    // Create a desktop icon that opens the code in a new window
    const wm = window.wmInstance;
    if (!wm) return;

    // Inject a temporary app into the registry
    wm.apps[id] = {
      title: name,
      icon: '🧩',
      render: (c) => {
        c.innerHTML = `
          <div class="section-title">${escapeHtml(name)}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">Generated mini-app. Open the code below.</div>
          <button class="gen-btn primary" id="mini-open-code" style="width:auto;">Open Code in New Tab</button>
          <div style="margin-top:12px;">
            <div class="section-title">Code</div>
            <pre style="background:#05060b;padding:10px;border-radius:8px;font-size:0.72rem;overflow:auto;color:#88c1ff;max-height:220px;">${escapeHtml(currentCode)}</pre>
          </div>
        `;
        c.querySelector('#mini-open-code').addEventListener('click', () => {
          const blob = new Blob([currentCode], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        });
      }
    };
    wm.openApp(id);
    wm.renderDesktopIcons(); // re-render desktop icons (will include mini apps)
  });
}

function buildMockApp(prompt) {
  const p = prompt.toLowerCase();
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
  let css = '';
  let js = '';

  // --- Button color changer ---
  if (p.includes('button') || p.includes('color') || p.includes('click')) {
    css = `
      body{font-family:system-ui;background:#07090f;color:#e8eaf2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px;}
      button{padding:12px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 0 20px rgba(139,92,246,0.4);}
      button:active{transform:scale(0.96);}
      #box{width:120px;height:120px;border-radius:12px;background:#161c2e;border:1px solid #1f2a44;}
    `;
    js = `
      const btn=document.createElement('button');btn.textContent='Change Color';
      const box=document.createElement('div');box.id='box';
      document.body.append(btn,box);
      const colors=['#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#a855f7'];
      btn.onclick=()=>{box.style.background=colors[Math.floor(Math.random()*colors.length)];};
    `;
  }
  // --- Todo list ---
  else if (p.includes('todo') || p.includes('task')) {
    css = `
      body{font-family:system-ui;background:#07090f;color:#e8eaf2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .card{background:#0f1324;border:1px solid #1f2a44;border-radius:14px;padding:20px;width:320px;}
      h2{margin-bottom:12px;font-size:1rem;}
      input{width:100%;padding:10px;border-radius:8px;border:1px solid #1f2a44;background:#07090f;color:#e8eaf2;margin-bottom:10px;}
      ul{list-style:none;padding:0;max-height:260px;overflow-y:auto;}
      li{padding:8px;border-bottom:1px solid #1f2a44;display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;}
      li.done{opacity:0.5;text-decoration:line-through;}
      .del{background:#ef4444;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;}
    `;
    js = `
      const ul=document.createElement('ul');const inp=document.createElement('input');inp.placeholder='Add a task…';
      const btn=document.createElement('button');btn.textContent='Add';
      document.body.append(Object.assign(document.createElement('div'),{className:'card',innerHTML:'<h2>Ψ Tasks</h2>'}),inp,btn,ul);
      const add=()=>{if(!inp.value.trim())return;const li=document.createElement('li');li.textContent=inp.value;const d=document.createElement('button');d.className='del';d.textContent='✕';d.onclick=()=>li.remove();li.appendChild(d);inp.value='';li.ondblclick=()=>li.classList.toggle('done');ul.appendChild(li);};
      btn.onclick=add;inp.onkeydown=(e)=>{if(e.key==='Enter')add();};
    `;
  }
  // --- Dice roller ---
  else if (p.includes('dice') || p.includes('roll')) {
    css = `
      body{font-family:system-ui;background:#07090f;color:#e8eaf2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px;}
      #die{width:100px;height:100px;border-radius:16px;background:#0f1324;border:2px solid #1f2a44;display:grid;place-items:center;font-size:3rem;font-weight:800;color:#8b5cf6;user-select:none;}
      button{padding:10px 20px;border-radius:10px;border:none;background:#161c2e;color:#e8eaf2;cursor:pointer;border:1px solid #1f2a44;}
      button:active{transform:scale(0.96);}
    `;
    js = `
      const die=document.createElement('div');die.id='die';die.textContent='⚀';
      const btn=document.createElement('button');btn.textContent='Roll';
      document.body.append(die,btn);
      const faces=['⚀','⚁','⚂','⚃','⚄','⚅'];
      btn.onclick=()=>{die.style.transform='scale(0.6)';setTimeout(()=>{die.textContent=faces[Math.floor(Math.random()*6)];die.style.transform='scale(1)';},120);};
    `;
  }
  // --- Gradient text ---
  else if (p.includes('gradient') || p.includes('text')) {
    css = `
      body{font-family:system-ui;background:#07090f;color:#e8eaf2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px;}
      h1{font-size:3rem;background:linear-gradient(135deg,#8b5cf6,#06b6d4,#22c55e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 200%;animation:grad 3s ease infinite;}
      @keyframes grad{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
      button{padding:10px 20px;border-radius:10px;border:none;background:#161c2e;color:#e8eaf2;cursor:pointer;border:1px solid #1f2a44;}
    `;
    js = `
      const h1=document.createElement('h1');h1.textContent='Ψ Gradient';
      const btn=document.createElement('button');btn.textContent='Change Text';
      document.body.append(h1,btn);
      const texts=['Ψ Gradient','Function Psi','FxΨ Lab','Generated UI','v0 Who?'];
      let i=0;btn.onclick=()=>{h1.textContent=texts[i=++i%texts.length];};
    `;
  }
  // --- Fallback: simple echo app ---
  else {
    css = `
      body{font-family:system-ui;background:#07090f;color:#e8eaf2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:16px;}
      #out{font-size:1.5rem;font-weight:700;color:#8b5cf6;}
      input{padding:10px 20px;border-radius:10px;border:1px solid #1f2a44;background:#0f1324;color:#e8eaf2;}
    `;
    js = `
      const out=document.createElement('div');out.id='out';out.textContent='Type something';
      const inp=document.createElement('input');inp.placeholder='Say something…';
      document.body.append(out,inp);
      inp.oninput=()=>out.textContent=inp.value||'Type something';
    `;
  }

  html += `${css}</style></head><body>${js}</body></html>`;
  return html;
}
