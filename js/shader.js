/* ==========================================================================
   Function Psi — WebGL Shader Background
   Matches why.zero.university aesthetic: teal gradient, organic motion
   ========================================================================== */

function initShader() {
  const canvas = document.getElementById('webgl');
  if (!canvas) return;

  let scene, camera, renderer, uniforms, mesh;
  let time = 0;
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };

  // Track mouse for subtle interaction
  document.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

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
    uniform vec2 u_mouse;
    varying vec2 vUv;

    // Simplex-like noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = dot(i, vec2(12.9898, 78.233));
      float b = dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233));
      float c = dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233));
      float d = dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233));
      float n1 = fract(sin(a) * 43758.5453);
      float n2 = fract(sin(b) * 43758.5453);
      float n3 = fract(sin(c) * 43758.5453);
      float n4 = fract(sin(d) * 43758.5453);
      return mix(mix(n1, n2, f.x), mix(n3, n4, f.x), f.y);
    }

    // FBM
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5, 0.3); // Match gradient center
      vec2 p = (uv - center) * 2.0;

      float t = u_time * 0.05;
      float mx = u_mouse.x * 0.1;
      float my = u_mouse.y * 0.1;

      // Organic flowing shapes
      float d1 = length(p - vec2(0.3 * sin(t * 0.7), 0.2 * cos(t * 0.5)));
      float d2 = length(p - vec2(-0.2 * cos(t * 0.4), -0.3 * sin(t * 0.6)));
      float d3 = length(p - vec2(0.1 * sin(t * 0.3), 0.15 * cos(t * 0.8)));

      float f1 = exp(-d1 * 3.0);
      float f2 = exp(-d2 * 3.5);
      float f3 = exp(-d3 * 4.0);

      // Noise distortion
      float n = fbm(p * 1.5 + t * 0.2) * 0.15;
      float n2 = fbm(p * 3.0 - t * 0.15) * 0.08;

      // Base gradient colors (matching CSS)
      vec3 col1 = vec3(0.83, 0.96, 0.92); // #d4f6eb
      vec3 col2 = vec3(0.70, 0.87, 0.82); // #b3ded1
      vec3 col3 = vec3(0.57, 0.78, 0.72); // #91c7b7
      vec3 col4 = vec3(0.44, 0.68, 0.61); // #70af9c
      vec3 col5 = vec3(0.31, 0.59, 0.51); // #4e9782
      vec3 col6 = vec3(0.21, 0.44, 0.37); // #356f5e
      vec3 col7 = vec3(0.11, 0.28, 0.22); // #1c4839

      // Layered gradient
      float g = uv.y;
      vec3 base = mix(col7, col6, smoothstep(0.95, 1.0, g));
      base = mix(base, col5, smoothstep(0.85, 0.9, g));
      base = mix(base, col4, smoothstep(0.7, 0.78, g));
      base = mix(base, col3, smoothstep(0.55, 0.65, g));
      base = mix(base, col2, smoothstep(0.4, 0.5, g));
      base = mix(base, col1, smoothstep(0.2, 0.3, g));

      // Add organic blobs
      vec3 blobs = col1 * f1 + col2 * f2 + col3 * f3;
      base = mix(base, blobs, 0.6);

      // Add noise texture
      base += vec3(n) * 0.1;
      base += vec3(n2) * 0.05;

      // Mouse influence - subtle highlight
      float mdist = length(uv - (u_mouse * 0.5 + 0.5));
      float mglow = exp(-mdist * 8.0) * 0.15;
      base += vec3(mglow) * vec3(0.83, 0.96, 0.92);

      // Vignette
      float vig = 1.0 - length(uv - 0.5) * 0.8;
      base *= vig;

      // Slight grain
      float grain = noise(uv * 200.0 + t * 10.0) * 0.02;
      base += vec3(grain);

      gl_FragColor = vec4(base, 1.0);
    }
  `;

  function init() {
    // Check WebGL
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl || typeof THREE === 'undefined') {
      canvas.style.display = 'none';
      return;
    }

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener('resize', onResize);
    animate();
  }

  function onResize() {
    if (!renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    uniforms.u_resolution.value.set(w, h);
  }

  function animate() {
    if (!renderer) return;

    time += 1;
    uniforms.u_time.value = time;

    // Smooth mouse follow
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    uniforms.u_mouse.value.set(mouse.x, mouse.y);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Export for global access
window.initShader = initShader;