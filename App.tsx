import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerControls } from './components/PlayerControls';
import { ProgressBar } from './components/ProgressBar';
import { visualizers } from './visualizers';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HotkeysInfo } from './components/HotkeysInfo';

const App: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [trackName, setTrackName] = useState<string>('');
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [visualizerIndex, setVisualizerIndex] = useState<number>(0);
    const [showHotkeys, setShowHotkeys] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>(0);

    const setupAudioContext = useCallback(() => {
        if (!audioRef.current || audioContextRef.current) return;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
    }, []);

    const resizeCanvas = useCallback(() => {
        if (canvasRef.current && containerRef.current) {
            canvasRef.current.width = containerRef.current.clientWidth;
            canvasRef.current.height = containerRef.current.clientHeight;
            const currentVisualizer = visualizers[visualizerIndex];
            if (currentVisualizer.init && canvasRef.current.getContext('2d')) {
                currentVisualizer.init(canvasRef.current.getContext('2d')!);
            }
        }
    }, [visualizerIndex]);

    const visualize = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        const draw = () => {
            analyserRef.current?.getByteFrequencyData(dataArray);
            visualizers[visualizerIndex].draw(ctx, dataArray);
            animationFrameRef.current = requestAnimationFrame(draw);
        };
        draw();
    }, [visualizerIndex]);
    
    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    useEffect(() => {
        if (isPlaying) {
            if (!audioContextRef.current) setupAudioContext();
            audioContextRef.current?.resume();
            visualize();
        } else {
            cancelAnimationFrame(animationFrameRef.current);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isPlaying, visualize, setupAudioContext]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && audioRef.current) {
            const url = URL.createObjectURL(file);
            audioRef.current.src = url;
            setTrackName(file.name.replace(/\.[^/.]+$/, ""));
            audioRef.current.onloadedmetadata = () => {
                setDuration(audioRef.current?.duration || 0);
                setCurrentTime(0);
                audioRef.current?.play();
                setIsPlaying(true);
            };
        }
    };

    const togglePlayPause = useCallback(() => {
        if (!audioRef.current?.src) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const changeVisualizer = useCallback((direction: number) => {
        setVisualizerIndex(prev => {
            const newIndex = (prev + direction + visualizers.length) % visualizers.length;
            const newViz = visualizers[newIndex];
            const ctx = canvasRef.current?.getContext('2d');
            if (newViz.init && ctx) newViz.init(ctx);
            return newIndex;
        });
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const seekAudio = useCallback((amount: number) => {
        if (audioRef.current) {
            const newTime = audioRef.current.currentTime + amount;
            audioRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
        }
    }, [duration]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => setCurrentTime(audio?.currentTime || 0);
        const handleEnded = () => setIsPlaying(false);
        audio?.addEventListener('timeupdate', handleTimeUpdate);
        audio?.addEventListener('ended', handleEnded);
        return () => {
            audio?.removeEventListener('timeupdate', handleTimeUpdate);
            audio?.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key) {
                case ' ': e.preventDefault(); togglePlayPause(); break;
                case 'ArrowRight': seekAudio(5); break;
                case 'ArrowLeft': seekAudio(-5); break;
                case 'n': case 'N': changeVisualizer(1); break;
                case 'b': case 'B': changeVisualizer(-1); break;
                case 'u': case 'U': fileInputRef.current?.click(); break;
                case 'f': case 'F': toggleFullscreen(); break;
                case 'h': case 'H': setShowHotkeys(p => !p); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, changeVisualizer, toggleFullscreen, seekAudio]);

    return (
        <div className="bg-black text-gray-200 h-full relative font-mono overflow-hidden">
            
            <div ref={containerRef} className="absolute inset-0">
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                {!trackName && <WelcomeScreen onUploadClick={() => fileInputRef.current?.click()} />}
            </div>

            {showHotkeys && <HotkeysInfo onClose={() => setShowHotkeys(false)} />}

            <footer className={`absolute bottom-0 left-0 right-0 w-full max-w-5xl mx-auto p-2 md:p-4 z-10 transition-transform duration-500 ${isFullscreen ? 'transform translate-y-full' : 'transform translate-y-0'}`}>
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
                    <ProgressBar 
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={(e) => { if(audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
                    />
                    <PlayerControls
                        isPlaying={isPlaying}
                        onPlayPause={togglePlayPause}
                        onNext={() => changeVisualizer(1)}
                        onPrev={() => changeVisualizer(-1)}
                        trackName={trackName || 'No track loaded'}
                        visualizerName={`${visualizerIndex + 1}/${visualizers.length}: ${visualizers[visualizerIndex].name}`}
                        onUploadClick={() => fileInputRef.current?.click()}
                        onToggleHotkeys={() => setShowHotkeys(p => !p)}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                    />
                </div>
            </footer>
            <audio ref={audioRef} crossOrigin="anonymous" />
            <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        </div>
    );
};

export default App;