/* ==========================================================================
   Function Psi — Generative Art System
   Algorithmic visualizations driven by data (weather, stocks, prices)
   Canvas API, no external dependencies
   ========================================================================== */

function renderGenerativeArt(container) {
  const id = 'art-' + Date.now();
  container.innerHTML = `
    <div class="art-header">
      <div class="art-title">Generative Art</div>
    </div>
    <div class="art-body">
      <div class="art-canvas-wrap" id="art-canvas-wrap-${id}">
        <canvas class="art-canvas" id="art-canvas-${id}" width="600" height="400"></canvas>
        <div class="art-overlay" id="art-overlay-${id}">
          <div class="art-overlay-title">Generating…</div>
          <div class="art-overlay-desc">Data-driven patterns in motion</div>
        </div>
      </div>
      <div class="art-controls">
        <div class="art-control-group">
          <label class="art-control-label">Data Source</label>
          <select class="art-select" id="art-source-${id}">
            <option value="weather">Weather Patterns</option>
            <option value="stocks">Stock Prices</option>
            <option value="crypto">Crypto Prices</option>
            <option value="audio">Audio Wave</option>
            <option value="random">Pure Random</option>
          </select>
        </div>
        <div class="art-control-group">
          <label class="art-control-label">Algorithm</label>
          <select class="art-select" id="art-algo-${id}">
            <option value="particles">Particle Flow</option>
            <option value="waveform">Waveform</option>
            <option value="voronoi">Voronoi Cells</option>
            <option value="spiral">Data Spiral</option>
          </select>
        </div>
        <div class="art-control-group">
          <label class="art-control-label">Color Palette</label>
          <select class="art-select" id="art-palette-${id}">
            <option value="psi">Ψ Violet/Cyan</option>
            <option value="neon">Neon Midnight</option>
            <option value="sunset">Sunset</option>
            <option value="matrix">Matrix</option>
            <option value="mono">Monochrome</option>
          </select>
        </div>
        <div class="art-control-group">
          <label class="art-control-label">Speed</label>
          <input type="range" class="art-range" id="art-speed-${id}" min="0" max="3" step="0.1" value="1" />
        </div>
        <div class="art-control-group art-btn-group">
          <button class="art-btn" id="art-randomize-${id}">Randomize</button>
          <button class="art-btn primary" id="art-export-${id}">Export Image</button>
        </div>
      </div>
      <div class="art-data-panel" id="art-data-panel-${id}">
        <div class="art-data-title">Live Data</div>
        <div class="art-data-values" id="art-data-values-${id}"></div>
      </div>
    </div>
  `;

  const canvas = document.getElementById(`art-canvas-${id}`);
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById(`art-overlay-${id}`);
  const sourceSel = document.getElementById(`art-source-${id}`);
  const algoSel = document.getElementById(`art-algo-${id}`);
  const paletteSel = document.getElementById(`art-palette-${id}`);
  const speedSel = document.getElementById(`art-speed-${id}`);
  const randomizeBtn = document.getElementById(`art-randomize-${id}`);
  const exportBtn = document.getElementById(`art-export-${id}`);
  const dataValues = document.getElementById(`art-data-values-${id}`);

  // Palettes
  const palettes = {
    psi: ['#8b5cf6', '#06b6d4', '#d946ef', '#22c55e', '#ffffff'],
    neon: ['#ff00ff', '#00ffff', '#ffff00', '#ff0055', '#5500ff'],
    sunset: ['#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#a1c4fd'],
    matrix: ['#00ff41', '#00cc33', '#009922', '#006611', '#003300'],
    mono: ['#ffffff', '#e2e8f0', '#94a3b8', '#64748b', '#334155']
  };

  // Generative data simulation
  let data = {
    weather: { temp: 22, humidity: 65, wind: 12, pressure: 1013 },
    stocks: { aapl: 189.5, tsla: 245.3, nvda: 875.2, msft: 378.9 },
    crypto: { btc: 64231.5, eth: 3452.1, sol: 142.8, doge: 0.12 },
    audio: [0, 0, 0, 0, 0, 0, 0, 0],
    random: []
  };

  let time = 0;
  let animId;
  let particles = [];
  let initialized = false;

  function initParticles(count = 200) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  function getDataValues(source) {
    switch (source) {
      case 'weather':
        return {
          temp: data.weather.temp + Math.sin(time * 0.05) * 3,
          humidity: data.weather.humidity + Math.cos(time * 0.03) * 5,
          wind: data.weather.wind + Math.sin(time * 0.07) * 2,
          pressure: data.weather.pressure
        };
      case 'stocks':
        return {
          aapl: data.stocks.aapl + Math.sin(time * 0.02) * 5,
          tsla: data.stocks.tsla + Math.cos(time * 0.03) * 8,
          nvda: data.stocks.nvda + Math.sin(time * 0.015) * 15,
          msft: data.stocks.msft + Math.cos(time * 0.025) * 3
        };
      case 'crypto':
        return {
          btc: data.crypto.btc + Math.sin(time * 0.01) * 500,
          eth: data.crypto.eth + Math.cos(time * 0.02) * 30,
          sol: data.crypto.sol + Math.sin(time * 0.025) * 5,
          doge: data.crypto.doge + Math.sin(time * 0.05) * 0.02
        };
      case 'audio':
        return data.audio.map(() => Math.random() * 100);
      case 'random':
        return Array.from({ length: 50 }, () => Math.random() * 100);
      default:
        return { temp: 22 };
    }
  }

  function updateDataDisplay(source) {
    const vals = getDataValues(source);
    let html = '';
    if (Array.isArray(vals)) {
      html = vals.map((v, i) => `<div class="art-data-item">Ch ${i + 1}: ${v.toFixed(1)}</div>`).join('');
    } else {
      html = Object.entries(vals).map(([k, v]) => `<div class="art-data-item">${k}: ${typeof v === 'number' ? v.toFixed(2) : v}</div>`).join('');
    }
    dataValues.innerHTML = html;
  }

  function drawParticles(src, algo, palette) {
    const vals = getDataValues(src);
    const numVals = Array.isArray(vals) ? vals : Object.values(vals).filter(v => typeof v === 'number');
    const avg = numVals.length ? numVals.reduce((a, b) => a + b, 0) / numVals.length : 50;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = palettes[palette];
    time += 0.02 * parseFloat(speedSel.value);

    if (algo === 'particles') {
      particles.forEach((p, i) => {
        const noise = Math.sin(time + p.x * 0.01 + p.y * 0.01) * 0.5;
        const dataInfluence = (numVals[i % numVals.length] || 50) / 100;
        p.vx += Math.cos(time + p.angle) * 0.05 * dataInfluence;
        p.vy += Math.sin(time + p.angle) * 0.05 * dataInfluence;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const c = colors[(i + Math.floor(time)) % colors.length];
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + dataInfluence), 0, Math.PI * 2);
        ctx.fill();

        // Connection lines
        if (i % 5 === 0) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(time) * 50, p.y + Math.sin(time) * 50);
          ctx.strokeStyle = c + '40';
          ctx.stroke();
        }
      });
    } else if (algo === 'waveform') {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      const step = canvas.width / 100;
      for (let x = 0; x <= canvas.width; x += step) {
        const y = canvas.height / 2 + Math.sin(x * 0.02 + time) * (avg / 2);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill under wave
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = colors[0] + '20';
      ctx.fill();
    } else if (algo === 'voronoi') {
      // Simple cell-like drawing based on data
      const cellSize = 40 + (avg / 2);
      for (let y = 0; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
          const val = numVals[(Math.floor(x / cellSize) + Math.floor(y / cellSize)) % numVals.length] || 50;
          const c = colors[Math.floor((val / 100) * colors.length)];
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3 * (val / 100), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (algo === 'spiral') {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(time * 0.5);
      for (let i = 0; i < 100; i++) {
        const angle = i * 0.1 + time;
        const r = i * 2 + (numVals[i % numVals.length] || 50) / 5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const c = colors[i % colors.length];
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Data label
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`Source: ${src} | Avg: ${avg.toFixed(1)} | Time: ${time.toFixed(2)}`, 10, 20);
  }

  function animate() {
    if (!initialized) return;
    const src = sourceSel.value;
    const algo = algoSel.value;
    const palette = paletteSel.value;
    drawParticles(src, algo, palette);
    updateDataDisplay(src);
    animId = requestAnimationFrame(animate);
  }

  function start() {
    initialized = true;
    initParticles();
    overlay.style.display = 'none';
    animate();
  }

  function stop() {
    initialized = false;
    if (animId) cancelAnimationFrame(animId);
  }

  sourceSel.addEventListener('change', () => { stop(); start(); });
  algoSel.addEventListener('change', () => { stop(); start(); });
  paletteSel.addEventListener('change', () => { stop(); start(); });

  randomizeBtn.addEventListener('click', () => {
    // Randomize data slightly
    Object.keys(data).forEach((key) => {
      if (key === 'audio') {
        data[key] = data[key].map(() => Math.random() * 100);
      } else if (typeof data[key] === 'object') {
        Object.keys(data[key]).forEach((k) => {
          if (typeof data[key][k] === 'number') {
            data[key][k] += (Math.random() - 0.5) * 20;
          }
        });
      }
    });
  });

  exportBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `psi-generative-art-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });

  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    stop();
    canvas.width = container.clientWidth - 320; // account for controls
    canvas.height = container.clientHeight - 60;
    start();
  });
  resizeObserver.observe(container);

  // Initial start
  start();

  // Cleanup when window closes
  container.addEventListener('remove', () => stop());
}
