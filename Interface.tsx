import React, { useEffect, useState } from 'react';
import { useGenesisStore, Phase } from './store';
import { motion, AnimatePresence } from 'framer-motion';

const PhaseContent = {
  [Phase.ANCESTRAL]: {
    title: "PHASE I: THE ANCESTRAL STAR",
    subtitle: "POPULATION III // 13.6 BYA",
    description: "In the beginning, massive stars forged purely of hydrogen and helium ruled the cosmos. Their cores contained the raw laws of physics, stable and untainted.",
    code: `function initUniverse() {\n  const gravity = 6.674e-11;\n  const c = 299792458;\n  return new Star({ mass: 1000 });\n}`
  },
  [Phase.COLLAPSE]: {
    title: "PHASE II: DATA COMPRESSION",
    subtitle: "SUPERNOVA EVENT // ENCODING...",
    description: "The collapse is not destruction. It is archiving. The star's matter and information are being compressed into a cosmic DNA strand, ready for transmission.",
    code: `// Compressing geometry...\nstruct DNA {\n  vec3 origin;\n  float entropy;\n};\n\nvoid collapse(Star s) {\n  archive(s.data);\n}`
  },
  [Phase.HORIZON]: {
    title: "PHASE III: THE HORIZON",
    subtitle: "SINGULARITY // TRANSMISSION",
    description: "The event horizon acts as the interface. We are approaching the boundary where space-time inverts.",
    code: `const BLACK_HOLE_ROUTER = {\n  input: "Universe_A",\n  output: "Universe_B",\n  bandwidth: "Infinite"\n};`
  },
  [Phase.TRAVERSAL]: {
    title: "PHASE IV: TRAVERSAL",
    subtitle: "WORMHOLE TUNNELING",
    description: "Passing through the Einstein-Rosen bridge. The laws of physics are being rewritten. Information is traveling faster than light relative to the outside observer.",
    code: `while (inside_tunnel) {\n  physics.rewrite({ \n    c: 'variable', \n    dimensions: 11 \n  });\n}`
  },
  [Phase.GENESIS]: {
    title: "PHASE V: GENESIS",
    subtitle: "CHILD UNIVERSE // INHERITANCE",
    description: "We have emerged on the other side. A new cosmos expands around us, inheriting the mutated constants of its parent. Life begins anew.",
    code: `class ChildUniverse extends Ancestor {\n  constructor() {\n    super();\n    this.fineStructureConstant += 0.007;\n  }\n}`
  }
};

const CodeBlock = ({ code }: { code: string }) => (
  <div style={{
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.8rem',
    color: '#00ffff',
    background: 'rgba(0, 20, 40, 0.6)',
    padding: '1rem',
    borderLeft: '2px solid #00ffff',
    whiteSpace: 'pre-wrap',
    marginTop: '1rem',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
  }}>
    {code}
  </div>
);

const HUD = () => {
  const phase = useGenesisStore(state => state.phase);
  const content = PhaseContent[phase];

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      padding: '4rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* HUD Header */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: '10px', height: '10px', background: '#00ffff', borderRadius: '50%' }} />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)' }}>
          SYS.GENESIS.INTERFACE_V1.0
        </span>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '500px' }}
        >
          <h4 style={{ margin: 0, color: '#00ffff', fontSize: '1rem', letterSpacing: '4px' }}>
            {content.subtitle}
          </h4>
          <h1 style={{ 
            fontSize: '4rem', 
            margin: '0.5rem 0', 
            fontWeight: 700,
            textTransform: 'uppercase',
            lineHeight: 0.9
          }}>
            {content.title.split(': ')[1]}
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
            {content.description}
          </p>
          
          <CodeBlock code={content.code} />
        </motion.div>
      </AnimatePresence>

      {/* Decorative Grid Lines */}
      <div style={{
        position: 'absolute', top: '50%', right: '2rem',
        width: '1px', height: '200px', background: 'linear-gradient(to bottom, transparent, #00ffff, transparent)',
        transform: 'translateY(-50%)'
      }} />
    </div>
  );
};

const Timeline = () => {
  const progress = useGenesisStore(state => state.progress);
  const setProgress = useGenesisStore(state => state.setProgress);
  const isPlaying = useGenesisStore(state => state.isPlaying);
  const hasFinished = useGenesisStore(state => state.hasFinished);
  const togglePlay = useGenesisStore(state => state.togglePlay);
  const restart = useGenesisStore(state => state.restart);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If we are finished, slider drags restart logic
    if (hasFinished) restart();
    setProgress(parseFloat(e.target.value));
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '3rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 10,
      pointerEvents: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={hasFinished ? restart : togglePlay}
          style={{
            background: 'none',
            border: '1px solid #00ffff',
            color: '#00ffff',
            padding: '0.5rem 1rem',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            width: '80px',
            boxShadow: hasFinished ? '0 0 15px #00ffff' : 'none'
          }}
        >
          {hasFinished ? 'RESTART' : (isPlaying ? 'PAUSE' : 'PLAY')}
        </button>
        <div style={{ flex: 1, height: '1px', background: 'rgba(0, 255, 255, 0.3)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#00ffff' }}>
        <span>ANCESTRAL</span>
        <span>COLLAPSE</span>
        <span>HORIZON</span>
        <span>TRAVERSAL</span>
        <span>GENESIS</span>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.001"
        value={progress}
        onChange={handleSliderChange}
        style={{
          width: '100%',
          cursor: 'pointer',
          accentColor: '#00ffff'
        }}
      />
      
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
        {hasFinished ? 'SIMULATION COMPLETE. AWAITING INPUT.' : (isPlaying ? 'AUTOMATIC SEQUENCE ENGAGED' : 'MANUAL OVERRIDE ACTIVE')}
      </div>
    </div>
  );
};

export const Interface = () => {
  return (
    <>
      <HUD />
      <Timeline />
    </>
  );
};