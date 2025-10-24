import React from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, UploadIcon, KeyboardIcon, EnterFullscreenIcon, ExitFullscreenIcon } from './icons';

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    trackName: string;
    visualizerName: string;
    onUploadClick: () => void;
    onToggleHotkeys: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    trackName,
    visualizerName,
    onUploadClick,
    onToggleHotkeys,
    isFullscreen,
    onToggleFullscreen
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4 text-cyan-300 gap-y-3 md:gap-x-4">
            {/* Track Info */}
            <div className="w-full md:w-1/3 text-center md:text-left md:order-1">
                <p className="truncate text-sm font-bold" title={trackName}>{trackName}</p>
                <p className="text-xs text-cyan-500 truncate" title={visualizerName}>{visualizerName}</p>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-4 w-full md:w-1/3 justify-center order-first md:order-2">
                <button onClick={onPrev} className="p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200" aria-label="Previous Visualizer">
                    <PrevIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button onClick={onPlayPause} className="p-2 md:p-3 bg-cyan-500 text-black rounded-full shadow-lg shadow-cyan-500/50 hover:scale-110 transition-transform duration-200" aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <PauseIcon className="w-7 h-7 md:w-8 md:h-8" /> : <PlayIcon className="w-7 h-7 md:w-8 md:h-8" />}
                </button>
                <button onClick={onNext} className="p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200" aria-label="Next Visualizer">
                    <NextIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
            
            {/* Utility Controls */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-end items-center gap-4 md:gap-2 md:order-3">
                 <button onClick={onToggleFullscreen} className="p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200" aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                    {isFullscreen ? <ExitFullscreenIcon className="w-5 h-5 md:w-6 md:h-6" /> : <EnterFullscreenIcon className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <button onClick={onToggleHotkeys} className="p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200" aria-label="Show Hotkeys">
                    <KeyboardIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button onClick={onUploadClick} className="p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200" aria-label="Upload Music">
                    <UploadIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );
};