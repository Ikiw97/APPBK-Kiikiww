// Guru (Teacher) storage utility functions
// Similar structure to siswaStorage.ts

export interface Guru {
    id: string;
    nip: string;
    nama: string;
    jenisKelamin: 'L' | 'P';
    mataPelajaran?: string;
    jabatan?: string;
    noTelepon?: string;
    email?: string;
}

// Fetch all teachers from API (Supabase)
export async function getAllGuruData(): Promise<Guru[]> {
    try {
        const response = await fetch('/api/teachers/get-all');
        const result = await response.json();

        if (result.success && result.data) {
            // Map API response to Guru interface
            return result.data.map((guru: any) => ({
                id: guru.id,
                nip: guru.nip,
                nama: guru.nama,
                jenisKelamin: guru.jenis_kelamin || 'L',
                mataPelajaran: guru.mata_pelajaran || '',
                jabatan: guru.jabatan || '',
                noTelepon: guru.no_telepon || '',
                email: guru.email || ''
            }));
        }
    } catch (error) {
        console.error('Error fetching teachers from API:', error);
    }

    return [];
}

// Add new teacher via API
export async function addGuru(guru: Omit<Guru, 'id'>): Promise<Guru | null> {
    try {
        const response = await fetch('/api/teachers/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nip: guru.nip,
                nama: guru.nama,
                jenis_kelamin: guru.jenisKelamin,
                mata_pelajaran: guru.mataPelajaran || null,
                jabatan: guru.jabatan || null,
                no_telepon: guru.noTelepon || null,
                email: guru.email || null
            })
        });

        const result = await response.json();
        if (result.success && result.data) {
            return {
                id: result.data.id,
                nip: result.data.nip,
                nama: result.data.nama,
                jenisKelamin: result.data.jenis_kelamin || 'L',
                mataPelajaran: result.data.mata_pelajaran || '',
                jabatan: result.data.jabatan || '',
                noTelepon: result.data.no_telepon || '',
                email: result.data.email || ''
            };
        }
    } catch (error) {
        console.error('Error adding teacher:', error);
    }
    return null;
}

// Update teacher via API
export async function updateGuru(guruId: string, updatedData: Partial<Guru>): Promise<Guru | null> {
    try {
        const response = await fetch('/api/teachers/manage', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: guruId,
                nama: updatedData.nama,
                nip: updatedData.nip,
                jenis_kelamin: updatedData.jenisKelamin,
                mata_pelajaran: updatedData.mataPelajaran || null,
                jabatan: updatedData.jabatan || null,
                no_telepon: updatedData.noTelepon || null,
                email: updatedData.email || null
            })
        });

        const result = await response.json();
        if (result.success && result.data) {
            return {
                id: result.data.id,
                nip: result.data.nip,
                nama: result.data.nama,
                jenisKelamin: result.data.jenis_kelamin || 'L',
                mataPelajaran: result.data.mata_pelajaran || '',
                jabatan: result.data.jabatan || '',
                noTelepon: result.data.no_telepon || '',
                email: result.data.email || ''
            };
        }
    } catch (error) {
        console.error('Error updating teacher:', error);
    }
    return null;
}

// Delete teacher via API
export async function deleteGuru(guruId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/teachers/manage', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: guruId })
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error deleting teacher:', error);
        return false;
    }
}

// Import CSV - sends to API
export async function importGuruFromCSV(csv: string): Promise<number> {
    const lines = csv.trim().split('\n');
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 2) continue;

        // Format: NIP, Nama, Jenis Kelamin (L/P), Mata Pelajaran, Jabatan, No Telepon, Email
        const [nip, nama, jenisKelamin = 'L', mataPelajaran = '', jabatan = '', noTelepon = '', email = ''] = parts;

        if (nip && nama) {
            const result = await addGuru({
                nip,
                nama,
                jenisKelamin: (jenisKelamin.toUpperCase() === 'P' ? 'P' : 'L'),
                mataPelajaran: mataPelajaran || undefined,
                jabatan: jabatan || undefined,
                noTelepon: noTelepon || undefined,
                email: email || undefined
            });

            if (result) count++;
        }
    }

    return count;
}
