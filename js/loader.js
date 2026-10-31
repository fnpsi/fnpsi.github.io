/* ==========================================================================
   Function Psi — Loading & Lazy Loader
   Manages progressive initialization, code splitting
   ========================================================================== */

class LazyLoader {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.counter = document.getElementById('loading-counter');
    this.progress = document.getElementById('loading-progress');
    this.text = document.getElementById('loading-text');
    this.uiContainer = document.getElementById('ui-container');
    this.webglCanvas = document.getElementById('webgl');
    this.preCanvas99 = document.getElementById('pre-canvas-99');

    this.steps = [
      { name: 'preload-css', weight: 5 },
      { name: 'init-webgl', weight: 25 },
      { name: 'load-threejs', weight: 20 },
      { name: 'init-shader', weight: 15 },
      { name: 'init-generative', weight: 15 },
      { name: 'init-api', weight: 5 },
      { name: 'init-ui', weight: 10 },
      { name: 'hydrate', weight: 5 }
    ];
    this.currentStep = 0;
    this.totalWeight = this.steps.reduce((sum, s) => sum + s.weight, 0);
    this.loadedWeight = 0;

    this.start();
  }

  start() {
    this.animateCounter();
    this.runSteps();
  }

  animateCounter() {
    const target = 99;
    let current = 0;
    const duration = 3000;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      current = Math.floor(progress * target);
      this.counter.textContent = current.toString().padStart(2, '0');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.counter.textContent = target.toString().padStart(2, '0');
      }
    };
    tick();
  }

  updateProgress(stepName) {
    const step = this.steps.find(s => s.name === stepName);
    if (step) {
      this.loadedWeight += step.weight;
      const percent = Math.min((this.loadedWeight / this.totalWeight) * 100, 100);
      this.progress.style.width = `${percent}%`;

      const labels = {
        'preload-css': 'Preloading styles...',
        'init-webgl': 'Initializing WebGL...',
        'load-threejs': 'Loading Three.js...',
        'init-shader': 'Compiling shaders...',
        'init-generative': 'Starting generative art...',
        'init-api': 'Loading personal API...',
        'init-ui': 'Building interface...',
        'hydrate': 'Finalizing...'
      };
      this.text.textContent = labels[stepName] || 'Loading...';
    }
  }

  async runSteps() {
    // Step 1: CSS already loaded via link tag
    this.updateProgress('preload-css');
    await this.sleep(100);

    // Step 2: Initialize WebGL context check
    this.updateProgress('init-webgl');
    await this.sleep(200);

    // Step 3: Load Three.js dynamically
    this.updateProgress('load-threejs');
    await this.loadThreeJS();
    await this.sleep(200);

    // Step 4: Initialize shader
    this.updateProgress('init-shader');
    if (window.initShader) {
      window.initShader();
    }
    await this.sleep(500);

    // Step 5: Initialize generative art
    this.updateProgress('init-generative');
    if (window.initGenerativeArt) {
      window.initGenerativeArt();
    }
    await this.sleep(300);

    // Step 6: Initialize API
    this.updateProgress('init-api');
    if (window.initAPI) {
      window.initAPI();
    }
    await this.sleep(200);

    // Step 7: Initialize UI
    this.updateProgress('init-ui');
    if (window.initUI) {
      window.initUI();
    }
    await this.sleep(300);

    // Step 8: Hydrate
    this.updateProgress('hydrate');
    await this.sleep(200);

    // Complete
    this.complete();
  }

  loadThreeJS() {
    return new Promise((resolve) => {
      if (window.THREE) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.min.js';
      script.onload = resolve;
      script.onerror = () => {
        console.warn('Three.js failed to load, continuing without WebGL');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  complete() {
    // Hide pre-canvas 99
    if (this.preCanvas99) {
      this.preCanvas99.style.opacity = '0';
      this.preCanvas99.style.transition = 'opacity 0.5s';
    }

    // Show UI
    requestAnimationFrame(() => {
      this.loadingScreen.classList.add('hidden');
      this.uiContainer.classList.add('visible');

      // Trigger section reveals
      this.revealSections();
    });
  }

  revealSections() {
    const sections = document.querySelectorAll('.hero-section, .tools-section, .generative-section, .api-section, .portfolio-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach((section, i) => {
      section.classList.add('section-hidden');
      section.style.transitionDelay = `${i * 100}ms`;
      observer.observe(section);
    });

    // Hero visible immediately
    const hero = document.querySelector('.hero-section');
    if (hero) {
      hero.classList.add('section-visible');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LazyLoader());
} else {
  new LazyLoader();
}

window.LazyLoader = LazyLoader;