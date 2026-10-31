/* ==========================================================================
   Function Psi — System Monitor
   Live system stats simulation
   ========================================================================== */

function renderSystemMonitor(container) {
  const id = 'sys-' + Date.now();
  container.innerHTML = `
    <div class="sys-header">
      <div class="sys-title">System Monitor</div>
    </div>
    <div class="sys-grid">
      <div class="sys-card">
        <div class="sys-stat-label">CPU</div>
        <div class="sys-stat-value" id="sys-cpu-${id}">0%</div>
        <div class="sys-progress-wrap">
          <div class="sys-progress" id="sys-cpu-bar-${id}"></div>
        </div>
      </div>
      <div class="sys-card">
        <div class="sys-stat-label">Memory</div>
        <div class="sys-stat-value" id="sys-mem-${id}">0 MB</div>
        <div class="sys-progress-wrap">
          <div class="sys-progress" id="sys-mem-bar-${id}"></div>
        </div>
      </div>
      <div class="sys-card">
        <div class="sys-stat-label">Disk</div>
        <div class="sys-stat-value" id="sys-disk-${id}">0 GB</div>
        <div class="sys-progress-wrap">
          <div class="sys-progress" id="sys-disk-bar-${id}"></div>
        </div>
      </div>
      <div class="sys-card">
        <div class="sys-stat-label">Uptime</div>
        <div class="sys-stat-value" id="sys-up-${id}">0s</div>
        <div class="sys-progress-wrap">
          <div class="sys-progress" id="sys-up-bar-${id}"></div>
        </div>
      </div>
    </div>
    <div class="sys-log" id="sys-log-${id}">
      <div class="sys-log-line">[sys] Monitor started</div>
    </div>
  `;

  const startTime = Date.now();
  let uptime = 0;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function update() {
    uptime += 1;

    const cpu = rand(5, 45);
    const memUsed = rand(400, 900);
    const memTotal = 1024;
    const diskUsed = rand(12, 45);
    const diskTotal = 128;

    document.getElementById(`sys-cpu-${id}`).textContent = cpu + '%';
    document.getElementById(`sys-cpu-bar-${id}`).style.width = cpu + '%';

    document.getElementById(`sys-mem-${id}`).textContent = memUsed + ' / ' + memTotal + ' MB';
    document.getElementById(`sys-mem-bar-${id}`).style.width = Math.round((memUsed / memTotal) * 100) + '%';

    document.getElementById(`sys-disk-${id}`).textContent = diskUsed + ' / ' + diskTotal + ' GB';
    document.getElementById(`sys-disk-bar-${id}`).style.width = Math.round((diskUsed / diskTotal) * 100) + '%';

    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    document.getElementById(`sys-up-${id}`).textContent = `${h}h ${m}m ${s}s`;

    // Log
    if (rand(1, 20) === 1) {
      const log = document.getElementById(`sys-log-${id}`);
      const line = document.createElement('div');
      line.className = 'sys-log-line';
      line.textContent = `[${new Date().toLocaleTimeString()}] [sys] Process ${rand(1000, 9999)} tick`;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    }
  }

  update();
  setInterval(update, 1000);
}
