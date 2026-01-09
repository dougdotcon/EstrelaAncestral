import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { Scene } from './Scene';
import { Interface } from './Interface';
import * as THREE from 'three';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false }} 
        camera={{ position: [0, 0, 12], fov: 45 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#000005']} />
          
          <Scene />
          
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.15} 
              luminanceSmoothing={0.9} 
              height={300} 
              intensity={0.6} 
            />
            <ChromaticAberration 
               offset={new THREE.Vector2(0.002, 0.002)}
               radialModulation={false}
               modulationOffset={0}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      <Interface />
      
      {/* Loading Overlay (Optional, simple implementation) */}
      <Suspense fallback={
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          INITIALIZING...
        </div>
      }>
      </Suspense>
    </div>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);