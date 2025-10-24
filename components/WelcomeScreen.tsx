import React from 'react';
import { UploadIcon } from './icons';

interface WelcomeScreenProps {
    onUploadClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUploadClick }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-10">
            <button 
                onClick={onUploadClick} 
                className="group flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400/80 hover:bg-cyan-900/20 transition-all duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Upload audio file"
            >
                <UploadIcon className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-500/60 group-hover:text-cyan-400 transition-colors duration-300 mb-4" />
                <span className="text-xl sm:text-2xl font-bold text-cyan-400/80 group-hover:text-cyan-300 tracking-wider transition-colors duration-300">
                    Click to Upload Audio
                </span>
            </button>
        </div>
    );
};
