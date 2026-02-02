import React, { useState, useEffect, useCallback } from 'react';
import { BookUser, Plus, Trash2, Search, Edit, X, Calendar, User, Users, FileDown } from 'lucide-react';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import { generateClasses } from '@/lib/classHelper';
import { generateParentGuestBookDoc } from '@/lib/generateParentGuestBookDoc';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface ParentGuestBookEntry {
    id: string;
    visit_date: string;
    student_id: string;
    student_name: string;
    student_class: string;
    parent_name: string;
    visit_purpose: string;
    problem_solution: string;
    created_at: string;
}

interface ParentGuestBookProps {
    schoolMode?: 'smp' | 'sma_smk';
}

export default function ParentGuestBook({ schoolMode = 'smp' }: ParentGuestBookProps) {
    const [entries, setEntries] = useState<ParentGuestBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState<SiswaAbsensi[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<SiswaAbsensi | null>(null);
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [parentName, setParentName] = useState('');
    const [visitPurpose, setVisitPurpose] = useState('');
    const [problemSolution, setProblemSolution] = useState('');

    // Filter states
    const [filterClass, setFilterClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<ParentGuestBookEntry | null>(null);
    const [editVisitDate, setEditVisitDate] = useState('');
    const [editParentName, setEditParentName] = useState('');
    const [editVisitPurpose, setEditVisitPurpose] = useState('');
    const [editProblemSolution, setEditProblemSolution] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    const classes = generateClasses(schoolMode);

    // Fetch entries
    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterClass) params.append('class', filterClass);

            const response = await fetch(`/api/parent-guest-book?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setEntries(result.data);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    }, [filterClass]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    // Load students when class changes
    useEffect(() => {
        const loadStudents = async () => {
            if (!selectedClass) {
                setStudents([]);
                return;
            }
            setLoadingStudents(true);
            try {
                const data = await getSiswaByKelas(selectedClass);
                setStudents(data);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setLoadingStudents(false);
            }
        };
        loadStudents();
        setSelectedStudent(null);
    }, [selectedClass]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudent) {
            alert('Pilih siswa');
            return;
        }

        if (!parentName.trim() || !visitPurpose.trim()) {
            alert('Lengkapi semua field yang diperlukan');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/parent-guest-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visit_date: visitDate,
                    student_id: selectedStudent.id,
                    student_name: selectedStudent.nama,
                    student_class: selectedClass,
                    parent_name: parentName,
                    visit_purpose: visitPurpose,
                    problem_solution: problemSolution
                })
            });

            const result = await response.json();

            if (result.success) {
                setSelectedStudent(null);
                setParentName('');
                setVisitPurpose('');
                setProblemSolution('');
                setVisitDate(new Date().toISOString().split('T')[0]);
                fetchEntries();
                alert('Data berhasil disimpan!');
            } else {
                alert('Gagal menyimpan data: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting entry:', error);
            alert('Terjadi kesalahan saat menyimpan data');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

        try {
            const response = await fetch('/api/parent-guest-book', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const result = await response.json();

            if (result.success) {
                fetchEntries();
            } else {
                alert('Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    // Handle edit
    const handleEdit = (entry: ParentGuestBookEntry) => {
        setEditingEntry(entry);
        setEditVisitDate(entry.visit_date);
        setEditParentName(entry.parent_name);
        setEditVisitPurpose(entry.visit_purpose);
        setEditProblemSolution(entry.problem_solution || '');
        setEditModalOpen(true);
    };

    // Handle update
    const handleUpdate = async () => {
        if (!editingEntry) return;

        if (!editParentName.trim() || !editVisitPurpose.trim()) {
            alert('Lengkapi semua field yang diperlukan');
            return;
        }

        setEditSubmitting(true);
        try {
            const response = await fetch('/api/parent-guest-book', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingEntry.id,
                    visit_date: editVisitDate,
                    student_id: editingEntry.student_id,
                    student_name: editingEntry.student_name,
                    student_class: editingEntry.student_class,
                    parent_name: editParentName,
                    visit_purpose: editVisitPurpose,
                    problem_solution: editProblemSolution
                })
            });

            const result = await response.json();

            if (result.success) {
                setEditModalOpen(false);
                setEditingEntry(null);
                fetchEntries();
                alert('Data berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui data: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Terjadi kesalahan saat memperbarui data');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Filter entries
    const filteredEntries = entries.filter(entry => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesStudent = entry.student_name.toLowerCase().includes(query);
            const matchesParent = entry.parent_name.toLowerCase().includes(query);
            const matchesPurpose = entry.visit_purpose.toLowerCase().includes(query);
            if (!matchesStudent && !matchesParent && !matchesPurpose) return false;
        }
        return true;
    });

    return (
        <div className="px-4 md:px-8 py-6 md:py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Layanan BK</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Buku Tamu Orang Tua
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Catat kunjungan orang tua siswa ke ruang BK.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Plus size={20} className="text-amber-600" />
                    </div>
                    Tambah Data Kunjungan
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                            required
                        />
                    </div>

                    {/* Kelas */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Kelas <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                            required
                        >
                            <option value="">Pilih Kelas</option>
                            {classes.map((cls) => (
                                <option key={cls.value} value={cls.value}>{cls.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nama Siswa */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nama Siswa <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedStudent?.id || ''}
                            onChange={(e) => {
                                const student = students.find(s => s.id === e.target.value);
                                setSelectedStudent(student || null);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                            disabled={!selectedClass || loadingStudents}
                            required
                        >
                            <option value="">
                                {loadingStudents ? 'Memuat siswa...' : 'Pilih Siswa'}
                            </option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.nama} ({student.nis})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nama Orang Tua */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nama Orang Tua <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="Nama orang tua/wali..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                            required
                        />
                    </div>

                    {/* Uraian Keperluan */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Uraian Keperluan Kehadiran <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={visitPurpose}
                            onChange={(e) => setVisitPurpose(e.target.value)}
                            placeholder="Jelaskan keperluan kunjungan..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-sm"
                            required
                        />
                    </div>

                    {/* Alternatif Penyelesaian Masalah */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Alternatif Penyelesaian Masalah
                        </label>
                        <textarea
                            value={problemSolution}
                            onChange={(e) => setProblemSolution(e.target.value)}
                            placeholder="Jelaskan alternatif penyelesaian masalah (opsional)..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto px-8 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Simpan Data
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama siswa, orang tua, atau keperluan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map((cls) => (
                            <option key={cls.value} value={cls.value}>{cls.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <BookUser size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Belum ada data kunjungan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Siswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kelas</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Orang Tua</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Keperluan</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Solusi</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {new Date(entry.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{entry.student_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{entry.student_class}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{entry.parent_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={entry.visit_purpose}>{entry.visit_purpose}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={entry.problem_solution || '-'}>{entry.problem_solution || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => generateParentGuestBookDoc(entry)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Download DOCX"
                                                >
                                                    <FileDown size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editModalOpen && editingEntry && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Edit Data Kunjungan</h2>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Siswa</label>
                                <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">
                                    {editingEntry.student_name} - {editingEntry.student_class}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                                <input
                                    type="date"
                                    value={editVisitDate}
                                    onChange={(e) => setEditVisitDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Orang Tua</label>
                                <input
                                    type="text"
                                    value={editParentName}
                                    onChange={(e) => setEditParentName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Uraian Keperluan</label>
                                <textarea
                                    value={editVisitPurpose}
                                    onChange={(e) => setEditVisitPurpose(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Alternatif Penyelesaian Masalah</label>
                                <textarea
                                    value={editProblemSolution}
                                    onChange={(e) => setEditProblemSolution(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={editSubmitting}
                                className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {editSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
