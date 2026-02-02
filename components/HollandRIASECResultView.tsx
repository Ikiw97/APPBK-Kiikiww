import React from 'react';
import {
    ArrowLeft, Printer,
    Wrench, TestTube, Palette, Heart, Briefcase, Calculator,
    BarChart3, User
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface RIASECResultData {
    id: string;
    student_name: string;
    class: string;
    gender?: string;
    created_at: string;
    holland_code: string;
    score_r: number;
    score_i: number;
    score_a: number;
    score_s: number;
    score_e: number;
    score_c: number;
    answers: Record<string, number>;
}

interface HollandRIASECResultViewProps {
    result: RIASECResultData;
    onBack: () => void;
}

const RIASEC_INFO = {
    R: {
        label: 'Realistic (Doers)',
        icon: Wrench,
        color: '#ef4444',
        description: 'Orang yang praktis, menyukai kegiatan fisik, bekerja dengan mesin atau alat, dan lebih suka bekerja dengan benda daripada manusia atau ide.',
        careers: ['Teknik Mesin', 'Otomotif', 'Pertanian', 'Peternakan', 'Atlet', 'Polisi', 'Militer', 'Pilot', 'Arsitek Lanskap', 'Chef']
    },
    I: {
        label: 'Investigative (Thinkers)',
        icon: TestTube,
        color: '#f59e0b',
        description: 'Orang yang analitis, intelektual, suka mengamati, meneliti, dan memecahkan masalah kompleks. Menyukai sains dan matematika.',
        careers: ['Ilmuwan', 'Dokter', 'Apoteker', 'Programmer', 'Ahli Matematika', 'Peneliti', 'Psikolog', 'Analis Sistem', 'Ahli Biologi']
    },
    A: {
        label: 'Artistic (Creators)',
        icon: Palette,
        color: '#ec4899',
        description: 'Orang yang kreatif, ekspresif, orisinal, dan independen. Menyukai seni, drama, musik, dan penulisan. Menghindari rutinitas berulang.',
        careers: ['Desainer Grafis', 'Penulis', 'Musisi', 'Aktor', 'Arsitek', 'Fotografer', 'Jurnalis', 'Desainer Interior', 'Animator']
    },
    S: {
        label: 'Social (Helpers)',
        icon: Heart,
        color: '#3b82f6',
        description: 'Orang yang suka membantu, mengajar, menyembuhkan, dan melayani orang lain. Memiliki kemampuan komunikasi dan interpersonal yang baik.',
        careers: ['Guru', 'Konselor', 'Perawat', 'Pekerja Sosial', 'Psikolog', 'Human Resources (HRD)', 'Pelatih', 'Terapis', 'Customer Service']
    },
    E: {
        label: 'Enterprising (Persuaders)',
        icon: Briefcase,
        color: '#8b5cf6',
        description: 'Orang yang energik, ambisius, suka memimpin dan meyakinkan orang lain. Tertarik pada bisnis, politik, dan kewirausahaan.',
        careers: ['Pengusaha', 'Manajer', 'Pengacara', 'Politisi', 'Sales/Marketing', 'Real Estate Agent', 'Event Organizer', 'Kepala Sekolah']
    },
    C: {
        label: 'Conventional (Organizers)',
        icon: Calculator,
        color: '#10b981',
        description: 'Orang yang teratur, rapi, teliti, dan suka bekerja dengan data atau angka. Menyukai struktur, aturan, dan prosedur yang jelas.',
        careers: ['Akuntan', 'Administrasi', 'Sekretaris', 'Bankir', 'Pustakawan', 'Data Entry', 'Pegawai Negeri', 'Staf Keuangan', 'Arsiparis']
    }
};

export default function HollandRIASECResultView({ result, onBack }: HollandRIASECResultViewProps) {
    const scores = {
        R: result.score_r,
        I: result.score_i,
        A: result.score_a,
        S: result.score_s,
        E: result.score_e,
        C: result.score_c
    };

    const ChartData = [
        { name: 'Realistic', score: scores.R, code: 'R', fill: RIASEC_INFO.R.color },
        { name: 'Investigative', score: scores.I, code: 'I', fill: RIASEC_INFO.I.color },
        { name: 'Artistic', score: scores.A, code: 'A', fill: RIASEC_INFO.A.color },
        { name: 'Social', score: scores.S, code: 'S', fill: RIASEC_INFO.S.color },
        { name: 'Enterprising', score: scores.E, code: 'E', fill: RIASEC_INFO.E.color },
        { name: 'Conventional', score: scores.C, code: 'C', fill: RIASEC_INFO.C.color },
    ];

    // Recalculate derived data if needed, or use stored code
    // Getting top 3 from scores just to be safe and consistent
    const sortedDimensions = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key as keyof typeof scores);

    const topThree = sortedDimensions.slice(0, 3);
    const dominantType = topThree[0];
    const dominantInfo = RIASEC_INFO[dominantType as keyof typeof RIASEC_INFO];

    // Recommend careers
    const primaryCareers = RIASEC_INFO[topThree[0] as keyof typeof RIASEC_INFO].careers;
    const secondaryCareers = RIASEC_INFO[topThree[1] as keyof typeof RIASEC_INFO].careers;
    const careers = [...new Set([...primaryCareers.slice(0, 5), ...secondaryCareers.slice(0, 5)])];

    return (
        <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
            <div className="max-w-5xl mx-auto px-4 print:px-0">
                {/* Header Navigation */}
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

                {/* Result Content */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none border border-slate-200 print:border-none">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
                        <h1 className="text-3xl font-bold mb-2">Laporan Hasil Asesmen RIASEC</h1>
                        <div className="flex justify-center gap-6 text-orange-100 font-medium print:text-slate-600 print:text-sm">
                            <span>Nama: {result.student_name}</span>
                            <span>•</span>
                            <span>Kelas: {result.class}</span>
                            <span className="print:hidden">•</span>
                            <span className="print:hidden">Tanggal: {new Date(result.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="p-8 print:p-4">
                        {/* Top Result Section */}
                        <div className="text-center mb-12 print:mb-6">
                            <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Kode Kepribadian</p>
                            <div className="inline-flex items-center justify-center gap-2 mb-6">
                                {topThree.map((code, idx) => (
                                    <span key={idx} className={`text-6xl font-black ${idx === 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                                        {code}
                                    </span>
                                ))}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">
                                {dominantInfo.label}
                            </h2>
                            <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                                {dominantInfo.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                            {/* Chart Section */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-orange-500" />
                                    Profil Minat
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                                                {ChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top 3 Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">3 Tipe Dominan</h3>
                                {topThree.map((code) => {
                                    const info = RIASEC_INFO[code as 'R'];
                                    return (
                                        <div key={code} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all bg-white">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                                <info.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{info.label}</h4>
                                                <p className="text-sm text-slate-500 leading-snug mt-1">{info.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Career Recommendations */}
                        <div className="border-t border-slate-100 pt-8 print:pt-4">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Briefcase size={22} className="text-orange-500" />
                                Rekomendasi Karir
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {careers.map((career, idx) => (
                                    <div key={idx} className="bg-orange-50/50 border border-orange-100 text-orange-800 px-4 py-3 rounded-xl text-center font-medium text-sm hover:bg-orange-100 transition-colors cursor-default">
                                        {career}
                                    </div>
                                ))}
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
