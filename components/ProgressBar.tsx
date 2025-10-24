import React from 'react';

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
    
    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 pt-2">
            <span className="text-xs text-cyan-400 w-10 text-center">{formatTime(currentTime)}</span>
            <div className="w-full bg-cyan-900/50 rounded-full h-1.5 group">
                <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    value={currentTime}
                    onChange={onSeek}
                    className="w-full h-1.5 bg-transparent appearance-none cursor-pointer"
                    style={{'--progress-percentage': `${progressPercentage}%`} as React.CSSProperties}
                />
                 <style>{`
                    input[type=range] {
                        -webkit-appearance: none;
                        width: 100%;
                        background: transparent;
                    }

                    input[type=range]:focus {
                        outline: none;
                    }

                    input[type=range]::-webkit-slider-runnable-track {
                        width: 100%;
                        height: 6px;
                        cursor: pointer;
                        background: linear-gradient(to right, #22d3ee var(--progress-percentage), #164e63 var(--progress-percentage));
                        border-radius: 9999px;
                    }

                    input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 14px;
                        width: 14px;
                        border-radius: 50%;
                        background: #ecfeff;
                        cursor: pointer;
                        margin-top: -4px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    
                    input[type=range]:hover::-webkit-slider-thumb {
                        opacity: 1;
                    }

                    input[type=range]::-moz-range-track {
                        width: 100%;
                        height: 6px;
                        cursor: pointer;
                        background: linear-gradient(to right, #22d3ee var(--progress-percentage), #164e63 var(--progress-percentage));
                        border-radius: 9999px;
                    }

                    input[type=range]::-moz-range-thumb {
                        height: 14px;
                        width: 14px;
                        border-radius: 50%;
                        background: #ecfeff;
                        cursor: pointer;
                        border: none;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    
                    input[type=range]:hover::-moz-range-thumb {
                        opacity: 1;
                    }
                `}</style>
            </div>
            <span className="text-xs text-cyan-600 w-10 text-center">{formatTime(duration)}</span>
        </div>
    );
};