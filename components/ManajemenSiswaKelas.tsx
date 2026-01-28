import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, Upload, Save, X, Search } from 'lucide-react';
import {
  SiswaAbsensi,
  DAFTAR_KELAS_SMP,
  getDaftarKelas
} from '@/lib/absensiTypes';
import {
  getAllSiswaData,
  addSiswa,
  updateSiswa,
  deleteSiswa,
  importSiswaFromCSV,
  getSiswaByKelas
} from '@/lib/siswaStorage';

interface FormData {
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
}

interface ManajemenSiswaKelasProps {
  schoolMode?: 'smp' | 'sma_smk';
}

export default function ManajemenSiswaKelas({ schoolMode = 'smp' }: ManajemenSiswaKelasProps) {
  const daftarKelas = getDaftarKelas(schoolMode);
  const [selectedKelas, setSelectedKelas] = useState(daftarKelas[0] || 'VII-1');
  const [daftarSiswa, setDaftarSiswa] = useState<SiswaAbsensi[]>([]);
  const [formData, setFormData] = useState<FormData>({ nis: '', nama: '', jenisKelamin: 'L' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [totalSiswaSemuaKelas, setTotalSiswaSemuaKelas] = useState(0);

  useEffect(() => {
    setSelectedKelas(daftarKelas[0] || 'VII-1');
  }, [schoolMode]);

  useEffect(() => {
    loadSiswaKelas();
  }, [selectedKelas]);

  // Load total students from all classes
  useEffect(() => {
    const loadTotalSiswa = async () => {
      const allSiswa = await getAllSiswaData();
      const total = Object.values(allSiswa).reduce((sum, siswaList) => sum + siswaList.length, 0);
      setTotalSiswaSemuaKelas(total);
    };
    loadTotalSiswa();
  }, [daftarSiswa]); // Re-calculate when current class data changes

  const loadSiswaKelas = async () => {
    const siswa = await getSiswaByKelas(selectedKelas);
    setDaftarSiswa(siswa);
    setEditingId(null);
    setFormData({ nis: '', nama: '', jenisKelamin: 'L' });
  };

  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nis.trim() || !formData.nama.trim()) {
      setMessage({ type: 'error', text: 'NIS dan Nama harus diisi' });
      return;
    }

    if (editingId) {
      const updated = await updateSiswa(selectedKelas, editingId, formData);
      if (updated) {
        setMessage({ type: 'success', text: 'Siswa berhasil diperbarui' });
        setEditingId(null);
      }
    } else {
      const isDuplicate = daftarSiswa.some(s => s.nis === formData.nis);
      if (isDuplicate) {
        setMessage({ type: 'error', text: 'NIS sudah terdaftar di kelas ini' });
        return;
      }

      await addSiswa(selectedKelas, formData);
      setMessage({ type: 'success', text: 'Siswa berhasil ditambahkan' });
    }

    setFormData({ nis: '', nama: '', jenisKelamin: 'L' });
    await loadSiswaKelas();

    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditSiswa = (siswa: SiswaAbsensi) => {
    setEditingId(siswa.id);
    setFormData({
      nis: siswa.nis,
      nama: siswa.nama,
      jenisKelamin: siswa.jenisKelamin
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ nis: '', nama: '', jenisKelamin: 'L' });
  };

  const handleDeleteSiswa = async (siswaId: string, namaSiswa: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${namaSiswa}?`)) {
      const success = await deleteSiswa(selectedKelas, siswaId);
      if (success) {
        setMessage({ type: 'success', text: 'Siswa berhasil dihapus' });
        await loadSiswaKelas();
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleImportCSV = async () => {
    if (!csvInput.trim()) {
      setMessage({ type: 'error', text: 'Masukkan data CSV terlebih dahulu' });
      return;
    }

    const count = await importSiswaFromCSV(csvInput, selectedKelas);
    setMessage({ type: 'success', text: `${count} siswa berhasil diimpor` });
    setCsvInput('');
    setShowCsvImport(false);
    await loadSiswaKelas();
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAllSiswa = () => {
    daftarSiswa.forEach(siswa => {
      deleteSiswa(selectedKelas, siswa.id);
    });
    setShowDeleteAllConfirm(false);
    setMessage({ type: 'success', text: `${daftarSiswa.length} siswa berhasil dihapus` });
    loadSiswaKelas();
    setTimeout(() => setMessage(null), 3000);
  };

  const exportToCSV = () => {
    const headers = ['NIS', 'Nama Siswa', 'Jenis Kelamin'];
    const rows = daftarSiswa.map(s => [
      s.nis,
      s.nama,
      s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siswa_${selectedKelas}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSiswa = daftarSiswa.filter(siswa =>
    siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.nis.includes(searchQuery)
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
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-5">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">Data Master</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Manajemen Siswa per Kelas
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-xl">
                Kelola daftar siswa untuk setiap kelas dengan mudah dan cepat.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              <span className="text-sm font-medium text-blue-700">Total: {totalSiswaSemuaKelas} Siswa (Semua Kelas)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-slate-700">{daftarSiswa.length} Siswa di {selectedKelas}</span>
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
              {editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daftarKelas.map(kelas => (
                  <option key={kelas} value={kelas}>{kelas}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddSiswa} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">NIS</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Nomor Induk Siswa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingId}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap siswa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
              placeholder="Cari berdasarkan nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CSV Import Area */}
          {showCsvImport && (
            <div className="card p-6 mb-6 bg-purple-50 border border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Import Data Siswa</h3>
                <button
                  onClick={() => setShowCsvImport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Format: NIS, Nama, Jenis Kelamin (L/P) - satu siswa per baris
              </p>

              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="001, Nama Siswa, L&#10;002, Nama Siswa, P"
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

          {/* Students List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Daftar Siswa Kelas {selectedKelas}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {filteredSiswa.length} siswa
                </span>
                {daftarSiswa.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>

            {filteredSiswa.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-gray-600 mb-2">Belum ada siswa di kelas ini</p>
                <p className="text-sm text-gray-500">Tambahkan siswa menggunakan form di sebelah kiri</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">NIS</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Siswa</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Jenis Kelamin</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSiswa.map((siswa, index) => (
                      <tr key={siswa.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{siswa.nis}</td>
                        <td className="py-3 px-4 text-gray-900">{siswa.nama}</td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditSiswa(siswa)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(siswa.id, siswa.nama)}
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
                <h3 className="text-lg font-bold text-gray-900">Hapus Semua Siswa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Anda yakin ingin menghapus <strong>{daftarSiswa.length} siswa</strong> dari kelas <strong>{selectedKelas}</strong>? Tindakan ini tidak dapat dibatalkan.
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
                onClick={handleDeleteAllSiswa}
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
