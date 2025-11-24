import React, { useState, useEffect } from 'react';
import { initAudio, playIntroSound } from '../utils/audio';
import { Play } from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'start' | 'animating' | 'finished'>('start');

  const handleStart = () => {
    // 1. Wake up audio instantly
    initAudio();
    
    // 2. Play intro sound
    playIntroSound();

    // 3. Start animation
    setPhase('animating');
  };

  useEffect(() => {
    if (phase === 'animating') {
      // Sequence timing based on CSS animations
      // Animation total duration is around 2.5s for wheel, then logo fade
      
      // Step 2: Fade out everything after animations done
      const timer = setTimeout(() => {
        setPhase('finished');
        // Small buffer to let fade out finish visually
        setTimeout(onComplete, 800); 
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (phase === 'finished') return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 transition-opacity duration-1000 ${phase === 'animating' && 'animate-[introFadeOut_0.8s_ease-out_3s_forwards]'}`}>
      
      {phase === 'start' && (
        <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-500">
           
           {/* High Quality Motion Blur Wheel Graphic */}
           <div className="relative group cursor-pointer transition-transform duration-500 hover:scale-105" onClick={handleStart}>
             {/* Background Glow */}
             <div className="absolute inset-0 bg-blue-500/30 blur-[60px] rounded-full group-hover:bg-purple-500/40 transition-colors duration-500"></div>
             
             {/* Main Wheel Container */}
             <div className="relative w-72 h-72 rounded-full border-8 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
                
                {/* Spinning Blur Layer (Conic Gradient) */}
                <div className="absolute inset-[-20%] bg-[conic-gradient(from_0deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7,#ef4444)] animate-[spin_0.3s_linear_infinite] blur-sm opacity-90"></div>
                
                {/* Inner Overlay for depth/shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>

                {/* Center Hub */}
                <div className="absolute z-10 flex items-center justify-center">
                    {/* Metal Ring */}
                    <div className="w-24 h-24 bg-slate-200 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.5)] flex items-center justify-center border-4 border-slate-300">
                        {/* Inner Cap */}
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-white/80 rounded-full blur-[1px]"></div>
                        </div>
                    </div>
                </div>
             </div>
           </div>
           
           <div className="text-center space-y-2">
             <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight drop-shadow-sm">
                Lucky Wheel
             </h1>
             <p className="text-slate-500 font-medium">Ready to spin?</p>
           </div>
           
           <button 
             onClick={handleStart}
             className="group relative px-10 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full font-bold text-lg text-white transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
           >
             <span className="flex items-center gap-3">
               Start Game <Play size={20} fill="currentColor" />
             </span>
           </button>
        </div>
      )}

      {phase === 'animating' && (
        <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
           {/* Spinning Wheel Element for Transition */}
           <div className="absolute intro-wheel-anim opacity-0">
              <svg width="400" height="400" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#333" stroke="#fff" strokeWidth="2" />
                <path d="M50 50 L50 2 A48 48 0 0 1 98 50 Z" fill="#FF00FF" />
                <path d="M50 50 L98 50 A48 48 0 0 1 50 98 Z" fill="#00FFFF" />
                <path d="M50 50 L50 98 A48 48 0 0 1 2 50 Z" fill="#FFFF00" />
                <path d="M50 50 L2 50 A48 48 0 0 1 50 2 Z" fill="#39FF14" />
                <circle cx="50" cy="50" r="10" fill="white" />
              </svg>
           </div>

           {/* Logo Transformation */}
           <div className="absolute animate-[fadeIn_0.5s_ease-out_2s_forwards] opacity-0 flex flex-col items-center">
              <span className="font-black text-6xl md:text-8xl tracking-tighter bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-pan drop-shadow-2xl scale-150">
                 Lucky Wheel
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default Intro;