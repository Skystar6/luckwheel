import React, { useState } from 'react';
import { Settings, Users, Trophy, Shuffle, SortAsc, Volume2, Music, Play, RotateCcw } from 'lucide-react';
import { TickSoundType, WinSoundType, playTickSound, playWinSound } from '../utils/audio';

interface SidebarProps {
  items: string[];
  setItems: (items: string[]) => void;
  winners: string[];
  onClearWinners: () => void;
  settings: {
    duration: number;
    tickSound: TickSoundType;
    winSound: WinSoundType;
  };
  setSettings: (settings: any) => void;
  isSpinning: boolean;
  handleSpin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  setItems, 
  winners, 
  onClearWinners,
  settings, 
  setSettings,
  isSpinning,
  handleSpin
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'results' | 'settings'>('entries');
  const [inputText, setInputText] = useState(items.join('\n'));

  // Update items when textarea changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    // Filter empty lines
    const newItems = text.split('\n').filter(line => line.trim() !== '');
    setItems(newItems);
  };

  const shuffleItems = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setInputText(shuffled.join('\n'));
  };

  const sortItems = () => {
    const sorted = [...items].sort((a, b) => a.localeCompare(b));
    setItems(sorted);
    setInputText(sorted.join('\n'));
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700 w-full md:w-96 shadow-2xl z-20">
      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-900/50">
        <button 
          onClick={() => setActiveTab('entries')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'entries' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Users size={16} /> Entries <span className="bg-slate-700 text-xs py-0.5 px-2 rounded-full text-slate-300">{items.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'results' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Trophy size={16} /> Results <span className="bg-slate-700 text-xs py-0.5 px-2 rounded-full text-slate-300">{winners.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-4 transition-colors ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-800">
        
        {activeTab === 'entries' && (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-3">
              <button onClick={shuffleItems} className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-600 shadow-sm" title="Shuffle">
                <Shuffle size={14} /> Shuffle
              </button>
              <button onClick={sortItems} className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-600 shadow-sm" title="Sort">
                <SortAsc size={14} /> Sort
              </button>
            </div>
            
            <textarea
              className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium text-sm leading-relaxed shadow-inner"
              value={inputText}
              onChange={handleTextChange}
              placeholder="Enter names here..."
              spellCheck={false}
            />
             <p className="text-xs text-slate-500 mt-2 text-center">Enter one name per line</p>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            {winners.length > 0 && (
              <button 
                type="button"
                onClick={onClearWinners}
                className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-bold py-3 rounded-lg border border-red-900/50 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Winners
              </button>
            )}

            {winners.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">
                <p>No winners yet.</p>
                <p className="text-xs mt-2">Spin the wheel to get started!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {winners.map((winner, idx) => (
                  <li key={idx} className="bg-slate-700/50 p-3 rounded-lg flex items-center gap-3 border border-slate-600 animate-[fadeIn_0.3s_ease-out]">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                      {winners.length - idx}
                    </span>
                    <span className="font-medium text-slate-200">{winner}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* Duration */}
            <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">Spin Duration (Seconds)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  value={settings.duration}
                  onChange={(e) => setSettings({...settings, duration: Number(e.target.value)})}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-blue-400 font-mono font-bold w-10 text-right">{settings.duration}s</span>
              </div>
            </div>

            {/* Tick Sound */}
            <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                <Volume2 size={16} className="text-slate-400"/> Spin Sound
              </label>
              <div className="flex gap-2">
                <select 
                  value={settings.tickSound}
                  onChange={(e) => {
                      const newSound = e.target.value as TickSoundType;
                      setSettings({...settings, tickSound: newSound});
                  }}
                  className="flex-1 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="soft">Soft Blip</option>
                  <option value="mechanical">Mechanical Click</option>
                  <option value="crisp">Crisp Tick</option>
                  <option value="pop">Pop</option>
                  <option value="game">Retro Game</option>
                </select>
                <button 
                  onClick={() => playTickSound(settings.tickSound)}
                  className="p-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors border border-slate-500"
                  title="Preview Sound"
                >
                  <Play size={20} />
                </button>
              </div>
            </div>

            {/* Win Sound */}
            <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                <Music size={16} className="text-slate-400"/> Winner Sound
              </label>
              <div className="flex gap-2">
                <select 
                  value={settings.winSound}
                  onChange={(e) => {
                      const newSound = e.target.value as WinSoundType;
                      setSettings({...settings, winSound: newSound});
                  }}
                  className="flex-1 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="fanfare">Fanfare</option>
                  <option value="success">Success Chime</option>
                  <option value="magic">Magic Sparkle</option>
                  <option value="arcade">Arcade Win</option>
                  <option value="piano">Piano Chord</option>
                </select>
                <button 
                  onClick={() => playWinSound(settings.winSound)}
                  className="p-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors border border-slate-500"
                  title="Preview Sound"
                >
                  <Play size={20} />
                </button>
              </div>
            </div>
            
             <div className="pt-4 border-t border-slate-700 mt-auto">
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">About</h3>
                <p className="text-xs text-slate-400">
                  This app runs entirely in your browser. No data is sent to any server.
                </p>
            </div>
          </div>
        )}

      </div>
      
      {/* Mobile Spin Button */}
      <div className="p-4 border-t border-slate-700 bg-slate-900 md:hidden">
         <button
            onClick={handleSpin}
            disabled={isSpinning || items.length === 0}
            className={`w-full py-4 rounded-xl font-black text-xl tracking-wider shadow-lg transform transition-all active:scale-95 ${
              isSpinning || items.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20'
            }`}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
      </div>
    </div>
  );
};

export default Sidebar;