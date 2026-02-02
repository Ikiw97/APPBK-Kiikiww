import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, FileText, Calendar, User, Tag, Clock, ArrowLeft, Send, Trash2, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContextSupabase';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import { getFeatureSettings } from '@/lib/featureSettings';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    description: string;
    type: 'report' | 'counseling' | 'monitoring' | 'closing' | 'schedule';
    author: string;
}

interface Case {
    id: number;
    student_name: string;
    class: string;
    category: string;
    priority: 'Tinggi' | 'Sedang' | 'Rendah';
    status: 'Baru' | 'Dalam Penanganan' | 'Dalam Pengawasan' | 'Selesai';
    created_at: string;
    counselor: string;
    description: string;
    timeline?: TimelineEvent[];
}

export default function CaseManagement() {
    const { user } = useAuth();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [caseTimeline, setCaseTimeline] = useState<TimelineEvent[]>([]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // School Mode & Settings
    const [schoolMode, setSchoolMode] = useState<SchoolMode>('smp');
    const [schoolName, setSchoolName] = useState('');

    // Schedule Modal State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        date: '',
        time: '',
        notes: ''
    });

    // Form State
    const [newCase, setNewCase] = useState({
        student_name: '',
        class: '',
        category: 'Kedisiplinan',
        priority: 'Sedang',
        description: ''
    });
    const [newNote, setNewNote] = useState('');

    // Dropdown Data
    const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);
    const [studentOptions, setStudentOptions] = useState<SiswaAbsensi[]>([]);

    useEffect(() => {
        // Load school mode
        if (typeof window !== 'undefined') {
            const mode = (localStorage.getItem('schoolMode') as SchoolMode) || 'smp';
            setSchoolMode(mode);
            setSchoolMode(mode);
            setClassOptions(generateClasses(mode));

            // Load school name for report
            getFeatureSettings().then(settings => {
                setSchoolName(settings.system.schoolName || 'Sekolah');
            });
        }
    }, []);

    useEffect(() => {
        fetchCases();
    }, [activeTab]);

    useEffect(() => {
        if (selectedCase) {
            fetchTimeline(selectedCase.id);
        }
    }, [selectedCase]);

    // Update student options when class changes
    useEffect(() => {
        const loadStudents = async () => {
            if (newCase.class) {
                const students = await getSiswaByKelas(newCase.class);
                setStudentOptions(students);
                // Reset student selection if class changes
                setNewCase(prev => ({ ...prev, student_name: '' }));
            } else {
                setStudentOptions([]);
            }
        };
        loadStudents();
    }, [newCase.class]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('counseling_cases')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeTab === 'active') {
                query = query.neq('status', 'Selesai');
            } else {
                query = query.eq('status', 'Selesai');
            }

            const { data, error } = await query;

            if (error) throw error;
            setCases(data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeline = async (caseId: number) => {
        try {
            const { data, error } = await supabase
                .from('case_timeline')
                .select('*')
                .eq('case_id', caseId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedTimeline: TimelineEvent[] = (data || []).map(item => ({
                id: item.id,
                date: new Date(item.created_at).toLocaleString('id-ID'),
                title: item.title,
                description: item.description,
                type: item.type,
                author: item.author
            }));

            setCaseTimeline(formattedTimeline);
        } catch (error) {
            console.error('Error fetching timeline:', error);
        }
    };

    const statusOptions = ['Baru', 'Dalam Penanganan', 'Dalam Pengawasan', 'Selesai'];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Tinggi': return 'bg-red-100 text-red-600';
            case 'Sedang': return 'bg-orange-100 text-orange-600';
            case 'Rendah': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Baru': return 'bg-blue-100 text-blue-600';
            case 'Dalam Penanganan': return 'bg-purple-100 text-purple-600';
            case 'Dalam Pengawasan': return 'bg-yellow-100 text-yellow-600';
            case 'Selesai': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const handleCreateCase = async () => {
        try {
            const { data, error } = await supabase
                .from('counseling_cases')
                .insert([
                    {
                        student_name: newCase.student_name,
                        class: newCase.class,
                        category: newCase.category,
                        priority: newCase.priority,
                        status: 'Baru',
                        counselor: user?.name || user?.email || 'Admin',
                        description: newCase.description
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            await supabase.from('case_timeline').insert([
                {
                    case_id: data.id,
                    title: 'Kasus Baru',
                    description: newCase.description,
                    type: 'report',
                    author: user?.name || user?.email || 'System'
                }
            ]);

            setShowAddModal(false);
            setNewCase({ student_name: '', class: '', category: 'Kedisiplinan', priority: 'Sedang', description: '' });
            fetchCases();
        } catch (error) {
            console.error('Error creating case:', error);
            alert('Gagal membuat kasus. Pastikan tabel database sudah tersedia.');
        }
    };

    const updateCaseStatus = async (caseId: number, newStatus: Case['status']) => {
        // Prompt for note
        const note = window.prompt(`Masukkan catatan untuk status "${newStatus}" (Opsional):`) || '-';

        try {
            const { error } = await supabase
                .from('counseling_cases')
                .update({ status: newStatus })
                .eq('id', caseId);

            if (error) throw error;

            const { error: timelineError } = await supabase.from('case_timeline').insert([
                {
                    case_id: caseId,
                    title: newStatus,
                    description: note,
                    type: newStatus === 'Selesai' ? 'closing' : 'monitoring',
                    author: user?.name || user?.email || 'System'
                }
            ]);

            if (timelineError) console.error("Timeline update error", timelineError);

            if (selectedCase) {
                setSelectedCase({ ...selectedCase, status: newStatus });
                fetchTimeline(caseId);
            }
            fetchCases();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddNote = async () => {
        if (!selectedCase || !newNote.trim()) return;

        try {
            const { error } = await supabase.from('case_timeline').insert([
                {
                    case_id: selectedCase.id,
                    title: 'Catatan Tambahan',
                    description: newNote,
                    type: 'monitoring',
                    author: user?.name || user?.email || 'System'
                }
            ]);

            if (error) throw error;

            setNewNote('');
            fetchTimeline(selectedCase.id);
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const handleScheduleSession = async () => {
        if (!selectedCase || !scheduleData.date || !scheduleData.time) {
            alert('Mohon lengkapi tanggal dan waktu.');
            return;
        }

        try {
            // Combine date and time
            const scheduledDateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);

            const { error } = await supabase.from('case_timeline').insert([
                {
                    case_id: selectedCase.id,
                    title: 'Jadwal Konseling',
                    description: scheduleData.notes || 'Sesi konseling dijadwalkan.',
                    type: 'schedule',
                    created_at: scheduledDateTime.toISOString(), // Use created_at as the scheduled time
                    author: user?.name || user?.email || 'System'
                }
            ]);

            if (error) throw error;

            setShowScheduleModal(false);
            setScheduleData({ date: '', time: '', notes: '' });
            fetchTimeline(selectedCase.id);
            alert('Jadwal berhasil disimpan.');
        } catch (error) {
            console.error('Error scheduling session:', error);
            alert('Gagal menjadwalkan sesi.');
        }
    };

    const handleDeleteCase = async (id: number) => {
        if (!confirm('Apakah anda yakin ingin menghapus kasus ini? Data yang dihapus tidak dapat dikembalikan.')) return;

        try {
            await supabase.from('case_timeline').delete().eq('case_id', id);

            const { error } = await supabase.from('counseling_cases').delete().eq('id', id);
            if (error) throw error;

            setSelectedCase(null);
            fetchCases();
        } catch (error) {
            console.error("Error deleting case:", error);
            alert("Gagal menghapus kasus.");
        }
    }

    const handlePrintReport = () => {
        if (!selectedCase) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up window diblokir. Izinkan pop-up untuk mencetak laporan.');
            return;
        }

        const reportContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Konseling - ${selectedCase.student_name}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; line-height: 1.5; color: #000; padding: 2cm; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .header h1 { margin: 0; font-size: 18pt; text-transform: uppercase; }
                    .header h2 { margin: 5px 0 0; font-size: 14pt; font-weight: normal; }
                    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .meta-table td { padding: 5px; vertical-align: top; }
                    .label { font-weight: bold; width: 150px; }
                    .section-title { font-weight: bold; font-size: 12pt; margin: 20px 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .content-box { text-align: justify; margin-bottom: 20px; white-space: pre-wrap; }
                    .content-box-cell { white-space: pre-wrap; }
                    .timeline-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
                    .timeline-table th, .timeline-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                    .timeline-table th { background-color: #f0f0f0; }
                    .footer { margin-top: 50px; text-align: right; }
                    .signature-box { display: inline-block; text-align: center; min-width: 200px; margin-top: 20px; }
                    .signature-line { margin-top: 60px; border-top: 1px solid #000; }
                    @media print {
                        body { padding: 0; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Laporan Layanan Bimbingan Konseling</h1>
                    <h2>${schoolName}</h2>
                </div>

                <div class="section-title">Data Siswa & Kasus</div>
                <table class="meta-table">
                    <tr>
                        <td class="label">Nama Siswa</td>
                        <td>: ${selectedCase.student_name}</td>
                    </tr>
                    <tr>
                        <td class="label">Kelas</td>
                        <td>: ${selectedCase.class}</td>
                    </tr>
                    <tr>
                        <td class="label">Jenis Pelanggaran</td>
                        <td>: ${selectedCase.category}</td>
                    </tr>
                    <tr>
                        <td class="label">Pelanggaran</td>
                        <td class="content-box-cell">: ${selectedCase.description}</td>
                    </tr>
                    <tr>
                        <td class="label">Prioritas</td>
                        <td>: ${selectedCase.priority}</td>
                    </tr>
                    <tr>
                        <td class="label">Konselor</td>
                        <td>: ${selectedCase.counselor === user?.email ? (user?.name || selectedCase.counselor) : selectedCase.counselor}</td>
                    </tr>
                </table>

                <div class="section-title">Riwayat Penanganan</div>
                <table class="timeline-table">
                    <thead>
                        <tr>
                            <th style="width: 20%">Tanggal</th>
                            <th style="width: 20%">Status</th>
                            <th>Deskripsi</th>
                            <th style="width: 15%">Petugas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[...caseTimeline]
                .reverse() // Sort Ascending (Oldest First)
                .filter(e => e.title !== 'Kasus Baru' && !(e.title === 'Baru' && (e.description === '-' || !e.description))) // Filter out 'Kasus Baru' and empty 'Baru'
                .map(event => `
                            <tr>
                                <td>${event.date}</td>
                                <td>${event.title}</td>
                                <td>${event.description}</td>
                                <td>${event.author === user?.email ? (user?.name || event.author) : event.author}</td>
                            </tr>
                        `).join('')}
                        ${caseTimeline.length === 0 ? '<tr><td colspan="4" style="text-align:center; font-style:italic;">Belum ada riwayat penanganan.</td></tr>' : ''}
                    </tbody>
                </table>

                <div class="footer">
                    <div>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="signature-box">
                        <div>Guru Bimbingan Konseling</div>
                        <div class="signature-line">
                            ${user?.name || 'Konselor'}
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(reportContent);
        printWindow.document.close();
    };

    // Filtered Cases Logic
    const filteredCases = cases.filter(c => {
        const matchesSearch = c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.class.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory ? c.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    // Detail View Component
    if (selectedCase) {
        return (
            <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50">
                <button
                    onClick={() => setSelectedCase(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Kembali ke Daftar Kasus</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">


                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{selectedCase.student_name}</h1>
                                    <p className="text-slate-500">{selectedCase.class}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCase.status)}`}>
                                    {selectedCase.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Jenis Pelanggaran</span>
                                    <p className="text-slate-700 font-medium">{selectedCase.category}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Prioritas</span>
                                    <p className={`text-sm font-medium ${getPriorityColor(selectedCase.priority).replace('bg-', 'text-').split(' ')[1]}`}>
                                        {selectedCase.priority}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Konselor</span>
                                    <p className="text-slate-700 font-medium">
                                        {selectedCase.counselor === user?.email ? (user?.name || selectedCase.counselor) : selectedCase.counselor}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Tanggal Mulai</span>
                                    <p className="text-slate-700 font-medium">{new Date(selectedCase.created_at).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-2">Pelanggaran</h3>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {selectedCase.description}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-slate-400" />
                                Riwayat Penanganan
                            </h3>

                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                                {caseTimeline.map((event, index) => (
                                    <div key={event.id} className="relative pl-8 animate-in fade-in slide-in-from-bottom-2">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${event.type === 'report' ? 'bg-red-500' :
                                            event.type === 'counseling' ? 'bg-blue-500' :
                                                event.type === 'schedule' ? 'bg-purple-500' :
                                                    event.type === 'monitoring' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`} />

                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                                            <span className="text-sm font-semibold text-slate-900">{event.title}</span>
                                            <span className="text-xs text-slate-400">{event.date}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-2">{event.description}</p>
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">
                                                {event.author === user?.email ? (user?.name || event.author) : event.author}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {caseTimeline.length === 0 && (
                                    <p className="text-slate-400 italic pl-8">Belum ada riwayat.</p>
                                )}

                                <div className="relative pl-8 pt-4">
                                    <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Tambahkan catatan perkembangan..."
                                            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm mb-2 outline-none p-1"
                                            rows={2}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                <Send size={12} />
                                                Kirim Catatan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Status Kasus</h3>
                            <div className="space-y-2">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => updateCaseStatus(selectedCase.id, status as Case['status'])}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${selectedCase.status === status
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                                            : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>{status}</span>
                                        {selectedCase.status === status && <CheckCircle size={16} className="text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Aksi Cepat</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
                                    <Calendar size={18} className="text-slate-400" />
                                    Jadwalkan Konseling
                                </button>
                                <button
                                    onClick={handlePrintReport}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <FileText size={18} className="text-slate-400" />
                                    Cetak Laporan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header - Modern Glassmorphism Design */}
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Konseling & Home Visit</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Manajemen Kasus
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Catat dan pantau perkembangan kasus siswa secara terstruktur.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 hover:scale-105"
                            >
                                <Plus size={20} />
                                <span>Buat Kasus Baru</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-primary-50 border border-primary-200 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary-500 rounded-full"></span>
                            <span className="text-sm font-medium text-slate-700">{cases.filter(c => c.status !== 'Selesai').length} Kasus Aktif</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700">{cases.filter(c => c.status === 'Selesai').length} Selesai</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'active'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Kasus Aktif
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'archived'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Arsip
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari siswa atau kelas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                        {/* Filter Toggle - For now just visual, or implement full filter menu later */}
                        <div className="relative group">
                            <button
                                className={`p-2 border rounded-lg transition-colors ${filterCategory ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                title="Filter Jenis Pelanggaran"
                            >
                                <Filter size={18} />
                            </button>
                            {/* Simple hover dropdown for Category Filter */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-2 hidden group-hover:block z-10 animate-in fade-in slide-in-from-top-2">
                                <div className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2 pt-1">Filter Jenis Pelanggaran</div>
                                <button onClick={() => setFilterCategory('')} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${!filterCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>Semua</button>
                                {['Kedisiplinan', 'Akademik', 'Sosial', 'Pribadi', 'Karir'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${filterCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Data sedang dimuat...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Siswa</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Pelanggaran</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioritas</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Konselor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredCases.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                            {cases.length === 0
                                                ? `Belum ada data kasus ${activeTab === 'active' ? 'aktif' : 'diarsipkan'}.`
                                                : 'Tidak ditemukan kasus yang sesuai pencarian.'}
                                        </td>
                                    </tr>
                                ) : filteredCases.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {item.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.student_name}</p>
                                                    <p className="text-xs text-slate-500">{item.class}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                <Tag size={12} />
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-600">
                                                    {item.counselor === user?.email ? (user?.name || item.counselor) : item.counselor}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-600">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                                }}
                                                className={`p-1 rounded transition-colors ${openDropdownId === item.id ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                title="Aksi"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {/* Action Dropdown */}
                                            {openDropdownId === item.id && (
                                                <div className="absolute right-8 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1 text-left animate-in fade-in zoom-in-95 origin-top-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCase(item);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <FileText size={14} />
                                                        Detail
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCase(item.id);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {filteredCases.length > 0 ? `Menampilkan ${filteredCases.length} data` : 'Tidak ada data'}
                    </p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-600 disabled:opacity-50">Sebelumnya</button>
                        <button disabled className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-600 disabled:opacity-50">Selanjutnya</button>
                    </div>
                </div>

                {/* Modal Buat Kasus */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Buat Kasus Baru</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                    <Trash2 className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                                        <select
                                            value={newCase.class}
                                            onChange={e => setNewCase({ ...newCase, class: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classOptions.map(cls => (
                                                <option key={cls.value} value={cls.value}>{cls.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Siswa</label>
                                        <select
                                            value={newCase.student_name}
                                            onChange={e => setNewCase({ ...newCase, student_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                            disabled={!newCase.class}
                                        >
                                            <option value="">Pilih Siswa</option>
                                            {studentOptions.map(student => (
                                                <option key={student.id} value={student.nama}>{student.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Pelanggaran</label>
                                        <select
                                            value={newCase.category}
                                            onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        >
                                            <option value="Kedisiplinan">Kedisiplinan</option>
                                            <option value="Akademik">Akademik</option>
                                            <option value="Sosial">Sosial</option>
                                            <option value="Pribadi">Pribadi</option>
                                            <option value="Karir">Karir</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                                        <select
                                            value={newCase.priority}
                                            onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        >
                                            <option value="Rendah">Rendah</option>
                                            <option value="Sedang">Sedang</option>
                                            <option value="Tinggi">Tinggi</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pelanggaran</label>
                                    <textarea
                                        value={newCase.description}
                                        onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm h-32 resize-none"
                                        placeholder="Jelaskan detail permasalahan..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleCreateCase}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm opacity-100 disabled:opacity-50"
                                    >
                                        Buat Kasus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Jadwal Konseling */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Jadwalkan Konseling</h2>
                            <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" /> {/* Ensure X is imported if using X icon, checking imports... X is not imported, let's use Trash2 or add X to imports if valid, or just simple text 'x'. Or I check imports. 'Plus' is imported. Let's assume Lucide import needs update if X is missing. Or use a simple button. I will add X to imports or use an existing icon. Wait, I see 'Trash2' used for close in 'Buat Kasus Baru'. I will check imports at top. */}
                                {/* Checking line 2 imports... 'Plus', 'Search', 'Filter', 'MoreVertical', 'FileText', 'Calendar', 'User', 'Tag', 'Clock', 'ArrowLeft', 'Send', 'Trash2', 'CheckCircle'. X is NOT imported. I will use 'ArrowLeft' or just 'Tutup' text, OR I will add X to imports in a separate chunk. Actually, users might prefer consistency. I'll add 'X' to imports first. */}
                                {/* For now, I'll use text or existing icon to result in valid code in one go. 'Trash2' is semantically wrong for close. I'll use a generic SVG or text. */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    value={scheduleData.date}
                                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu</label>
                                <input
                                    type="time"
                                    value={scheduleData.time}
                                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                                <textarea
                                    value={scheduleData.notes}
                                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm h-24 resize-none"
                                    placeholder="Tambahkan catatan untuk sesi ini..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleScheduleSession}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
