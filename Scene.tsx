import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGenesisStore } from './store';
import { 
  starVertexShader, starFragmentShader, 
  particleVertexShader, particleFragmentShader,
  diskVertexShader, diskFragmentShader,
  shockwaveVertexShader, shockwaveFragmentShader,
  wormholeVertexShader, wormholeFragmentShader,
  electricityVertexShader, electricityFragmentShader,
  galaxyVertexShader, galaxyFragmentShader
} from './shaders';

const PARTICLE_COUNT = 30000;
// DRAMATICALLY SLOWER: Allows time to feel the scale
const ANIMATION_SPEED = 0.008; 

// --- HELPER COMPONENTS ---

const AutoPilot = () => {
  const isPlaying = useGenesisStore(state => state.isPlaying);
  const progress = useGenesisStore(state => state.progress);
  const setProgress = useGenesisStore(state => state.setProgress);

  useFrame((state, delta) => {
    if (isPlaying) {
      let next = progress + (delta * ANIMATION_SPEED);
      // LOOP ENABLED: Reset to 0 when reaching 1.0
      if (next >= 1.0) {
        next = 0;
      } 
      setProgress(next);
    }
  });

  return null;
};

// --- PROCEDURAL GALAXY ---
const ProceduralGalaxy = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const progress = useGenesisStore(state => state.progress);
    
    const count = 40000;
    
    const { positions, colors, sizes, randomness } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        const rnd = new Float32Array(count);
        
        const coreColor = new THREE.Color('#ffcc00'); 
        const armColor = new THREE.Color('#0088ff');  
        const dustColor = new THREE.Color('#ff0066'); 
        
        for(let i=0; i<count; i++) {
            const i3 = i*3;
            const branches = 3;
            const radius = Math.random() * 80; // Larger Galaxy
            const spinAngle = radius * 0.5;
            const branchAngle = (i % branches) * ((Math.PI * 2) / branches);
            
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (15 - radius*0.1);
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (15 - radius*0.1);
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (15 - radius*0.1);

            pos[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            pos[i3+1] = randomY * 0.8; 
            pos[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = coreColor.clone().lerp(armColor, radius / 80);
            if (Math.random() > 0.8) mixedColor.lerp(dustColor, 0.5);

            col[i3] = mixedColor.r;
            col[i3+1] = mixedColor.g;
            col[i3+2] = mixedColor.b;
            
            sz[i] = Math.random();
            rnd[i] = Math.random();
        }
        
        return { positions: pos, colors: col, sizes: sz, randomness: rnd };
    }, []);

    useFrame((state) => {
        if(!pointsRef.current || !materialRef.current) return;
        const visibility = smoothstep(0.75, 0.85, progress);
        pointsRef.current.visible = visibility > 0.01;
        materialRef.current.opacity = visibility;
        // Faster spin for more energy
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 1.5;
    });

    return (
        <points ref={pointsRef} position={[0, -20, -400]} rotation={[0.5, 0, 0]}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-aRandom" count={count} array={randomness} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial 
                ref={materialRef}
                vertexShader={galaxyVertexShader}
                fragmentShader={galaxyFragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{ uTime: { value: 0 } }}
            />
        </points>
    )
}

// --- TUNNEL SPARKS ---
const TunnelSparks = () => {
    const meshRef = useRef<THREE.Points>(null);
    const progress = useGenesisStore(state => state.progress);
    
    const { positions } = useMemo(() => {
        const count = 1500;
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 4 + Math.random() * 6; 
            pos[i*3] = r * Math.cos(theta);
            pos[i*3+1] = r * Math.sin(theta);
            pos[i*3+2] = (Math.random() - 0.5) * 300; // Longer spread
        }
        return { positions: pos };
    }, []);

    useFrame((state) => {
        if(!meshRef.current) return;
        const active = progress > 0.55 && progress < 0.80;
        meshRef.current.visible = active;
        
        if(active) {
            const speed = 4.0; // Faster sparks for speed sensation
            const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<1500; i++) {
                positions[i*3+2] += speed;
                if(positions[i*3+2] > 50) positions[i*3+2] = -250; 
            }
            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={1500} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#ffcc88" size={0.15} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </points>
    )
}

// --- ELECTRIC ARCS ---
const ElectricArcs = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const progress = useGenesisStore(state => state.progress);

    useFrame((state) => {
        if(matRef.current) {
            // Faster electricity
            matRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 2.0;
            const intensity = smoothstep(0.55, 0.65, progress) * (1.0 - smoothstep(0.75, 0.80, progress));
            matRef.current.uniforms.uIntensity.value = intensity;
        }
        if(meshRef.current) {
            meshRef.current.visible = progress > 0.5 && progress < 0.85;
            meshRef.current.rotation.z += 0.2; 
        }
    });

    return (
        <mesh ref={meshRef} rotation={[Math.PI/2, 0, 0]} position={[0,0,-80]}>
            <cylinderGeometry args={[5, 5, 300, 32, 1, true]} />
            <shaderMaterial 
                ref={matRef}
                vertexShader={electricityVertexShader}
                fragmentShader={electricityFragmentShader}
                transparent
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                uniforms={{ uTime: { value: 0 }, uIntensity: { value: 0 } }}
            />
        </mesh>
    )
}

// --- WORMHOLE ---
const Wormhole = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useGenesisStore(state => state.progress);

  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        const intensity = smoothstep(0.55, 0.60, progress) * (1.0 - smoothstep(0.78, 0.82, progress));
        materialRef.current.uniforms.uIntensity.value = intensity;
    }
    if (meshRef.current) {
        meshRef.current.visible = progress > 0.50 && progress < 0.85;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -80]}>
      {/* Longer tunnel */}
      <cylinderGeometry args={[8, 8, 400, 64, 100, true]} /> 
      <shaderMaterial
        ref={materialRef}
        vertexShader={wormholeVertexShader}
        fragmentShader={wormholeFragmentShader}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ 
          uTime: { value: 0 },
          uIntensity: { value: 0 }
        }}
      />
    </mesh>
  );
};

const BackgroundStars = () => {
  const points = useMemo(() => {
    const p = new Float32Array(5000 * 3);
    for(let i=0; i<5000; i++) {
      const r = 100 + Math.random() * 200; // Wider field
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i*3] = r * Math.sin(phi) * Math.cos(theta);
      p[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      p[i*3+2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={5000} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#88ccff" transparent opacity={0.4} sizeAttenuation={true} />
    </points>
  )
}

const ShockwaveEvent = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useGenesisStore(state => state.progress);
  const { camera } = useThree();

  useFrame(() => {
    if (materialRef.current) {
        materialRef.current.uniforms.uProgress.value = progress;
    }
    if (meshRef.current) {
        meshRef.current.lookAt(camera.position);
        if (progress > 0.15 && progress < 0.35) {
            meshRef.current.visible = true;
            meshRef.current.scale.setScalar(35.0); 
        } else {
            meshRef.current.visible = false;
        }
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={shockwaveVertexShader}
        fragmentShader={shockwaveFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uProgress: { value: 0 } }}
      />
    </mesh>
  )
}

const ParticlesSystem = () => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useGenesisStore(state => state.progress);

  const { positions, dnaTargets, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const dna = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Ancestral Halo - Wider to allow camera to fly through
      const r = 8.0 + Math.random() * 10.0; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3+1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.6; 
      pos[i3+2] = r * Math.cos(phi);

      const strand = i % 2 === 0 ? 0 : Math.PI;
      const t = (i / PARTICLE_COUNT) * 12 * Math.PI; 
      const radius = 2.5;
      dna[i3] = (i / PARTICLE_COUNT - 0.5) * 35.0; 
      dna[i3+1] = Math.sin(t + strand) * radius;   
      dna[i3+2] = Math.cos(t + strand) * radius;   
      dna[i3] += (Math.random() - 0.5) * 1.0;
      dna[i3+1] += (Math.random() - 0.5) * 1.0;
      dna[i3+2] += (Math.random() - 0.5) * 1.0;

      sz[i] = Math.random();
    }
    return { positions: pos, dnaTargets: dna, sizes: sz };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.1
      );
    }
    if (meshRef.current && progress < 0.2) {
        meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetDNA" count={PARTICLE_COUNT} array={dnaTargets} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 }
        }}
      />
    </points>
  );
};

const AncestralStarCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useGenesisStore(state => state.progress);
  
  useFrame((state) => {
    if (materialRef.current) {
      // Faster internal turmoil for pressure feeling
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 1.2;
      materialRef.current.uniforms.uProgress.value = progress;
    }
    if (meshRef.current) {
       meshRef.current.rotation.y -= 0.005;
       meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3.5, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        transparent={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 }, uProgress: { value: 0 } }}
      />
    </mesh>
  );
};

const BlackHole = () => {
  const groupRef = useRef<THREE.Group>(null);
  const diskMatRef = useRef<THREE.ShaderMaterial>(null);
  const progress = useGenesisStore(state => state.progress);

  useFrame((state) => {
    if (diskMatRef.current) {
      diskMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    
    if (groupRef.current) {
        const fadeIn = THREE.MathUtils.smoothstep(progress, 0.15, 0.25);
        const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 0.60, 0.65);
        const scale = fadeIn * fadeOut;
        
        groupRef.current.scale.setScalar(scale);
        groupRef.current.visible = scale > 0.01;
        // Faster rotation for pressure
        groupRef.current.rotation.x = progress * 0.5 + state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[2.2, 5, 64]} />
        <shaderMaterial 
          ref={diskMatRef}
          vertexShader={diskVertexShader}
          fragmentShader={diskFragmentShader}
          side={THREE.DoubleSide}
          transparent
          blending={THREE.AdditiveBlending}
          uniforms={{ uTime: { value: 0 } }}
        />
      </mesh>
    </group>
  );
}

const CameraController = () => {
  const { camera } = useThree();
  const progress = useGenesisStore(state => state.progress);

  useFrame((state) => {
    let targetZ = 30; // Start further back
    let targetY = 0;
    
    // PRESSURE SYSTEM: Base shake intensity based on phase
    let baseShake = 0.02; // Always a little movement (living universe)

    if (progress <= 0.20) {
       // Ancestral: 30 -> 22
       targetZ = 30 - progress * 40; 
       baseShake = 0.05 + smoothstep(0.15, 0.20, progress) * 0.2; // Rising tension
    } 
    else if (progress <= 0.40) {
       // Collapse: 22 -> 15 (Pushing in)
       targetZ = 22 - (progress - 0.20) * 35; 
       targetY = (progress - 0.20) * 5;
       baseShake = 0.3 + (1.0 - smoothstep(0.20, 0.40, progress)) * 0.1; // High Shake
    } 
    else if (progress <= 0.60) {
       // Horizon: Hovering near event horizon
       const t = (progress - 0.40) / 0.20;
       targetZ = 15 - t * 10; // Ends at 5
       targetY = 1.0 - t * 1.0; 
       baseShake = 0.2 + t * 0.5; // Increasing gravity shake
    } 
    else if (progress <= 0.75) { 
       // Wormhole: 5 -> -200 (Huge Travel)
       const t = (progress - 0.60) / 0.15;
       targetZ = 5.0 - t * 205.0; 
       baseShake = 0.5 + Math.sin(t * 10) * 0.2; // Turbulence
    } 
    else { 
       // Genesis: -200 -> -600 (Deep galaxy flythrough)
       const t = (progress - 0.75) / 0.25;
       const easeOut = 1.0 - Math.pow(1.0 - t, 3.0);
       targetZ = -200.0 - easeOut * 400.0; 
       targetY = Math.sin(t * 2.0) * 20.0; 
       baseShake = 0.05 + (1.0-t) * 0.2; // Cooling down
    }

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03); // Slower follow
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    
    // Apply Pressure (Shake)
    const time = state.clock.getElapsedTime();
    const shakeX = Math.sin(time * 15.0) * baseShake * 0.3; // High freq
    const shakeY = Math.cos(time * 13.0) * baseShake * 0.3;
    
    camera.position.x += shakeX;
    camera.position.y += shakeY;
    
    // Smooth return to center on X
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);

    if (progress > 0.8) {
        camera.lookAt(0, -20, -500);
    } else {
        camera.lookAt(0, 0, targetZ - 50); 
    }
  });

  return null;
}

function smoothstep(min: number, max: number, value: number) {
  var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export const Scene = () => {
  return (
    <>
      <AutoPilot />
      <CameraController />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffffff" distance={500} />
      
      <BackgroundStars />
      <ShockwaveEvent />
      <Wormhole />
      <ElectricArcs />
      <TunnelSparks />

      <group>
        <AncestralStarCore />
        <ParticlesSystem />
        <BlackHole />
        <ProceduralGalaxy />
      </group>
    </>
  );
};