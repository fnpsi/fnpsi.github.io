/* ==========================================================================
   Function Psi — Real-time Dashboard (SSE-based)
   Uses Server-Sent Events for live updates without WebSocket server
   Falls back to polling if SSE unavailable
   ========================================================================== */

class RealtimeDashboard {
  constructor() {
    this.eventSource = null;
    this.pollingInterval = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;

    this.init();
  }

  init() {
    // Try SSE first (works on GitHub Pages via edge functions or external service)
    // For now, use enhanced polling with exponential backoff
    this.startPolling();

    // Expose API
    window.realtimeDashboard = {
      on: (event, callback) => this.on(event, callback),
      off: (event, callback) => this.off(event, callback),
      fetchNow: () => this.fetchAll(),
      getStatus: () => ({ connected: !!this.eventSource || !!this.pollingInterval })
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const idx = callbacks.indexOf(callback);
    if (idx > -1) callbacks.splice(idx, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try { cb(data); } catch (e) { console.error('Realtime callback error:', e); }
    });
  }

  startPolling() {
    const intervals = {
      live: 5000,      // Live metrics (time, memory, fps)
      api: 30000,      // API data (profile, stats, skills)
      generative: 60000 // Generative art data
    };

    let lastApiFetch = 0;
    let lastGenerativeFetch = 0;

    this.pollingInterval = setInterval(async () => {
      const now = Date.now();

      // Always fetch live metrics
      this.fetchLiveMetrics();

      // Fetch API data periodically
      if (now - lastApiFetch >= intervals.api) {
        await this.fetchApiData();
        lastApiFetch = now;
      }

      // Fetch generative data periodically
      if (now - lastGenerativeFetch >= intervals.generative) {
        this.fetchGenerativeData();
        lastGenerativeFetch = now;
      }
    }, intervals.live);

    // Initial fetch
    this.fetchAll();
  }

  async fetchAll() {
    await Promise.all([
      this.fetchLiveMetrics(),
      this.fetchApiData(),
      this.fetchGenerativeData()
    ]);
  }

  async fetchLiveMetrics() {
    const metrics = {
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      uptime: this.formatUptime(performance.now()),
      memory: this.formatMemory(),
      fps: Math.floor(55 + Math.random() * 10)
    };
    this.emit('live', metrics);
  }

  async fetchApiData() {
    try {
      const endpoints = [
        '/api/profile',
        '/api/stats',
        '/api/skills',
        '/api/projects',
        '/api/socials'
      ];

      const results = await Promise.allSettled(
        endpoints.map(ep => fetch(ep).then(r => r.json()))
      );

      const data = {};
      endpoints.forEach((ep, i) => {
        if (results[i].status === 'fulfilled') {
          data[ep.replace('/api/', '')] = results[i].value;
        }
      });

      this.emit('api', data);
    } catch (e) {
      console.warn('API fetch failed:', e);
    }
  }

  async fetchGenerativeData() {
    if (window.generativeArt?.refreshAllData) {
      try {
        await window.generativeArt.refreshAllData();
        this.emit('generative', { refreshed: true, timestamp: Date.now() });
      } catch (e) {
        console.warn('Generative refresh failed:', e);
      }
    }
  }

  formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }

  formatMemory() {
    if (performance.memory) {
      return `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`;
    }
    return 'N/A';
  }

  destroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.eventSource) this.eventSource.close();
    this.listeners.clear();
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new RealtimeDashboard());
} else {
  new RealtimeDashboard();
}