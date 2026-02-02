import React, { useState, useEffect } from 'react';
import { getAllSiswaData } from '@/lib/siswaStorage';
import { SiswaAbsensi, DAFTAR_KELAS_SMP, DAFTAR_KELAS_SMA, DAFTAR_KELAS_SMK } from '@/lib/absensiTypes';
import { ChevronLeft, Users, Shuffle, ChevronDown, User } from 'lucide-react';

interface GroupGeneratorProps {
    onBack: () => void;
    schoolMode?: 'smp' | 'sma_smk';
}

export default function GroupGenerator({ onBack, schoolMode = 'smp' }: GroupGeneratorProps) {
    const [allStudents, setAllStudents] = useState<Record<string, SiswaAbsensi[]>>({});
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [currentStudents, setCurrentStudents] = useState<SiswaAbsensi[]>([]);

    const [numberOfGroups, setNumberOfGroups] = useState<number>(5);
    const [generatedGroups, setGeneratedGroups] = useState<SiswaAbsensi[][]>([]);
    const [isGenerated, setIsGenerated] = useState(false);

    // Load students on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await getAllSiswaData();
            setAllStudents(data);

            // Helper to get numeric value for Roman numerals for sorting
            const getRomanValue = (roman: string) => {
                const map: Record<string, number> = { 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 };
                return map[roman] || 0;
            };

            const sortClasses = (a: string, b: string) => {
                const [romanA, suffixA] = a.split('-');
                const [romanB, suffixB] = b.split('-');

                const valA = getRomanValue(romanA);
                const valB = getRomanValue(romanB);

                if (valA !== valB) return valA - valB;
                return parseInt(suffixA || '0') - parseInt(suffixB || '0');
            };

            // Determine which class list to show based on schoolMode
            let standardClasses: string[] = [];
            if (schoolMode === 'sma_smk') {
                standardClasses = [...DAFTAR_KELAS_SMA, ...DAFTAR_KELAS_SMK];
            } else {
                standardClasses = DAFTAR_KELAS_SMP;
            }

            // Create unique set of classes
            const allClasses = Array.from(new Set([
                ...standardClasses,
                ...Object.keys(data)
            ])).sort(sortClasses);

            // Filter by mode
            const isSmpClass = (cls: string) => cls.startsWith('VII') || cls.startsWith('VIII') || cls.startsWith('IX');
            const isSmaClass = (cls: string) => cls.startsWith('X') || cls.startsWith('XI') || cls.startsWith('XII');

            const filteredClasses = allClasses.filter(cls => {
                if (schoolMode === 'smp') return isSmpClass(cls);
                if (schoolMode === 'sma_smk') return isSmaClass(cls);
                return isSmpClass(cls);
            });

            setAvailableClasses(filteredClasses);

            if (filteredClasses.length > 0) {
                setSelectedClass(filteredClasses[0]);
            }
        };
        loadData();
    }, [schoolMode]);

    // Update current students when class changes
    useEffect(() => {
        if (selectedClass && allStudents[selectedClass]) {
            setCurrentStudents(allStudents[selectedClass]);
            setIsGenerated(false);
            setGeneratedGroups([]);
        } else {
            setCurrentStudents([]);
        }
    }, [selectedClass, allStudents]);

    const handleGenerate = () => {
        if (!currentStudents.length) return;

        const males = currentStudents.filter(s => s.jenisKelamin === 'L');
        const females = currentStudents.filter(s => s.jenisKelamin === 'P');

        // Simple shuffle function
        const shuffle = (array: any[]) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };

        const shuffledMales = shuffle(males);
        const shuffledFemales = shuffle(females);

        const groups: SiswaAbsensi[][] = Array.from({ length: numberOfGroups }, () => []);

        // Distribute Males
        shuffledMales.forEach((student, index) => {
            groups[index % numberOfGroups].push(student);
        });

        // Distribute Females
        shuffledFemales.forEach((student, index) => {
            groups[index % numberOfGroups].push(student);
        });

        setGeneratedGroups(groups);
        setIsGenerated(true);
    };

    const handleMoveStudent = (studentId: string, fromGroupIndex: number, toGroupIndex: number) => {
        if (fromGroupIndex === toGroupIndex) return;

        const newGroups = [...generatedGroups];
        const studentIndex = newGroups[fromGroupIndex].findIndex(s => s.id === studentId);

        if (studentIndex !== -1) {
            const [student] = newGroups[fromGroupIndex].splice(studentIndex, 1);
            newGroups[toGroupIndex].push(student);
            setGeneratedGroups(newGroups);
        }
    };

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                        >
                            <ChevronLeft size={20} />
                            Kembali ke Menu
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">👥 Group Generator</h1>
                        <p className="text-gray-600">Bagi kelompok kelas secara otomatis dengan distribusi gender seimbang</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-700 pl-2 pr-2">Jumlah Kelompok:</span>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={numberOfGroups}
                                onChange={(e) => setNumberOfGroups(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                                className="w-16 border-gray-300 rounded-md text-center focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center">
                            <span className="text-sm font-medium text-gray-700 pl-2 pr-2">Kelas:</span>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="border-none bg-transparent py-1 pl-1 pr-8 rounded-md text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer"
                            >
                                {availableClasses.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95"
                        >
                            <Shuffle size={20} />
                            Acak Kelompok
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isGenerated ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-primary-50 px-4 py-3 border-b border-primary-100 flex justify-between items-center">
                                    <h3 className="font-bold text-primary-800">Kelompok {groupIndex + 1}</h3>
                                    <span className="text-xs font-semibold bg-white text-primary-600 px-2 py-1 rounded-full border border-primary-100">
                                        {group.length} Siswa
                                    </span>
                                </div>
                                <div className="p-4 space-y-2">
                                    {group.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 group transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${student.jenisKelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                    {student.jenisKelamin}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{student.nama}</span>
                                            </div>

                                            {/* Move Button */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="relative">
                                                    <select
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        value={""} // Always empty to show icon
                                                        onChange={(e) => handleMoveStudent(student.id, groupIndex, parseInt(e.target.value))}
                                                    >
                                                        <option value="" disabled>Pindah ke...</option>
                                                        {generatedGroups.map((_, idx) => (
                                                            idx !== groupIndex && (
                                                                <option key={idx} value={idx}>Kelompok {idx + 1}</option>
                                                            )
                                                        ))}
                                                    </select>
                                                    <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Pindah Kelompok">
                                                        <Users size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {group.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 italic text-sm">
                                            Kelompok Kosong
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8">
                        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Users size={48} className="text-primary-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Siap untuk Membagi Kelompok?</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            Pilih kelas dan jumlah kelompok, lalu klik tombol "Acak Kelompok" untuk mulai membagi siswa.
                            Sistem akan otomatis menyeimbangkan jumlah siswa laki-laki dan perempuan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
