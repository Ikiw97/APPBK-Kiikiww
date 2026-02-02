import React from 'react';
import {
    ArrowLeft, Printer,
    BookOpen, Globe, Briefcase, Heart, Plane, Sprout, Palette,
    Cpu, Wrench, TrendingUp,
    BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

interface SMACareerPathResultViewProps {
    result: any;
    onBack: () => void;
}

// Informasi setiap jurusan (Copied from SMACareerPathForm to ensure consistency)
const PATH_INFO: Record<string, {
    label: string;
    fullName: string;
    type: 'SMA' | 'SMK';
    icon: any;
    color: string;
    description: string;
    subjects: string[];
    careers: string[];
}> = {
    sma_ipa: {
        label: 'IPA',
        fullName: 'SMA - IPA (Ilmu Pengetahuan Alam)',
        type: 'SMA',
        icon: BookOpen,
        color: '#3b82f6', // blue
        description: 'Jurusan yang mempelajari ilmu pengetahuan alam seperti Matematika, Fisika, Kimia, dan Biologi. Cocok untuk yang suka sains dan berhitung.',
        subjects: ['Matematika', 'Fisika', 'Kimia', 'Biologi'],
        careers: ['Dokter', 'Insinyur', 'Apoteker', 'Peneliti', 'Ahli Teknologi']
    },
    sma_ips: {
        label: 'IPS',
        fullName: 'SMA - IPS (Ilmu Pengetahuan Sosial)',
        type: 'SMA',
        icon: Globe,
        color: '#10b981', // emerald
        description: 'Jurusan yang mempelajari ilmu sosial seperti Ekonomi, Geografi, Sejarah, dan Sosiologi. Cocok untuk yang tertarik dengan isu sosial dan ekonomi.',
        subjects: ['Ekonomi', 'Geografi', 'Sejarah', 'Sosiologi'],
        careers: ['Pengacara', 'Ekonom', 'Akuntan', 'Diplomat', 'Jurnalis']
    },
    sma_bahasa: {
        label: 'Bahasa',
        fullName: 'SMA - Bahasa dan Budaya',
        type: 'SMA',
        icon: BookOpen,
        color: '#ec4899', // pink
        description: 'Jurusan yang fokus pada bahasa (Indonesia, Inggris, asing) dan sastra. Cocok untuk yang suka membaca, menulis, dan mempelajari budaya.',
        subjects: ['Bahasa Indonesia', 'Bahasa Inggris', 'Sastra', 'Bahasa Asing'],
        careers: ['Penulis', 'Penerjemah', 'Guru Bahasa', 'Jurnalis', 'Diplomat']
    },
    smk_teknologi: {
        label: 'Teknologi & Rekayasa',
        fullName: 'SMK - Teknologi & Rekayasa',
        type: 'SMK',
        icon: Wrench,
        color: '#ef4444', // red
        description: 'Program keahlian yang mempelajari teknik mesin, listrik, otomotif, dan elektronika. Cocok untuk yang suka praktik dan bekerja dengan alat.',
        subjects: ['Teknik Mesin', 'Teknik Listrik', 'Otomotif', 'Elektronika'],
        careers: ['Teknisi', 'Mekanik', 'Operator Mesin', 'QC Industri', 'Ahli Listrik']
    },
    smk_tik: {
        label: 'TIK',
        fullName: 'SMK - Teknologi Informasi & Komunikasi',
        type: 'SMK',
        icon: Cpu,
        color: '#8b5cf6', // violet
        description: 'Program keahlian yang mempelajari pemrograman, jaringan komputer, dan multimedia. Cocok untuk yang suka teknologi digital.',
        subjects: ['Pemrograman', 'Jaringan Komputer', 'Desain Grafis', 'Multimedia'],
        careers: ['Programmer', 'Web Developer', 'IT Support', 'Desainer Grafis', 'Admin Network']
    },
    smk_bisnis: {
        label: 'Bisnis & Manajemen',
        fullName: 'SMK - Bisnis dan Manajemen',
        type: 'SMK',
        icon: TrendingUp,
        color: '#f59e0b', // amber
        description: 'Program keahlian yang mempelajari akuntansi, administrasi, pemasaran, dan manajemen. Cocok untuk yang suka berbisnis dan berorganisasi.',
        subjects: ['Akuntansi', 'Administrasi', 'Pemasaran', 'Manajemen'],
        careers: ['Akuntan', 'Admin', 'Marketing', 'Sales', 'HRD']
    },
    smk_kesehatan: {
        label: 'Kesehatan',
        fullName: 'SMK - Kesehatan dan Pekerjaan Sosial',
        type: 'SMK',
        icon: Heart,
        color: '#06b6d4', // cyan
        description: 'Program keahlian yang mempelajari keperawatan, farmasi, dan kesehatan masyarakat. Cocok untuk yang peduli kesehatan dan suka menolong.',
        subjects: ['Keperawatan', 'Farmasi', 'Kesehatan Masyarakat', 'Anatomi'],
        careers: ['Perawat', 'Asisten Apoteker', 'Lab Kesehatan', 'Terapis', 'Bidan']
    },
    smk_pariwisata: {
        label: 'Pariwisata',
        fullName: 'SMK - Pariwisata',
        type: 'SMK',
        icon: Plane,
        color: '#14b8a6', // teal
        description: 'Program keahlian yang mempelajari perhotelan, kuliner, dan layanan wisata. Cocok untuk yang suka bertemu orang dan layanan.',
        subjects: ['Perhotelan', 'Tata Boga', 'Tour Guide', 'Customer Service'],
        careers: ['Staff Hotel', 'Chef', 'Tour Guide', 'Flight Attendant', 'Event  Organizer']
    },
    smk_agribisnis: {
        label: 'Agrobisnis',
        fullName: 'SMK - Agrobisnis & Agroteknologi',
        type: 'SMK',
        icon: Sprout,
        color: '#84cc16', // lime
        description: 'Program keahlian yang mempelajari pertanian modern, peternakan, dan agrobisnis. Cocok untuk yang suka alam dan bercocok tanam.',
        subjects: ['Pertanian', 'Peternakan', 'Agrobisnis', 'Teknologi Pertanian'],
        careers: ['Petani Modern', 'Peternak', 'Pengusaha Agrobisnis', 'Ahli Pertanian']
    },
    smk_seni: {
        label: 'Seni & Kreatif',
        fullName: 'SMK - Seni dan Industri Kreatif',
        type: 'SMK',
        icon: Palette,
        color: '#f97316', // orange
        description: 'Program keahlian yang mempelajari seni rupa, desain, musik, dan broadcasting. Cocok untuk yang kreatif dan suka berkarya.',
        subjects: ['Desain', 'Seni Rupa', 'Musik', 'Broadcasting', 'Animasi'],
        careers: ['Desainer', 'Seniman', 'Animator', 'Content Creator', 'Fotografer']
    }
};

export default function SMACareerPathResultView({ result, onBack }: SMACareerPathResultViewProps) {
    // Reconstruct score data from flat DB structure
    const scores = {
        sma_ipa: result.sma_ipa_score || 0,
        sma_ips: result.sma_ips_score || 0,
        sma_bahasa: result.sma_bahasa_score || 0,
        smk_teknologi: result.smk_teknologi_score || 0,
        smk_tik: result.smk_tik_score || 0,
        smk_bisnis: result.smk_bisnis_score || 0,
        smk_kesehatan: result.smk_kesehatan_score || 0,
        smk_pariwisata: result.smk_pariwisata_score || 0,
        smk_agribisnis: result.smk_agribisnis_score || 0,
        smk_seni: result.smk_seni_score || 0,
    };

    // Calculate percentages and sort to find top 3
    const pathsWithPercentage = Object.entries(scores).map(([path, score]) => ({
        path,
        score: Number(score),
        percentage: Math.round((Number(score) / 25) * 100)
    }));

    pathsWithPercentage.sort((a, b) => b.score - a.score);
    const topThree = pathsWithPercentage.slice(0, 3);
    const recommendedPath = result.recommended_path || topThree[0].path;
    const topPath = PATH_INFO[recommendedPath] || PATH_INFO['sma_ipa']; // Fallback

    const chartData = topThree.map(item => ({
        name: PATH_INFO[item.path].label,
        score: item.percentage,
        fill: PATH_INFO[item.path].color
    }));

    return (
        <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
            <div className="max-w-5xl mx-auto px-4 print:px-0">
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors">
                        <ArrowLeft size={20} /> Kembali ke Daftar
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm transition-colors"
                    >
                        <Printer size={18} /> Cetak Hasil
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
                        <h1 className="text-3xl font-bold mb-2">Hasil Angket Penjurusan SMA/SMK</h1>
                        <div className="flex justify-center gap-6 text-amber-100 font-medium print:text-slate-600 print:text-sm">
                            <span>Nama: {result.student_name || result.nama}</span>
                            <span>•</span>
                            <span>Kelas: {result.class || result.kelas}</span>
                            <span>•</span>
                            <span>NIS: {result.nis || '-'}</span>
                        </div>
                    </div>

                    <div className="p-8 print:p-4">
                        {/* Top Recommendation */}
                        <div className="text-center mb-12 print:mb-6">
                            <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Jurusan Yang Direkomendasikan</p>
                            <div className="inline-flex items-center gap-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl px-8 py-6 mb-6">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: topPath.color }}>
                                    <topPath.icon size={32} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-3xl font-black text-slate-800">{topPath.fullName}</h2>
                                    <p className="text-amber-600 font-semibold">Tingkat Kesesuaian: {topThree.find(t => t.path === recommendedPath)?.percentage || 0}%</p>
                                </div>
                            </div>
                            <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                                {topPath.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                            {/* Chart */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-amber-500" />
                                    Top 3 Jurusan
                                </h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <LabelList dataKey="score" position="right" formatter={(value: number) => `${value}%`} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top 3 Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Detail 3 Teratas</h3>
                                {topThree.map((item, idx) => {
                                    const info = PATH_INFO[item.path];
                                    return (
                                        <div key={item.path} className={`flex gap-4 p-4 rounded-xl border transition-all ${idx === 0 ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-white'}`}>
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                                <info.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800">{info.fullName}</h4>
                                                    <span className="text-sm font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: info.color + '20', color: info.color }}>
                                                        {item.percentage}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">{info.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}</div>
                        </div>

                        {/* Recommended Path Details */}
                        <div className="border-t border-slate-100 pt-8 print:pt-4">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Detail Jurusan Rekomendasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <BookOpen size={18} />
                                        Mata Pelajaran Utama
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {topPath.subjects.map((subject, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                        <Briefcase size={18} />
                                        Prospek Karir
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {topPath.careers.map((career, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                                {career}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Print Footer */}
                        <div className="hidden print:block mt-8 text-center text-xs text-slate-400 border-t pt-4">
                            Dicetak dari Aplikasi BK - {new Date().toLocaleDateString('id-ID')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
