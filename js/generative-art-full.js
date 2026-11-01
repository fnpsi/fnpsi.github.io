/* ==========================================================================
   Function Psi — Generative Art System with Real API Data
   Fetches: OpenWeatherMap, Alpha Vantage, CoinGecko, Web Audio API
   ========================================================================== */

function initGenerativeArt() {
  const canvas = document.getElementById('generative-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const sourceSel = document.getElementById('gen-source');
  const algoSel = document.getElementById('gen-algo');
  const paletteSel = document.getElementById('gen-palette');
  const exportBtn = document.getElementById('gen-export');

  // Palettes
  const palettes = {
    psi: ['#8b5cf6', '#06b6d4', '#d946ef', '#22c55e', '#ffffff'],
    teal: ['#d4f6eb', '#b3ded1', '#91c7b7', '#70af9c', '#4e9782', '#356f5e', '#1c4839'],
    neon: ['#ff00ff', '#00ffff', '#ffff00', '#ff0055', '#5500ff'],
    sunset: ['#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#a1c4fd'],
    matrix: ['#00ff41', '#00cc33', '#009922', '#006611', '#003300']
  };

  // Data state
  let data = {
    weather: { temp: 22, humidity: 65, wind: 12, pressure: 1013 },
    stocks: { aapl: 189.5, tsla: 245.3, nvda: 875.2, msft: 378.9 },
    crypto: { btc: 64231.5, eth: 3452.1, sol: 142.8, doge: 0.12 },
    audio: Array(64).fill(0).map(() => Math.random() * 100),
    random: Array(100).fill(0).map(() => Math.random() * 100)
  };

  let dataCallbacks = {
    weather: [],
    stocks: [],
    crypto: [],
    audio: [],
    random: []
  };

  let particles = [];
  let time = 0;
  let animId;
  let initialized = false;
  let audioContext = null;
  let analyser = null;
  let audioData = null;

  // API Configuration - Replace with your keys
  const API_CONFIG = {
    weather: { key: 'bd5e378503939ddaee76f12ad7a97608', url: 'https://api.openweathermap.org/data/2.5/weather' },
    stocks: { key: 'N9ZNL0UQXK0VQ59M', url: 'https://www.alphavantage.co/query' },
    crypto: { key: '', url: 'https://api.coingecko.com/api/v3/simple/price' }
  };

  // Fetch real data
  async function fetchWeather() {
    if (!API_CONFIG.weather.key) return simulateWeather();
    try {
      const res = await fetch(`${API_CONFIG.weather.url}?q=Johannesburg&units=metric&appid=${API_CONFIG.weather.key}`);
      const json = await res.json();
      return {
        temp: json.main.temp,
        humidity: json.main.humidity,
        wind: json.wind.speed,
        pressure: json.main.pressure
      };
    } catch (e) {
      return simulateWeather();
    }
  }

  async function fetchStocks() {
    if (!API_CONFIG.stocks.key) return simulateStocks();
    try {
      const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
      const promises = symbols.map(sym =>
        fetch(`${API_CONFIG.stocks.url}?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${API_CONFIG.stocks.key}`)
          .then(r => r.json())
      );
      const results = await Promise.all(promises);
      return {
        aapl: parseFloat(results[0]?.['Global Quote']?.['05. price']) || 189.5,
        tsla: parseFloat(results[1]?.['Global Quote']?.['05. price']) || 245.3,
        nvda: parseFloat(results[2]?.['Global Quote']?.['05. price']) || 875.2,
        msft: parseFloat(results[3]?.['Global Quote']?.['05. price']) || 378.9
      };
    } catch (e) {
      return simulateStocks();
    }
  }

  async function fetchCrypto() {
    try {
      const res = await fetch(`${API_CONFIG.crypto.url}?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=usd`);
      const json = await res.json();
      return {
        btc: json.bitcoin?.usd || 64231.5,
        eth: json.ethereum?.usd || 3452.1,
        sol: json.solana?.usd || 142.8,
        doge: json.dogecoin?.usd || 0.12
      };
    } catch (e) {
      return simulateCrypto();
    }
  }

  // Simulated data (fallback)
  function simulateWeather() {
    return {
      temp: 22 + Math.sin(time * 0.005) * 3,
      humidity: 65 + Math.cos(time * 0.003) * 5,
      wind: 12 + Math.sin(time * 0.007) * 2,
      pressure: 1013
    };
  }
  function simulateStocks() {
    return {
      aapl: 189.5 + Math.sin(time * 0.002) * 5,
      tsla: 245.3 + Math.cos(time * 0.003) * 8,
      nvda: 875.2 + Math.sin(time * 0.0015) * 15,
      msft: 378.9 + Math.cos(time * 0.0025) * 3
    };
  }
  function simulateCrypto() {
    return {
      btc: 64231.5 + Math.sin(time * 0.001) * 500,
      eth: 3452.1 + Math.cos(time * 0.002) * 30,
      sol: 142.8 + Math.sin(time * 0.0025) * 5,
      doge: 0.12 + Math.sin(time * 0.005) * 0.02
    };
  }

  async function refreshAllData() {
    const [weather, stocks, crypto] = await Promise.all([
      fetchWeather(), fetchStocks(), fetchCrypto()
    ]);
    data.weather = weather;
    data.stocks = stocks;
    data.crypto = crypto;
    notifyCallbacks('weather', weather);
    notifyCallbacks('stocks', stocks);
    notifyCallbacks('crypto', crypto);
  }

  function notifyCallbacks(source, value) {
    dataCallbacks[source].forEach(cb => cb(value));
  }

  function subscribe(source, callback) {
    dataCallbacks[source].push(callback);
    return () => {
      dataCallbacks[source] = dataCallbacks[source].filter(cb => cb !== callback);
    };
  }

  // Audio visualization
  async function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioData = new Uint8Array(analyser.frequencyBinCount);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Update audio data periodically
      setInterval(() => {
        if (analyser && audioData) {
          analyser.getByteFrequencyData(audioData);
          data.audio = Array.from(audioData).map(v => (v / 255) * 100);
          notifyCallbacks('audio', data.audio);
        }
      }, 100);
    } catch (e) {
      console.log('Audio access denied, using simulated audio');
      data.audio = Array(64).fill(0).map(() => Math.random() * 100);
    }
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.dataset.logicalWidth = rect.width;
    canvas.dataset.logicalHeight = rect.height;
    initParticles();
  }

  function initParticles() {
    const w = parseFloat(canvas.dataset.logicalWidth) || canvas.width;
    const h = parseFloat(canvas.dataset.logicalHeight) || canvas.height;
    const count = Math.min(300, Math.floor((w * h) / 2000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2,
        hue: Math.random()
      });
    }
  }

  function getDataValues(source) {
    switch (source) {
      case 'weather':
        return data.weather;
      case 'stocks':
        return data.stocks;
      case 'crypto':
        return data.crypto;
      case 'audio':
        return data.audio;
      case 'random':
        return data.random;
      default:
        return { temp: 22 };
    }
  }

  function draw() {
    const w = parseFloat(canvas.dataset.logicalWidth) || canvas.width;
    const h = parseFloat(canvas.dataset.logicalHeight) || canvas.height;
    const src = sourceSel.value;
    const algo = algoSel.value;
    const paletteName = paletteSel.value;
    const colors = palettes[paletteName];

    ctx.clearRect(0, 0, w, h);

    // Subtle background gradient matching site
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, Math.max(w, h));
    const baseColors = palettes.teal;
    grad.addColorStop(0, baseColors[0]);
    grad.addColorStop(0.2, baseColors[1]);
    grad.addColorStop(0.4, baseColors[2]);
    grad.addColorStop(0.6, baseColors[3]);
    grad.addColorStop(0.8, baseColors[4]);
    grad.addColorStop(1, baseColors[6]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const vals = getDataValues(src);
    const numVals = Array.isArray(vals) ? vals : Object.values(vals).filter(v => typeof v === 'number');
    const avg = numVals.length ? numVals.reduce((a, b) => a + b, 0) / numVals.length : 50;

    time += 0.01;

    if (algo === 'particles') {
      drawParticles(w, h, colors, numVals, avg);
    } else if (algo === 'waveform') {
      drawWaveform(w, h, colors, numVals, avg);
    } else if (algo === 'voronoi') {
      drawVoronoi(w, h, colors, numVals, avg);
    } else if (algo === 'spiral') {
      drawSpiral(w, h, colors, numVals, avg);
    }

    // Data readout
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px "Google Sans Code", monospace';
    ctx.fillText(`Source: ${src.toUpperCase()}  |  Algorithm: ${algo.toUpperCase()}  |  Particles: ${particles.length}`, 16, 24);
  }

  function drawParticles(w, h, colors, numVals, avg) {
    particles.forEach((p, i) => {
      const noise = Math.sin(time + p.x * 0.005 + p.y * 0.005) * 0.5;
      const dataInfluence = (numVals[i % numVals.length] || 50) / 100;

      p.vx += Math.cos(time + p.angle) * 0.02 * dataInfluence;
      p.vy += Math.sin(time + p.angle) * 0.02 * dataInfluence;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const c = colors[(i + Math.floor(time * 0.5)) % colors.length];
      const rgb = hexToRgb(c);

      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 + dataInfluence), 0, Math.PI * 2);
      ctx.fill();

      if (i % 7 === 0) {
        const target = particles[(i + 7) % particles.length];
        if (target) {
          const dist = Math.hypot(p.x - target.x, p.y - target.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    });
  }

  function drawWaveform(w, h, colors, numVals, avg) {
    ctx.save();
    ctx.translate(0, h * 0.5);

    const amplitude = (avg / 100) * h * 0.3;
    const frequency = 0.008;
    const color = colors[0];
    const rgb = hexToRgb(color);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= w; x += 2) {
      let y = 0;
      for (let o = 0; o < 3; o++) {
        const val = numVals[(Math.floor(x * frequency * 100) + o * 10) % numVals.length] || 50;
        y += Math.sin(x * frequency * (o + 1) + time * (o + 1)) * (val / 100) * amplitude / 3;
      }
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -amplitude, 0, amplitude);
    grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
    grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawVoronoi(w, h, colors, numVals, avg) {
    const cellSize = 30 + (avg / 100) * 40;
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const idx = Math.floor(x / cellSize) + Math.floor(y / cellSize) * Math.ceil(w / cellSize);
        const val = numVals[idx % numVals.length] || 50;
        const c = colors[Math.floor((val / 100) * (colors.length - 1))];
        const rgb = hexToRgb(c);

        const cx = x + cellSize / 2 + (Math.sin(time + x * 0.01) - 0.5) * 10;
        const cy = y + cellSize / 2 + (Math.cos(time + y * 0.01) - 0.5) * 10;
        const r = (cellSize / 3) * (0.5 + val / 200);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawSpiral(w, h, colors, numVals, avg) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(time * 0.2);

    for (let i = 0; i < 200; i++) {
      const angle = i * 0.15 + time;
      const r = i * 1.5 + (numVals[i % numVals.length] || 50) / 3;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const c = colors[i % colors.length];
      const rgb = hexToRgb(c);
      const size = 2 + Math.sin(time + i * 0.1) * 2;

      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function animate() {
    if (!initialized) return;
    draw();
    animId = requestAnimationFrame(animate);
  }

  function start() {
    initialized = true;
    resize();
    animate();
  }

  function stop() {
    initialized = false;
    if (animId) cancelAnimationFrame(animId);
  }

  // Controls
  [sourceSel, algoSel, paletteSel].forEach((sel) => {
    sel.addEventListener('change', () => { stop(); start(); });
  });

  exportBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `psi-generative-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Resize observer
  const ro = new ResizeObserver(() => {
    if (initialized) { stop(); start(); }
  });
  ro.observe(canvas.parentElement);

  // Initialize
  async function init() {
    // Initial data fetch
    await refreshAllData();

    // Set up auto-refresh
    setInterval(refreshAllData, 60000); // Every minute

    // Init audio on user interaction
    document.addEventListener('click', () => {
      if (!audioContext) initAudio();
    }, { once: true });

    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external control
  window.generativeArt = { refreshAllData, subscribe, getData: () => data };
}

window.initGenerativeArt = initGenerativeArt;
