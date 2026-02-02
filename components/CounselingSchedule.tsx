import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, User, Plus, X, Users, MapPin, BookOpen, Trash2, UserPlus, Edit } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { getAllSiswaData } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface ScheduleEvent {
    id: number;
    case_id: number;
    title: string;
    description: string;
    created_at: string;
    author: string;
    counseling_cases: {
        student_name: string;
        class: string;
        category: string;
    } | null;
}

interface ClassSchedule {
    id: number;
    class: string;
    topic: string;
    description: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: string;
    location: string;
    counselor: string;
    created_at: string;
}

interface IndividualSchedule {
    id: number;
    student_id: string;
    student_name: string;
    student_class: string;
    topic: string;
    description: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: string;
    location: string;
    counselor: string;
    created_at: string;
}

export default function CounselingSchedule() {
    const { user } = useAuth();
    const [individualSchedules, setIndividualSchedules] = useState<ScheduleEvent[]>([]);
    const [customIndividualSchedules, setCustomIndividualSchedules] = useState<IndividualSchedule[]>([]);
    const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddIndividualModal, setShowAddIndividualModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'class'>('all');

    // Edit states
    const [showEditClassModal, setShowEditClassModal] = useState(false);
    const [showEditIndividualModal, setShowEditIndividualModal] = useState(false);
    const [editingClassSchedule, setEditingClassSchedule] = useState<ClassSchedule | null>(null);
    const [editingIndividualSchedule, setEditingIndividualSchedule] = useState<IndividualSchedule | null>(null);

    // State untuk data siswa dari master data
    const [allStudents, setAllStudents] = useState<Record<string, SiswaAbsensi[]>>({});
    const [selectedClassForStudent, setSelectedClassForStudent] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<SiswaAbsensi[]>([]);

    const [schoolMode] = useState<SchoolMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('schoolMode') as SchoolMode) || 'smp';
        }
        return 'smp';
    });

    const classes = generateClasses(schoolMode);

    const [newSchedule, setNewSchedule] = useState({
        class: '',
        topic: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration: '1 x 40 Menit',
        location: ''
    });

    // Form state untuk jadwal individu
    const [newIndividualSchedule, setNewIndividualSchedule] = useState({
        student_id: '',
        student_name: '',
        student_class: '',
        topic: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration: '45 Menit',
        location: 'Ruang BK'
    });

    useEffect(() => {
        fetchSchedules();
        fetchAllStudents();
    }, []);

    // Fetch daftar siswa dari master data
    const fetchAllStudents = async () => {
        try {
            const data = await getAllSiswaData();
            setAllStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    // Update filtered students saat kelas dipilih
    useEffect(() => {
        if (selectedClassForStudent && allStudents[selectedClassForStudent]) {
            setFilteredStudents(allStudents[selectedClassForStudent]);
        } else {
            setFilteredStudents([]);
        }
    }, [selectedClassForStudent, allStudents]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Fetch individual schedules
            const { data: individualData, error: individualError } = await supabase
                .from('case_timeline')
                .select(`
                    *,
                    counseling_cases (
                        student_name,
                        class,
                        category
                    )
                `)
                .eq('type', 'schedule')
                .order('created_at', { ascending: true });

            if (individualError) throw individualError;
            setIndividualSchedules(individualData || []);

            // Fetch class schedules
            const { data: classData, error: classError } = await supabase
                .from('class_schedules')
                .select('*')
                .order('scheduled_date', { ascending: true });

            if (classError) {
                console.error('Error fetching class schedules:', classError);
                // Don't throw - table might not exist yet
            } else {
                setClassSchedules(classData || []);
            }

            // Fetch custom individual schedules
            const { data: individualData2, error: individualError2 } = await supabase
                .from('individual_schedules')
                .select('*')
                .order('scheduled_date', { ascending: true });

            if (!individualError2) {
                setCustomIndividualSchedules(individualData2 || []);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassSchedule = async () => {
        if (!newSchedule.class || !newSchedule.topic || !newSchedule.scheduled_date || !newSchedule.scheduled_time) {
            alert('Mohon lengkapi kelas, topik, tanggal, dan waktu.');
            return;
        }

        try {
            const { error } = await supabase
                .from('class_schedules')
                .insert([{
                    class: newSchedule.class,
                    topic: newSchedule.topic,
                    description: newSchedule.description,
                    scheduled_date: newSchedule.scheduled_date,
                    scheduled_time: newSchedule.scheduled_time,
                    duration: newSchedule.duration,
                    location: newSchedule.location,
                    counselor: user?.name || user?.email || 'Admin'
                }]);

            if (error) throw error;

            setShowAddModal(false);
            setNewSchedule({
                class: '',
                topic: '',
                description: '',
                scheduled_date: '',
                scheduled_time: '',
                duration: '1 x 40 Menit',
                location: ''
            });
            fetchSchedules();
        } catch (error) {
            console.error('Error adding class schedule:', error);
            alert('Gagal menambahkan jadwal. Pastikan tabel database sudah tersedia.');
        }
    };

    const handleDeleteClassSchedule = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            const { error } = await supabase
                .from('class_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Gagal menghapus jadwal.');
        }
    };

    // Handler untuk tambah jadwal individu
    const handleAddIndividualSchedule = async () => {
        if (!newIndividualSchedule.student_id || !newIndividualSchedule.topic || !newIndividualSchedule.scheduled_date || !newIndividualSchedule.scheduled_time) {
            alert('Mohon lengkapi nama siswa, topik, tanggal, dan waktu.');
            return;
        }

        try {
            const { error } = await supabase
                .from('individual_schedules')
                .insert([{
                    student_id: newIndividualSchedule.student_id,
                    student_name: newIndividualSchedule.student_name,
                    student_class: newIndividualSchedule.student_class,
                    topic: newIndividualSchedule.topic,
                    description: newIndividualSchedule.description,
                    scheduled_date: newIndividualSchedule.scheduled_date,
                    scheduled_time: newIndividualSchedule.scheduled_time,
                    duration: newIndividualSchedule.duration,
                    location: newIndividualSchedule.location,
                    counselor: user?.name || user?.email || 'Admin'
                }]);

            if (error) throw error;

            setShowAddIndividualModal(false);
            setSelectedClassForStudent('');
            setNewIndividualSchedule({
                student_id: '',
                student_name: '',
                student_class: '',
                topic: '',
                description: '',
                scheduled_date: '',
                scheduled_time: '',
                duration: '45 Menit',
                location: 'Ruang BK'
            });
            fetchSchedules();
        } catch (error) {
            console.error('Error adding individual schedule:', error);
            alert('Gagal menambahkan jadwal. Pastikan tabel database sudah tersedia.');
        }
    };

    // Handler untuk hapus jadwal individu
    const handleDeleteIndividualSchedule = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            const { error } = await supabase
                .from('individual_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting individual schedule:', error);
            alert('Gagal menghapus jadwal.');
        }
    };

    // Handler untuk edit jadwal kelas
    const handleEditClassSchedule = (schedule: ClassSchedule) => {
        setEditingClassSchedule(schedule);
        setShowEditClassModal(true);
    };

    // Handler untuk update jadwal kelas
    const handleUpdateClassSchedule = async () => {
        if (!editingClassSchedule) return;

        if (!editingClassSchedule.class || !editingClassSchedule.topic || !editingClassSchedule.scheduled_date || !editingClassSchedule.scheduled_time) {
            alert('Mohon lengkapi kelas, topik, tanggal, dan waktu.');
            return;
        }

        try {
            const { error } = await supabase
                .from('class_schedules')
                .update({
                    class: editingClassSchedule.class,
                    topic: editingClassSchedule.topic,
                    description: editingClassSchedule.description,
                    scheduled_date: editingClassSchedule.scheduled_date,
                    scheduled_time: editingClassSchedule.scheduled_time,
                    duration: editingClassSchedule.duration,
                    location: editingClassSchedule.location
                })
                .eq('id', editingClassSchedule.id);

            if (error) throw error;

            setShowEditClassModal(false);
            setEditingClassSchedule(null);
            fetchSchedules();
            alert('Jadwal kelas berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating class schedule:', error);
            alert('Gagal memperbarui jadwal kelas.');
        }
    };

    // Handler untuk edit jadwal individu
    const handleEditIndividualSchedule = (schedule: IndividualSchedule) => {
        setEditingIndividualSchedule(schedule);
        setShowEditIndividualModal(true);
    };

    // Handler untuk update jadwal individu
    const handleUpdateIndividualSchedule = async () => {
        if (!editingIndividualSchedule) return;

        if (!editingIndividualSchedule.student_name || !editingIndividualSchedule.topic || !editingIndividualSchedule.scheduled_date || !editingIndividualSchedule.scheduled_time) {
            alert('Mohon lengkapi nama siswa, topik, tanggal, dan waktu.');
            return;
        }

        try {
            const { error } = await supabase
                .from('individual_schedules')
                .update({
                    topic: editingIndividualSchedule.topic,
                    description: editingIndividualSchedule.description,
                    scheduled_date: editingIndividualSchedule.scheduled_date,
                    scheduled_time: editingIndividualSchedule.scheduled_time,
                    duration: editingIndividualSchedule.duration,
                    location: editingIndividualSchedule.location
                })
                .eq('id', editingIndividualSchedule.id);

            if (error) throw error;

            setShowEditIndividualModal(false);
            setEditingIndividualSchedule(null);
            fetchSchedules();
            alert('Jadwal individu berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating individual schedule:', error);
            alert('Gagal memperbarui jadwal individu.');
        }
    };

    // Combine and filter schedules
    const getCombinedSchedules = () => {
        let combined: any[] = [];

        if (activeTab === 'all' || activeTab === 'individual') {
            // Jadwal individu dari case_timeline
            combined = [...combined, ...individualSchedules.map(s => ({
                ...s,
                type: 'individual',
                subtype: 'case',
                date: new Date(s.created_at),
                displayDate: s.created_at
            }))];

            // Jadwal individu dari tabel individual_schedules
            combined = [...combined, ...customIndividualSchedules.map(s => ({
                ...s,
                type: 'individual',
                subtype: 'custom',
                date: new Date(`${s.scheduled_date}T${s.scheduled_time}`),
                displayDate: `${s.scheduled_date}T${s.scheduled_time}`
            }))];
        }

        if (activeTab === 'all' || activeTab === 'class') {
            combined = [...combined, ...classSchedules.map(s => ({
                ...s,
                type: 'class',
                date: new Date(`${s.scheduled_date}T${s.scheduled_time}`),
                displayDate: `${s.scheduled_date}T${s.scheduled_time}`
            }))];
        }

        // Filter by date
        if (filterDate) {
            combined = combined.filter(item => {
                const itemDate = new Date(item.displayDate).toISOString().split('T')[0];
                return itemDate === filterDate;
            });
        }

        // Sort by date
        combined.sort((a, b) => a.date.getTime() - b.date.getTime());

        return combined;
    };

    const combinedSchedules = getCombinedSchedules();

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
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Jadwal & Agenda</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Jadwal Konseling
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Kelola jadwal sesi konseling dan agenda kegiatan bimbingan konseling.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowAddIndividualModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm"
                            >
                                <UserPlus size={18} />
                                <span>Tambah Jadwal Individu</span>
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 hover:scale-105"
                            >
                                <Plus size={20} />
                                <span>Tambah Jadwal Kelas</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <User size={14} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">{individualSchedules.length + customIndividualSchedules.length} Individu</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">{classSchedules.length} Kelas</span>
                        </div>
                    </div>
                </div>
            </div>



            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs and Filters */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setActiveTab('individual')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'individual'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Individu
                        </button>
                        <button
                            onClick={() => setActiveTab('class')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'class'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Kelas
                        </button>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <Calendar className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-700">Filter Tanggal:</span>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Memuat jadwal...
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {combinedSchedules.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                {filterDate ? 'Tidak ada jadwal pada tanggal ini.' : 'Belum ada jadwal konseling.'}
                            </div>
                        ) : (
                            combinedSchedules.map((item, index) => (
                                <div key={`${item.type}-${item.id}`} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center group">
                                    {/* Date Box */}
                                    <div className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${item.type === 'class'
                                        ? 'bg-purple-50 border-purple-100 text-purple-600'
                                        : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                        <span className="text-xs font-bold uppercase">
                                            {new Date(item.displayDate).toLocaleDateString('id-ID', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-bold">{new Date(item.displayDate).getDate()}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {item.type === 'class' ? (
                                                <Users size={18} className="text-purple-600" />
                                            ) : (
                                                <User size={18} className="text-blue-600" />
                                            )}
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.type === 'class'
                                                    ? item.topic
                                                    : item.subtype === 'custom'
                                                        ? item.student_name
                                                        : (item.counseling_cases?.student_name || 'Siswa Tidak Dikenal')}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.type === 'class'
                                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                {item.type === 'class'
                                                    ? item.class
                                                    : item.subtype === 'custom'
                                                        ? item.student_class
                                                        : (item.counseling_cases?.class || '-')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>
                                                    {new Date(item.displayDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </div>
                                            {(item.type === 'class' || item.subtype === 'custom') && item.duration && (
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen size={14} />
                                                    <span>{item.duration}</span>
                                                </div>
                                            )}
                                            {(item.type === 'class' || item.subtype === 'custom') && item.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} />
                                                <span>{item.type === 'class' ? item.counselor : item.subtype === 'custom' ? item.counselor : item.author}</span>
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {item.description}
                                            </p>
                                        )}
                                        {item.subtype === 'custom' && item.topic && (
                                            <div className="mt-2">
                                                <span className="text-xs font-medium text-slate-500">Topik: </span>
                                                <span className="text-sm text-slate-700">{item.topic}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {(item.type === 'class' || item.subtype === 'custom') && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => item.type === 'class'
                                                    ? handleEditClassSchedule(item as ClassSchedule)
                                                    : handleEditIndividualSchedule(item as IndividualSchedule)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Edit Jadwal"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => item.type === 'class'
                                                    ? handleDeleteClassSchedule(item.id)
                                                    : handleDeleteIndividualSchedule(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus Jadwal"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Add Class Schedule Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-slate-900">Tambah Jadwal Kelas</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas <span className="text-red-500">*</span></label>
                                        <select
                                            value={newSchedule.class}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, class: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classes.map(cls => (
                                                <option key={cls.value} value={cls.value}>{cls.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi</label>
                                        <input
                                            type="text"
                                            value={newSchedule.duration}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, duration: e.target.value })}
                                            placeholder="1 x 40 Menit"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Topik Layanan <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newSchedule.topic}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, topic: e.target.value })}
                                        placeholder="Contoh: Motivasi Belajar, Etika Pergaulan"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            value={newSchedule.scheduled_date}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Waktu <span className="text-red-500">*</span></label>
                                        <input
                                            type="time"
                                            value={newSchedule.scheduled_time}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi</label>
                                    <input
                                        type="text"
                                        value={newSchedule.location}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                                        placeholder="Contoh: Ruang BK, Kelas VII-1"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi / Catatan</label>
                                    <textarea
                                        value={newSchedule.description}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                        placeholder="Catatan tambahan tentang sesi konseling..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAddClassSchedule}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Individual Schedule Modal */}
            {
                showAddIndividualModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <UserPlus size={20} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Tambah Jadwal Konseling Individu</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddIndividualModal(false);
                                        setSelectedClassForStudent('');
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas <span className="text-red-500">*</span></label>
                                        <select
                                            value={selectedClassForStudent}
                                            onChange={(e) => {
                                                setSelectedClassForStudent(e.target.value);
                                                setNewIndividualSchedule({
                                                    ...newIndividualSchedule,
                                                    student_id: '',
                                                    student_name: '',
                                                    student_class: e.target.value
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classes.map(cls => (
                                                <option key={cls.value} value={cls.value}>{cls.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Siswa <span className="text-red-500">*</span></label>
                                        <select
                                            value={newIndividualSchedule.student_id}
                                            onChange={(e) => {
                                                const student = filteredStudents.find(s => s.id === e.target.value);
                                                setNewIndividualSchedule({
                                                    ...newIndividualSchedule,
                                                    student_id: e.target.value,
                                                    student_name: student?.nama || '',
                                                    student_class: selectedClassForStudent
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            disabled={!selectedClassForStudent}
                                        >
                                            <option value="">{selectedClassForStudent ? 'Pilih Siswa' : 'Pilih kelas terlebih dahulu'}</option>
                                            {filteredStudents.map(student => (
                                                <option key={student.id} value={student.id}>
                                                    {student.nama} ({student.nis})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedClassForStudent && filteredStudents.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">Tidak ada siswa di kelas ini. Silakan tambahkan siswa di menu Master Data.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Topik / Tujuan Konseling <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newIndividualSchedule.topic}
                                        onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, topic: e.target.value })}
                                        placeholder="Contoh: Konflik dengan teman, Motivasi belajar, Masalah keluarga"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            value={newIndividualSchedule.scheduled_date}
                                            onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, scheduled_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Waktu <span className="text-red-500">*</span></label>
                                        <input
                                            type="time"
                                            value={newIndividualSchedule.scheduled_time}
                                            onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, scheduled_time: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi</label>
                                        <input
                                            type="text"
                                            value={newIndividualSchedule.duration}
                                            onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, duration: e.target.value })}
                                            placeholder="45 Menit"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi</label>
                                        <input
                                            type="text"
                                            value={newIndividualSchedule.location}
                                            onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, location: e.target.value })}
                                            placeholder="Ruang BK"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi / Catatan</label>
                                    <textarea
                                        value={newIndividualSchedule.description}
                                        onChange={(e) => setNewIndividualSchedule({ ...newIndividualSchedule, description: e.target.value })}
                                        placeholder="Catatan tambahan tentang sesi konseling individu..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => {
                                        setShowAddIndividualModal(false);
                                        setSelectedClassForStudent('');
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAddIndividualSchedule}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Class Schedule Modal */}
            {showEditClassModal && editingClassSchedule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-900">Edit Jadwal Kelas</h2>
                            <button
                                onClick={() => {
                                    setShowEditClassModal(false);
                                    setEditingClassSchedule(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas <span className="text-red-500">*</span></label>
                                    <select
                                        value={editingClassSchedule.class}
                                        onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, class: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes.map(cls => (
                                            <option key={cls.value} value={cls.value}>{cls.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi</label>
                                    <input
                                        type="text"
                                        value={editingClassSchedule.duration}
                                        onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, duration: e.target.value })}
                                        placeholder="1 x 40 Menit"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Topik Layanan <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editingClassSchedule.topic}
                                    onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, topic: e.target.value })}
                                    placeholder="Contoh: Motivasi Belajar, Etika Pergaulan"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={editingClassSchedule.scheduled_date}
                                        onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, scheduled_date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Waktu <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        value={editingClassSchedule.scheduled_time}
                                        onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, scheduled_time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi</label>
                                <input
                                    type="text"
                                    value={editingClassSchedule.location}
                                    onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, location: e.target.value })}
                                    placeholder="Contoh: Ruang BK, Kelas VII-1"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi / Catatan</label>
                                <textarea
                                    value={editingClassSchedule.description}
                                    onChange={(e) => setEditingClassSchedule({ ...editingClassSchedule, description: e.target.value })}
                                    placeholder="Catatan tambahan tentang sesi konseling..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => {
                                    setShowEditClassModal(false);
                                    setEditingClassSchedule(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateClassSchedule}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Individual Schedule Modal */}
            {showEditIndividualModal && editingIndividualSchedule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Edit Jadwal Individu</h2>
                                    <p className="text-sm text-slate-500">{editingIndividualSchedule.student_name} - {editingIndividualSchedule.student_class}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditIndividualModal(false);
                                    setEditingIndividualSchedule(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Topik / Tujuan Konseling <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editingIndividualSchedule.topic}
                                    onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, topic: e.target.value })}
                                    placeholder="Contoh: Konflik dengan teman, Motivasi belajar, Masalah keluarga"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={editingIndividualSchedule.scheduled_date}
                                        onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, scheduled_date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Waktu <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        value={editingIndividualSchedule.scheduled_time}
                                        onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, scheduled_time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi</label>
                                    <input
                                        type="text"
                                        value={editingIndividualSchedule.duration}
                                        onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, duration: e.target.value })}
                                        placeholder="45 Menit"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi</label>
                                    <input
                                        type="text"
                                        value={editingIndividualSchedule.location}
                                        onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, location: e.target.value })}
                                        placeholder="Ruang BK"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi / Catatan</label>
                                <textarea
                                    value={editingIndividualSchedule.description}
                                    onChange={(e) => setEditingIndividualSchedule({ ...editingIndividualSchedule, description: e.target.value })}
                                    placeholder="Catatan tambahan tentang sesi konseling individu..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => {
                                    setShowEditIndividualModal(false);
                                    setEditingIndividualSchedule(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateIndividualSchedule}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
