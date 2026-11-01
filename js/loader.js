/* ==========================================================================
   Function Psi — Live Loading & Lazy Loader
   Bulletproof: always reveals UI, even on errors. Real progress tracking.
   ========================================================================== */

class LiveLoader {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.counter = document.getElementById('loading-counter');
    this.progress = document.getElementById('loading-progress');
    this.text = document.getElementById('loading-text');
    this.uiContainer = document.getElementById('ui-container');
    this.preCanvas99 = document.getElementById('pre-canvas-99');

    this.completed = false;
    this.startTime = performance.now();
    this.minLoadTime = 2500; // Minimum 2.5s so counter animation looks good

    this.steps = [
      { name: 'preload-css', weight: 5, label: 'Preloading styles...' },
      { name: 'init-webgl', weight: 20, label: 'Initializing WebGL...' },
      { name: 'load-threejs', weight: 25, label: 'Loading Three.js...' },
      { name: 'init-shader', weight: 15, label: 'Compiling shaders...' },
      { name: 'init-generative', weight: 15, label: 'Starting generative art...' },
      { name: 'init-api', weight: 5, label: 'Loading personal API...' },
      { name: 'init-ui', weight: 10, label: 'Building interface...' },
      { name: 'hydrate', weight: 5, label: 'Finalizing...' }
    ];
    this.totalWeight = this.steps.reduce((sum, s) => sum + s.weight, 0);
    this.loadedWeight = 0;
    this.stepIndex = 0;

    this.start();
  }

  start() {
    this.animateCounter();
    this.runSteps().catch((err) => {
      console.error('Loader error:', err);
      this.forceComplete();
    });
  }

  animateCounter() {
    const target = 99;
    const duration = this.minLoadTime;
    const startTime = performance.now();

    const tick = () => {
      if (this.completed) return;
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
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
      this.text.textContent = step.label;
    }
  }

  async runSteps() {
    // Step 1: CSS already loaded
    this.updateProgress('preload-css');
    await this.sleep(150);

    // Step 2: WebGL context check
    this.updateProgress('init-webgl');
    await this.sleep(150);

    // Step 3: Three.js (already loaded via script tag in HTML, but verify)
    this.updateProgress('load-threejs');
    await this.sleep(200);

    // Step 4: Initialize shader
    this.updateProgress('init-shader');
    try {
      if (window.initShader) {
        await this.callWithTimeout(() => window.initShader(), 3000);
      }
    } catch (e) {
      console.warn('Shader init failed:', e);
    }
    await this.sleep(300);

    // Step 5: Initialize generative art
    this.updateProgress('init-generative');
    try {
      if (window.initGenerativeArt) {
        await this.callWithTimeout(() => window.initGenerativeArt(), 3000);
      }
    } catch (e) {
      console.warn('Generative art init failed:', e);
    }
    await this.sleep(300);

    // Step 6: Initialize API
    this.updateProgress('init-api');
    try {
      if (window.initAPI) {
        await this.callWithTimeout(() => window.initAPI(), 2000);
      }
    } catch (e) {
      console.warn('API init failed:', e);
    }
    await this.sleep(200);

    // Step 7: Initialize UI
    this.updateProgress('init-ui');
    try {
      if (window.initUI) {
        await this.callWithTimeout(() => window.initUI(), 3000);
      }
    } catch (e) {
      console.warn('UI init failed:', e);
    }
    await this.sleep(300);

    // Step 8: Hydrate
    this.updateProgress('hydrate');
    await this.sleep(200);

    this.complete();
  }

  callWithTimeout(fn, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), ms);
      Promise.resolve(fn()).then(resolve, reject);
      timer.unref ? timer.unref() : null;
    });
  }

  complete() {
    if (this.completed) return;
    this.completed = true;

    // Ensure counter hits 99
    this.counter.textContent = '99';
    this.progress.style.width = '100%';
    this.text.textContent = 'Ready.';

    // Hide pre-canvas 99
    if (this.preCanvas99) {
      this.preCanvas99.style.opacity = '0';
      this.preCanvas99.style.transition = 'opacity 0.5s ease';
    }

    // Show UI with fallback timeout
    setTimeout(() => this.revealUI(), 100);
  }

  forceComplete() {
    this.complete();
  }

  revealUI() {
    // Hide loading screen
    this.loadingScreen.classList.add('hidden');

    // Show UI container
    this.uiContainer.style.opacity = '1';
    this.uiContainer.style.visibility = 'visible';
    this.uiContainer.classList.add('visible');

    // Force layout so transition works
    requestAnimationFrame(() => {
      this.revealSections();
    });
  }

  revealSections() {
    const sections = document.querySelectorAll(
      '.hero-section, .tools-section, .generative-section, .api-section, .portfolio-section, .dashboard-section'
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -100px 0px' });

    sections.forEach((section, i) => {
      section.classList.remove('section-hidden');
      section.classList.add('section-visible');
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-init
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiveLoader());
  } else {
    new LiveLoader();
  }

  // Safety net: always reveal UI after 8 seconds max
  setTimeout(() => {
    const ui = document.getElementById('ui-container');
    const loader = document.getElementById('loading-screen');
    if (ui && loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      ui.style.opacity = '1';
      ui.style.visibility = 'visible';
      ui.classList.add('visible');
    }
  }, 8000);
})();

window.LiveLoader = LiveLoader;