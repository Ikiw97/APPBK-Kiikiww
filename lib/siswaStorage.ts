import { SiswaAbsensi, DAFTAR_KELAS_SMP } from './absensiTypes';

const STORAGE_KEY = 'bk_dashboard_siswa_data';

// Fetch all students from API (Supabase)
export async function getAllSiswaData(): Promise<Record<string, SiswaAbsensi[]>> {
  try {
    const response = await fetch('/api/students/get-all');
    const result = await response.json();

    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching students from API:', error);
  }

  // Fallback to localStorage if API fails
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading siswa data from localStorage:', error);
    }
  }

  return {};
}

// Get students by class (now async)
export async function getSiswaByKelas(kelas: string): Promise<SiswaAbsensi[]> {
  const allData = await getAllSiswaData();
  return allData[kelas] || [];
}

// Add new student via API
export async function addSiswa(kelas: string, siswa: Omit<SiswaAbsensi, 'id' | 'kelas'>): Promise<SiswaAbsensi | null> {
  try {
    const response = await fetch('/api/students/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nis: siswa.nis,
        nama: siswa.nama,
        kelas,
        jenis_kelamin: siswa.jenisKelamin
      })
    });

    const result = await response.json();
    if (result.success) {
      return {
        id: result.data.id,
        nama: result.data.nama,
        nis: result.data.nis,
        kelas: result.data.kelas,
        jenisKelamin: result.data.jenis_kelamin
      };
    }
  } catch (error) {
    console.error('Error adding student:', error);
  }
  return null;
}

// Update student via API
export async function updateSiswa(kelas: string, siswaId: string, updatedData: Partial<SiswaAbsensi>): Promise<SiswaAbsensi | null> {
  try {
    const response = await fetch('/api/students/manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: siswaId,
        nama: updatedData.nama,
        nis: updatedData.nis,
        jenis_kelamin: updatedData.jenisKelamin
      })
    });

    const result = await response.json();
    if (result.success) {
      return {
        id: result.data.id,
        nama: result.data.nama,
        nis: result.data.nis,
        kelas: result.data.kelas,
        jenisKelamin: result.data.jenis_kelamin
      };
    }
  } catch (error) {
    console.error('Error updating student:', error);
  }
  return null;
}

// Delete student via API
export async function deleteSiswa(kelas: string, siswaId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/students/manage', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: siswaId })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
}

// Delete by NIS (find student first, then delete)
export async function deleteSiswaByNIS(kelas: string, nis: string): Promise<boolean> {
  const allData = await getAllSiswaData();
  const student = allData[kelas]?.find(s => s.nis === nis);

  if (student) {
    return await deleteSiswa(kelas, student.id);
  }
  return false;
}

// Legacy localStorage functions (kept for backward compatibility during migration)
export function saveSiswaData(data: Record<string, SiswaAbsensi[]>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving siswa data:', error);
  }
}

export function initializeDefaultData(): Record<string, SiswaAbsensi[]> {
  const defaultData: Record<string, SiswaAbsensi[]> = {};
  DAFTAR_KELAS_SMP.forEach(kelas => {
    defaultData[kelas] = [];
  });
  saveSiswaData(defaultData);
  return defaultData;
}

// Import CSV - now sends to API
export async function importSiswaFromCSV(csv: string, kelas: string): Promise<number> {
  const lines = csv.trim().split('\n');
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 2) continue;

    const [nis, nama, jenisKelamin = 'L'] = parts;

    if (nis && nama) {
      const result = await addSiswa(kelas, {
        nama,
        nis,
        jenisKelamin: (jenisKelamin.toUpperCase() === 'P' ? 'P' : 'L')
      });

      if (result) count++;
    }
  }

  return count;
}

// Verify student credentials (Name & NIS)
export async function verifyStudentCredentials(nama: string, nis: string): Promise<SiswaAbsensi | null> {
  const allData = await getAllSiswaData();

  // Normalize input for comparison
  const inputNama = nama.trim().toLowerCase();
  const inputNis = nis.trim();

  // Search through all classes
  for (const kelas in allData) {
    const students = allData[kelas];
    const found = students.find(s =>
      s.nis === inputNis &&
      s.nama.toLowerCase() === inputNama
    );

    if (found) {
      return found;
    }
  }

  return null;
}
