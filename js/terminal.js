/* ==========================================================================
   Function Psi — Terminal App
   Bash-like command line inside the desktop OS
   ========================================================================== */

function renderTerminal(container) {
  const id = 'term-' + Date.now();
  container.innerHTML = `
    <div class="term-header">
      <div class="term-title">bash</div>
      <div class="term-actions">
        <button class="term-btn" id="term-clear-${id}" title="Clear">Clear</button>
        <button class="term-btn primary" id="term-newwin-${id}" title="New Tab">New Tab</button>
      </div>
    </div>
    <div class="term-body" id="term-body-${id}">
      <div class="term-line">
        <span class="term-prompt">fnpsi@psi-lab:~$</span>
        <span class="term-cursor" id="term-cursor-${id}">_</span>
      </div>
    </div>
    <div class="term-input-wrap">
      <span class="term-prompt-small">fnpsi@psi-lab:~$</span>
      <input type="text" id="term-input-${id}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
    </div>
  `;

  const body = document.getElementById(`term-body-${id}`);
  const input = document.getElementById(`term-input-${id}`);
  const clearBtn = document.getElementById(`term-clear-${id}`);
  const newWinBtn = document.getElementById(`term-newwin-${id}`);

  // Command history
  let history = [];
  let histIndex = -1;

  // Mock filesystem
  const fs = {
    'README.md': '# Function Psi Digital Lab\n\nA desktop-style operating system in the browser.\n\nApps: tool-vault, psi-generator, code-editor, terminal, file-manager, notes, calculator, settings, portfolio, course-catalog',
    'package.json': '{\n  "name": "psi-digital-lab",\n  "version": "1.0.0",\n  "description": "One of the coolest websites out there",\n  "owner": "Function Psi"\n}',
    'todo.txt': '- [x] Build desktop OS\n- [x] Add WebGL shader\n- [x] Add code editor\n- [ ] Add your custom projects\n- [ ] Deploy to fnpsi.github.io',
    'social.txt': 'X: @fnpsi_\nIG: fnpsi\nYT: @fnpsi',
  };

  const cwd = ['~'];
  let username = 'fnpsi';
  let hostname = 'psi-lab';

  // Commands
  const cmdHelp = `Available commands:
  help       Show this help
  clear      Clear the terminal
  ls         List files
  cat <file> Read a file
  pwd        Print working directory
  whoami     Show current user
  neofetch   System info
  echo <text>Print text
  date       Show current date
  uptime     System uptime
  apps       List installed apps
  open <app> Open an app
  api <endpoint> Query Personal API (profile, stats, skills, projects, socials)
  sudo       ...you wish
  cool       Activate cool mode`;

  function prompt() {
    return `${username}@${hostname}:${cwd.join('/')}$ `;
  }

  function print(text, className = '') {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-output ${className}">${escapeHtml(text)}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function printError(text) {
    print(text, 'term-error');
  }

  function printSuccess(text) {
    print(text, 'term-success');
  }

  function printInfo(text) {
    print(text, 'term-info');
  }

  function newPrompt() {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-prompt">${prompt()}</span>
      <span class="term-input-wrapper">
        <input type="text" class="term-live-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus />
        <span class="term-cursor">_</span>
      </span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    const liveInput = line.querySelector('.term-live-input');
    liveInput.focus();
    liveInput.addEventListener('keydown', handleKeydown);
    return liveInput;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      e.target.blur();
      const line = e.target.closest('.term-line');
      const wrapper = line.querySelector('.term-input-wrapper');
      wrapper.innerHTML = `<span class="term-input-static">${escapeHtml(val)}</span>`;
      processCommand(val);
      newPrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        histIndex = Math.max(0, histIndex - 1);
        e.target.value = history[histIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex < history.length - 1) {
        histIndex++;
        e.target.value = history[histIndex];
      } else {
        histIndex = history.length;
        e.target.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      e.target.value += '    ';
    } else if (e.key === 'Escape') {
      document.getElementById(`term-body-${id}`).querySelectorAll('.term-live-input').forEach((el) => el.blur());
    }
  }

  function processCommand(cmd) {
    if (!cmd) return;
    if (history.length === 0 || history[history.length - 1] !== cmd) {
      history.push(cmd);
    }
    histIndex = history.length;

    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        print(cmdHelp);
        break;
      case 'clear':
        body.innerHTML = '';
        newPrompt();
        return;
      case 'ls':
        print(Object.keys(fs).join('  '));
        break;
      case 'pwd':
        print(cwd.join('/'));
        break;
      case 'whoami':
        print(username);
        break;
      case 'date':
        print(new Date().toLocaleString());
        break;
      case 'uptime':
        print('up 0 days, 0:00, 0 users, load average: 0.00, 0.00, 0.00');
        break;
      case 'echo':
        print(args.join(' '));
        break;
      case 'cat': {
        const file = args[0];
        if (!file) { printError('cat: missing file operand'); break; }
        const content = fs[file];
        if (content === undefined) { printError(`cat: ${file}: No such file`); break; }
        print(content);
        break;
      }
      case 'neofetch': {
        print('');
        print('       .--------.          ', 'term-neofetch');
        print('      /   _____   \\         ', 'term-neofetch');
        print('     |  /     \\   |         ', 'term-neofetch');
        print('     |  |  Ψ  |   |   OS: Ψ Digital Lab 1.0', 'term-neofetch');
        print('     |  \\_____/   |   Host: Function Psi', 'term-neofetch');
        print('      \\_________/    Kernel: WebGL + JS', 'term-neofetch');
        print('       /       \\     Shell: bash v5.2', 'term-neofetch');
        print('      /   ____   \\    Packages: 42', 'term-neofetch');
        print('     |  /    \\   |   Uptime: ∞', 'term-neofetch');
        print('     |  |    |   |   Terminal: Ψ Terminal', 'term-neofetch');
        print('      \\ \\____/ /', 'term-neofetch');
        print('       `------`', 'term-neofetch');
        print('');
        break;
      }
      case 'apps':
        print('Installed apps:');
        print('  tool-vault    Tool Vault');
        print('  psi-generator Ψ Generator');
        print('  code-editor   Code Editor');
        print('  terminal      Terminal');
        print('  file-manager  File Manager');
        print('  notes         Notes');
        print('  calculator    Calculator');
        print('  settings      Settings');
        print('  portfolio     Portfolio Archive');
        print('  course-catalog Course Catalog');
        break;
      case 'open': {
        const app = args[0];
        if (!app) { printError('open: missing app name'); break; }
        const wm = window.wmInstance;
        if (!wm) { printError('Window manager not available'); break; }
        const appMap = {
          'tool-vault': 'tool-vault',
          'vault': 'tool-vault',
          'generator': 'psi-generator',
          'psi-generator': 'psi-generator',
          'editor': 'code-editor',
          'code-editor': 'code-editor',
          'terminal': 'terminal',
          'file-manager': 'file-manager',
          'notes': 'notes',
          'calculator': 'calculator',
          'settings': 'settings',
          'portfolio': 'portfolio',
          'course-catalog': 'course-catalog',
          'courses': 'course-catalog',
        };
        const mapped = appMap[app];
        if (mapped) {
          wm.openApp(mapped);
          printSuccess(`Opened ${app}`);
        } else {
          printError(`open: ${app}: no such app`);
        }
        break;
      }
      case 'sudo':
        printError("[sudo] password for fnpsi: incorrect");
        printError("sudo: 1 incorrect password attempt");
        break;
      case 'cool':
        document.body.dataset.coolMode = document.body.dataset.coolMode === 'on' ? 'off' : 'on';
        printSuccess(document.body.dataset.coolMode === 'on' ? 'COOL MODE ACTIVATED' : 'Cool mode deactivated');
        break;
      case 'api': {
        const endpoint = args[0];
        if (!endpoint) {
          printError('api: missing endpoint');
          print('Available endpoints:');
          print('  profile   Personal profile');
          print('  stats     System statistics');
          print('  skills    Skills and levels');
          print('  projects  Project list');
          print('  socials   Social media links');
          print('  all       All endpoints');
          break;
        }
        const endpoints = endpoint === 'all'
          ? ['profile', 'stats', 'skills', 'projects', 'socials']
          : [endpoint];
        Promise.all(endpoints.map(ep =>
          fetch(`/api/${ep}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )).then(results => {
          results.forEach((data, i) => {
            if (data) {
              printInfo(`=== /api/${endpoints[i]} ===`);
              print(JSON.stringify(data, null, 2));
            } else {
              printError(`Failed to fetch /api/${endpoints[i]}`);
            }
          });
          newPrompt();
        });
        return; // Don't call newPrompt() here, we do it in the promise
      }
      default:
        if (command) {
          printError(`bash: ${command}: command not found`);
        }
    }
    newPrompt();
  }

  clearBtn.addEventListener('click', () => {
    body.innerHTML = '';
    print('Terminal cleared.');
    newPrompt();
  });

  newWinBtn.addEventListener('click', () => {
    const wm = window.wmInstance;
    if (wm) wm.openApp('terminal');
  });

  // Start
  print('Ψ Terminal v1.0 — Type "help" for commands');
  newPrompt();

  // Also handle the hidden input at bottom (for Enter key on initial load)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      e.target.value = '';
      print(`<span class="term-prompt">${prompt()}</span> ${escapeHtml(val)}`, '');
      processCommand(val);
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
