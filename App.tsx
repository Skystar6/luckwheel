import React, { useState, useEffect } from 'react';
import Wheel from './components/Wheel';
import Sidebar from './components/Sidebar';
import WinnerModal from './components/WinnerModal';
import Intro from './components/Intro';
import { Menu, Maximize2 } from 'lucide-react';
import { TickSoundType, WinSoundType, initAudio } from './utils/audio';

const DEFAULT_ITEMS = [
  "Ali", "Beatriz", "Charles", "Diya", "Eric", 
  "Fatima", "Gabriel", "Hanna", "Ivan", "Julia"
];

function App() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [winners, setWinners] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  // Settings
  const [settings, setSettings] = useState({
    duration: 20, // Default to 20 seconds for dramatic effect
    tickSound: 'mechanical' as TickSoundType,
    winSound: 'success' as WinSoundType,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Responsive: Close sidebar on mobile initially
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSpinStart = () => {
    if (items.length === 0 || isSpinning) return;
    initAudio(); // Wake up audio context just in case, though Intro handles it
    setIsSpinning(true);
    setCurrentWinner(null);
  };

  const handleSpinEnd = (winner: string) => {
    setIsSpinning(false);
    setCurrentWinner(winner);
    // Add to winners list immediately
    setWinners(prev => [winner, ...prev]);
  };

  const handleCloseModal = () => {
    setCurrentWinner(null);
  };

  const handleRemoveAndClose = () => {
    if (currentWinner) {
      setItems(prev => prev.filter(i => i !== currentWinner));
    }
    setCurrentWinner(null);
  };

  const handleClearWinners = () => {
    // 1. Identify winners that are currently missing from the items list (meaning they were removed)
    const currentItemsSet = new Set(items);
    // Use Set to avoid adding duplicates if the winner appears multiple times in history
    const uniqueWinners = [...new Set(winners)];
    
    const winnersToRestore = uniqueWinners.filter(w => !currentItemsSet.has(w));

    // 2. Add them back to the items list
    if (winnersToRestore.length > 0) {
      setItems(prev => [...prev, ...winnersToRestore]);
    }

    // 3. Clear the winners list
    setWinners([]);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden relative font-sans">
      
      {/* Intro Overlay */}
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}

      {/* Main Content Area (Wheel) */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
        {/* Header / Toolbar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
             <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
               {/* Updated Title: Lucky Wheel (Title Case) with Rainbow Animation */}
               <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-pan drop-shadow-sm">
                 Lucky Wheel
               </span>
            </div>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <button className="p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg" title="Toggle Fullscreen" onClick={() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }}>
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Wheel Container */}
        <div 
          className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 relative"
        >
          {/* Wheel Canvas */}
          <div className="w-full max-w-[85vh] aspect-square relative drop-shadow-2xl">
             <Wheel 
               items={items}
               isSpinning={isSpinning}
               onSpinStart={handleSpinStart}
               onSpinEnd={handleSpinEnd}
               spinDuration={settings.duration}
               tickSoundId={settings.tickSound}
               winSoundId={settings.winSound}
             />
          </div>
           
           {!isSpinning && !currentWinner && (
             <div className="absolute bottom-8 flex flex-col items-center animate-in fade-in duration-700">
               <div className="text-slate-400 text-sm font-medium animate-pulse hidden md:block bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800 mb-2">
                 Press Ctrl+Enter to Spin
               </div>
               <div className="text-slate-600 text-[10px] font-medium">
                 Created by Erhan Suar (with Gemini 3 Pro)
               </div>
             </div>
           )}

        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed md:relative top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none'
        }`}
      >
        <Sidebar 
          items={items} 
          setItems={setItems}
          winners={winners}
          onClearWinners={handleClearWinners}
          settings={settings}
          setSettings={setSettings}
          isSpinning={isSpinning}
          handleSpin={handleSpinStart}
        />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Winner Modal */}
      <WinnerModal 
        winner={currentWinner} 
        onClose={handleCloseModal}
        onRemoveAndClose={handleRemoveAndClose}
      />
    </div>
  );
}

export default App;