import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, Upload, Save, X, Search, Users, Phone, Mail, Briefcase, BookOpen } from 'lucide-react';
import {
    Guru,
    getAllGuruData,
    addGuru,
    updateGuru,
    deleteGuru,
    importGuruFromCSV
} from '@/lib/guruStorage';

interface FormData {
    nip: string;
    nama: string;
    jenisKelamin: 'L' | 'P';
    mataPelajaran: string;
    jabatan: string;
    noTelepon: string;
    email: string;
}

const emptyFormData: FormData = {
    nip: '',
    nama: '',
    jenisKelamin: 'L',
    mataPelajaran: '',
    jabatan: '',
    noTelepon: '',
    email: ''
};

export default function ManajemenGuru() {
    const [daftarGuru, setDaftarGuru] = useState<Guru[]>([]);
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [csvInput, setCsvInput] = useState('');
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGuru();
    }, []);

    const loadGuru = async () => {
        setLoading(true);
        try {
            const data = await getAllGuruData();
            setDaftarGuru(data);
        } catch (error) {
            console.error('Error loading guru:', error);
        } finally {
            setLoading(false);
        }
        setEditingId(null);
        setFormData(emptyFormData);
    };

    const handleAddGuru = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nip.trim() || !formData.nama.trim()) {
            setMessage({ type: 'error', text: 'NIP dan Nama harus diisi' });
            return;
        }

        if (editingId) {
            const updated = await updateGuru(editingId, formData);
            if (updated) {
                setMessage({ type: 'success', text: 'Guru berhasil diperbarui' });
                setEditingId(null);
            } else {
                setMessage({ type: 'error', text: 'Gagal memperbarui guru' });
            }
        } else {
            const isDuplicate = daftarGuru.some(g => g.nip === formData.nip);
            if (isDuplicate) {
                setMessage({ type: 'error', text: 'NIP sudah terdaftar' });
                return;
            }

            const result = await addGuru(formData);
            if (result) {
                setMessage({ type: 'success', text: 'Guru berhasil ditambahkan' });
            } else {
                setMessage({ type: 'error', text: 'Gagal menambahkan guru' });
            }
        }

        setFormData(emptyFormData);
        await loadGuru();

        setTimeout(() => setMessage(null), 3000);
    };

    const handleEditGuru = (guru: Guru) => {
        setEditingId(guru.id);
        setFormData({
            nip: guru.nip,
            nama: guru.nama,
            jenisKelamin: guru.jenisKelamin,
            mataPelajaran: guru.mataPelajaran || '',
            jabatan: guru.jabatan || '',
            noTelepon: guru.noTelepon || '',
            email: guru.email || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(emptyFormData);
    };

    const handleDeleteGuru = async (guruId: string, namaGuru: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${namaGuru}?`)) {
            const success = await deleteGuru(guruId);
            if (success) {
                setMessage({ type: 'success', text: 'Guru berhasil dihapus' });
                await loadGuru();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Gagal menghapus guru' });
            }
        }
    };

    const handleImportCSV = async () => {
        if (!csvInput.trim()) {
            setMessage({ type: 'error', text: 'Masukkan data CSV terlebih dahulu' });
            return;
        }

        const count = await importGuruFromCSV(csvInput);
        setMessage({ type: 'success', text: `${count} guru berhasil diimpor` });
        setCsvInput('');
        setShowCsvImport(false);
        await loadGuru();
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDeleteAllGuru = async () => {
        for (const guru of daftarGuru) {
            await deleteGuru(guru.id);
        }
        setShowDeleteAllConfirm(false);
        setMessage({ type: 'success', text: `${daftarGuru.length} guru berhasil dihapus` });
        await loadGuru();
        setTimeout(() => setMessage(null), 3000);
    };

    const exportToCSV = () => {
        const headers = ['NIP', 'Nama Guru', 'Jenis Kelamin', 'Mata Pelajaran', 'Jabatan', 'No. Telepon', 'Email'];
        const rows = daftarGuru.map(g => [
            g.nip,
            g.nama,
            g.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            g.mataPelajaran || '',
            g.jabatan || '',
            g.noTelepon || '',
            g.email || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_guru_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredGuru = daftarGuru.filter(guru =>
        guru.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guru.nip.includes(searchQuery) ||
        (guru.mataPelajaran && guru.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guru.jabatan && guru.jabatan.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Data Master</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Manajemen Data Guru
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Kelola daftar guru dan tenaga pendidik dengan mudah dan cepat.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                            <span className="text-sm font-medium text-emerald-700">Total: {daftarGuru.length} Guru</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">
                                {daftarGuru.filter(g => g.jenisKelamin === 'L').length} Laki-laki, {daftarGuru.filter(g => g.jenisKelamin === 'P').length} Perempuan
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            {editingId ? 'Edit Guru' : 'Tambah Guru Baru'}
                        </h2>

                        <form onSubmit={handleAddGuru} className="space-y-3">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                    placeholder="Nomor Induk Pegawai"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={!!editingId}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Nama Guru</label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama lengkap guru"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Jenis Kelamin</label>
                                <select
                                    value={formData.jenisKelamin}
                                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Mata Pelajaran</label>
                                <input
                                    type="text"
                                    value={formData.mataPelajaran}
                                    onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                                    placeholder="Misal: Matematika, Bahasa Indonesia"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Jabatan</label>
                                <input
                                    type="text"
                                    value={formData.jabatan}
                                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                                    placeholder="Misal: Guru BK, Wali Kelas"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">No. Telepon</label>
                                <input
                                    type="text"
                                    value={formData.noTelepon}
                                    onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update' : 'Tambah'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                            <button
                                onClick={() => setShowCsvImport(!showCsvImport)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                            >
                                <Upload size={16} />
                                Import CSV
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    {/* Search Bar */}
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, NIP, mata pelajaran, atau jabatan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* CSV Import Area */}
                    {showCsvImport && (
                        <div className="card p-6 mb-6 bg-purple-50 border border-purple-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Import Data Guru</h3>
                                <button
                                    onClick={() => setShowCsvImport(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                                Format: NIP, Nama, Jenis Kelamin (L/P), Mata Pelajaran, Jabatan, No Telepon, Email - satu guru per baris
                            </p>

                            <textarea
                                value={csvInput}
                                onChange={(e) => setCsvInput(e.target.value)}
                                placeholder="001, Nama Guru, L, Matematika, Guru BK, 08123456789, email@example.com&#10;002, Nama Guru, P, Bahasa Indonesia, Wali Kelas, 08987654321, guru@school.com"
                                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                rows={5}
                            />

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handleImportCSV}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                >
                                    Import
                                </button>
                                <button
                                    onClick={() => setShowCsvImport(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Teachers List */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Daftar Guru
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                    {filteredGuru.length} guru
                                </span>
                                {daftarGuru.length > 0 && (
                                    <button
                                        onClick={() => setShowDeleteAllConfirm(true)}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    >
                                        Hapus Semua
                                    </button>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat data guru...</p>
                            </div>
                        ) : filteredGuru.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">👨‍🏫</div>
                                <p className="text-gray-600 mb-2">Belum ada data guru</p>
                                <p className="text-sm text-gray-500">Tambahkan guru menggunakan form di sebelah kiri</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300 bg-gray-100">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">NIP</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Guru</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">JK</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Mata Pelajaran</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Jabatan</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Kontak</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGuru.map((guru, index) => (
                                            <tr key={guru.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                                                <td className="py-3 px-4 text-gray-700 font-medium">{guru.nip}</td>
                                                <td className="py-3 px-4 text-gray-900">{guru.nama}</td>
                                                <td className="py-3 px-4 text-center text-gray-700">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${guru.jenisKelamin === 'L'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-pink-100 text-pink-700'
                                                        }`}>
                                                        {guru.jenisKelamin === 'L' ? 'L' : 'P'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">{guru.mataPelajaran || '-'}</td>
                                                <td className="py-3 px-4 text-gray-700">{guru.jabatan || '-'}</td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    <div className="flex flex-col gap-1">
                                                        {guru.noTelepon && (
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Phone size={12} className="text-gray-400" />
                                                                <span>{guru.noTelepon}</span>
                                                            </div>
                                                        )}
                                                        {guru.email && (
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Mail size={12} className="text-gray-400" />
                                                                <span>{guru.email}</span>
                                                            </div>
                                                        )}
                                                        {!guru.noTelepon && !guru.email && '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditGuru(guru)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGuru(guru.id, guru.nama)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                </div>
            </div>

            {/* Delete All Confirmation Modal */}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="text-red-600 text-2xl">⚠️</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Hapus Semua Guru</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Anda yakin ingin menghapus <strong>{daftarGuru.length} guru</strong>? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteAllGuru}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
