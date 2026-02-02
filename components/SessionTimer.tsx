import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, RotateCcw, Clock, Volume2, VolumeX, Edit2, Check } from 'lucide-react';

interface SessionTimerProps {
    onBack: () => void;
}

export default function SessionTimer({ onBack }: SessionTimerProps) {
    const [duration, setDuration] = useState<number>(10 * 60); // Default 10 minutes in seconds
    const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'counseling' | 'discussion'>('counseling');
    const [sessionTitle, setSessionTitle] = useState('Sesi Konseling');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Presets in minutes
    const presets = [5, 10, 15, 30, 45, 60];

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple bell sound
        audioRef.current.volume = 0.5;

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        setIsActive(false);
        if (!isMuted && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const setPresetKey = (minutes: number) => {
        setIsActive(false);
        setDuration(minutes * 60);
        setTimeLeft(minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        return ((duration - timeLeft) / duration) * 100;
    };

    // Theme colors based on mode
    const theme = mode === 'counseling'
        ? {
            bg: 'bg-teal-50',
            primary: 'text-teal-600',
            secondary: 'text-teal-500',
            button: 'bg-teal-600 hover:bg-teal-700',
            ring: 'stroke-teal-500',
            badge: 'bg-teal-100 text-teal-700'
        }
        : {
            bg: 'bg-orange-50',
            primary: 'text-orange-600',
            secondary: 'text-orange-500',
            button: 'bg-orange-600 hover:bg-orange-700',
            ring: 'stroke-orange-500',
            badge: 'bg-orange-100 text-orange-700'
        };

    // Circular progress calculations
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (calculateProgress() / 100) * circumference;

    return (
        <div className={`px-6 md:px-8 py-8 min-h-screen ${theme.bg} transition-colors duration-500`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
                    >
                        <ChevronLeft size={20} />
                        Kembali
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('counseling')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'counseling' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Konseling
                        </button>
                        <button
                            onClick={() => setMode('discussion')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'discussion' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Diskusi
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-12 flex flex-col items-center">

                        {/* Title Display/Edit */}
                        <div className="mb-8 flex items-center justify-center gap-2">
                            {isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={sessionTitle}
                                        onChange={(e) => setSessionTitle(e.target.value)}
                                        className="text-2xl font-bold text-center border-b-2 border-gray-300 focus:border-primary-500 focus:outline-none px-2 py-1"
                                        autoFocus
                                        onBlur={() => setIsEditingTitle(false)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                    />
                                    <button onClick={() => setIsEditingTitle(false)} className="text-green-600 p-1 hover:bg-green-50 rounded-full">
                                        <Check size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsEditingTitle(true)}>
                                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-gray-600 transition-colors">{sessionTitle}</h2>
                                    <Edit2 size={16} className="text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            )}
                        </div>

                        {/* Timer Display */}
                        <div className="relative mb-12">
                            {/* SVG Circle Progress */}
                            <svg className="transform -rotate-90 w-72 h-72 md:w-80 md:h-80">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-gray-100"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className={`${theme.ring} transition-all duration-1000 ease-linear`}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Digital Clock in Center */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className={`text-6xl md:text-7xl font-mono font-bold tracking-tighter ${isActive ? theme.primary : 'text-gray-700'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                                <div className={`mt-2 text-sm font-medium uppercase tracking-widest ${isActive ? 'animate-pulse text-gray-500' : 'text-gray-400'}`}>
                                    {isActive ? 'Berjalan' : timeLeft === 0 ? 'Selesai' : 'Jeda'}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-10">
                            <button
                                onClick={toggleTimer}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-110 active:scale-95 ${isActive ? 'bg-red-500 hover:bg-red-600' : theme.button}`}
                            >
                                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={resetTimer}
                                className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="Reset"
                            >
                                <RotateCcw size={24} />
                            </button>

                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                            </button>
                        </div>

                        {/* Presets */}
                        <div className="w-full max-w-2xl">
                            <p className="text-center text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">Atur Waktu</p>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {presets.map(min => (
                                    <button
                                        key={min}
                                        onClick={() => setPresetKey(min)}
                                        className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${duration === min * 60
                                                ? `${theme.badge} border-current`
                                                : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                                            }`}
                                    >
                                        {min} Menit
                                    </button>
                                ))}

                                {/* Custom Input */}
                                <div className="col-span-3 md:col-span-2 relative">
                                    <div className="relative flex items-center">
                                        <input
                                            type="number"
                                            placeholder="Custom"
                                            min="1"
                                            max="120"
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 0) setPresetKey(val);
                                            }}
                                            className="w-full py-3 pl-4 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-600 font-semibold text-sm focus:border-primary-500 focus:bg-white transition-all outline-none"
                                        />
                                        <span className="absolute right-4 text-gray-400 text-sm font-medium pointer-events-none">Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
