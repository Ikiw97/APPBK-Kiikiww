import React, { useState } from 'react';
import { Hammer, Disc, ArrowRight, Users, Clock, Sparkles, Sprout } from 'lucide-react'; // Disc as a wheel icon substitute
import StudentWheel from './StudentWheel';
import GroupGenerator from './GroupGenerator';
import SessionTimer from './SessionTimer';
import MotivationGenerator from './MotivationGenerator';
import HopeTree from './HopeTree';

interface AlatBantuViewProps {
    onBack?: () => void;
    schoolMode?: 'smp' | 'sma_smk';
}

export default function AlatBantuView({ onBack, schoolMode }: AlatBantuViewProps) {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    if (activeTool === 'wheel') {
        return <StudentWheel onBack={() => setActiveTool(null)} schoolMode={schoolMode} />;
    }

    if (activeTool === 'groups') {
        return <GroupGenerator onBack={() => setActiveTool(null)} schoolMode={schoolMode} />;
    }

    if (activeTool === 'timer') {
        return <SessionTimer onBack={() => setActiveTool(null)} />;
    }

    if (activeTool === 'motivation') {
        return <MotivationGenerator onBack={() => setActiveTool(null)} />;
    }

    if (activeTool === 'tree') {
        return <HopeTree onBack={() => setActiveTool(null)} />;
    }

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Alat Bantu</h1>
                <p className="text-gray-600">Kumpulan alat bantu interaktif untuk kegiatan Bimbingan Konseling</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Student Wheel Card */}
                <div
                    onClick={() => setActiveTool('wheel')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Disc size={100} />
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Disc size={24} className="animate-spin-slow" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Wheel of Names</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Acak nama siswa dari kelas secara adil dan menyenangkan menggunakan roda putar interaktif.
                    </p>

                    <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Buka Alat <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Group Generator Card */}
                <div
                    onClick={() => setActiveTool('groups')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Users size={100} />
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Users size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Group Generator</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Bagi kelas menjadi kelompok-kelompok kecil dengan distribusi gender yang seimbang secara otomatis.
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Buka Alat <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Timer Card */}
                <div
                    onClick={() => setActiveTool('timer')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock size={100} />
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Clock size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Timer & Sesi BK</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Pengatur waktu sesi konseling dan diskusi dengan preset waktu dan notifikasi audio.
                    </p>

                    <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Buka Alat <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Motivation Card */}
                <div
                    onClick={() => setActiveTool('motivation')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Sparkles size={100} />
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Sparkles size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Motivasi & Refleksi</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Kumpulan kata mutiara, pertanyaan refleksi, dan afirmasi positif untuk menutup sesi layanan.
                    </p>

                    <div className="flex items-center text-rose-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Buka Alat <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Hope Tree Card */}
                <div
                    onClick={() => setActiveTool('tree')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Sprout size={100} />
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Sprout size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pohon Harapan</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Tumbuhkan pohon impianmu! Game visualisasi harapan yang tumbuh seiring banyaknya mimpi yang ditulis.
                    </p>

                    <div className="flex items-center text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Buka Alat <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-75 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <Hammer size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Coming Soon</h3>
                    <p className="text-gray-500 text-sm">Alat bantu lainnya segera hadir</p>
                </div>
            </div>
        </div>
    );
}
