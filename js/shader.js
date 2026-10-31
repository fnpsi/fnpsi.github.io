/* ==========================================================================
   Function Psi — WebGL Shader Background (Three.js)
   Free CDN, no API keys, no build step.
   Gracefully degrades if WebGL/Three.js is unavailable.
   ========================================================================== */

(function () {
  "use strict";

  let scene, camera, renderer, uniforms, mesh;
  let time = 0;
  let active = false;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = uv * 2.0 - 1.0;

      float d1 = length(p - vec2(0.5 * sin(u_time * 0.3), 0.5 * cos(u_time * 0.2)));
      float d2 = length(p - vec2(-0.4 * cos(u_time * 0.25), 0.4 * sin(u_time * 0.35)));
      float d3 = length(p - vec2(0.3 * sin(u_time * 0.15), -0.3 * cos(u_time * 0.2)));

      float f1 = exp(-d1 * 3.0);
      float f2 = exp(-d2 * 3.0);
      float f3 = exp(-d3 * 3.0);

      vec3 color = mix(u_color1, u_color2, f1 + f2);
      color += u_color3 * f3;

      float grain = noise(uv * 50.0 + u_time * 0.5) * 0.05;
      color += vec3(grain);

      float vig = 1.0 - length(uv * 1.4) * 0.6;
      color *= vig;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function init() {
    const canvas = document.getElementById('shader-bg');
    if (!canvas) return;

    // Check WebGL availability
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      // WebGL not available — leave canvas blank (CSS background shows through)
      canvas.style.background = 'transparent';
      return;
    }

    if (typeof THREE === 'undefined') {
      canvas.style.background = 'transparent';
      return;
    }

    try {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_color1: { value: new THREE.Color(0x0a0a1a) },
        u_color2: { value: new THREE.Color(0x1a0a33) },
        u_color3: { value: new THREE.Color(0x330a4d) }
      };

      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      });

      mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        context: gl,
        preserveDrawingBuffer: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      active = true;

      window.addEventListener('resize', onResize);

      animate();
    } catch (e) {
      // Silent fail — CSS background shows through
      canvas.style.background = 'transparent';
    }
  }

  function onResize() {
    if (!renderer || !active) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.u_resolution.value.set(w, h);
  }

  function animate() {
    if (!renderer || !active) return;
    time += 0.01;
    uniforms.u_time.value = time;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.updateShaderColors = function (isLight) {
    if (!uniforms || !active) return;
    if (isLight) {
      uniforms.u_color1.value.set(0xf3f4f8);
      uniforms.u_color2.value.set(0xe2e8f0);
      uniforms.u_color3.value.set(0xcbd5e1);
    } else {
      uniforms.u_color1.value.set(0x0a0a1a);
      uniforms.u_color2.value.set(0x1a0a33);
      uniforms.u_color3.value.set(0x330a4d);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
