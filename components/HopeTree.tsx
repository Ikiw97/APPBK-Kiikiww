import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Trash2, Sprout, Wand2, Heart, X } from 'lucide-react';

interface HopeTreeProps {
    onBack: () => void;
}

interface Hope {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    rotation: number;
}

// Negative keywords to detect
const NEGATIVE_KEYWORDS = [
    // Bad words
    'bodoh', 'tolol', 'goblok', 'bego', 'idiot', 'anjing', 'bangsat', 'brengsek', 'sialan', 'kampret',
    // Hopelessness / self-harm related
    'mati', 'bunuh', 'bunuh diri', 'menyerah', 'putus asa', 'tidak berguna', 'gagal', 'benci diri',
    'ingin mati', 'tak berguna', 'percuma', 'sia-sia', 'benci hidup', 'capek hidup', 'lelah hidup',
    // Tiredness / exhaustion
    'lelah', 'cape', 'capek', 'capai', 'kelelahan', 'kewalahan', 'saya lelah', 'saya cape', 'saya capek',
    'sangat lelah', 'terlalu lelah', 'ga kuat', 'gak kuat', 'tidak kuat', 'tak sanggup',
    // Laziness
    'malas', 'males', 'ogah', 'tidak mau', 'gak mau', 'ga mau', 'enggan', 'segan', 'mager',
    'malas belajar', 'malas sekolah', 'malas kuliah', 'malas kerja',
    // Lack of self-confidence
    'tidak bisa', 'gak bisa', 'ga bisa', 'tidak mampu', 'gak mampu', 'tidak sanggup',
    'tidak percaya diri', 'minder', 'rendah diri', 'malu', 'takut', 'khawatir', 'cemas',
    'saya jelek', 'saya buruk', 'saya payah', 'saya lemah', 'saya bodoh',
    'tidak pintar', 'gak pintar', 'tidak cukup', 'tidak layak', 'tidak pantas',
    'bukan siapa-siapa', 'tidak berarti', 'tidak penting'
];

// Encouraging messages for when negative input is detected
const ENCOURAGING_MESSAGES = [
    // General encouragement
    "Kamu tidak sendiri. Ada banyak orang yang peduli padamu. 💙",
    "Setiap hari adalah kesempatan baru. Jangan menyerah!",
    "Kamu lebih kuat dari yang kamu kira. Percayalah pada dirimu sendiri.",
    "Badai pasti berlalu. Tetap semangat, ya!",
    "Kamu berharga dan layak mendapatkan kebahagiaan.",
    "Satu langkah kecil hari ini bisa membawa perubahan besar besok.",
    "Jangan biarkan kegelapan menghalangi cahaya di dalam dirimu.",
    "Setiap masalah pasti ada jalan keluarnya. Kamu pasti bisa!",
    "Kamu adalah pribadi yang unik dan istimewa.",
    "Bicaralah dengan seseorang yang kamu percaya. Berbagi bisa meringankan beban.",
    // For tiredness
    "Istirahat sejenak itu penting. Tapi jangan lupa bangun dan lanjutkan perjuanganmu! 💪",
    "Lelah itu wajar, tapi ingat tujuanmu yang indah di depan sana.",
    "Setiap langkah kecil, walau lelah, membawamu lebih dekat ke impianmu.",
    "Tubuh boleh lelah, tapi semangat harus tetap menyala!",
    "Istirahat dulu, lalu bangkit lagi dengan lebih kuat.",
    // For laziness
    "Mulai dengan satu hal kecil. Langkah pertama adalah yang terpenting!",
    "Kemalasan adalah musuh terbesar mimpi. Ayo, kamu bisa melawannya!",
    "Hari ini mungkin berat, tapi bayangkan betapa bangganya dirimu nanti.",
    "Disiplin mengalahkan motivasi. Mulai sekarang, walau sedikit!",
    "Sukses dimulai dari kemauan untuk mencoba. Ayo mulai!",
    // For self-confidence
    "Kamu memiliki potensi luar biasa yang belum sepenuhnya kamu sadari.",
    "Percaya pada dirimu sendiri. Kamu lebih hebat dari yang kamu pikirkan!",
    "Kesalahan adalah bagian dari proses belajar. Jangan takut mencoba!",
    "Setiap orang hebat pernah merasa ragu. Yang penting adalah terus maju.",
    "Kamu layak mendapatkan hal-hal baik dalam hidupmu.",
    "Jangan bandingkan dirimu dengan orang lain. Kamu unik dan istimewa!",
    "Keberanian bukan berarti tidak takut, tapi tetap maju walau takut.",
    "Kamu sudah sangat hebat sampai di titik ini. Teruslah berjuang!"
];

export default function HopeTree({ onBack }: HopeTreeProps) {
    const [hopes, setHopes] = useState<Hope[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [stage, setStage] = useState(1); // 1: Seed, 2: Sprout, 3: Sapling, 4: Tree
    const [showConfetti, setShowConfetti] = useState(false);
    const [showMotivationPopup, setShowMotivationPopup] = useState(false);
    const [motivationMessage, setMotivationMessage] = useState('');
    const [duplicateWarning, setDuplicateWarning] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Leaf colors
    const colors = ['#4ade80', '#22c55e', '#16a34a', '#86efac', '#15803d'];

    useEffect(() => {
        // Simple grow sound or distinct sound per stage could be added
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'); // Pop sound
    }, []);

    // Determine Stage based on Hope Count
    useEffect(() => {
        let newStage = 1;
        if (hopes.length === 0) newStage = 1;
        else if (hopes.length < 4) newStage = 2;
        else if (hopes.length < 9) newStage = 3;
        else newStage = 4;

        if (newStage > stage) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
        setStage(newStage);
    }, [hopes.length]);

    // Check for negative content
    const containsNegativeContent = (text: string): boolean => {
        const lowerText = text.toLowerCase();
        return NEGATIVE_KEYWORDS.some(keyword => lowerText.includes(keyword));
    };

    // Check for duplicate hopes
    const isDuplicateHope = (text: string): boolean => {
        const normalizedText = text.trim().toLowerCase();
        return hopes.some(hope => hope.text.trim().toLowerCase() === normalizedText);
    };

    const addHope = () => {
        if (!inputValue.trim()) return;

        // Clear any previous warning
        setDuplicateWarning('');

        // Check for negative content
        if (containsNegativeContent(inputValue)) {
            // Show motivational popup instead of adding hope
            const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
            setMotivationMessage(randomMessage);
            setShowMotivationPopup(true);
            setInputValue(''); // Clear input
            return;
        }

        // Check for duplicate hope
        if (isDuplicateHope(inputValue)) {
            setDuplicateWarning('⚠️ Harapan ini sudah ada! Tulis harapan yang berbeda untuk menumbuhkan pohonmu.');
            // Auto-clear warning after 4 seconds
            setTimeout(() => setDuplicateWarning(''), 4000);
            return;
        }

        const newHope: Hope = {
            id: Date.now().toString(),
            text: inputValue,
            // Random position within a constrained area depending on stage
            // We'll calculate display position relative to the tree canopy center
            x: Math.random() * 80 - 40, // -40 to 40 relative spread
            y: Math.random() * 60 - 30, // -30 to 30 relative spread
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 60 - 30
        };

        setHopes([...hopes, newHope]);
        setInputValue('');

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    };

    const resetTree = () => {
        if (confirm('Apakah Anda yakin ingin menebang pohon dan mulai dari awal?')) {
            setHopes([]);
        }
    };

    // Render tree based on stage
    const renderTree = () => {
        switch (stage) {
            case 1: // Seed
                return (
                    <div className="relative flex flex-col items-center justify-end h-64 w-64 transition-all duration-1000">
                        <div className="w-6 h-6 bg-amber-700 rounded-full absolute bottom-2 animate-bounce" />
                        <div className="w-32 h-2 bg-amber-900/30 rounded-full blur-sm absolute bottom-0" />
                    </div>
                );
            case 2: // Sprout
                return (
                    <div className="relative flex flex-col items-center justify-end h-64 w-64 transition-all duration-1000">
                        {/* Stem */}
                        <div className="w-2 h-16 bg-green-600 rounded-full absolute bottom-2 origin-bottom animate-grow" />
                        {/* Leaves */}
                        <div className="absolute bottom-16 -left-2 w-6 h-6 bg-green-500 rounded-tr-3xl rounded-bl-3xl transform -rotate-45" />
                        <div className="absolute bottom-14 -right-2 w-4 h-4 bg-green-400 rounded-tl-3xl rounded-br-3xl transform rotate-45" />
                        <div className="w-32 h-2 bg-amber-900/30 rounded-full blur-sm absolute bottom-0" />
                    </div>
                );
            case 3: // Sapling
                return (
                    <div className="relative flex flex-col items-center justify-end h-80 w-64 transition-all duration-1000">
                        {/* Trunk */}
                        <div className="w-4 h-32 bg-amber-700 rounded-full absolute bottom-2" />
                        {/* Branches placeholder area for leaves */}
                        <div className="absolute bottom-28 w-40 h-40 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="w-40 h-3 bg-amber-900/30 rounded-full blur-sm absolute bottom-0" />

                        {/* Actual rendered hopes as leaves */}
                        <div className="absolute bottom-32 w-0 h-0 flex items-center justify-center">
                            {hopes.map((hope) => (
                                <div
                                    key={hope.id}
                                    style={{
                                        transform: `translate(${hope.x}px, ${hope.y}px) rotate(${hope.rotation}deg)`,
                                        backgroundColor: hope.color
                                    }}
                                    className="absolute w-8 h-8 rounded-tr-3xl rounded-bl-xl shadow-sm cursor-help hover:scale-150 hover:z-50 transition-all group"
                                >
                                    {/* Tooltip */}
                                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white p-2 rounded-lg text-xs font-semibold text-gray-700 shadow-xl border border-gray-100 z-50 text-center pointer-events-none">
                                        "{hope.text}"
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-100"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4: // Big Tree
                return (
                    <div className="relative flex flex-col items-center justify-end h-96 w-96 transition-all duration-1000">
                        {/* Big Trunk */}
                        <div className="w-12 h-48 bg-amber-800 rounded-full absolute bottom-4" />
                        {/* Canopy - CSS Drawing */}
                        <div className="absolute bottom-32 w-64 h-64 bg-green-600 rounded-full opacity-90 scale-100 animate-wiggle-slow" />
                        <div className="absolute bottom-40 -left-16 w-48 h-48 bg-green-500 rounded-full opacity-90" />
                        <div className="absolute bottom-40 -right-16 w-48 h-48 bg-green-500 rounded-full opacity-90" />
                        <div className="absolute bottom-56 w-56 h-56 bg-green-400 rounded-full opacity-90" />

                        {/* Shadow */}
                        <div className="w-56 h-4 bg-amber-900/40 rounded-full blur-md absolute bottom-0" />

                        {/* Leaves Container */}
                        <div className="absolute bottom-48 w-0 h-0 flex items-center justify-center">
                            {hopes.map((hope, idx) => {
                                // Recalculate spread for bigger tree based on index
                                // We can use the stored random values but multiply them for bigger spread
                                const spreadX = hope.x * 2.5;
                                const spreadY = hope.y * 2.5 - 50; // Shift up a bit

                                return (
                                    <div
                                        key={hope.id}
                                        style={{
                                            transform: `translate(${spreadX}px, ${spreadY}px) rotate(${hope.rotation}deg)`,
                                            backgroundColor: hope.color
                                        }}
                                        className="absolute w-10 h-10 rounded-tr-3xl rounded-bl-xl shadow-sm cursor-help hover:scale-125 hover:z-50 transition-all group border border-white/20"
                                    >
                                        {/* Tooltip */}
                                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-lg text-sm font-semibold text-gray-700 shadow-xl border border-gray-100 z-50 text-center pointer-events-none">
                                            "{hope.text}"
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-100"></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 overflow-hidden relative">
            {/* Clouds Background - decorative */}
            <div className="absolute top-20 left-20 w-32 h-12 bg-white/40 rounded-full blur-xl animate-drift-slow" />
            <div className="absolute top-40 right-40 w-48 h-16 bg-white/30 rounded-full blur-xl animate-drift-slower" />

            <div className="max-w-4xl mx-auto relative z-10 w-full h-full flex flex-col">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors mb-4 self-start bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm"
                >
                    <ChevronLeft size={20} />
                    Kembali
                </button>

                <div className="flex-1 flex flex-col items-center justify-between min-h-[600px]">

                    {/* Stats / Stage Indicator */}
                    <div className="text-center mb-20 relative z-20">
                        <h1 className="text-4xl font-bold text-white drop-shadow-md mb-3">🌳 Pohon Harapan</h1>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                            <span className="opacity-75">Status:</span>
                            <span className="font-bold text-yellow-300">
                                {stage === 1 && '🌱 Benih'}
                                {stage === 2 && '🌿 Tunas'}
                                {stage === 3 && '🌳 Pohon Muda'}
                                {stage === 4 && '✨ Pohon Rindang'}
                            </span>
                            <span className="w-1 h-4 bg-white/20 mx-1"></span>
                            <span>{hopes.length} Harapan</span>
                        </div>
                    </div>

                    {/* Tree Display Area */}
                    <div className="flex-1 flex items-end justify-center pb-12 relative w-full">
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="animate-ping w-full h-full absolute inset-0 bg-yellow-400/20 rounded-full" />
                            </div>
                        )}
                        {renderTree()}
                    </div>

                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-t-[50%] scale-150 translate-y-12 blur-sm -z-10" />

                    {/* Duplicate Warning */}
                    {duplicateWarning && (
                        <div className="w-full max-w-lg mb-2 px-4 py-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 text-sm font-medium text-center animate-fadeIn shadow-md">
                            {duplicateWarning}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white flex gap-2 mb-8">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => { setInputValue(e.target.value); setDuplicateWarning(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && addHope()}
                            placeholder="Tulis harapanmu di sini..."
                            className="flex-1 px-4 py-3 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-sky-500 transition-all outline-none placeholder-gray-500 font-medium"
                        />
                        <button
                            onClick={addHope}
                            disabled={!inputValue.trim()}
                            className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
                        >
                            <Send size={24} />
                        </button>
                    </div>

                    {hopes.length > 0 && (
                        <button
                            onClick={resetTree}
                            className="absolute bottom-4 right-4 p-2 text-white/50 hover:text-white hover:bg-red-500/20 rounded-full transition-all"
                            title="Reset Pohon"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Motivational Popup Modal */}
            {showMotivationPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-amber-50 -z-10" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10" />

                        {/* Close Button */}
                        <button
                            onClick={() => setShowMotivationPopup(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                                <Heart size={32} className="text-rose-500" fill="currentColor" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-4">Kami Peduli Padamu 💕</h3>

                            <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                                "{motivationMessage}"
                            </p>

                            <p className="text-sm text-gray-500 mb-6">
                                Harapan positif membantu pohonmu tumbuh lebih subur!
                            </p>

                            <button
                                onClick={() => setShowMotivationPopup(false)}
                                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Saya Mengerti 💪
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes grow {
                    from { transform: scaleY(0); }
                    to { transform: scaleY(1); }
                }
                @keyframes wiggle-slow {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
