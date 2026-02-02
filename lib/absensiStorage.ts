import { RecordAbsensi, AbsensiStatus } from './absensiTypes';

// Fetch all attendance records
export async function getRecordAbsensi(): Promise<RecordAbsensi[]> {
    try {
        const response = await fetch('/api/absensi/record');
        const result = await response.json();

        if (result.success && result.data) {
            return result.data.map((record: any) => ({
                ...record,
                tanggal: new Date(record.tanggal)
            }));
        }
    } catch (error) {
        console.error('Error fetching attendance records:', error);
    }

    // Fallback to localStorage if API fails
    if (typeof window !== 'undefined') {
        try {
            const savedData = localStorage.getItem('recordAbsensi');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return parsedData.map((record: any) => ({
                    ...record,
                    tanggal: new Date(record.tanggal)
                }));
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }
    }

    return [];
}

// Add or update attendance record
export async function upsertRecordAbsensi(
    siswaId: string,
    tanggal: string,
    status: AbsensiStatus,
    existingRecordId?: string,
    keterangan?: string
): Promise<RecordAbsensi | null> {
    try {
        const jamMasuk = (status === 'Hadir' || status === 'Terlambat')
            ? new Date().toTimeString().slice(0, 5)
            : undefined;

        if (existingRecordId) {
            // Update existing record
            const response = await fetch('/api/absensi/record', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: existingRecordId,
                    status,
                    keterangan,
                    jamMasuk
                })
            });

            const result = await response.json();
            if (result.success) {
                return {
                    ...result.data,
                    tanggal: new Date(result.data.tanggal)
                };
            }
        } else {
            // Create new record
            const response = await fetch('/api/absensi/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siswaId,
                    tanggal,
                    status,
                    keterangan,
                    jamMasuk
                })
            });

            const result = await response.json();
            if (result.success) {
                return {
                    ...result.data,
                    tanggal: new Date(result.data.tanggal)
                };
            } else {
                console.error('Failed to save record:', result.error);
            }
        }
    } catch (error) {
        console.error('Error saving attendance record:', error);
    }
    return null;
}

// Delete single record
export async function deleteRecordAbsensi(recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/absensi/record', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: recordId })
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, error: result.error };
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Delete all records (optionally by class)
export async function deleteAllRecordAbsensi(kelas?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/absensi/record', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deleteAll: true,
                kelas: kelas || 'semua'
            })
        });

        const result = await response.json();

        // Also clear localStorage as backup
        if (result.success && typeof window !== 'undefined') {
            localStorage.removeItem('recordAbsensi');
        }

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
