// Simple synthesizer using Web Audio API to avoid external asset dependencies
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Initialize/Resume audio context on user interaction to prevent delay
// We play a silent buffer to physically wake up the audio hardware immediately
export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(e => console.error("Audio resume failed", e));
  }
  
  // Play a silent note to force the audio engine to wake up instantly
  // This solves the "first spin silence" issue on many mobile devices/browsers
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 440;
  gain.gain.value = 0.0001; // Effectively silent
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(0.1);
};

// --- TICK SOUNDS ---

export type TickSoundType = 'soft' | 'mechanical' | 'crisp' | 'pop' | 'game';

const tickPresets: Record<TickSoundType, (ctx: AudioContext, now: number) => void> = {
  soft: (ctx, now) => {
    // A very short, soft sine blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  },
  mechanical: (ctx, now) => {
    // Filtered noise/triangle for a plastic click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  },
  crisp: (ctx, now) => {
    // High pitched short click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  },
  pop: (ctx, now) => {
    // Water drop / mouth pop style
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  },
  game: (ctx, now) => {
    // Retro 8-bit blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.05);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
};

export const playTickSound = (type: TickSoundType = 'soft') => {
  try {
    const ctx = getAudioContext();
    // Note: We don't call resume here to avoid blocking the main thread during high frequency ticks.
    // We rely on initAudio() being called at start.
    const preset = tickPresets[type] || tickPresets['soft'];
    preset(ctx, ctx.currentTime);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// --- INTRO SOUND ---
export const playIntroSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // 1. THE DING (Crystal clear chime)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now); // High C (C6) - clean and bright
        
        // Slight harmonic for "sparkle"
        const harm = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(2093, now); // Octave up
        harmGain.gain.setValueAtTime(0.05, now);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        harm.connect(harmGain);
        harmGain.connect(ctx.destination);
        harm.start(now);
        harm.stop(now + 0.5);

        // Main Bell Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02); // Quick attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // Long clean tail
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3);

        // 2. THE SWOOSH (Wind effect)
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        // Sweep up frequency
        noiseFilter.frequency.setValueAtTime(200, now);
        noiseFilter.frequency.linearRampToValueAtTime(1200, now + 1.5);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.5); // Subtle volume
        noiseGain.gain.linearRampToValueAtTime(0, now + 2.0);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

    } catch(e) {
        console.error("Intro sound failed", e);
    }
}

// --- WIN SOUNDS ---

export type WinSoundType = 'fanfare' | 'success' | 'magic' | 'arcade' | 'piano';

const winPresets: Record<WinSoundType, (ctx: AudioContext, now: number) => void> = {
  fanfare: (ctx, now) => {
    // Major Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  },
  success: (ctx, now) => {
    // Simple ascending triad, cleaner
    const notes = [440, 554.37, 659.25]; // A Major
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  },
  magic: (ctx, now) => {
    // Fast high pitched random sparkling
    for (let i = 0; i < 10; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1000 + Math.random() * 1000;
        const start = now + i * 0.05;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
    }
  },
  arcade: (ctx, now) => {
    // Retro power up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    osc.frequency.linearRampToValueAtTime(1760, now + 0.6);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  },
  piano: (ctx, now) => {
    // Soft chords simulation (FM synthesis simple)
    const notes = [261.63, 329.63, 392.00, 523.25]; // C Major Chord
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // Softer than saw
        osc.frequency.value = freq;
        
        // Add a slight detune for richness
        const detune = ctx.createOscillator();
        detune.frequency.value = 2; // Vibrato rate
        const detuneGain = ctx.createGain();
        detuneGain.gain.value = 5; // Vibrato depth
        detune.connect(detuneGain);
        detuneGain.connect(osc.frequency);
        detune.start(now);
        detune.stop(now + 1.5);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
    });
  }
};

export const playWinSound = (type: WinSoundType = 'fanfare') => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const preset = winPresets[type] || winPresets['fanfare'];
    preset(ctx, ctx.currentTime);
  } catch (e) {
    console.error("Win audio failed", e);
  }
};