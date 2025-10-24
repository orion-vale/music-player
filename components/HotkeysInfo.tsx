import React from 'react';
import { CloseIcon } from './icons';

interface HotkeysInfoProps {
    onClose: () => void;
}

const HotkeyItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
    <div className="flex justify-between items-center py-2 border-b border-cyan-900/50">
        <span className="text-cyan-400">{description}</span>
        <div className="flex gap-1">
            {keys.map(key => (
                 <kbd key={key} className="px-2 py-1 text-sm font-semibold text-cyan-200 bg-cyan-900/50 border border-cyan-800 rounded-md">
                    {key}
                </kbd>
            ))}
        </div>
    </div>
);

export const HotkeysInfo: React.FC<HotkeysInfoProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-gray-900/70 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-md m-4 p-6 text-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-cyan-300 mb-4 tracking-wider">HOTKEYS</h2>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 text-cyan-400 hover:text-cyan-200" aria-label="Close hotkeys info">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="space-y-2">
                    <HotkeyItem keys={['Space']} description="Play / Pause" />
                    <HotkeyItem keys={['←']} description="Seek Backward 5s" />
                    <HotkeyItem keys={['→']} description="Seek Forward 5s" />
                    <HotkeyItem keys={['B']} description="Previous Visualizer" />
                    <HotkeyItem keys={['N']} description="Next Visualizer" />
                    <HotkeyItem keys={['U']} description="Upload Music" />
                    <HotkeyItem keys={['F']} description="Toggle Fullscreen" />
                    <HotkeyItem keys={['H']} description="Toggle this panel" />
                </div>
            </div>
        </div>
    );
};