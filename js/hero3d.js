/* =========================================================
   Function Psi — signal chamber
   A scroll-driven flight through a chrome instrument.
   ========================================================= */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-canvas]");
  if (!canvas) return;

  var stage = canvas.closest("[data-hero-visual]");
  var hero = document.querySelector("[data-hero-cinema]");
  var note = document.querySelector("[data-webgl-note]");
  var noteText = document.querySelector("[data-webgl-note-text]");
  var coords = document.querySelector("[data-hero-coords]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;
  var announced = false;
  var booted = false;
  var scrollProgress = 0;
  var heroScroll = null;

  function setNote(text, isFallback) {
    if (note) note.classList.toggle("is-fallback", Boolean(isFallback));
    if (noteText) noteText.textContent = text;
  }

  function announceReady() {
    if (announced) return;
    announced = true;
    window.__fnpsiSceneReady = true;
    document.dispatchEvent(new CustomEvent("fnpsi:scene-ready"));
  }

  function fallback(reason) {
    if (stage) stage.classList.remove("is-webgl-ready");
    document.documentElement.classList.add("no-webgl");
    setNote(reason || "CSS fallback / WebGL off", true);
    if (heroScroll) {
      if (heroScroll.scrollTrigger) heroScroll.scrollTrigger.kill();
      heroScroll.kill();
      heroScroll = null;
    }
    announceReady();
  }

  function supportsWebGL() {
    try {
      var test = document.createElement("canvas");
      var context =
        test.getContext("webgl2") ||
        test.getContext("webgl") ||
        test.getContext("experimental-webgl");

      if (!context) return false;
      var lose = context.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      return true;
    } catch (error) {
      return false;
    }
  }

  function whenIdle(callback) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 900 });
    } else {
      window.setTimeout(callback, 140);
    }
  }

  /* ------------------------------------------------------------------
     Scroll choreography is independent of the 3D boot. The hero is
     pinned and the captions work while the scene compiles.
     ------------------------------------------------------------------ */

  function setupScroll() {
    if (reduceMotion || !hero || !window.gsap || !window.ScrollTrigger) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var titleLines = gsap.utils.toArray(".hero-cinema__title .hero__line > span");
    var intro = document.querySelector(".hero-cinema__intro");
    var captions = gsap.utils.toArray("[data-hero-caption]");
    var flash = document.querySelector("[data-hero-flash]");
    var cue = document.querySelector(".hero-cinema__cue");
    var enter = document.querySelector("[data-hero-enter]");
    var meta = document.querySelector(".hero-cinema__meta");
    var hudProgress = document.querySelector("[data-hero-progress]");
    var hudPercent = document.querySelector("[data-hero-percent]");
    var hudPhase = document.querySelector("[data-hero-phase]");
    var phaseNames = ["01 / Signal", "02 / Depth", "03 / Motion", "04 / Enter"];
    var currentPhase = -1;

    var timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: function () {
          return "+=" + window.innerHeight * (isMobile ? 2.2 : 2.8);
        },
        pin: true,
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          scrollProgress = self.progress;

          // Keep the camera and telemetry in step with the scroll even if
          // the render loop is waiting on a throttled animation frame.
          if (window.__fnpsiHeroApplyProgress) window.__fnpsiHeroApplyProgress(self.progress);
          if (window.__fnpsiHeroRender) window.__fnpsiHeroRender();

          if (hudProgress) hudProgress.style.transform = "scaleX(" + self.progress + ")";
          if (hudPercent) hudPercent.textContent = String(Math.round(self.progress * 100)).padStart(2, "0");

          var phaseIndex = self.progress < 0.28 ? 0 : self.progress < 0.5 ? 1 : self.progress < 0.72 ? 2 : 3;
          if (phaseIndex !== currentPhase) {
            currentPhase = phaseIndex;
            if (hudPhase) hudPhase.textContent = phaseNames[phaseIndex];
          }
        }
      }
    });

    timeline
      .to(titleLines, {
        yPercent: -115,
        opacity: 0,
        duration: 0.16,
        stagger: 0.025,
        ease: "power2.in"
      }, 0.04)
      .to(intro, {
        autoAlpha: 0,
        y: -18,
        duration: 0.12,
        ease: "power2.in"
      }, 0.08)
      .to(cue, { autoAlpha: 0, duration: 0.08 }, 0.04)
      .to(meta, { autoAlpha: 0, duration: 0.08 }, 0.04)
      .to(captions[0], {
        autoAlpha: 1,
        y: 0,
        duration: 0.12,
        ease: "power3.out"
      }, 0.24)
      .to(captions[0], {
        autoAlpha: 0,
        y: -22,
        duration: 0.1,
        ease: "power2.in"
      }, 0.4)
      .to(captions[1], {
        autoAlpha: 1,
        y: 0,
        duration: 0.12,
        ease: "power3.out"
      }, 0.48)
      .to(captions[1], {
        autoAlpha: 0,
        y: -22,
        duration: 0.1,
        ease: "power2.in"
      }, 0.64)
      .to(captions[2], {
        autoAlpha: 1,
        y: 0,
        duration: 0.12,
        ease: "power3.out"
      }, 0.72)
      .to(captions[2], {
        autoAlpha: 0,
        y: -22,
        duration: 0.1,
        ease: "power2.in"
      }, 0.86)
      .to(enter, { autoAlpha: 1, duration: 0.08, ease: "power2.out" }, 0.8)
      .to(flash, { opacity: 0.55, duration: 0.06, ease: "power2.in" }, 0.92)
      .to(flash, { opacity: 0, duration: 0.08, ease: "power2.out" }, 0.98)
      .to({}, { duration: 0.001 }, 1);

    heroScroll = timeline;
    ScrollTrigger.refresh();
  }

  function playEntrance() {
    if (reduceMotion || !window.gsap) return;
    window.gsap.from(".hero-cinema__ui", {
      opacity: 0,
      duration: 1.1,
      ease: "power2.out"
    });
  }

  function smoothstep(edge0, edge1, value) {
    var t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function makeGlowTexture(THREE) {
    var size = 128;
    var glowCanvas = document.createElement("canvas");
    glowCanvas.width = size;
    glowCanvas.height = size;

    var context = glowCanvas.getContext("2d");
    var gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    gradient.addColorStop(0.16, "rgba(255, 255, 255, 0.58)");
    gradient.addColorStop(0.48, "rgba(255, 255, 255, 0.14)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(glowCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeGridTexture(THREE) {
    var size = 512;
    var gridCanvas = document.createElement("canvas");
    gridCanvas.width = size;
    gridCanvas.height = size;
    var context = gridCanvas.getContext("2d");

    context.clearRect(0, 0, size, size);
    context.strokeStyle = "rgba(201, 255, 74, 0.28)";
    context.lineWidth = 1;

    for (var i = 0; i <= size; i += 64) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(size, i);
      context.stroke();
    }

    context.strokeStyle = "rgba(243, 241, 234, 0.5)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(size, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, size);
    context.stroke();

    var texture = new THREE.CanvasTexture(gridCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(18, 30);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeGlyphTexture(THREE, text, color) {
    var size = 256;
    var glyphCanvas = document.createElement("canvas");
    glyphCanvas.width = size;
    glyphCanvas.height = size;
    var context = glyphCanvas.getContext("2d");

    context.clearRect(0, 0, size, size);
    context.fillStyle = color;
    context.font = '500 118px "DM Mono", "SFMono-Regular", Consolas, monospace';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, size / 2, size / 2 + 6);

    var texture = new THREE.CanvasTexture(glyphCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeEnvironmentTexture(THREE) {
    var width = 512;
    var height = 256;
    var environmentCanvas = document.createElement("canvas");
    environmentCanvas.width = width;
    environmentCanvas.height = height;
    var context = environmentCanvas.getContext("2d");

    var gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#20232b");
    gradient.addColorStop(0.42, "#101116");
    gradient.addColorStop(1, "#050607");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(201, 255, 74, 0.9)";
    context.fillRect(48, 24, 110, 7);
    context.fillRect(300, 42, 70, 4);

    context.fillStyle = "rgba(155, 123, 255, 0.8)";
    context.fillRect(340, 74, 120, 9);
    context.fillRect(90, 120, 46, 5);

    context.fillStyle = "rgba(255, 255, 255, 0.86)";
    context.fillRect(222, 58, 26, 142);
    context.fillRect(196, 98, 78, 18);

    var texture = new THREE.CanvasTexture(environmentCanvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */

  if (!supportsWebGL()) {
    fallback("CSS fallback / WebGL unavailable");
    return;
  }

  setupScroll();

  if (document.documentElement.getAttribute("data-page-ready") === "true") {
    // The loader has already finished; do not replay the UI entrance.
  } else {
    window.addEventListener("fnpsi:page-ready", playEntrance, { once: true });
  }

  function startBoot() {
    if (booted) return;
    booted = true;

    whenIdle(function () {
      (async function () {
        try {
          var THREE = await import("three");
          var extras = {};

          if (!isMobile) {
            var modules = await Promise.all([
              import("three/addons/environments/RoomEnvironment.js"),
              import("three/addons/postprocessing/EffectComposer.js"),
              import("three/addons/postprocessing/RenderPass.js"),
              import("three/addons/postprocessing/UnrealBloomPass.js"),
              import("three/addons/postprocessing/ShaderPass.js"),
              import("three/addons/postprocessing/OutputPass.js")
            ]);

            extras.RoomEnvironment = modules[0].RoomEnvironment;
            extras.EffectComposer = modules[1].EffectComposer;
            extras.RenderPass = modules[2].RenderPass;
            extras.UnrealBloomPass = modules[3].UnrealBloomPass;
            extras.ShaderPass = modules[4].ShaderPass;
            extras.OutputPass = modules[5].OutputPass;
          }

          init(THREE, extras);
        } catch (error) {
          console.warn("Function Psi: WebGL scene could not start.", error);
          fallback("CSS fallback / scene unavailable");
        }
      })();
    });
  }

  var pageReady = document.documentElement.getAttribute("data-page-ready") === "true";
  if (pageReady) {
    startBoot();
  } else {
    window.addEventListener("fnpsi:page-ready", startBoot, { once: true });
    // The loader can fail or be absent. Never leave the hero without a scene.
    window.setTimeout(function () {
      if (!booted) startBoot();
    }, 6200);
  }

  /* ------------------------------------------------------------------
     Scene
     ------------------------------------------------------------------ */

  function init(THREE, extras) {
    var renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch (error) {
      fallback("CSS fallback / renderer unavailable");
      return;
    }

    var glowTexture = makeGlowTexture(THREE);
    var gridTexture = makeGridTexture(THREE);
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090a);
    scene.fog = new THREE.FogExp2(0x08090a, isMobile ? 0.029 : 0.024);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
    var baseZ = isMobile ? 8 : 9;
    var travel = isMobile ? 46 : 60;
    var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    var lookTarget = new THREE.Vector3();
    var elapsed = 0;
    var raf = 0;
    var visible = true;
    var contextLost = false;
    var clock = new THREE.Clock();
    var composer = null;
    var gradePass = null;
    var bloomPass = null;
    var lowPower = isMobile || (navigator.deviceMemory && navigator.deviceMemory <= 4);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.6));
    renderer.setClearColor(0x08090a, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    camera.position.set(0, 0, baseZ);

    /* ---------- reflections ---------- */

    if (!isMobile && extras.RoomEnvironment) {
      var pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      scene.environment = pmrem.fromScene(new extras.RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } else {
      scene.environment = makeEnvironmentTexture(THREE);
    }

    /* ---------- light ---------- */

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    var limeLight = new THREE.PointLight(0xc9ff4a, 30, 22, 2);
    limeLight.position.set(3.4, 3, 4.2);
    scene.add(limeLight);

    var irisLight = new THREE.PointLight(0x9b7bff, 38, 24, 2);
    irisLight.position.set(-3.8, -2.4, 2.6);
    scene.add(irisLight);

    var rimLight = new THREE.DirectionalLight(0xffffff, 2.1);
    rimLight.position.set(0, 6, -5);
    scene.add(rimLight);

    var portalLight = new THREE.PointLight(0xc9ff4a, 0, 38, 2);
    portalLight.position.set(0, 0, isMobile ? -46 : -56);
    scene.add(portalLight);

    /* ---------- the first object ---------- */

    var knotGroup = new THREE.Group();
    knotGroup.position.set(isMobile ? 1.1 : 2.25, 0.15, 0);
    scene.add(knotGroup);

    var knotGeometry = new THREE.TorusKnotGeometry(
      1.12,
      0.34,
      isMobile ? 170 : 300,
      isMobile ? 28 : 48,
      2,
      3
    );
    var knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc7c5bf,
      metalness: 1,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.62,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [100, 760],
      envMapIntensity: 1.9,
      transparent: true,
      opacity: 1
    });
    var knot = new THREE.Mesh(knotGeometry, knotMaterial);
    knot.rotation.set(0.2, 0.1, -0.1);
    knotGroup.add(knot);

    var knotHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.92, 0.006, 6, 180),
      new THREE.MeshBasicMaterial({
        color: 0xc9ff4a,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    knotHalo.rotation.set(1.04, 0.22, -0.2);
    knotGroup.add(knotHalo);

    var irisRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.18, 0.005, 6, 180),
      new THREE.MeshBasicMaterial({
        color: 0x9b7bff,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    irisRing.rotation.set(1.18, -0.42, 0.34);
    knotGroup.add(irisRing);

    var satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xc9ff4a, transparent: true, opacity: 1 })
    );
    satellite.position.set(1.95, 0.2, 0.55);
    knotGroup.add(satellite);

    var knotGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9b7bff,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    knotGlow.scale.set(7.5, 7.5, 1);
    knotGlow.position.set(0, 0, -0.7);
    knotGroup.add(knotGlow);

    var slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 4.4, 0.16),
      new THREE.MeshPhysicalMaterial({
        color: 0xb9bcc5,
        metalness: 1,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.6,
        transparent: true,
        opacity: 1
      })
    );
    slab.position.set(isMobile ? 2.6 : 3.5, 0.1, -1.9);
    slab.rotation.set(0.04, -0.42, 0.1);
    knotGroup.add(slab);

    var slabEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(slab.geometry),
      new THREE.LineBasicMaterial({
        color: 0xc9ff4a,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    slab.add(slabEdges);

    var startGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xc9ff4a,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    startGlow.scale.set(15, 15, 1);
    startGlow.position.set(isMobile ? 1.1 : 2.25, 0.15, -2.6);
    scene.add(startGlow);

    /* ---------- the tunnel ---------- */

    var ringGroup = new THREE.Group();
    scene.add(ringGroup);
    var rings = [];
    var ringCount = isMobile ? 14 : 22;
    var ringSpacing = isMobile ? 3.15 : 2.72;

    for (var ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      var ringRadius = 2.35 + (ringIndex % 5) * 0.3;
      var ringTube = 0.009 + (ringIndex % 4) * 0.004;
      var ringColor = ringIndex % 3 === 0 ? 0xc9ff4a : ringIndex % 3 === 1 ? 0x9b7bff : 0xf3f1ea;
      var ringBaseOpacity = 0.2 + (ringIndex % 4) * 0.045;
      var ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: ringBaseOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadius, ringTube, 6, isMobile ? 72 : 132),
        ringMaterial
      );
      ring.position.z = -3.4 - ringIndex * ringSpacing;
      ring.rotation.z = Math.random() * Math.PI;
      ring.userData.baseRotation = ring.rotation.z;
      ring.userData.speed = 0.03 + (ringIndex % 5) * 0.012;
      ring.userData.baseOpacity = ringBaseOpacity;

      var tickMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ring.userData.tickMaterial = tickMaterial;

      for (var tickIndex = 0; tickIndex < 4; tickIndex += 1) {
        var tick = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.16, 0.016), tickMaterial);
        var tickAngle = (Math.PI / 2) * tickIndex;
        tick.position.set(Math.cos(tickAngle) * ringRadius, Math.sin(tickAngle) * ringRadius, 0);
        tick.rotation.z = tickAngle;
        ring.add(tick);
      }

      ringGroup.add(ring);
      rings.push(ring);
    }

    /* ---------- ribbons and threads ---------- */

    function addRibbon(offset, color, radius, opacity) {
      var points = [];
      for (var step = 0; step <= 22; step += 1) {
        var t = step / 22;
        points.push(new THREE.Vector3(
          Math.sin(t * Math.PI * 3.1 + offset) * (2.6 + radius),
          Math.cos(t * Math.PI * 2.4 + offset) * (1.5 + radius * 0.35),
          -4 - t * (isMobile ? 46 : 62)
        ));
      }

      var curve = new THREE.CatmullRomCurve3(points);
      var geometry = new THREE.TubeGeometry(curve, isMobile ? 80 : 150, 0.018, 5, false);
      var material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var ribbon = new THREE.Mesh(geometry, material);
      ribbon.userData.baseOpacity = opacity;
      scene.add(ribbon);
      return ribbon;
    }

    var ribbons = [
      addRibbon(0.2, 0xc9ff4a, 0.2, 0.32),
      addRibbon(2.3, 0x9b7bff, 0.7, 0.22),
      addRibbon(4.1, 0xf3f1ea, 0.35, 0.12)
    ];

    var threadMaterial = new THREE.LineDashedMaterial({
      color: 0x9b7bff,
      transparent: true,
      opacity: 0.28,
      dashSize: 0.5,
      gapSize: 1.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (var threadIndex = 0; threadIndex < 5; threadIndex += 1) {
      var threadPoints = [];
      for (var threadStep = 0; threadStep <= 14; threadStep += 1) {
        var threadT = threadStep / 14;
        threadPoints.push(new THREE.Vector3(
          Math.sin(threadT * Math.PI * 2.8 + threadIndex * 1.4) * (4.4 + threadIndex * 0.5),
          Math.cos(threadT * Math.PI * 2 + threadIndex * 1.7) * (2.2 + threadIndex * 0.3),
          -5 - threadT * (isMobile ? 44 : 60)
        ));
      }
      var threadGeometry = new THREE.BufferGeometry().setFromPoints(threadPoints);
      var thread = new THREE.Line(threadGeometry, threadMaterial.clone());
      thread.computeLineDistances();
      thread.userData.baseOpacity = thread.material.opacity;
      scene.add(thread);
      ribbons.push(thread);
    }

    /* ---------- monoliths ---------- */

    var monolithGroup = new THREE.Group();
    scene.add(monolithGroup);
    var monoliths = [];
    var monolithCount = isMobile ? 6 : 12;

    for (var monolithIndex = 0; monolithIndex < monolithCount; monolithIndex += 1) {
      var monolithHeight = 2.2 + (monolithIndex % 4) * 0.85;
      var monolith = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, monolithHeight, 0.14),
        new THREE.MeshPhysicalMaterial({
          color: monolithIndex % 3 === 0 ? 0xc9ff4a : 0xbfc2ca,
          metalness: 1,
          roughness: 0.2,
          clearcoat: 0.7,
          envMapIntensity: 1.2
        })
      );

      var side = monolithIndex % 2 === 0 ? 1 : -1;
      monolith.position.set(
        side * (4.6 + (monolithIndex % 3) * 1.1),
        -1.6 + (monolithIndex % 5) * 0.9,
        -9 - monolithIndex * (isMobile ? 6.2 : 4.8)
      );
      monolith.rotation.set(
        (Math.random() - 0.5) * 0.14,
        side * (0.18 + Math.random() * 0.3),
        side * (0.06 + Math.random() * 0.12)
      );
      monolith.userData.baseY = monolith.position.y;
      monolith.userData.phase = Math.random() * Math.PI * 2;

      if (monolithIndex % 4 === 0) {
        monolith.add(new THREE.LineSegments(
          new THREE.EdgesGeometry(monolith.geometry),
          new THREE.LineBasicMaterial({
            color: 0xc9ff4a,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        ));
      }

      monolithGroup.add(monolith);
      monoliths.push(monolith);
    }

    /* ---------- grid ---------- */

    var grid = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 150),
      new THREE.MeshBasicMaterial({
        map: gridTexture,
        transparent: true,
        opacity: isMobile ? 0.12 : 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    grid.rotation.x = -Math.PI / 2;
    grid.position.set(0, -4.5, -32);
    scene.add(grid);

    var ceiling = grid.clone();
    ceiling.material = grid.material.clone();
    ceiling.material.opacity = isMobile ? 0.045 : 0.07;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.5;
    scene.add(ceiling);

    /* ---------- glyphs ---------- */

    var glyphGroup = new THREE.Group();
    scene.add(glyphGroup);
    var glyphs = [];
    var glyphData = [
      ["\u03a8", 0xc9ff4a],
      ["\u0192", 0xf3f1ea],
      ["01", 0x9b7bff],
      ["SIGNAL", 0xc9ff4a],
      ["FORM", 0xf3f1ea],
      ["03", 0x9b7bff],
      ["ENTER", 0xc9ff4a],
      ["\u03a8", 0x9b7bff]
    ];
    var glyphCount = isMobile ? 6 : 11;

    for (var glyphIndex = 0; glyphIndex < glyphCount; glyphIndex += 1) {
      var glyphChoice = glyphData[glyphIndex % glyphData.length];
      var glyph = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeGlyphTexture(THREE, glyphChoice[0], "#ffffff"),
          color: glyphChoice[1],
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );

      var glyphSide = glyphIndex % 2 === 0 ? 1 : -1;
      var glyphScale = 0.55 + (glyphIndex % 4) * 0.18;
      glyph.scale.set(glyphScale, glyphScale, 1);
      glyph.position.set(
        glyphSide * (2.6 + (glyphIndex % 4) * 1.15),
        -1.8 + (glyphIndex % 5) * 0.95,
        -7 - glyphIndex * (isMobile ? 6 : 4.6)
      );
      glyph.userData.baseY = glyph.position.y;
      glyph.userData.phase = Math.random() * Math.PI * 2;
      glyph.userData.baseOpacity = 0.24 + (glyphIndex % 3) * 0.1;
      glyphGroup.add(glyph);
      glyphs.push(glyph);
    }

    /* ---------- instanced shards ---------- */

    var shardCount = isMobile ? 42 : 96;
    var shardGeometry = new THREE.IcosahedronGeometry(0.13, 0);
    var shardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.92,
      roughness: 0.2,
      envMapIntensity: 1.1
    });
    var shardMesh = new THREE.InstancedMesh(shardGeometry, shardMaterial, shardCount);
    shardMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(shardMesh);

    var shardDummy = new THREE.Object3D();
    var shards = [];
    var shardPalette = [new THREE.Color(0xc9ff4a), new THREE.Color(0x9b7bff), new THREE.Color(0xc7c5bf), new THREE.Color(0xf3f1ea)];

    for (var shardIndex = 0; shardIndex < shardCount; shardIndex += 1) {
      var shardAngle = Math.random() * Math.PI * 2;
      var shardRadius = 2.2 + Math.random() * 6.2;
      var shard = {
        x: Math.cos(shardAngle) * shardRadius,
        y: Math.sin(shardAngle) * shardRadius * 0.76,
        z: 10 - Math.random() * 76,
        scale: 0.4 + Math.random() * 1.5,
        spin: {
          x: (Math.random() - 0.5) * 0.9,
          y: (Math.random() - 0.5) * 0.9,
          z: (Math.random() - 0.5) * 0.9
        },
        speed: 0.5 + Math.random() * 1.8,
        angle: Math.random() * Math.PI * 2
      };
      shards.push(shard);
      shardMesh.setColorAt(shardIndex, shardPalette[shardIndex % shardPalette.length]);
    }
    if (shardMesh.instanceColor) shardMesh.instanceColor.needsUpdate = true;

    /* ---------- shader particles ---------- */

    var particleCount = isMobile ? 1100 : 3000;
    var positions = new Float32Array(particleCount * 3);
    var particleColors = new Float32Array(particleCount * 3);
    var particleSizes = new Float32Array(particleCount);
    var particleSpeeds = new Float32Array(particleCount);
    var particlePhases = new Float32Array(particleCount);
    var lime = new THREE.Color(0xc9ff4a);
    var iris = new THREE.Color(0x9b7bff);
    var bone = new THREE.Color(0xf3f1ea);

    for (var particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
      var particleAngle = Math.random() * Math.PI * 2;
      var particleRadius = 1.5 + Math.random() * 10;
      var positionIndex = particleIndex * 3;

      positions[positionIndex] = Math.cos(particleAngle) * particleRadius;
      positions[positionIndex + 1] = Math.sin(particleAngle) * particleRadius * 0.76;
      positions[positionIndex + 2] = 14 - Math.random() * 88;

      var particleColor = particleIndex % 9 === 0 ? lime : particleIndex % 13 === 0 ? iris : bone;
      particleColors[positionIndex] = particleColor.r;
      particleColors[positionIndex + 1] = particleColor.g;
      particleColors[positionIndex + 2] = particleColor.b;

      particleSizes[particleIndex] = 0.05 + Math.random() * 0.16;
      particleSpeeds[particleIndex] = 0.25 + Math.random() * 1.9;
      particlePhases[particleIndex] = Math.random() * Math.PI * 2;
    }

    var particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aColor", new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(particleSpeeds, 1));
    particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(particlePhases, 1));

    var particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1 },
        uPixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: [
        "attribute vec3 aColor;",
        "attribute float aSize;",
        "attribute float aSpeed;",
        "attribute float aPhase;",
        "varying vec3 vColor;",
        "varying float vAlpha;",
        "uniform float uTime;",
        "uniform float uSpeed;",
        "uniform float uPixelRatio;",
        "void main() {",
        "  vColor = aColor;",
        "  vec3 p = position;",
        "  float range = 88.0;",
        "  p.z = mod(p.z + uTime * (0.55 + aSpeed) * uSpeed + 74.0, range) - 74.0;",
        "  p.x += sin(uTime * 0.3 + aPhase) * 0.18;",
        "  p.y += cos(uTime * 0.24 + aPhase) * 0.16;",
        "  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);",
        "  gl_Position = projectionMatrix * mvPosition;",
        "  gl_PointSize = clamp(aSize * uPixelRatio * (330.0 / max(1.0, -mvPosition.z)), 0.6, 7.0);",
        "  vAlpha = smoothstep(0.0, 7.0, -mvPosition.z) * smoothstep(88.0, 42.0, -mvPosition.z);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "varying vec3 vColor;",
        "varying float vAlpha;",
        "void main() {",
        "  vec2 point = gl_PointCoord - 0.5;",
        "  float distanceToCenter = length(point);",
        "  if (distanceToCenter > 0.5) discard;",
        "  float alpha = smoothstep(0.5, 0.0, distanceToCenter);",
        "  alpha = pow(alpha, 1.7);",
        "  gl_FragColor = vec4(vColor, alpha * vAlpha * 0.9);",
        "}"
      ].join("\n"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    var particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    /* ---------- the signal at the end ---------- */

    var portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, isMobile ? -46 : -56);
    scene.add(portalGroup);

    var portal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, isMobile ? 1 : 2),
      new THREE.MeshPhysicalMaterial({
        color: 0xf3f1ea,
        metalness: 0.84,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: 0x9b7bff,
        emissiveIntensity: 1.1,
        envMapIntensity: 1.4
      })
    );
    portalGroup.add(portal);

    var portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.018, 6, 180),
      new THREE.MeshBasicMaterial({
        color: 0xc9ff4a,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    portalGroup.add(portalRing);

    var portalRingTwo = new THREE.Mesh(
      new THREE.TorusGeometry(2.95, 0.008, 6, 180),
      new THREE.MeshBasicMaterial({
        color: 0x9b7bff,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    portalGroup.add(portalRingTwo);

    var aperture = new THREE.Group();
    portalGroup.add(aperture);
    var bladeMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9ff4a,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (var bladeIndex = 0; bladeIndex < 24; bladeIndex += 1) {
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.018, 0.018), bladeMaterial);
      var bladeAngle = (Math.PI * 2 * bladeIndex) / 24;
      blade.position.set(Math.cos(bladeAngle) * 2.62, Math.sin(bladeAngle) * 2.62, 0);
      blade.rotation.z = bladeAngle;
      aperture.add(blade);
    }

    var portalGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xc9ff4a,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    portalGlow.scale.set(10, 10, 1);
    portalGroup.add(portalGlow);

    var irisGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9b7bff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    irisGlow.scale.set(20, 20, 1);
    irisGlow.position.z = -1.6;
    portalGroup.add(irisGlow);

    var farNebula = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9b7bff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    farNebula.scale.set(46, 46, 1);
    farNebula.position.set(0, 0, -76);
    scene.add(farNebula);

    /* ---------- postprocessing ---------- */

    if (!isMobile && extras.EffectComposer && !lowPower) {
      composer = new extras.EffectComposer(renderer);
      composer.setPixelRatio(renderer.getPixelRatio());

      var renderPass = new extras.RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new extras.UnrealBloomPass(
        new THREE.Vector2(1, 1),
        0.52,
        0.65,
        0.74
      );
      composer.addPass(bloomPass);

      var gradeShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) }
        },
        vertexShader: [
          "varying vec2 vUv;",
          "void main() {",
          "  vUv = uv;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D tDiffuse;",
          "uniform float uTime;",
          "uniform vec2 uResolution;",
          "varying vec2 vUv;",
          "void main() {",
          "  vec2 centered = vUv - 0.5;",
          "  float radius = length(centered);",
          "  float aberration = 0.0018 * smoothstep(0.0, 0.85, radius);",
          "  vec3 color;",
          "  color.r = texture2D(tDiffuse, vUv + centered * aberration).r;",
          "  color.g = texture2D(tDiffuse, vUv).g;",
          "  color.b = texture2D(tDiffuse, vUv - centered * aberration).b;",
          "  float vignette = smoothstep(0.92, 0.24, radius);",
          "  color *= mix(0.7, 1.0, vignette);",
          "  float grain = fract(sin(dot(vUv * uResolution + uTime, vec2(12.9898, 78.233))) * 43758.5453);",
          "  color += (grain - 0.5) * 0.032;",
          "  color *= 1.0 - 0.018 * sin(vUv.y * uResolution.y * 1.15);",
          "  gl_FragColor = vec4(color, 1.0);",
          "}"
        ].join("\n")
      };

      gradePass = new extras.ShaderPass(gradeShader);
      composer.addPass(gradePass);
      composer.addPass(new extras.OutputPass());
    }

    /* ---------- resize ---------- */

    function resize() {
      var width = stage ? stage.clientWidth : 0;
      var height = stage ? stage.clientHeight : 0;
      if (!width) width = window.innerWidth;
      if (!height) height = window.innerHeight;

      var pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.6);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      if (composer) {
        composer.setPixelRatio(pixelRatio);
        composer.setSize(width, height);
      }

      if (gradePass) {
        var drawingBufferSize = renderer.getDrawingBufferSize(new THREE.Vector2());
        gradePass.uniforms.uResolution.value.set(drawingBufferSize.x, drawingBufferSize.y);
      }

      particleMaterial.uniforms.uPixelRatio.value = pixelRatio;

      if (reduceMotion) {
        applyProgress(scrollProgress);
        render();
      }
    }

    function onPointerMove(event) {
      if (event.pointerType === "touch" || reduceMotion) return;
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    }

    function applyProgress(progress) {
      var p = Math.max(0, Math.min(1, progress));
      var drift = 1 - p * 0.5;

      camera.position.z = baseZ - p * travel;
      camera.position.x = Math.sin(p * Math.PI * 2.1) * 0.92 * drift + pointer.x * 0.55;
      camera.position.y = Math.cos(p * Math.PI * 1.55) * 0.55 * drift + pointer.y * 0.34;
      camera.fov = 42 + p * 16;
      camera.updateProjectionMatrix();

      lookTarget.set(
        pointer.x * 0.7 + Math.sin(p * Math.PI * 1.2) * 0.25,
        pointer.y * 0.42 + Math.cos(p * Math.PI * 1.1) * 0.18,
        camera.position.z - 10
      );
      camera.lookAt(lookTarget);
      camera.rotation.z += Math.sin(p * Math.PI * 2.7) * 0.075 * (1 - p * 0.3);

      var knotExit = smoothstep(0.02, 0.24, p);
      knotGroup.position.x = (isMobile ? 1.1 : 2.25) + knotExit * 8.2;
      knotGroup.position.y = 0.15 + knotExit * 2.7;
      knotGroup.position.z = knotExit * -1.8;
      knotGroup.scale.setScalar(1 + p * 1.25);

      var knotFade = 1 - smoothstep(0.1, 0.32, p);
      knotMaterial.opacity = knotFade;
      knotHalo.material.opacity = 0.55 * knotFade;
      irisRing.material.opacity = 0.32 * knotFade;
      satellite.material.opacity = knotFade;
      knotGlow.material.opacity = 0.32 * knotFade;
      startGlow.material.opacity = 0.15 * knotFade;
      slab.material.opacity = knotFade;
      slabEdges.material.opacity = 0.34 * knotFade;

      rings.forEach(function (ring, index) {
        var distance = Math.abs(ring.position.z - camera.position.z);
        var proximity = Math.max(0, 1 - distance / 9);
        var fade = 0.6 + proximity * 1.05;

        ring.material.opacity = ring.userData.baseOpacity * fade;
        ring.userData.tickMaterial.opacity = 0.5 * fade;
        ring.rotation.z = ring.userData.baseRotation + elapsed * ring.userData.speed + p * (index % 2 ? 1.15 : -1.15);
      });

      monoliths.forEach(function (monolith, index) {
        monolith.position.y = monolith.userData.baseY + Math.sin(elapsed * 0.35 + monolith.userData.phase) * 0.12;
        monolith.rotation.y += 0.0008 * (index % 2 ? 1 : -1);
      });

      glyphs.forEach(function (glyph) {
        glyph.position.y = glyph.userData.baseY + Math.sin(elapsed * 0.55 + glyph.userData.phase) * 0.16;
        glyph.material.opacity = glyph.userData.baseOpacity * (1 - smoothstep(0.55, 0.95, p) * 0.5);
      });

      ribbons.forEach(function (ribbon, index) {
        if (ribbon.material) {
          ribbon.material.opacity = ribbon.userData.baseOpacity * (0.7 + Math.sin(elapsed * 0.4 + index) * 0.15 + p * 0.35);
        }
      });

      grid.material.opacity = (isMobile ? 0.12 : 0.18) * (0.75 + p * 0.5);
      ceiling.material.opacity = (isMobile ? 0.045 : 0.07) * (0.7 + p * 0.5);

      portalGroup.scale.setScalar(1 + smoothstep(0.7, 1, p) * 2.3);
      portal.rotation.x = elapsed * 0.16 + p * 2.2;
      portal.rotation.y = elapsed * 0.2 + p * 2.8;
      portalRing.rotation.z = elapsed * 0.08 + p * 0.8;
      portalRingTwo.rotation.z = -elapsed * 0.06 - p * 0.6;
      aperture.rotation.z = elapsed * 0.05 + p * 1.4;
      portalGlow.material.opacity = 0.3 + smoothstep(0.55, 0.95, p) * 0.5;
      irisGlow.material.opacity = 0.2 + smoothstep(0.6, 0.98, p) * 0.3;
      portalLight.intensity = smoothstep(0.5, 0.95, p) * 46;

      scene.fog.density = (isMobile ? 0.029 : 0.024) + p * 0.012;
      particleMaterial.uniforms.uSpeed.value = 1 + p * 16;

      if (coords) {
        coords.textContent =
          "X " + camera.position.x.toFixed(1) +
          " / Y " + camera.position.y.toFixed(1) +
          " / Z " + camera.position.z.toFixed(1);
      }
    }

    function animate(delta) {
      elapsed += delta;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      knot.rotation.x = 0.2 + elapsed * 0.1;
      knot.rotation.y = 0.1 + elapsed * 0.16;
      knot.rotation.z = -0.1 + Math.sin(elapsed * 0.24) * 0.12;

      knotHalo.rotation.z = -0.2 + elapsed * 0.032;
      irisRing.rotation.z = 0.34 - elapsed * 0.022;

      satellite.position.x = Math.cos(elapsed * 0.55) * 1.95;
      satellite.position.z = Math.sin(elapsed * 0.55) * 1.95;
      satellite.position.y = Math.sin(elapsed * 0.8) * 0.6;

      slab.rotation.y = -0.42 + Math.sin(elapsed * 0.2) * 0.08;

      particles.rotation.y = elapsed * 0.012;
      particles.rotation.x = Math.sin(elapsed * 0.07) * 0.06;
      particleMaterial.uniforms.uTime.value = elapsed;

      var shardSpeed = 1 + scrollProgress * 13;
      for (var index = 0; index < shardCount; index += 1) {
        var shard = shards[index];
        shard.z += shard.speed * shardSpeed * delta;
        shard.angle += delta * 0.12 * (index % 2 ? 1 : -1);

        if (shard.z > 14) {
          shard.z = -76;
          var resetAngle = Math.random() * Math.PI * 2;
          var resetRadius = 2.2 + Math.random() * 6.2;
          shard.x = Math.cos(resetAngle) * resetRadius;
          shard.y = Math.sin(resetAngle) * resetRadius * 0.76;
        }

        shardDummy.position.set(
          shard.x + Math.cos(shard.angle) * 0.35,
          shard.y + Math.sin(shard.angle) * 0.25,
          shard.z
        );
        shardDummy.rotation.set(
          shard.spin.x * elapsed,
          shard.spin.y * elapsed,
          shard.spin.z * elapsed
        );
        shardDummy.scale.setScalar(shard.scale);
        shardDummy.updateMatrix();
        shardMesh.setMatrixAt(index, shardDummy.matrix);
      }
      shardMesh.instanceMatrix.needsUpdate = true;

      applyProgress(scrollProgress);
      render();
    }

    function render() {
      if (composer) {
        if (gradePass) gradePass.uniforms.uTime.value = elapsed;
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    function renderFrame() {
      if (contextLost) return;

      var delta = Math.min(clock.getDelta(), 0.05);
      animate(delta);

      if (!reduceMotion && visible && !document.hidden) {
        raf = window.requestAnimationFrame(renderFrame);
      } else {
        raf = 0;
      }
    }

    function startLoop() {
      if (reduceMotion) {
        applyProgress(scrollProgress);
        render();
        return;
      }

      if (!raf && visible && !document.hidden) {
        clock.getDelta();
        raf = window.requestAnimationFrame(renderFrame);
      }
    }

    /* ---------- start ---------- */

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) startLoop();
        });
      }, { threshold: 0.02 });
      observer.observe(stage || canvas);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) startLoop();
    });

    canvas.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      contextLost = true;
      window.cancelAnimationFrame(raf);
      raf = 0;
      fallback("CSS fallback / context lost");
    });

    if (stage && "ResizeObserver" in window) {
      new ResizeObserver(function () {
        resize();
      }).observe(stage);
    }

    applyProgress(scrollProgress);
    render();

    if (stage) {
      stage.classList.add("is-webgl-ready");
      // Some embedded or occluded viewers pause CSS transitions. The scene
      // should still be visible once it is ready.
      window.setTimeout(function () {
        canvas.style.opacity = "1";
      }, 1400);
    }
    setNote("Live WebGL / signal chamber", false);
    announceReady();
    startLoop();

    window.__fnpsiHeroApplyProgress = applyProgress;
    window.__fnpsiHeroRender = render;

    window.FNPsiHero = {
      get progress() {
        return scrollProgress;
      },
      setProgress: function (value) {
        scrollProgress = Math.max(0, Math.min(1, value));
        applyProgress(scrollProgress);
        render();
      },
      render: render,
      scene: scene,
      camera: camera,
      renderer: renderer
    };
  }
})();
