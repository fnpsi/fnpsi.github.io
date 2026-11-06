/* =========================================================
   Function Psi — Aetherium: Live Spatial-Audio Instrument
   Web Audio + Three.js real-time synthesizer & visualizer
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Audio Context & Graph ---------- */

  var audioCtx = null;
  var masterGain = null;
  var reverbNode = null;
  var analyser = null;
  var oscillators = {};
  var oscillatorGains = {};
  var isAudioRunning = false;
  var autoEvolve = true;
  var evolveTime = 0;

  var params = {
    low: { freq: 80, gain: 0.35 },
    mid: { freq: 440, gain: 0.35 },
    high: { freq: 3200, gain: 0.35 },
    master: 0.35,
    reverb: 0.4
  };

  var targetParams = { ...params };

  /* ---------- Three.js Scene ---------- */

  var scene = null;
  var camera = null;
  var renderer = null;
  var chromeMesh = null;
  var orbitalRings = [];
  var particleSystem = null;
  var particlePositions = null;
  var particleVelocities = null;
  var particleSizes = null;
  var particleAlphas = null;
  var animationId = null;
  var clock = { delta: 0, elapsed: 0, lastTime: 0 };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasWebGL = true;

  /* ---------- DOM Elements ---------- */

  var canvas = document.getElementById("aetherium-canvas");
  var fallback = document.getElementById("aetherium-fallback");
  var audioToggle = document.getElementById("audio-toggle");
  var sliders = {
    low: document.getElementById("slider-low"),
    mid: document.getElementById("slider-mid"),
    high: document.getElementById("slider-high"),
    master: document.getElementById("master-gain"),
    reverb: document.getElementById("reverb-mix")
  };
  var outputs = {
    low: document.querySelector('output[for="slider-low"]'),
    mid: document.querySelector('output[for="slider-mid"]'),
    high: document.querySelector('output[for="slider-high"]'),
    master: document.querySelector('output[for="master-gain"]'),
    reverb: document.querySelector('output[for="reverb-mix"]')
  };
  var autoPlayCheckbox = document.getElementById("auto-play");
  var waveformCanvases = document.querySelectorAll(".aetherium-waveform");
  var waveformCtxs = [];

  /* ---------- Init ---------- */

  function init() {
    if (!canvas) return;

    initWaveforms();
    initThreeJS();
    initAudio();
    bindEvents();
    startRenderLoop();
  }

  /* ---------- Waveform Visualization ---------- */

  function initWaveforms() {
    waveformCanvases.forEach(function (canvas) {
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#08090a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      waveformCtxs.push(ctx);
    });
  }

  function drawWaveforms() {
    if (!analyser || !isAudioRunning) return;

    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    waveformCtxs.forEach(function (ctx, i) {
      var canvas = waveformCanvases[i];
      var band = i === 0 ? "low" : i === 1 ? "mid" : "high";
      var color = getComputedStyle(document.documentElement).getPropertyValue("--aether-" + band).trim();

      ctx.fillStyle = "#08090a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();

      var sliceWidth = canvas.width / dataArray.length;
      var x = 0;
      var centerY = canvas.height / 2;

      for (var j = 0; j < dataArray.length; j++) {
        var v = dataArray[j] / 255;
        var y = centerY - (v * centerY * 0.8);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();

      // Draw center line
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
    });

    requestAnimationFrame(drawWaveforms);
  }

  /* ---------- Three.js Scene Setup ---------- */

  function initThreeJS() {
    try {
      // Quick WebGL check
      var testCanvas = document.createElement("canvas");
      var gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) throw new Error("WebGL not available");
      hasWebGL = true;
    } catch (e) {
      hasWebGL = false;
      canvas.hidden = true;
      fallback.hidden = false;
      return;
    }

    // Wait for three.js to load
    if (typeof THREE === "undefined") {
      setTimeout(initThreeJS, 100);
      return;
    }

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090a);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 8);

    // Lights
    var ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(5, 10, 7);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0x70e7ff, 0.5);
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

    var accentLight = new THREE.PointLight(0xc9ff4a, 0, 20);
    accentLight.position.set(0, 0, 0);
    scene.add(accentLight);

    // Procedural environment map for reflections
    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    var roomEnv = createProceduralEnvMap();
    var envMap = pmremGenerator.fromScene(roomEnv).texture;
    scene.environment = envMap;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Chrome material
    var chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      metalness: 1.0,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      iridescence: 0.3,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400],
      envMapIntensity: 1.5,
      reflectivity: 1.0
    });

    // Chrome geometry - torus knot
    var geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 64);
    geometry.computeTangents();

    chromeMesh = new THREE.Mesh(geometry, chromeMaterial);
    chromeMesh.rotation.x = -0.2;
    scene.add(chromeMesh);

    // Orbital rings - instanced
    createOrbitalRings();

    // Particle system
    createParticleSystem();

    // Handle resize
    window.addEventListener("resize", onResize, { passive: true });

    // Pointer parallax
    document.addEventListener("mousemove", onPointerMove, { passive: true });

    // Mark canvas ready
    canvas.hidden = false;
  }

  function createProceduralEnvMap() {
    var envScene = new THREE.Scene();
    var envCamera = new THREE.CubeCamera(0.1, 100, 512);
    envScene.add(envCamera);

    // Create a room with gradient walls
    var roomSize = 20;
    var wallMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor1: { value: new THREE.Color(0x0a0b0d) },
        uColor2: { value: new THREE.Color(0x15161a) },
        uColor3: { value: new THREE.Color(0x0d0e10) }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        void main() {
          float grad = normalize(vWorldPos).y * 0.5 + 0.5;
          vec3 color = mix(uColor1, uColor2, grad);
          color = mix(color, uColor3, pow(grad, 2.0));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });

    var box = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
    var room = new THREE.Mesh(box, wallMaterial);
    envScene.add(room);

    // Add some glowing strips
    var stripGeo = new THREE.PlaneGeometry(roomSize * 0.8, 0.5);
    var stripMat = new THREE.MeshBasicMaterial({
      color: 0xc9ff4a,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    for (var i = -2; i <= 2; i++) {
      var strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.y = i * 2.5;
      strip.rotation.x = -Math.PI / 2;
      envScene.add(strip);
    }

    envCamera.update(renderer, envScene);
    return envScene;
  }

  function createOrbitalRings() {
    var ringGeometry = new THREE.RingGeometry(1.8, 2.0, 64);
    var ringCount = 3;

    var ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc9ff4a,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      envMapIntensity: 0.5
    });

    for (var i = 0; i < ringCount; i++) {
      var ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
      ring.rotation.x = -Math.PI / 2;
      ring.rotation.z = i * 0.4;
      ring.userData = {
        baseRotation: ring.rotation.z,
        speed: 0.05 + i * 0.02,
        band: i === 0 ? "low" : i === 1 ? "mid" : "high",
        tilt: (i - 1) * 0.15
      };

      // Color per band
      if (i === 0) ring.material.color.setHex(0xff6b45);
      else if (i === 1) ring.material.color.setHex(0xc9ff4a);
      else ring.material.color.setHex(0x70e7ff);

      scene.add(ring);
      orbitalRings.push(ring);
    }
  }

  function createParticleSystem() {
    var count = reduceMotion ? 500 : 2000;

    particlePositions = new Float32Array(count * 3);
    particleVelocities = new Float32Array(count * 3);
    particleSizes = new Float32Array(count);
    particleAlphas = new Float32Array(count);

    for (var i = 0; i < count; i++) {
      var radius = 2 + Math.random() * 6;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.002;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      particleSizes[i] = 0.5 + Math.random() * 1.5;
      particleAlphas[i] = 0.1 + Math.random() * 0.4;
    }

    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));
    particleGeo.setAttribute("alpha", new THREE.BufferAttribute(particleAlphas, 1));

    var particleMat = new THREE.PointsMaterial({
      size: 1,
      vertexColors: false,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
  }

  /* ---------- Audio ---------- */

  function initAudio() {
    audioToggle.addEventListener("click", function () {
      if (!isAudioRunning) {
        startAudio();
      } else {
        stopAudio();
      }
    });
  }

  async function startAudio() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain
      masterGain = audioCtx.createGain();
      masterGain.gain.value = params.master;
      masterGain.connect(audioCtx.destination);

      // Reverb - generate impulse response
      reverbNode = audioCtx.createConvolver();
      reverbNode.buffer = generateImpulseResponse(2.5, params.reverb);
      var reverbGain = audioCtx.createGain();
      reverbGain.gain.value = params.reverb;
      reverbNode.connect(reverbGain);
      reverbGain.connect(masterGain);

      // Analyser for waveforms
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(masterGain);

      // Create oscillators for each band
      ["low", "mid", "high"].forEach(function (band) {
        var osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = params[band].freq;

        var gain = audioCtx.createGain();
        gain.gain.value = params[band].gain;

        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbNode);
        gain.connect(analyser);

        osc.start();

        oscillators[band] = osc;
        oscillatorGains[band] = gain;
      });

      isAudioRunning = true;
      audioToggle.setAttribute("aria-pressed", "true");
      audioToggle.querySelector("span:last-child").textContent = "Disable Audio";
      audioToggle.classList.add("active");
      sliders.master.disabled = false;
      sliders.reverb.disabled = false;

      drawWaveforms();
    } catch (e) {
      console.error("Audio init failed:", e);
      audioToggle.disabled = true;
      audioToggle.querySelector("span:last-child").textContent = "Audio unavailable";
    }
  }

  function stopAudio() {
    if (!audioCtx) return;

    Object.values(oscillators).forEach(function (osc) {
      try { osc.stop(); } catch (e) {}
    });

    try {
      audioCtx.close();
    } catch (e) {}

    audioCtx = null;
    masterGain = null;
    reverbNode = null;
    analyser = null;
    oscillators = {};
    oscillatorGains = {};
    isAudioRunning = false;

    audioToggle.setAttribute("aria-pressed", "false");
    audioToggle.querySelector("span:last-child").textContent = "Enable Audio";
    audioToggle.classList.remove("active");
    sliders.master.disabled = true;
    sliders.reverb.disabled = true;
  }

  function generateImpulseResponse(duration, decay) {
    var sampleRate = audioCtx.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (var channel = 0; channel < 2; channel++) {
      var data = impulse.getChannelData(channel);
      for (var i = 0; i < length; i++) {
        var t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * 0.5;
      }
    }

    return impulse;
  }

  function updateReverb() {
    if (!audioCtx || !reverbNode) return;
    reverbNode.buffer = generateImpulseResponse(2.5, params.reverb);
  }

  /* ---------- Parameter Updates ---------- */

  function setParam(band, key, value) {
    params[band][key] = value;
    targetParams[band][key] = value;

    // Update output display
    if (outputs[band]) {
      if (key === "freq") {
        outputs[band].textContent = value + " Hz";
      } else {
        outputs[band].textContent = value.toFixed(2);
      }
    }

    // Update slider data attributes for CSS fill
    var slider = sliders[band];
    if (slider && key === "freq") {
      slider.setAttribute("data-value", value);
      slider.setAttribute("data-fill", "");
    }

    // Audio updates
    if (isAudioRunning) {
      if (key === "freq" && oscillators[band]) {
        oscillators[band].frequency.exponentialRampToValueAtTime(value, audioCtx.currentTime + 0.02);
      } else if (key === "gain" && oscillatorGains[band]) {
        oscillatorGains[band].gain.exponentialRampToValueAtTime(value, audioCtx.currentTime + 0.02);
      }
    }
  }

  function setMasterGain(value) {
    params.master = value;
    targetParams.master = value;
    if (outputs.master) outputs.master.textContent = value.toFixed(2);
    if (masterGain) masterGain.gain.exponentialRampToValueAtTime(value, audioCtx.currentTime + 0.02);
  }

  function setReverb(value) {
    params.reverb = value;
    targetParams.reverb = value;
    if (outputs.reverb) outputs.reverb.textContent = value.toFixed(2);
    if (reverbNode) updateReverb();
  }

  /* ---------- Auto-evolve ---------- */

  function perlin1D(x) {
    var i = Math.floor(x);
    var f = x - i;
    var u = f * f * (3 - 2 * f);
    var a = pseudoRandom(i);
    var b = pseudoRandom(i + 1);
    return a + (b - a) * u;
  }

  function pseudoRandom(seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function updateAutoEvolve(dt) {
    if (!autoEvolve || reduceMotion) return;

    evolveTime += dt * 0.15;

    var bands = ["low", "mid", "high"];
    var freqRanges = {
      low: [30, 250],
      mid: [250, 2000],
      high: [2000, 8000]
    };

    bands.forEach(function (band, i) {
      var range = freqRanges[band];
      var noise = perlin1D(evolveTime + i * 100);
      var targetFreq = range[0] + noise * (range[1] - range[0]);

      // Smooth towards target
      var current = params[band].freq;
      var smoothed = current + (targetFreq - current) * 0.008;

      // Update slider position
      var slider = sliders[band];
      if (slider) {
        slider.value = Math.round(smoothed);
        slider.setAttribute("data-value", Math.round(smoothed));
      }

      setParam(band, "freq", smoothed);
    });
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    // Frequency sliders
    ["low", "mid", "high"].forEach(function (band) {
      var slider = sliders[band];
      slider.addEventListener("input", function () {
        var val = parseFloat(this.value);
        setParam(band, "freq", val);
      });

      slider.addEventListener("change", function () {
        this.setAttribute("data-value", this.value);
      });
    });

    // Master gain
    sliders.master.addEventListener("input", function () {
      setMasterGain(parseFloat(this.value));
    });

    // Reverb
    sliders.reverb.addEventListener("input", function () {
      setReverb(parseFloat(this.value));
    });

    // Auto-evolve toggle
    autoPlayCheckbox.addEventListener("change", function () {
      autoEvolve = this.checked;
    });

    // Keyboard support for sliders
    document.querySelectorAll(".aetherium-slider").forEach(function (slider) {
      slider.addEventListener("keydown", function (e) {
        var step = parseFloat(this.step) || 1;
        var min = parseFloat(this.min);
        var max = parseFloat(this.max);
        var val = parseFloat(this.value);

        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          e.preventDefault();
          this.value = Math.min(max, val + step);
          this.dispatchEvent(new Event("input"));
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          e.preventDefault();
          this.value = Math.max(min, val - step);
          this.dispatchEvent(new Event("input"));
        } else if (e.key === "Home") {
          e.preventDefault();
          this.value = min;
          this.dispatchEvent(new Event("input"));
        } else if (e.key === "End") {
          e.preventDefault();
          this.value = max;
          this.dispatchEvent(new Event("input"));
        }
      });
    });
  }

  /* ---------- Three.js Animation ---------- */

  var pointer = { x: 0, y: 0 };

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!renderer || !camera) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  function updateChromeMesh(dt) {
    if (!chromeMesh) return;

    // Rotate slowly
    chromeMesh.rotation.y += dt * 0.08;
    chromeMesh.rotation.x += dt * 0.03;

    // Pointer parallax
    chromeMesh.rotation.y += pointer.x * 0.15;
    chromeMesh.rotation.x += pointer.y * 0.1;

    // Audio-driven vertex displacement would go here
    // For now, scale based on low frequency
    var lowGain = params.low.gain;
    var scale = 1 + lowGain * 0.3;
    chromeMesh.scale.setScalar(scale);

    // Emissive pulse based on mid
    if (chromeMesh.material.emissive) {
      var midGain = params.mid.gain;
      chromeMesh.material.emissiveIntensity = midGain * 0.5;
    }
  }

  function updateOrbitalRings(dt) {
    orbitalRings.forEach(function (ring, i) {
      ring.rotation.z = ring.userData.baseRotation + ring.userData.speed * clock.elapsed;

      // Tilt based on band frequency
      var band = ring.userData.band;
      var freq = params[band].freq;
      var freqRanges = { low: [30, 250], mid: [250, 2000], high: [2000, 8000] };
      var range = freqRanges[band];
      var norm = (freq - range[0]) / (range[1] - range[0]);
      ring.rotation.x = -Math.PI / 2 + ring.userData.tilt + norm * 0.3;

      // Opacity pulse
      ring.material.opacity = 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(clock.elapsed * 2 + i));
    });
  }

  function updateParticleSystem(dt) {
    if (!particleSystem || reduceMotion) return;

    var positions = particleSystem.geometry.attributes.position.array;
    var alphas = particleSystem.geometry.attributes.alpha.array;
    var count = positions.length / 3;

    for (var i = 0; i < count; i++) {
      // Apply velocity
      positions[i * 3] += particleVelocities[i * 3];
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1];
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

      // Subtle attraction to center
      var dx = -positions[i * 3] * 0.0001;
      var dy = -positions[i * 3 + 1] * 0.0001;
      var dz = -positions[i * 3 + 2] * 0.0001;
      particleVelocities[i * 3] += dx;
      particleVelocities[i * 3 + 1] += dy;
      particleVelocities[i * 3 + 2] += dz;

      // Damping
      particleVelocities[i * 3] *= 0.995;
      particleVelocities[i * 3 + 1] *= 0.995;
      particleVelocities[i * 3 + 2] *= 0.995;

      // Alpha pulse based on audio
      var audioLevel = isAudioRunning ? (params.low.gain + params.mid.gain + params.high.gain) / 3 : 0.35;
      alphas[i] = 0.1 + 0.4 * audioLevel * (0.8 + 0.2 * Math.sin(clock.elapsed * 3 + i));
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.alpha.needsUpdate = true;

    // Rotate whole system
    particleSystem.rotation.y += dt * 0.02;
  }

  function updateAccentLight() {
    if (!scene) return;
    var light = scene.getObjectByProperty("type", "PointLight");
    if (light) {
      var intensity = (params.low.gain + params.mid.gain + params.high.gain) / 3;
      light.intensity = intensity * 5;
      light.color.setHSL(0.2, 1, 0.5 + intensity * 0.3);
    }
  }

  function renderLoop(time) {
    if (!clock.lastTime) clock.lastTime = time;
    clock.delta = (time - clock.lastTime) / 1000;
    clock.elapsed = time / 1000;
    clock.lastTime = time;

    if (isAudioRunning) {
      updateAutoEvolve(clock.delta);
    }

    if (hasWebGL) {
      updateChromeMesh(clock.delta);
      updateOrbitalRings(clock.delta);
      updateParticleSystem(clock.delta);
      updateAccentLight();

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    animationId = requestAnimationFrame(renderLoop);
  }

  function startRenderLoop() {
    animationId = requestAnimationFrame(renderLoop);
  }

  /* ---------- Cleanup ---------- */

  window.addEventListener("beforeunload", function () {
    if (animationId) cancelAnimationFrame(animationId);
    if (isAudioRunning) stopAudio();
  });

  /* ---------- Boot ---------- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  /* ---------- Debug API ---------- */

  window.FNPsiAetherium = {
    getParams: function () { return { ...params }; },
    setParam: setParam,
    startAudio: startAudio,
    stopAudio: stopAudio,
    toggleAutoEvolve: function () { autoPlayCheckbox.checked = !autoPlayCheckbox.checked; autoEvolve = autoPlayCheckbox.checked; }
  };

})();