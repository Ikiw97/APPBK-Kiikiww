import React, { useState, useEffect, useRef } from 'react';
import { getAllSiswaData } from '@/lib/siswaStorage';
import { SiswaAbsensi, DAFTAR_KELAS_SMP, DAFTAR_KELAS_SMA, DAFTAR_KELAS_SMK } from '@/lib/absensiTypes';
import { ChevronLeft, RotateCcw, Play, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentWheelProps {
    onBack: () => void;
    schoolMode?: 'smp' | 'sma_smk';
}

export default function StudentWheel({ onBack, schoolMode = 'smp' }: StudentWheelProps) {
    const [allStudents, setAllStudents] = useState<Record<string, SiswaAbsensi[]>>({});
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [currentStudents, setCurrentStudents] = useState<SiswaAbsensi[]>([]);

    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<SiswaAbsensi | null>(null);
    const [rotation, setRotation] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load students on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await getAllSiswaData();
            setAllStudents(data);

            // Determine which class list to show based on schoolMode
            let standardClasses: string[] = [];

            if (schoolMode === 'sma_smk') {
                // Combine SMA and SMK classes
                standardClasses = [...DAFTAR_KELAS_SMA, ...DAFTAR_KELAS_SMK];
            } else {
                // Default to SMP (also covers undefined case)
                standardClasses = DAFTAR_KELAS_SMP;
            }

            // Helper to get numeric value for Roman numerals for sorting
            const getRomanValue = (roman: string) => {
                const map: Record<string, number> = { 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 };
                return map[roman] || 0;
            };

            const sortClasses = (a: string, b: string) => {
                const [romanA, suffixA] = a.split('-');
                const [romanB, suffixB] = b.split('-');

                const valA = getRomanValue(romanA);
                const valB = getRomanValue(romanB);

                if (valA !== valB) return valA - valB;

                // If roman parts are equal, sort by suffix (numeric)
                return parseInt(suffixA || '0') - parseInt(suffixB || '0');
            };

            const allClasses = Array.from(new Set([
                ...standardClasses,
                ...Object.keys(data)
            ])).sort(sortClasses);

            // Just in case, let's strictly filter the displayed list to match the mode if we want to be very precise?
            // The user said "jangan tampilkan kelas 10..". If the user is in SMP mode, they shouldn't see X-1.
            // So I should actually filter the final `availableClasses` to only include those appropriate for the level.

            const isSmpClass = (cls: string) => cls.startsWith('VII') || cls.startsWith('VIII') || cls.startsWith('IX');
            const isSmaClass = (cls: string) => cls.startsWith('X') || cls.startsWith('XI') || cls.startsWith('XII');

            const filteredClasses = allClasses.filter(cls => {
                if (schoolMode === 'smp') return isSmpClass(cls);
                if (schoolMode === 'sma_smk') return isSmaClass(cls);
                // Fallback: show everything if no mode specified (shouldn't happen with correct props)
                return isSmpClass(cls);
            });

            setAvailableClasses(filteredClasses);

            if (filteredClasses.length > 0) {
                setSelectedClass(filteredClasses[0]);
            }
        };
        loadData();
    }, [schoolMode]);

    // Update current students when class changes
    useEffect(() => {
        if (selectedClass && allStudents[selectedClass]) {
            setCurrentStudents(allStudents[selectedClass]);
            setWinner(null);
            setRotation(0);
        }
    }, [selectedClass, allStudents]);

    // Draw wheel
    useEffect(() => {
        drawWheel();
    }, [currentStudents, rotation]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas || currentStudents.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        ctx.clearRect(0, 0, width, height);

        const numSegments = currentStudents.length;
        const anglePerSegment = (2 * Math.PI) / numSegments;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DDA0DD', '#F0E68C', '#87CEFA'];

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * anglePerSegment;
            const endAngle = (i + 1) * anglePerSegment;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.save();
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(currentStudents[i].nama.split(' ')[0], radius - 20, 5); // Just first name to save space
            ctx.restore();
        }

        ctx.restore();

        // Pointer
        ctx.beginPath();
        ctx.moveTo(centerX + radius - 10, centerY);
        ctx.lineTo(centerX + radius + 20, centerY - 15);
        ctx.lineTo(centerX + radius + 20, centerY + 15);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();
    };

    const spin = () => {
        if (isSpinning || currentStudents.length === 0) return;

        setIsSpinning(true);
        setWinner(null);

        // Random spin duration between 3-5 seconds
        const duration = 3000 + Math.random() * 2000;
        // Random final rotation (at least 5 full spins)
        const finalRotation = rotation + (10 * Math.PI) + (Math.random() * 2 * Math.PI);

        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;

            if (elapsed < duration) {
                // Easing function (easeOutCubic)
                const t = elapsed / duration;
                const easeOut = 1 - Math.pow(1 - t, 3);

                const currentRot = rotation + (finalRotation - rotation) * easeOut;
                setRotation(currentRot);
                requestAnimationFrame(animate);
            } else {
                setRotation(finalRotation % (2 * Math.PI));
                setIsSpinning(false);
                determineWinner(finalRotation);
            }
        };

        requestAnimationFrame(animate);
    };

    const determineWinner = (finalRot: number) => {
        const numSegments = currentStudents.length;
        const anglePerSegment = (2 * Math.PI) / numSegments;

        // Normalize rotation
        let normalizedRot = finalRot % (2 * Math.PI);

        // The pointer is at 0 degrees (right side) in our drawing setup relative to the canvas
        // But since we rotate the whole wheel, we need to calculate which segment aligns with pointer
        // Actually, simpler logic:
        // We draw pointer at 0 rad (3 o'clock).
        // The wheel rotates clockwise.
        // So the segment at 0 rad is determined by:
        // angleAtPointer = (2PI - normalizedRot) % 2PI

        const angleAtPointer = (2 * Math.PI - normalizedRot) % (2 * Math.PI);
        const winningIndex = Math.floor(angleAtPointer / anglePerSegment);

        const winStudent = currentStudents[winningIndex];
        setWinner(winStudent);

        // Confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                        >
                            <ChevronLeft size={20} />
                            Kembali ke Menu
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">🎡 Wheel of Names</h1>
                        <p className="text-gray-600">Pilih siswa secara acak untuk pertanyaan atau aktivitas</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-sm font-medium text-gray-700 pl-2">Pilih Kelas:</span>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={isSpinning}
                            className="border-none bg-gray-50 py-2 pl-3 pr-8 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                            {availableClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Wheel Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                        {currentStudents.length > 0 ? (
                            <div className="relative">
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={400}
                                    className="max-w-full h-auto"
                                />

                                {/* Center Button / Hub */}
                                <div
                                    onClick={spin}
                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-primary-500 z-10 cursor-pointer transition-transform ${isSpinning ? 'scale-95' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    <Play size={24} className={`text-primary-600 ml-1 ${isSpinning ? 'opacity-50' : ''}`} fill="currentColor" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500">
                                <p>Tidak ada data siswa di kelas ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Controls & Result Section */}
                    <div className="space-y-6">
                        {/* Winner Display */}
                        <div className={`transition-all duration-500 transform ${winner ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
                                {winner && (
                                    <>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Trophy size={100} className="text-yellow-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider text-sm">Terpilih</p>
                                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{winner.nama}</h2>
                                            <p className="text-gray-600 font-medium">NIS: {winner.nis}</p>
                                        </div>
                                    </>
                                )}
                                {!winner && (
                                    <div className="py-8">
                                        <p className="text-gray-400 font-medium">Klik tombol Spin untuk memutar!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student List Preview */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Daftar Siswa ({currentStudents.length})</h3>
                                <span className="text-xs text-gray-500">Kelas {selectedClass}</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {currentStudents.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {currentStudents.map((s, idx) => (
                                            <div key={idx} className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-700 truncate border border-transparent hover:border-gray-200 transition-colors">
                                                {idx + 1}. {s.nama}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-8 text-gray-400 text-sm">Belum ada data siswa</p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={spin}
                            disabled={isSpinning || currentStudents.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all flex items-center justify-center gap-2 ${isSpinning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:shadow-primary-500/30 hover:-translate-y-1 active:translate-y-0'
                                }`}
                        >
                            <RotateCcw size={20} className={isSpinning ? 'animate-spin' : ''} />
                            {isSpinning ? 'Sedang Memutar...' : 'Putar Roda!'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
