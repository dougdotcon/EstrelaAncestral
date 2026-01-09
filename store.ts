import { create } from 'zustand';

export enum Phase {
  ANCESTRAL = 0,   // The Pop III Star
  COLLAPSE = 1,    // Supernova / DNA Compression
  HORIZON = 2,     // Black Hole
  TRAVERSAL = 3,   // Wormhole / Tunneling (New)
  GENESIS = 4      // Child Universe
}

interface GenesisState {
  progress: number; // 0.0 to 1.0
  phase: Phase;
  isPlaying: boolean;
  
  // Actions
  setProgress: (value: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  restart: () => void;
}

export const useGenesisStore = create<GenesisState>((set) => ({
  progress: 0,
  phase: Phase.ANCESTRAL,
  isPlaying: true,
  
  setProgress: (value) => set((state) => {
    // Loop logic handled in Scene, here we just clamp for safety or allow wrap if passed manually
    // But for the slider we clamp.
    let p = value;
    if (p > 1.0) p = 0; // Loop reset
    if (p < 0) p = 0;

    // Adjusted Timeline for slower pacing
    let currentPhase = Phase.ANCESTRAL;
    
    if (p <= 0.20) currentPhase = Phase.ANCESTRAL;
    else if (p <= 0.40) currentPhase = Phase.COLLAPSE;
    else if (p <= 0.60) currentPhase = Phase.HORIZON;
    else if (p <= 0.75) currentPhase = Phase.TRAVERSAL;
    else currentPhase = Phase.GENESIS;

    return { 
      progress: p, 
      phase: currentPhase,
    };
  }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  restart: () => set({ progress: 0, isPlaying: true })
}));