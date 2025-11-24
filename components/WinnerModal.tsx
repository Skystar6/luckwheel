import React, { useEffect } from 'react';
import { Trophy, UserMinus, RotateCw } from 'lucide-react';

interface WinnerModalProps {
  winner: string | null;
  onClose: () => void; // Keeps the winner
  onRemoveAndClose: () => void; // Removes the winner
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onRemoveAndClose }) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-800 border border-slate-600 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl transform transition-all scale-100 animate-[bounceIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full mb-6 shadow-lg shadow-orange-500/30">
             <Trophy size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">We have a winner!</h2>
          
          <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300 py-6 my-2 break-words drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {winner}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all hover:scale-105 border border-slate-600"
            >
              <RotateCw size={20} />
              <span>Keep & Continue</span>
            </button>
            
            <button 
              onClick={onRemoveAndClose}
              className="flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
            >
              <UserMinus size={20} />
              <span>Remove & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;