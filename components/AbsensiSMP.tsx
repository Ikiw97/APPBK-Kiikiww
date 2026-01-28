import React, { useState, useEffect } from 'react';
import { Plus, Search, BarChart3, Calendar, Users, TrendingUp, Download, Eye, Trash2, Edit2, Settings, RefreshCw, FileSpreadsheet } from 'lucide-react';
import * as XPS from 'xlsx';
import {
  AbsensiStatus,
  RecordAbsensi,
  SiswaAbsensi,
  LaporanAbsensiSiswa,
  STATUS_ABSENSI,
  DAFTAR_KELAS_SMP,
  DAFTAR_KELAS_SMA,
  getDaftarKelas,
  getTitleAbsensi,
  getWarnaDariBentukAbsensi,
  hitungPersentaseKehadiran,
  getStatusKesehatan
} from '@/lib/absensiTypes';
import { getSiswaByKelas, getAllSiswaData } from '@/lib/siswaStorage';
import { getRecordAbsensi, upsertRecordAbsensi, deleteRecordAbsensi, deleteAllRecordAbsensi } from '@/lib/absensiStorage';


interface AbsensiSMPProps {
  schoolMode?: 'smp' | 'sma_smk';
}

export default function AbsensiSMP({ schoolMode = 'smp' }: AbsensiSMPProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'laporan' | 'statistik'>('input');
  const [selectedKelas, setSelectedKelas] = useState(() => {
    const daftarKelas = getDaftarKelas(schoolMode);
    return daftarKelas[0] || 'VII-1';
  });
  const [recordAbsensi, setRecordAbsensi] = useState<RecordAbsensi[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<SiswaAbsensi[]>([]);
  const [allSiswa, setAllSiswa] = useState<SiswaAbsensi[]>([]);
  const [tanggalInput, setTanggalInput] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiswaLaporan, setSelectedSiswaLaporan] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordAbsensi | null>(null);


  const [filterKelasLaporan, setFilterKelasLaporan] = useState<string>('semua');
  const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [pendingAbsensi, setPendingAbsensi] = useState<Record<string, AbsensiStatus>>({});
  const [pendingKeterangan, setPendingKeterangan] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // State untuk filter statistik
  const [filterKelasStatistik, setFilterKelasStatistik] = useState<string>('semua');
  const [filterBulanStatistik, setFilterBulanStatistik] = useState<string>('semua');

  useEffect(() => {
    // Reset kelas ke default ketika schoolMode berubah
    const daftarKelas = getDaftarKelas(schoolMode);
    setSelectedKelas(daftarKelas[0] || 'VII-1');
    // Clear active tab untuk dashboard
    setActiveTab('input');
  }, [schoolMode]);

  useEffect(() => {
    loadDataSiswa();
    loadRecordAbsensi();
    loadAllSiswa();
    // Reset pending absensi saat kelas berubah
    setPendingAbsensi({});
    setPendingKeterangan({});
  }, [selectedKelas]);

  // Removed localStorage sync - now using database

  const loadDataSiswa = async () => {
    const siswa = await getSiswaByKelas(selectedKelas);
    setDaftarSiswa(siswa);
  };

  const loadAllSiswa = async () => {
    try {
      const allData = await getAllSiswaData();
      // Flatten all classes into single array
      const allStudents: SiswaAbsensi[] = [];
      Object.values(allData).forEach(studentList => {
        allStudents.push(...studentList);
      });
      setAllSiswa(allStudents);
    } catch (error) {
      console.error('Error loading all students:', error);
      setAllSiswa([]);
    }
  };

  const loadRecordAbsensi = async () => {
    try {
      const data = await getRecordAbsensi();
      setRecordAbsensi(data);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setRecordAbsensi([]);
    }
  };

  const handleTambahAbsensi = (siswaId: string, status: AbsensiStatus) => {
    // Simpan sementara ke local state
    setPendingAbsensi(prev => ({
      ...prev,
      [siswaId]: status
    }));
  };

  const handleSimpanAbsensi = async () => {
    const siswaIdsToSave = new Set([
      ...Object.keys(pendingAbsensi),
      ...Object.keys(pendingKeterangan)
    ]);

    if (siswaIdsToSave.size === 0) {
      alert('Belum ada data yang diubah!');
      return;
    }

    setIsSaving(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const siswaId of siswaIdsToSave) {
        // Cek apakah sudah ada record untuk tanggal ini
        const existingRecord = recordAbsensi.find(r =>
          r.siswaId === siswaId &&
          new Date(r.tanggal).toISOString().split('T')[0] === tanggalInput
        );

        // Determine status: prefer pending, fallback to existing.
        // If neither, skip (cannot save description for non-existent record without status)
        const status = pendingAbsensi[siswaId] ?? existingRecord?.status;

        if (!status) {
          console.warn(`Skipping save for student ${siswaId}: No status provided`);
          continue;
        }

        const keterangan = pendingKeterangan[siswaId] ?? existingRecord?.keterangan;

        const result = await upsertRecordAbsensi(
          siswaId,
          tanggalInput,
          status,
          existingRecord?.id,
          keterangan
        );

        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Reload data setelah simpan
      await loadRecordAbsensi();

      // Reset pending absensi
      setPendingAbsensi({});
      setPendingKeterangan({});

      if (errorCount === 0) {
        alert(`Berhasil menyimpan ${successCount} absensi siswa!`);
      } else {
        alert(`Berhasil: ${successCount}, Gagal: ${errorCount}`);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Terjadi kesalahan saat menyimpan absensi!');
    } finally {
      setIsSaving(false);
    }
  };

  const getPendingOrExistingStatus = (siswaId: string): AbsensiStatus | undefined => {
    // Prioritaskan pending absensi, lalu existing record
    if (pendingAbsensi[siswaId]) {
      return pendingAbsensi[siswaId];
    }
    const existingRecord = recordAbsensi.find(r =>
      r.siswaId === siswaId &&
      new Date(r.tanggal).toISOString().split('T')[0] === tanggalInput
    );
    return existingRecord?.status;
  };

  const handleHapusRecord = async (recordId: string) => {
    if (!recordId) return;

    try {
      // Optimistic update
      setRecordAbsensi(prev => prev.filter(r => r.id !== recordId));

      const result = await deleteRecordAbsensi(recordId);
      if (!result.success) {
        // Rollback if failed
        await loadRecordAbsensi();
        window.alert(`Gagal menghapus catatan: ${result.error || 'Terjadi kesalahan tidak dikenal'}`);
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      await loadRecordAbsensi();
    }
  };

  const hitungLaporanSiswa = (siswaId: string, useAllSiswa: boolean = false): LaporanAbsensiSiswa | null => {
    const siswaList = useAllSiswa ? allSiswa : daftarSiswa;
    const siswa = siswaList.find(s => s.id === siswaId);
    if (!siswa) return null;

    const recordSiswa = recordAbsensi.filter(r => r.siswaId === siswaId);
    const hadir = recordSiswa.filter(r => r.status === 'Hadir').length;
    const ijin = recordSiswa.filter(r => r.status === 'Ijin').length;
    const sakit = recordSiswa.filter(r => r.status === 'Sakit').length;
    const alfa = recordSiswa.filter(r => r.status === 'Alfa').length;
    const terlambat = recordSiswa.filter(r => r.status === 'Terlambat').length;
    const izinKeluar = recordSiswa.filter(r => r.status === 'Izin Keluar').length;

    const totalHari = recordSiswa.length;
    const hariHadir = hadir + terlambat; // Terlambat tetap dihitung sebagai hadir

    return {
      siswaId,
      namaSiswa: siswa.nama,
      nis: siswa.nis,
      kelas: siswa.kelas,
      hadir,
      ijin,
      sakit,
      alfa,
      terlambat,
      izinKeluar,
      totalHari,
      persentaseKehadiran: hitungPersentaseKehadiran(totalHari, hariHadir)
    };
  };

  const getCheckStatus = (siswaId: string, tanggal: string) => {
    return recordAbsensi.find(r =>
      r.siswaId === siswaId &&
      new Date(r.tanggal).toISOString().split('T')[0] === tanggal
    );
  };

  const renderInputAbsensi = () => {
    if (daftarSiswa.length === 0) {
      return (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Input Absensi Harian</h2>
              <button
                onClick={() => {
                  loadDataSiswa();
                  loadRecordAbsensi();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh data siswa dan absensi"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
          <div className="card p-12 text-center bg-blue-50 border-2 border-blue-200">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data Siswa</h2>
            <p className="text-gray-600 mb-6">Silakan tambahkan data siswa terlebih dahulu di menu "Data Master" pada sidebar.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Input Absensi Harian</h2>
            <button
              onClick={() => {
                loadDataSiswa();
                loadRecordAbsensi();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh data siswa dan absensi"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
              <input
                type="date"
                value={tanggalInput}
                onChange={(e) => {
                  setTanggalInput(e.target.value);
                  // Reset pending saat tanggal berubah
                  setPendingAbsensi({});
                  setPendingKeterangan({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value);
                  loadDataSiswa();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getDaftarKelas(schoolMode).map(kelas => (
                  <option key={kelas} value={kelas}>{kelas}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">NIS</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Siswa</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Hadir</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ijin</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Sakit</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Alfa</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Terlambat</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Izin Keluar</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 w-48">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {daftarSiswa.map((siswa, index) => {
                  const pendingStatus = pendingAbsensi[siswa.id];
                  const existingRecord = recordAbsensi.find(r =>
                    r.siswaId === siswa.id &&
                    new Date(r.tanggal).toISOString().split('T')[0] === tanggalInput
                  );
                  const existingStatus = existingRecord?.status;
                  const isPendingRow = pendingStatus !== undefined;

                  const getBtnClass = (type: AbsensiStatus, activeColor: string, subtleColor: string, hoverColor: string) => {
                    const isPending = pendingStatus === type;
                    const isSaved = !pendingStatus && existingStatus === type;
                    const base = "w-8 h-8 rounded font-bold transition-all duration-200 flex items-center justify-center mx-auto ";

                    if (isPending) return base + activeColor + " text-white shadow-md transform scale-110 z-10 ring-2 ring-offset-1 " + activeColor.replace('bg-', 'ring-');
                    if (isSaved) return base + subtleColor + " border " + subtleColor.replace('bg-', 'border-').replace('100', '200');
                    return base + "bg-gray-100 text-gray-400 " + hoverColor;
                  };

                  return (
                    <tr key={siswa.id} className={`border-b border-gray-200 hover:bg-gray-50/50 ${isPendingRow ? 'bg-yellow-50/50' : ''}`}>
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{siswa.nis}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {siswa.nama}
                        {isPendingRow && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-normal">Pending</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Hadir')}
                          className={getBtnClass('Hadir', 'bg-green-500', 'bg-green-100 text-green-700', 'hover:bg-green-200 hover:text-green-700')}
                          title="Hadir"
                        >
                          ✓
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Ijin')}
                          className={getBtnClass('Ijin', 'bg-blue-500', 'bg-blue-100 text-blue-700', 'hover:bg-blue-200 hover:text-blue-700')}
                          title="Ijin"
                        >
                          I
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Sakit')}
                          className={getBtnClass('Sakit', 'bg-yellow-500', 'bg-yellow-100 text-yellow-700', 'hover:bg-yellow-200 hover:text-yellow-700')}
                          title="Sakit"
                        >
                          S
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Alfa')}
                          className={getBtnClass('Alfa', 'bg-red-500', 'bg-red-100 text-red-700', 'hover:bg-red-200 hover:text-red-700')}
                          title="Alfa"
                        >
                          A
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Terlambat')}
                          className={getBtnClass('Terlambat', 'bg-orange-500', 'bg-orange-100 text-orange-700', 'hover:bg-orange-200 hover:text-orange-700')}
                          title="Terlambat"
                        >
                          T
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTambahAbsensi(siswa.id, 'Izin Keluar')}
                          className={getBtnClass('Izin Keluar', 'bg-purple-500', 'bg-purple-100 text-purple-700', 'hover:bg-purple-200 hover:text-purple-700')}
                          title="Izin Keluar"
                        >
                          K
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Opsional"
                          value={pendingKeterangan[siswa.id] ?? existingRecord?.keterangan ?? ''}
                          onChange={(e) => setPendingKeterangan(prev => ({
                            ...prev,
                            [siswa.id]: e.target.value
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Info dan Tombol Simpan */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex-1">
              <p className="text-sm text-blue-800">
                <strong>Keterangan:</strong> ✓ = Hadir | I = Ijin | S = Sakit | A = Alfa | T = Terlambat | K = Izin Keluar
              </p>
              {Object.keys(pendingAbsensi).length > 0 && (
                <p className="text-sm text-yellow-700 mt-2">
                  <strong>⚠️ {Object.keys(pendingAbsensi).length} siswa</strong> belum disimpan ke database
                </p>
              )}
            </div>
            <button
              onClick={handleSimpanAbsensi}
              disabled={isSaving || Object.keys(pendingAbsensi).length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${isSaving || Object.keys(pendingAbsensi).length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Menyimpan...
                </>
              ) : (
                <>
                  ✓ Simpan Absensi ({Object.keys(pendingAbsensi).length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLaporan = () => {
    const formatTanggal = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(date).toLocaleDateString('id-ID', options);
    };

    const filterRecords = recordAbsensi.filter(record => {
      const matchesSiswa = !selectedSiswaLaporan || record.siswaId === selectedSiswaLaporan;
      const matchesSearch = allSiswa
        .find(s => s.id === record.siswaId)
        ?.nama.toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesSiswa && matchesSearch;
    });

    const sortedRecords = [...filterRecords].sort((a, b) =>
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    // Hitung laporan untuk statistik/ringkasan
    const laporanAll = allSiswa
      .map(siswa => hitungLaporanSiswa(siswa.id, true))
      .filter(Boolean) as LaporanAbsensiSiswa[];

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Riwayat Kehadiran Siswa
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (reportType === 'daily') {
                      handleDownloadExcel();
                    } else {
                      handleDownloadMonthExcel();
                    }
                  }}
                  disabled={
                    filterKelasLaporan === 'semua' ||
                    (reportType === 'daily' && !selectedDetailDate) ||
                    (reportType === 'monthly' && filterBulanStatistik === 'semua')
                  }
                  className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${filterKelasLaporan === 'semua' ||
                    (reportType === 'daily' && !selectedDetailDate) ||
                    (reportType === 'monthly' && filterBulanStatistik === 'semua')
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  title={filterKelasLaporan === 'semua' ? "Pilih kelas spesifik untuk download" : `Download Excel (${reportType === 'daily' ? 'Harian' : 'Bulanan'})`}
                >
                  <FileSpreadsheet size={16} />
                  {reportType === 'daily' ? 'Excel Harian' : 'Excel Bulanan'}
                </button>
                <button
                  onClick={async () => {
                    // Using a simpler prompt or just direct for now as per user preference
                    if (window.confirm('Hapus semua riwayat absensi?')) {
                      const result = await deleteAllRecordAbsensi();
                      if (result.success) {
                        setRecordAbsensi([]);
                      } else {
                        window.alert(`Gagal menghapus history: ${result.error || 'Terjadi kesalahan tidak dikenal'}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Hapus History
                </button>
              </div>
            </div>

            {/* Filter Controls for Report */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Kelas */}
              <div>
                <select
                  value={filterKelasLaporan}
                  onChange={(e) => setFilterKelasLaporan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semua">Semua Kelas</option>
                  {getDaftarKelas(schoolMode).map((kelas) => (
                    <option key={kelas} value={kelas}>
                      Kelas {kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Mode & Contextual Filter */}
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                {/* Toggle Type */}
                <div className="flex flex-col">
                  <div className="flex bg-gray-100 rounded-lg p-1 h-10 w-fit">
                    <button
                      onClick={() => setReportType('daily')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${reportType === 'daily'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Harian
                    </button>
                    <button
                      onClick={() => setReportType('monthly')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${reportType === 'monthly'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Bulanan
                    </button>
                  </div>
                </div>

                {/* Conditional Input */}
                <div className="flex-1">
                  {reportType === 'daily' ? (
                    <input
                      type="date"
                      value={selectedDetailDate || ''}
                      onChange={(e) => setSelectedDetailDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                    />
                  ) : (
                    <select
                      value={filterBulanStatistik}
                      onChange={(e) => setFilterBulanStatistik(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                    >
                      <option value="semua">Pilih Bulan</option>
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Download Harian Button (moved here for coherence if needed, or keep in header) */}
            {/* Keeping existing download button for daily up top, but adding hint */}
          </div>
        </div>

        {/* Tampilan Riwayat DETAIL dengan Navigasi Tanggal */}
        <div className="space-y-6">

          {selectedDetailDate ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 mb-2">
                Detail Kehadiran: <span className="text-blue-600 font-bold">
                  {new Date(selectedDetailDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Siswa</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NIS</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Kehadiran</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Keterangan</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allSiswa
                      .filter(siswa => {
                        const namaMatch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase());
                        const kelasMatch = filterKelasLaporan === 'semua' || siswa.kelas === filterKelasLaporan;
                        const hasRecordToday = sortedRecords.some(r =>
                          r.siswaId === siswa.id &&
                          r.tanggal.toISOString().split('T')[0] === selectedDetailDate
                        );
                        return namaMatch && kelasMatch && hasRecordToday;
                      })
                      .map((siswa, idx) => {
                        const record = sortedRecords.find(r =>
                          r.siswaId === siswa.id &&
                          r.tanggal.toISOString().split('T')[0] === selectedDetailDate
                        );

                        if (!record) return null;

                        return (
                          <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{siswa.nama}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{siswa.nis}</td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700 font-medium">
                                {record.status}
                                {record.jamMasuk && <span className="ml-1 text-gray-400 font-normal">({record.jamMasuk})</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {record.keterangan || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleHapusRecord(record.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Hapus catatan"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {allSiswa.filter(s =>
                (filterKelasLaporan === 'semua' || s.kelas === filterKelasLaporan) &&
                s.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
                sortedRecords.some(r => r.siswaId === s.id && r.tanggal.toISOString().split('T')[0] === selectedDetailDate)
              ).length === 0 && (
                  <p className="text-center text-gray-500 py-4 border border-dashed rounded-lg">Tidak ada siswa hadir pada tanggal ini dengan filter yang aktif.</p>
                )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 font-medium">Pilih tanggal untuk melihat riwayat kehadiran</p>
            </div>
          )}
        </div>
      </div>
    );
  };


  const handleDownloadExcel = () => {
    if (!selectedDetailDate) {
      alert('Silakan pilih tanggal terlebih dahulu');
      return;
    }

    if (filterKelasLaporan === 'semua') {
      alert('Silakan pilih kelas spesifik untuk download laporan per kelas');
      return;
    }

    // Filter students for the selected class
    const siswaInClass = allSiswa.filter(s => s.kelas === filterKelasLaporan);

    // Sort students by name
    siswaInClass.sort((a, b) => a.nama.localeCompare(b.nama));

    // Get records for the selected date
    const recordsForDate = recordAbsensi.filter(r =>
      new Date(r.tanggal).toISOString().split('T')[0] === selectedDetailDate
    );

    // Prepare data rows
    const rows = siswaInClass.map((siswa, index) => {
      const record = recordsForDate.find(r => r.siswaId === siswa.id);

      return {
        no: index + 1,
        nis: siswa.nis,
        nama: siswa.nama,
        gender: siswa.jenisKelamin || '-',
        hadir: record?.status === 'Hadir' ? '✓' : '',
        ijin: record?.status === 'Ijin' ? '✓' : '',
        sakit: record?.status === 'Sakit' ? '✓' : '',
        alfa: record?.status === 'Alfa' ? '✓' : '',
        terlambat: record?.status === 'Terlambat' ? '✓' : '',
        izinKeluar: record?.status === 'Izin Keluar' ? '✓' : '',
        keterangan: record?.keterangan || ''
      };
    });

    // Create workbook and worksheet
    const wb = XPS.utils.book_new();

    // Custom header structure matches the screenshot
    const dateStrFormatted = new Date(selectedDetailDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const wsData: any[][] = [
      [`Kelas : ${filterKelasLaporan}`], // Row 1: Class info
      [`Tanggal : ${dateStrFormatted}`], // Row 2: Date info
      [], // Empty row for spacing
      ['No', 'NIS', 'Nama', 'L/P', 'hadir', 'ijin', 'sakit', 'alfa', 'terlambat', 'ijin keluar', 'keterangan'] // Header row
    ];

    // Add data rows
    rows.forEach(r => {
      wsData.push([
        r.no,
        r.nis,
        r.nama,
        r.gender,
        r.hadir,
        r.ijin,
        r.sakit,
        r.alfa,
        r.terlambat,
        r.izinKeluar,
        r.keterangan
      ]);
    });

    const ws = XPS.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // no
      { wch: 15 }, // nis
      { wch: 30 }, // nama
      { wch: 5 },  // L/P
      { wch: 8 },  // hadir
      { wch: 8 },  // ijin
      { wch: 8 },  // sakit
      { wch: 8 },  // alfa
      { wch: 10 }, // terlambat
      { wch: 10 }, // izin keluar
      { wch: 30 }  // keterangan
    ];

    XPS.utils.book_append_sheet(wb, ws, "Absensi");

    // Generate filename
    const dateStr = new Date(selectedDetailDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const fileName = `Absensi_Kelas_${filterKelasLaporan}_${dateStr}.xlsx`;

    // Download file
    XPS.writeFile(wb, fileName);
  };

  const handleDownloadMonthExcel = () => {
    if (filterKelasLaporan === 'semua') {
      alert('Silakan pilih kelas spesifik untuk download laporan per kelas');
      return;
    }

    if (filterBulanStatistik === 'semua') {
      alert('Silakan pilih bulan untuk download laporan bulanan');
      return;
    }

    // Filter students
    const siswaInClass = allSiswa.filter(s => s.kelas === filterKelasLaporan);
    siswaInClass.sort((a, b) => a.nama.localeCompare(b.nama));

    // Determine year and month
    const year = new Date().getFullYear(); // Using current year for simplicity, or could add Year selector
    const monthIndex = parseInt(filterBulanStatistik) - 1;

    // Get days in month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    // Header Row 1 & 2
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Prepare Headers
    const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    const headerRow = ['no', 'nis', 'nama', 'L/P', ...dateHeaders, 'keterangan'];

    // Records for the month
    const recordsForMonth = recordAbsensi.filter(r => {
      const d = new Date(r.tanggal);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    });

    const rows = siswaInClass.map((siswa, index) => {
      const rowData: any[] = [
        index + 1,
        siswa.nis,
        siswa.nama,
        siswa.jenisKelamin
      ];

      let keteranganList: string[] = [];

      // Fill Date Columns
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check for weekend (Red cells request)
        // Since xlsx community doesn't allow easy styling, we might just leave them or fill data as usual
        // User asked for "tanda merah itu sabtu dan minggu", implying structure.
        // We will just fill data if any, otherwise empty.

        const record = recordsForMonth.find(r =>
          r.siswaId === siswa.id &&
          new Date(r.tanggal).toISOString().split('T')[0] === dateStr
        );

        if (record) {
          if (record.keterangan) keteranganList.push(`(${day}) ${record.keterangan}`);

          switch (record.status) {
            case 'Hadir': rowData.push('✓'); break;
            case 'Ijin': rowData.push('I'); break;
            case 'Sakit': rowData.push('S'); break;
            case 'Alfa': rowData.push('A'); break;
            case 'Terlambat': rowData.push('T'); break;
            case 'Izin Keluar': rowData.push('K'); break;
            default: rowData.push('');
          }
        } else {
          rowData.push('');
        }
      }

      rowData.push(keteranganList.join(', '));
      return rowData;
    });

    // Create WorkSheet
    const wsData: any[][] = [
      [`kelas : ${filterKelasLaporan}`],
      [`Bulan : ${monthNames[monthIndex]}`],
      headerRow,
      ...rows
    ];

    const wb = XPS.utils.book_new();
    const ws = XPS.utils.aoa_to_sheet(wsData);

    // Column Widths
    const cols = [
      { wch: 4 }, // no
      { wch: 15 }, // nis
      { wch: 30 }, // nama
      { wch: 5 }, // L/P
    ];
    // Add widths for date columns (small)
    for (let i = 0; i < daysInMonth; i++) cols.push({ wch: 3 });
    // Keterangan width
    cols.push({ wch: 50 });

    ws['!cols'] = cols;

    XPS.utils.book_append_sheet(wb, ws, `Absensi ${monthNames[monthIndex]}`);
    XPS.writeFile(wb, `Absensi_Bulanan_${filterKelasLaporan}_${monthNames[monthIndex]}.xlsx`);
  };

  const renderStatistik = () => {
    // Daftar bulan untuk filter
    const daftarBulan = [
      { value: 'semua', label: 'Semua Bulan' },
      { value: '01', label: 'Januari' },
      { value: '02', label: 'Februari' },
      { value: '03', label: 'Maret' },
      { value: '04', label: 'April' },
      { value: '05', label: 'Mei' },
      { value: '06', label: 'Juni' },
      { value: '07', label: 'Juli' },
      { value: '08', label: 'Agustus' },
      { value: '09', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Desember' },
    ];

    // Filter siswa berdasarkan kelas
    const filteredSiswa = filterKelasStatistik === 'semua'
      ? allSiswa
      : allSiswa.filter(s => s.kelas === filterKelasStatistik);

    // Filter record absensi berdasarkan bulan
    const filteredRecords = filterBulanStatistik === 'semua'
      ? recordAbsensi
      : recordAbsensi.filter(r => {
        const bulan = new Date(r.tanggal).toISOString().substring(5, 7);
        return bulan === filterBulanStatistik;
      });

    // Hitung statistik per siswa dengan filtered records
    const hitungLaporanFiltered = (siswaId: string): LaporanAbsensiSiswa | null => {
      const siswa = filteredSiswa.find(s => s.id === siswaId);
      if (!siswa) return null;

      const recordSiswa = filteredRecords.filter(r => r.siswaId === siswaId);
      const hadir = recordSiswa.filter(r => r.status === 'Hadir').length;
      const ijin = recordSiswa.filter(r => r.status === 'Ijin').length;
      const sakit = recordSiswa.filter(r => r.status === 'Sakit').length;
      const alfa = recordSiswa.filter(r => r.status === 'Alfa').length;
      const terlambat = recordSiswa.filter(r => r.status === 'Terlambat').length;
      const izinKeluar = recordSiswa.filter(r => r.status === 'Izin Keluar').length;

      const totalHari = recordSiswa.length;
      const hariHadir = hadir + terlambat;

      return {
        siswaId,
        namaSiswa: siswa.nama,
        nis: siswa.nis,
        kelas: siswa.kelas,
        hadir,
        ijin,
        sakit,
        alfa,
        terlambat,
        izinKeluar,
        totalHari,
        persentaseKehadiran: hitungPersentaseKehadiran(totalHari, hariHadir)
      };
    };

    const laporanFiltered = filteredSiswa
      .map(siswa => hitungLaporanFiltered(siswa.id))
      .filter(Boolean) as LaporanAbsensiSiswa[];

    const rataRataKehadiran = laporanFiltered.length > 0
      ? Math.round(laporanFiltered.reduce((sum, l) => sum + l.persentaseKehadiran, 0) / laporanFiltered.length)
      : 0;

    const totalHadir = laporanFiltered.reduce((sum, l) => sum + l.hadir, 0);
    const totalAlfa = laporanFiltered.reduce((sum, l) => sum + l.alfa, 0);
    const totalSakit = laporanFiltered.reduce((sum, l) => sum + l.sakit, 0);
    const totalIjin = laporanFiltered.reduce((sum, l) => sum + l.ijin, 0);
    const totalTerlambat = laporanFiltered.reduce((sum, l) => sum + l.terlambat, 0);
    const totalIzinKeluar = laporanFiltered.reduce((sum, l) => sum + l.izinKeluar, 0);

    // Ranking siswa per kategori
    const topHadir = [...laporanFiltered].sort((a, b) => b.hadir - a.hadir).filter(l => l.hadir > 0).slice(0, 5);
    const topIjin = [...laporanFiltered].sort((a, b) => b.ijin - a.ijin).filter(l => l.ijin > 0).slice(0, 5);
    const topSakit = [...laporanFiltered].sort((a, b) => b.sakit - a.sakit).filter(l => l.sakit > 0).slice(0, 5);
    const topAlfa = [...laporanFiltered].sort((a, b) => b.alfa - a.alfa).filter(l => l.alfa > 0).slice(0, 5);
    const topTerlambat = [...laporanFiltered].sort((a, b) => b.terlambat - a.terlambat).filter(l => l.terlambat > 0).slice(0, 5);
    const topIzinKeluar = [...laporanFiltered].sort((a, b) => b.izinKeluar - a.izinKeluar).filter(l => l.izinKeluar > 0).slice(0, 5);

    const renderRankingCard = (
      title: string,
      data: LaporanAbsensiSiswa[],
      field: keyof LaporanAbsensiSiswa,
      bgColor: string,
      textColor: string,
      icon: string
    ) => (
      <div className="card p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        {data.length > 0 ? (
          <div className="space-y-2">
            {data.map((l, idx) => (
              <div
                key={l.siswaId}
                className={`flex items-center justify-between p-3 rounded-lg ${idx === 0 ? bgColor : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? textColor + ' bg-white' : 'bg-gray-200 text-gray-700'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className={`font-medium ${idx === 0 ? textColor : 'text-gray-900'}`}>{l.namaSiswa}</p>
                    <p className={`text-xs ${idx === 0 ? textColor + ' opacity-80' : 'text-gray-500'}`}>{l.kelas}</p>
                  </div>
                </div>
                <span className={`font-bold text-lg ${idx === 0 ? textColor : 'text-gray-700'}`}>
                  {l[field] as number}x
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Tidak ada data</p>
        )}
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Statistik</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Filter Kelas</label>
              <select
                value={filterKelasStatistik}
                onChange={(e) => setFilterKelasStatistik(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semua">Semua Kelas</option>
                {getDaftarKelas(schoolMode).map((kelas) => (
                  <option key={kelas} value={kelas}>
                    Kelas {kelas}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Filter Bulan</label>
              <select
                value={filterBulanStatistik}
                onChange={(e) => setFilterBulanStatistik(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daftarBulan.map((bulan) => (
                  <option key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <TrendingUp size={18} />
              </div>
              <p className="text-gray-600 text-xs">Rata-rata Kehadiran</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{rataRataKehadiran}%</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✓</span>
              <p className="text-gray-600 text-xs">Total Hadir</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalHadir}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <p className="text-gray-600 text-xs">Total Ijin</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalIjin}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🤒</span>
              <p className="text-gray-600 text-xs">Total Sakit</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSakit}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">❌</span>
              <p className="text-gray-600 text-xs">Total Alfa</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalAlfa}</p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⏰</span>
              <p className="text-gray-600 text-xs">Total Terlambat</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTerlambat}</p>
          </div>
        </div>

        {/* Distribusi Status Absensi */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribusi Status Absensi</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">{totalHadir} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalHadir / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Ijin</span>
                <span className="text-sm font-medium text-gray-700">{totalIjin} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalIjin / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Sakit</span>
                <span className="text-sm font-medium text-gray-700">{totalSakit} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalSakit / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Alfa</span>
                <span className="text-sm font-medium text-gray-700">{totalAlfa} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalAlfa / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Terlambat</span>
                <span className="text-sm font-medium text-gray-700">{totalTerlambat} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalTerlambat / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Izin Keluar</span>
                <span className="text-sm font-medium text-gray-700">{totalIzinKeluar} record</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalIzinKeluar / (filteredRecords.length || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Siswa */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderRankingCard('Paling Banyak Hadir', topHadir, 'hadir', 'bg-green-100', 'text-green-700', '✅')}
            {renderRankingCard('Paling Banyak Ijin', topIjin, 'ijin', 'bg-blue-100', 'text-blue-700', '📋')}
            {renderRankingCard('Paling Banyak Sakit', topSakit, 'sakit', 'bg-yellow-100', 'text-yellow-700', '🤒')}
            {renderRankingCard('Paling Banyak Alfa', topAlfa, 'alfa', 'bg-red-100', 'text-red-700', '❌')}
            {renderRankingCard('Paling Banyak Terlambat', topTerlambat, 'terlambat', 'bg-orange-100', 'text-orange-700', '⏰')}
            {renderRankingCard('Paling Banyak Izin Keluar', topIzinKeluar, 'izinKeluar', 'bg-purple-100', 'text-purple-700', '🚪')}
          </div>
        </div>
      </div>
    );
  };

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
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Kehadiran</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                {getTitleAbsensi(schoolMode)}
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-xl">
                Kelola kehadiran dan ketidakhadiran siswa dengan mudah dan terstruktur.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
              <Users size={14} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{daftarSiswa.length} Siswa</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-slate-700">{recordAbsensi.length} Record</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Line */}

      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'input'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          Input Absensi
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'laporan'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          Laporan
        </button>
        <button
          onClick={() => setActiveTab('statistik')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'statistik'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          Statistik
        </button>

      </div>

      {activeTab === 'input' && renderInputAbsensi()}
      {activeTab === 'laporan' && renderLaporan()}
      {activeTab === 'statistik' && renderStatistik()}

    </div>
  );
}
