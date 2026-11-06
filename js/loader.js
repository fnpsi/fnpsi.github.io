/* =========================================================
   Function Psi — loading screen
   ========================================================= */
(function () {
  "use strict";

  var loader = document.querySelector("[data-loader]");
  if (!loader) return;

  var html = document.documentElement;
  var count = loader.querySelector("[data-loader-count]");
  var bar = loader.querySelector("[data-loader-bar]");
  var status = loader.querySelector("[data-loader-status]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var startTime = performance.now();
  var minDuration = reduceMotion ? 200 : 1250;
  var current = 0;
  var target = 8;
  var finished = false;
  var announced = false;
  var revealTimer = 0;
  var frame = 0;
  var failsafe = 0;
  var sceneTimer = 0;
  var fontsReady = false;
  var windowReady = document.readyState === "complete";
  var sceneExpected = Boolean(document.querySelector("[data-hero-canvas]"));
  var sceneReady = !sceneExpected;

  html.classList.add("is-loading");

  function displayValue() {
    var rounded = Math.round(current);
    if (count) count.textContent = rounded >= 100 ? "100" : String(rounded).padStart(2, "0");
    if (bar) bar.style.transform = "scaleX(" + Math.min(1, current / 100) + ")";
  }

  function updateStatus() {
    if (!status) return;
    if (current < 30) {
      status.textContent = "Waking up the browser";
    } else if (current < 58) {
      status.textContent = "Loading type + texture";
    } else if (current < 88) {
      status.textContent = "Warming the WebGL";
    } else {
      status.textContent = "Ready when you are";
    }
  }

  function setTarget(next) {
    target = Math.max(target, Math.min(100, next));
  }

  function allReady() {
    return fontsReady && windowReady && sceneReady;
  }

  function announce() {
    if (announced) return;
    announced = true;
    html.setAttribute("data-page-ready", "true");
    window.dispatchEvent(new CustomEvent("fnpsi:page-ready"));
  }

  function reveal() {
    if (finished) return;
    finished = true;
    window.clearTimeout(failsafe);
    window.clearTimeout(revealTimer);
    window.cancelAnimationFrame(frame);

    announce();
    loader.classList.add("is-done");
    loader.setAttribute("aria-hidden", "true");
    loader.setAttribute("aria-busy", "false");
    html.classList.remove("is-loading");

    window.setTimeout(function () {
      loader.style.display = "none";
      document.dispatchEvent(new CustomEvent("fnpsi:loader-done"));
    }, 1100);

    if (!window.location.hash) window.scrollTo(0, 0);
  }

  function hide() {
    if (finished) return;

    if (reduceMotion || !window.gsap) {
      reveal();
      return;
    }

    announce();

    // If requestAnimationFrame is paused (background tab, embedded viewer),
    // never leave the visitor behind a loader that cannot animate.
    revealTimer = window.setTimeout(reveal, 2100);

    var tl = window.gsap.timeline({ onComplete: reveal });
    tl.to(loader.querySelectorAll(".loader__top, .loader__bottom, .loader__center"), {
      opacity: 0,
      y: -14,
      duration: 0.5,
      stagger: 0.04,
      ease: "power2.out"
    })
      .to(loader, {
        yPercent: -100,
        duration: 1.05,
        ease: "power4.inOut"
      }, 0.12);
  }

  function finish() {
    if (finished) return;
    current = 100;
    setTarget(100);
    displayValue();
    updateStatus();
    window.setTimeout(hide, reduceMotion ? 0 : 420);
  }

  function tick() {
    if (finished) return;

    current += (target - current) * 0.09;
    if (target >= 100 && current > 99.4) current = 100;
    displayValue();
    updateStatus();

    if (allReady() && performance.now() - startTime >= minDuration) {
      setTarget(100);
      if (current >= 99.4) {
        finish();
        return;
      }
    }

    frame = window.requestAnimationFrame(tick);
  }

  document.fonts.ready.then(function () {
    fontsReady = true;
    setTarget(58);
  }).catch(function () {
    fontsReady = true;
    setTarget(58);
  });

  window.addEventListener("load", function () {
    windowReady = true;
    setTarget(78);
  }, { once: true });

  document.addEventListener("fnpsi:scene-ready", function () {
    window.clearTimeout(sceneTimer);
    sceneReady = true;
    setTarget(94);
  }, { once: true });

  if (window.__fnpsiSceneReady) {
    window.clearTimeout(sceneTimer);
    sceneReady = true;
    setTarget(94);
  }

  if (!sceneExpected) setTarget(78);

  // The scene can finish after the page is usable. Do not hold the visitor
  // behind the loader while a mobile GPU compiles shaders.
  if (sceneExpected && !sceneReady) {
    sceneTimer = window.setTimeout(function () {
      sceneReady = true;
      setTarget(78);
    }, 1800);
  }

  // If the 3D scene takes too long, never trap the visitor behind the loader.
  failsafe = window.setTimeout(function () {
    sceneReady = true;
    fontsReady = true;
    windowReady = true;
    finish();
  }, 7600);

  displayValue();
  updateStatus();
  frame = window.requestAnimationFrame(tick);

  // Keep the failsafe honest if the page is restored from bfcache.
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && !finished) {
      sceneReady = true;
      fontsReady = true;
      windowReady = true;
      finish();
    }
  });
})();
