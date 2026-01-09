// --- STAR SHADER (Ancestral - "Rasengan" Energy Look) ---
export const starVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform float uProgress;

  // Simplex Noise for vertex displacement (Pulse)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // FASTER PULSE (3.0 -> 5.0)
    float pulse = sin(uTime * 5.0) * 0.05;
    float turbulence = smoothstep(0.0, 0.20, uProgress); 
    
    vec3 newPos = position + normal * (pulse + snoise(position + uTime * 2.0) * (0.05 + turbulence * 0.5));
    
    float shrink = smoothstep(0.18, 0.22, uProgress);
    newPos = mix(newPos, newPos * 0.1, shrink);

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform float uProgress;

  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // FASTER PLASMA (uTime * 0.5 -> uTime * 1.0)
    vec2 noiseCoord = vUv * 4.0 + vec2(0.0, uTime * 1.0); 
    float plasma = fbm(noiseCoord);
    
    // FASTER OPPOSING LAYER (uTime * 1.5 -> uTime * 2.5)
    float plasma2 = fbm(vUv * 8.0 - vec2(uTime * 2.5, 0.0));
    float combinedPlasma = mix(plasma, plasma2, 0.5);

    vec3 deepBlue = vec3(0.05, 0.1, 0.6);
    vec3 brightCyan = vec3(0.2, 0.8, 1.0);
    vec3 coreWhite = vec3(1.0, 1.0, 1.0);
    
    vec3 baseColor = mix(deepBlue, brightCyan, combinedPlasma);
    baseColor = mix(baseColor, coreWhite, pow(combinedPlasma, 3.0)); 

    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    
    vec3 finalColor = baseColor + (vec3(0.5, 0.8, 1.0) * fresnel * 2.0);

    float instability = smoothstep(0.0, 0.20, uProgress);
    
    if (instability > 0.0) {
        float veins = step(0.6, plasma2);
        finalColor = mix(finalColor, vec3(1.0, 0.2, 0.1) * 3.0, veins * instability);
    }

    float fadeOut = smoothstep(0.18, 0.22, uProgress);
    float opacity = 1.0 - fadeOut;
    opacity = max(opacity, fresnel * (1.0 - smoothstep(0.20, 0.25, uProgress)));

    gl_FragColor = vec4(finalColor, opacity);
  }
`;

// --- PARTICLE SHADER (General System) ---
export const particleVertexShader = `
  attribute vec3 aTargetDNA;
  attribute float aSize;
  uniform float uTime;
  uniform float uProgress; 
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position; 
    vec3 color = vec3(0.2, 0.6, 1.0);
    float alpha = 1.0;

    if (uProgress < 0.2) {
        float angle = uTime * 0.1 + pos.y * 0.1;
        float s = sin(angle);
        float c = cos(angle);
        float x = pos.x * c - pos.z * s;
        float z = pos.x * s + pos.z * c;
        pos.x = x;
        pos.z = z;
    }

    float instability = smoothstep(0.0, 0.20, uProgress);
    if (instability > 0.0) {
        // MORE VIBRATION (20.0 -> 30.0)
        pos += vec3(sin(uTime * 30.0), cos(uTime * 30.0), 0.0) * 0.1 * instability;
        color = mix(color, vec3(1.0, 0.3, 0.1), instability); 
    }

    float implosion = smoothstep(0.20, 0.22, uProgress);
    if (implosion > 0.0) {
        float suckFactor = smoothstep(0.20, 0.22, uProgress) * (1.0 - smoothstep(0.22, 0.24, uProgress));
        pos = mix(pos, vec3(0.0), suckFactor * 0.9);
    }

    float dnaMix = smoothstep(0.22, 0.35, uProgress) * (1.0 - smoothstep(0.60, 0.70, uProgress));
    if (dnaMix > 0.0) {
       vec3 target = aTargetDNA;
       float chaos = (1.0 - dnaMix) * 5.0; 
       pos = mix(pos + vec3(sin(uTime*10.0)*chaos), target, dnaMix);
       color = mix(color, vec3(0.0, 1.0, 0.8), dnaMix);
    }
    
    if (uProgress > 0.60) {
        alpha = 1.0 - smoothstep(0.60, 0.65, uProgress);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float flash = 1.0 + (1.0 - abs(uProgress - 0.22) * 20.0); 
    flash = max(1.0, flash);
    gl_PointSize = aSize * flash * (300.0 / -mvPosition.z);
    vColor = color;
    vAlpha = alpha;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float glow = exp(-ll * 5.0);
    gl_FragColor = vec4(vColor + glow*0.5, vAlpha * glow);
  }
`;

// --- LIGHTNING / ELECTRICITY SHADER ---
export const electricityVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const electricityFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  void main() {
    vec2 uv = vUv;
    // FASTER NOISE (uTime * 15 -> uTime * 25)
    float noiseVal = noise(uv * 20.0 + vec2(0.0, uTime * 25.0));
    float bolt = 1.0 / abs(uv.x - 0.5 + (noiseVal - 0.5) * 0.2);
    bolt = pow(bolt, 3.0) * 0.002;
    float flash = noise(vec2(uTime * 30.0, 0.0));
    vec3 color = vec3(0.6, 0.8, 1.0); 
    if (rand(vec2(uTime)) > 0.5) color = vec3(1.0, 0.9, 0.5); 
    gl_FragColor = vec4(color, bolt * flash * uIntensity);
  }
`;

// --- NEW GALAXY SHADER ---
export const galaxyVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aRandom;
  uniform float uTime;
  varying vec3 vColor;
  void main() {
    vec3 pos = position;
    float angle = uTime * 0.05 * (1.0 - length(pos) * 0.01);
    float s = sin(angle);
    float c = cos(angle);
    float x = pos.x * c - pos.z * s;
    float z = pos.x * s + pos.z * c;
    pos.x = x;
    pos.z = z;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float twinkle = sin(uTime * 4.0 + aRandom * 100.0) * 0.5 + 0.5; // Faster twinkle
    gl_PointSize = aSize * (500.0 / -mvPosition.z) * (0.8 + twinkle * 0.4);
    vColor = aColor;
  }
`;

export const galaxyFragmentShader = `
  varying vec3 vColor;
  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float glow = exp(-ll * 4.0);
    gl_FragColor = vec4(vColor, glow);
  }
`;

// --- BLACK HOLE DISK ---
export const diskVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const diskFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center) * 2.0;
    float ring = smoothstep(0.4, 0.5, dist) * smoothstep(1.0, 0.8, dist);
    float angle = atan(center.y, center.x);
    // FASTER SPIRAL
    float spiral = sin(angle * 10.0 + uTime * 4.0 - dist * 10.0);
    vec3 color = vec3(1.0, 0.6, 0.1);
    float alpha = ring * (0.5 + 0.5 * spiral);
    gl_FragColor = vec4(color * 2.0, alpha);
  }
`;

// --- SHOCKWAVE ---
export const shockwaveVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const shockwaveFragmentShader = `
  uniform float uTime;
  uniform float uProgress; 
  varying vec2 vUv;
  void main() {
    float trigger = 0.22; 
    float range = 0.2;
    float waveT = (uProgress - trigger) / range;
    if (waveT < 0.0 || waveT > 1.0) discard;
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float radius = waveT * 0.8;
    float thickness = 0.02;
    float ring = smoothstep(radius, radius + thickness, dist) * smoothstep(radius + thickness * 2.0, radius + thickness, dist);
    vec3 color = vec3(1.0, 0.9, 0.8);
    gl_FragColor = vec4(color, ring * (1.0 - waveT));
  }
`;

// --- WORMHOLE SHADER ---
export const wormholeVertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // FASTER TWIST
    float angle = pos.z * 0.1 + uTime * 1.5;
    float x = pos.x * cos(angle) - pos.y * sin(angle);
    float y = pos.x * sin(angle) + pos.y * cos(angle);
    pos.x = x;
    pos.y = y;
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const wormholeFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  uniform float uTime;
  uniform float uIntensity; 
  float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
  void main() {
    // FASTER SPEED (10.0 -> 20.0)
    float speed = uTime * 20.0;
    float stripes = sin(vUv.y * 100.0 + speed) + cos(vUv.x * 20.0);
    float line = smoothstep(0.8, 0.9, stripes);
    float noise = rand(vUv * 10.0 + vec2(0.0, uTime * 10.0));
    float fire = smoothstep(0.4, 0.8, noise * sin(vUv.y * 10.0 + uTime * 4.0));
    vec3 darkBase = vec3(0.1, 0.0, 0.2);
    vec3 neonCyan = vec3(0.0, 1.0, 1.0);
    vec3 electricFire = vec3(1.0, 0.4, 0.0); 
    vec3 color = mix(darkBase, neonCyan, line * 0.5);
    color += electricFire * fire; 
    float alpha = uIntensity * (0.2 + line * 0.5 + fire * 0.8);
    gl_FragColor = vec4(color, alpha); 
  }
`;