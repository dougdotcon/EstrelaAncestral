import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenesisStore } from './store';

export const Intro = () => {
  const showIntro = useGenesisStore(state => state.showIntro);
  const setShowIntro = useGenesisStore(state => state.setShowIntro);
  const setIsPlaying = useGenesisStore(state => state.setIsPlaying);

  const handleStart = () => {
    setShowIntro(false);
    // Slight delay to allow fade out before starting movement
    setTimeout(() => setIsPlaying(true), 1000);
  };

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5 } }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#000',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: '"Rajdhani", sans-serif'
          }}
        >
          {/* SKIP BUTTON */}
          <button
            onClick={handleStart}
            style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              background: 'transparent',
              border: '1px solid #ffffff',
              color: '#ffffff',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              zIndex: 1001,
              fontFamily: 'JetBrains Mono',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              opacity: 0.5
            }}
          >
            Skip Intro
          </button>

          {/* CRAWL CONTAINER */}
          <div
            style={{
              perspective: '450px', // Strong perspective to make it look like it's going BACK
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ top: '110%', opacity: 1 }}
              animate={{ top: '-250%' }} // Move way further up/back
              transition={{ 
                duration: 55, // Slower, more majestic
                ease: 'linear',
                delay: 1 
              }}
              onAnimationComplete={handleStart}
              style={{
                position: 'absolute',
                width: '60%', // Narrow column like the movies
                maxWidth: '700px',
                color: '#ffffff', // White text
                fontSize: '2.5rem',
                fontWeight: 700,
                textAlign: 'justify',
                lineHeight: '1.5',
                transform: 'rotateX(25deg)', // Tilted back
                transformOrigin: '50% 100%', // Pivot from bottom
                textShadow: '0 0 5px rgba(255, 255, 255, 0.4)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h1 style={{ fontSize: '5rem', margin: 0, letterSpacing: '0.1em', lineHeight: 1 }}>GENESIS</h1>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.4em', marginTop: '1rem' }}>THE ANCESTRAL INTERFACE</h2>
              </div>

              <p style={{ marginBottom: '3rem' }}>
                Before our Big Bang, there was another Universe. A realm of perfect physics, governed by stars of unimaginable mass.
              </p>
              <p style={{ marginBottom: '3rem' }}>
                One of these stars, the Ancestor, reached the end of its life. Yet, it did not merely die; it compressed reality itself.
              </p>
              <p style={{ marginBottom: '3rem' }}>
                In its final moments, the star archived the Laws of Physics and the genetic code of its universe into a single point of infinite density: a Black Hole.
              </p>
              <p style={{ marginBottom: '3rem' }}>
                We are not at the "beginning." We are caught within the event horizon of this collapse. Our universe shares 99% of the "Source Code" from the one that came before.
              </p>
              <p style={{ marginBottom: '3rem' }}>
                The simulation you are about to witness is a reconstruction of this event. The moment destruction became genesis. The moment the Old became the New.
              </p>
            </motion.div>
            
            {/* Fade at top to hide text leaving into "space" */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '30%',
                background: 'linear-gradient(to bottom, #000000 10%, transparent)',
                zIndex: 10,
                pointerEvents: 'none'
            }} />
            
            {/* Fade at bottom to smooth entry */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, width: '100%', height: '10%',
                background: 'linear-gradient(to top, #000000 20%, transparent)',
                zIndex: 10,
                pointerEvents: 'none'
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};