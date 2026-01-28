import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2, Users, User, Search, Printer, Check, Download, Edit, X } from 'lucide-react';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import { generateClasses } from '@/lib/classHelper';
import type { SiswaAbsensi } from '@/lib/absensiTypes';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';

interface CounselingReportStudent {
    student_id: string;
    student_name: string;
    student_nis?: string;
}

interface CounselingReport {
    id: string;
    report_type: 'pribadi' | 'kelompok';
    class: string;
    service_type: 'pribadi' | 'kelompok';
    problem_description: string;
    solution: string;
    counselor?: string;
    students: CounselingReportStudent[];
    created_at: string;
}

interface CounselingReportProps {
    schoolMode?: 'smp' | 'sma_smk';
}

export default function CounselingReport({ schoolMode = 'smp' }: CounselingReportProps) {
    const [reports, setReports] = useState<CounselingReport[]>([]);
    const [loading, setLoading] = useState(true);

    // Individual form states
    const [individualSubmitting, setIndividualSubmitting] = useState(false);
    const [individualClass, setIndividualClass] = useState('');
    const [individualStudents, setIndividualStudents] = useState<SiswaAbsensi[]>([]);
    const [individualLoadingStudents, setIndividualLoadingStudents] = useState(false);
    const [individualSelectedStudent, setIndividualSelectedStudent] = useState<SiswaAbsensi | null>(null);
    const [individualServiceType, setIndividualServiceType] = useState<'pribadi' | 'kelompok'>('pribadi');
    const [individualProblem, setIndividualProblem] = useState('');
    const [individualSolution, setIndividualSolution] = useState('');

    // Group form states
    const [groupSubmitting, setGroupSubmitting] = useState(false);
    const [groupClass, setGroupClass] = useState('');
    const [groupStudents, setGroupStudents] = useState<SiswaAbsensi[]>([]);
    const [groupLoadingStudents, setGroupLoadingStudents] = useState(false);
    const [groupSelectedStudents, setGroupSelectedStudents] = useState<SiswaAbsensi[]>([]);
    const [groupServiceType, setGroupServiceType] = useState<'pribadi' | 'kelompok'>('kelompok');
    const [groupProblem, setGroupProblem] = useState('');
    const [groupSolution, setGroupSolution] = useState('');

    // Filter states
    const [filterClass, setFilterClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<CounselingReport | null>(null);
    const [editServiceType, setEditServiceType] = useState<'pribadi' | 'kelompok'>('pribadi');
    const [editProblem, setEditProblem] = useState('');
    const [editSolution, setEditSolution] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    const classes = generateClasses(schoolMode);

    // Fetch reports
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterClass) params.append('class', filterClass);

            const response = await fetch(`/api/counseling-reports?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setReports(result.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [filterClass]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Load individual students when class changes
    useEffect(() => {
        const loadStudents = async () => {
            if (!individualClass) {
                setIndividualStudents([]);
                return;
            }
            setIndividualLoadingStudents(true);
            try {
                const data = await getSiswaByKelas(individualClass);
                setIndividualStudents(data);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setIndividualLoadingStudents(false);
            }
        };
        loadStudents();
        setIndividualSelectedStudent(null);
    }, [individualClass]);

    // Load group students when class changes
    useEffect(() => {
        const loadStudents = async () => {
            if (!groupClass) {
                setGroupStudents([]);
                return;
            }
            setGroupLoadingStudents(true);
            try {
                const data = await getSiswaByKelas(groupClass);
                setGroupStudents(data);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setGroupLoadingStudents(false);
            }
        };
        loadStudents();
        setGroupSelectedStudents([]);
    }, [groupClass]);

    // Handle individual form submission
    const handleIndividualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!individualSelectedStudent) {
            alert('Pilih siswa');
            return;
        }

        if (!individualProblem.trim() || !individualSolution.trim()) {
            alert('Lengkapi semua field yang diperlukan');
            return;
        }

        setIndividualSubmitting(true);
        try {
            const response = await fetch('/api/counseling-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_type: 'pribadi',
                    class: individualClass,
                    service_type: individualServiceType,
                    problem_description: individualProblem,
                    solution: individualSolution,
                    students: [{
                        student_id: individualSelectedStudent.id,
                        student_name: individualSelectedStudent.nama,
                        student_nis: individualSelectedStudent.nis
                    }]
                })
            });

            const result = await response.json();

            if (result.success) {
                setIndividualSelectedStudent(null);
                setIndividualProblem('');
                setIndividualSolution('');
                setIndividualServiceType('pribadi');
                fetchReports();
                alert('Laporan Pribadi berhasil disimpan!');
            } else {
                alert('Gagal menyimpan laporan: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Terjadi kesalahan saat menyimpan laporan');
        } finally {
            setIndividualSubmitting(false);
        }
    };

    // Handle group form submission
    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (groupSelectedStudents.length === 0) {
            alert('Pilih minimal satu siswa');
            return;
        }

        if (!groupProblem.trim() || !groupSolution.trim()) {
            alert('Lengkapi semua field yang diperlukan');
            return;
        }

        setGroupSubmitting(true);
        try {
            const response = await fetch('/api/counseling-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_type: 'kelompok',
                    class: groupClass,
                    service_type: groupServiceType,
                    problem_description: groupProblem,
                    solution: groupSolution,
                    students: groupSelectedStudents.map(s => ({
                        student_id: s.id,
                        student_name: s.nama,
                        student_nis: s.nis
                    }))
                })
            });

            const result = await response.json();

            if (result.success) {
                setGroupSelectedStudents([]);
                setGroupProblem('');
                setGroupSolution('');
                setGroupServiceType('kelompok');
                fetchReports();
                alert('Laporan Kelompok berhasil disimpan!');
            } else {
                alert('Gagal menyimpan laporan: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Terjadi kesalahan saat menyimpan laporan');
        } finally {
            setGroupSubmitting(false);
        }
    };

    // Handle delete report
    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;

        try {
            const response = await fetch('/api/counseling-reports', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const result = await response.json();

            if (result.success) {
                fetchReports();
            } else {
                alert('Gagal menghapus laporan');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    // Handle edit - open modal with report data
    const handleEdit = (report: CounselingReport) => {
        setEditingReport(report);
        setEditServiceType(report.service_type);
        setEditProblem(report.problem_description);
        setEditSolution(report.solution);
        setEditModalOpen(true);
    };

    // Handle update report
    const handleUpdateReport = async () => {
        if (!editingReport) return;

        if (!editProblem.trim() || !editSolution.trim()) {
            alert('Lengkapi semua field yang diperlukan');
            return;
        }

        setEditSubmitting(true);
        try {
            const response = await fetch('/api/counseling-reports', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingReport.id,
                    report_type: editingReport.report_type,
                    class: editingReport.class,
                    service_type: editServiceType,
                    problem_description: editProblem,
                    solution: editSolution,
                    students: editingReport.students.map(s => ({
                        student_id: s.student_id,
                        student_name: s.student_name,
                        student_nis: s.student_nis
                    }))
                })
            });

            const result = await response.json();

            if (result.success) {
                setEditModalOpen(false);
                setEditingReport(null);
                fetchReports();
                alert('Laporan berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui laporan: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating report:', error);
            alert('Terjadi kesalahan saat memperbarui laporan');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Handle print
    const handlePrint = (report: CounselingReport) => {
        const isIndividual = report.report_type === 'pribadi';
        const title = isIndividual ? 'BIMBINGAN KONSELING INDIVIDUAL' : 'BIMBINGAN KONSELING KELOMPOK';
        const serviceTypeLabel = report.service_type === 'pribadi' ? 'Pribadi' : 'Kelompok';
        const solutionLabel = isIndividual ? 'Solusi Tindak Lanjut Permasalahan Siswa' : 'Penyelesaian Permasalahan Siswa';

        // Build student names section based on report type
        let studentNamesHtml = '';
        if (isIndividual) {
            studentNamesHtml = `<p><span class="label">Nama</span><span class="colon">:</span> ${report.students[0]?.student_name || ''}</p>`;
        } else {
            studentNamesHtml = report.students.map((student, index) =>
                `<p><span class="label">${index === 0 ? 'Nama anggota' : ''}</span><span class="colon">:</span> ${student.student_name}</p>`
            ).join('');
        }

        const printContent = `
      <html>
        <head>
          <title>Laporan Bimbingan Konseling</title>
          <style>
            @media print {
              body { margin: 0; padding: 20mm; }
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              font-size: 12pt;
              line-height: 1.5;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { 
              color: #C00000; 
              font-size: 14pt; 
              margin-bottom: 5px;
              text-decoration: underline;
            }
            .header h2 { 
              font-size: 12pt; 
              margin-top: 0;
              text-decoration: underline;
            }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            .info .label { 
              display: inline-block; 
              width: 120px; 
            }
            .info .colon { 
              display: inline-block; 
              width: 20px; 
            }
            .service-type { color: #C00000; }
            .section { margin-top: 20px; }
            .section-header { 
              font-weight: bold; 
              margin-bottom: 10px;
              text-decoration: underline;
            }
            .section-header::before {
              content: "➤  ";
            }
            .content-box { 
              border: 1px solid #000; 
              padding: 15px; 
              min-height: 80px;
              white-space: pre-wrap;
            }
            .signature-section { 
              margin-top: 40px; 
            }
            .signature-date {
              text-align: right;
              margin-bottom: 20px;
            }
            .signature-table { 
              width: 100%; 
              border-collapse: collapse;
            }
            .signature-table td { 
              width: 50%; 
              vertical-align: top;
              padding-top: 10px;
            }
            .signature-table .right { text-align: right; }
            .signature-line { margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN</h1>
            <h2>${title}</h2>
          </div>
          
          <div class="info">
            ${studentNamesHtml}
            <p><span class="label">Kelas</span><span class="colon">:</span> ${report.class}</p>
            <p><span class="label">Jenis Layanan</span><span class="colon">:</span> <span class="service-type">${serviceTypeLabel}</span></p>
          </div>
          
          <div class="section">
            <p class="section-header">Uraian Permasalahan Siswa</p>
            <div class="content-box">${report.problem_description}</div>
          </div>
          
          <div class="section">
            <p class="section-header">${solutionLabel}</p>
            <div class="content-box">${report.solution}</div>
          </div>
          
          <div class="signature-section">
            <p class="signature-date">Karawang,</p>
            <table class="signature-table">
              <tr>
                <td>Mengetahui siswa/i</td>
                <td class="right">Guru Bimbingan Dan Konseling</td>
              </tr>
              <tr>
                <td class="signature-line">........................................</td>
                <td class="signature-line right">Nurfadilla Meilany Putri,S.Pd</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Handle download DOCX
    const handleDownloadDocx = async (report: CounselingReport) => {
        const isIndividual = report.report_type === 'pribadi';
        const title = isIndividual ? 'BIMBINGAN KONSELING INDIVIDUAL' : 'BIMBINGAN KONSELING KELOMPOK';
        const serviceTypeLabel = report.service_type === 'pribadi' ? 'Pribadi' : 'Kelompok';

        // Create content for problem box
        const problemCell = new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: report.problem_description, size: 24 })] })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
        });

        // Create content for solution box
        const solutionCell = new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: report.solution, size: 24 })] })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
        });

        // Build student names section based on report type
        const studentParagraphs: Paragraph[] = [];
        if (isIndividual) {
            studentParagraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'Nama', size: 24 }),
                        new TextRun({ text: '\t\t: ' + (report.students[0]?.student_name || ''), size: 24 }),
                    ],
                    spacing: { after: 100 },
                })
            );
        } else {
            // Group report - list each student on separate line
            report.students.forEach((student, index) => {
                studentParagraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: index === 0 ? 'Nama anggota' : '', size: 24 }),
                            new TextRun({ text: index === 0 ? '\t: ' + student.student_name : '\t\t: ' + student.student_name, size: 24 }),
                        ],
                        spacing: { after: 50 },
                    })
                );
            });
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        children: [new TextRun({ text: 'LAPORAN', bold: true, size: 28, color: 'C00000', underline: { type: UnderlineType.SINGLE } })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: title, bold: true, size: 24, color: '000000', underline: { type: UnderlineType.SINGLE } })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                    }),

                    // Student names
                    ...studentParagraphs,

                    // Class
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Kelas', size: 24 }),
                            new TextRun({ text: '\t\t: ' + report.class, size: 24 }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // Service type
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Jenis Layanan', size: 24 }),
                            new TextRun({ text: '\t: ', size: 24 }),
                            new TextRun({ text: serviceTypeLabel, size: 24, color: 'C00000' }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Problem section header
                    new Paragraph({
                        children: [
                            new TextRun({ text: '➤  ', size: 24 }),
                            new TextRun({ text: 'Uraian Permasalahan Siswa', bold: true, size: 24, underline: { type: UnderlineType.SINGLE } }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // Problem box
                    new Table({
                        rows: [new TableRow({ children: [problemCell], height: { value: 1500, rule: 'atLeast' } })],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),

                    new Paragraph({ children: [], spacing: { after: 300 } }),

                    // Solution section header
                    new Paragraph({
                        children: [
                            new TextRun({ text: '➤  ', size: 24 }),
                            new TextRun({ text: isIndividual ? 'Solusi Tindak Lanjut Permasalahan  Siswa' : 'Penyelesaian Permasalahan  Siswa', bold: true, size: 24, underline: { type: UnderlineType.SINGLE } }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // Solution box
                    new Table({
                        rows: [new TableRow({ children: [solutionCell], height: { value: 1500, rule: 'atLeast' } })],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),

                    new Paragraph({ children: [], spacing: { after: 600 } }),

                    // Signature section
                    new Paragraph({
                        children: [new TextRun({ text: 'Karawang,', size: 24 })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 100 },
                    }),

                    // Two column signature
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Mengetahui siswa/i', size: 24 })], spacing: { after: 600 } })],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Guru Bimbingan Dan Konseling', size: 24 })], alignment: AlignmentType.RIGHT, spacing: { after: 600 } })],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '........................................', size: 24 })], spacing: { before: 400 } })],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Nurfadilla Meilany Putri,S.Pd', size: 24 })], alignment: AlignmentType.RIGHT, spacing: { before: 400 } })],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    }),
                                ],
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const fileName = isIndividual
            ? `Laporan_Individual_${report.students[0]?.student_name || 'siswa'}_${report.class}.docx`
            : `Laporan_Kelompok_${report.class}.docx`;
        saveAs(blob, fileName);
    };

    // Toggle student selection for group reports
    const toggleStudentSelection = (student: SiswaAbsensi) => {
        setGroupSelectedStudents(prev => {
            const isSelected = prev.some(s => s.id === student.id);
            if (isSelected) {
                return prev.filter(s => s.id !== student.id);
            } else {
                return [...prev, student];
            }
        });
    };

    // Filter reports
    const filteredReports = reports.filter(report => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesStudent = report.students.some(s =>
                s.student_name.toLowerCase().includes(query)
            );
            const matchesDescription = report.problem_description.toLowerCase().includes(query);
            if (!matchesStudent && !matchesDescription) return false;
        }
        return true;
    });

    return (
        <div className="px-4 md:px-8 py-6 md:py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Layanan BK</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Laporan Bimbingan Konseling
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Kelola laporan konseling pribadi dan kelompok secara digital.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Individual Report Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User size={20} className="text-blue-600" />
                        </div>
                        Laporan Pribadi
                    </h2>

                    <form onSubmit={handleIndividualSubmit} className="space-y-4">
                        {/* Kelas */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Kelas <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={individualClass}
                                onChange={(e) => setIndividualClass(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                                value={individualSelectedStudent?.id || ''}
                                onChange={(e) => {
                                    const student = individualStudents.find(s => s.id === e.target.value);
                                    setIndividualSelectedStudent(student || null);
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                disabled={!individualClass || individualLoadingStudents}
                                required
                            >
                                <option value="">
                                    {individualLoadingStudents ? 'Memuat siswa...' : 'Pilih Siswa'}
                                </option>
                                {individualStudents.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.nama} ({student.nis})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Jenis Layanan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Jenis Layanan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={individualServiceType}
                                onChange={(e) => setIndividualServiceType(e.target.value as 'pribadi' | 'kelompok')}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                required
                            >
                                <option value="pribadi">Pribadi</option>
                                <option value="kelompok">Kelompok</option>
                            </select>
                        </div>

                        {/* Uraian Permasalahan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Uraian Permasalahan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={individualProblem}
                                onChange={(e) => setIndividualProblem(e.target.value)}
                                placeholder="Jelaskan permasalahan siswa..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                required
                            />
                        </div>

                        {/* Solusi Tindak Lanjut */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Solusi Tindak Lanjut <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={individualSolution}
                                onChange={(e) => setIndividualSolution(e.target.value)}
                                placeholder="Jelaskan solusi dan tindak lanjut..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={individualSubmitting}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {individualSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    Simpan Laporan Pribadi
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Group Report Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users size={20} className="text-purple-600" />
                        </div>
                        Laporan Kelompok
                    </h2>

                    <form onSubmit={handleGroupSubmit} className="space-y-4">
                        {/* Kelas */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Kelas <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={groupClass}
                                onChange={(e) => setGroupClass(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                required
                            >
                                <option value="">Pilih Kelas</option>
                                {classes.map((cls) => (
                                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pilih Siswa Multi-select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Pilih Siswa <span className="text-red-500">*</span>
                                <span className="text-slate-400 font-normal ml-2">
                                    ({groupSelectedStudents.length} dipilih)
                                </span>
                            </label>

                            {!groupClass ? (
                                <p className="text-slate-400 text-sm py-4 text-center border border-dashed border-slate-200 rounded-xl">
                                    Pilih kelas terlebih dahulu
                                </p>
                            ) : groupLoadingStudents ? (
                                <p className="text-slate-400 text-sm py-4 text-center">Memuat siswa...</p>
                            ) : (
                                <div className="border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                                    {groupStudents.length === 0 ? (
                                        <p className="text-slate-400 text-sm p-4 text-center">Tidak ada siswa di kelas ini</p>
                                    ) : (
                                        groupStudents.map((student) => {
                                            const isSelected = groupSelectedStudents.some(s => s.id === student.id);
                                            return (
                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleStudentSelection(student)}
                                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-purple-600' : 'border-2 border-slate-300'
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{student.nama}</p>
                                                        <p className="text-xs text-slate-500">{student.nis}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Jenis Layanan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Jenis Layanan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={groupServiceType}
                                onChange={(e) => setGroupServiceType(e.target.value as 'pribadi' | 'kelompok')}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                required
                            >
                                <option value="pribadi">Pribadi</option>
                                <option value="kelompok">Kelompok</option>
                            </select>
                        </div>

                        {/* Uraian Permasalahan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Uraian Permasalahan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={groupProblem}
                                onChange={(e) => setGroupProblem(e.target.value)}
                                placeholder="Jelaskan permasalahan kelompok..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm"
                                required
                            />
                        </div>

                        {/* Solusi Tindak Lanjut */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Solusi Tindak Lanjut <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={groupSolution}
                                onChange={(e) => setGroupSolution(e.target.value)}
                                placeholder="Jelaskan solusi dan tindak lanjut..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={groupSubmitting}
                            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {groupSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    Simpan Laporan Kelompok
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Reports List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    Daftar Laporan
                </h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map((cls) => (
                            <option key={cls.value} value={cls.value}>{cls.label}</option>
                        ))}
                    </select>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="col-span-full text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-slate-500">Memuat laporan...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">Belum ada laporan</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className={`border rounded-xl p-4 hover:shadow-md transition-all ${report.report_type === 'pribadi'
                                    ? 'border-blue-200 hover:border-blue-300'
                                    : 'border-purple-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${report.report_type === 'pribadi'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {report.report_type === 'pribadi' ? 'Pribadi' : 'Kelompok'}
                                            </span>
                                            <span className="text-xs text-slate-400">{report.class}</span>
                                        </div>
                                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
                                            {report.students.map(s => s.student_name).join(', ')}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDownloadDocx(report)}
                                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Download DOCX"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => handlePrint(report)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Cetak"
                                        >
                                            <Printer size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(report)}
                                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                    <span className="font-medium">Masalah:</span> {report.problem_description}
                                </p>
                                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                                    <span className="font-medium">Solusi:</span> {report.solution}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>Layanan: {report.service_type === 'pribadi' ? 'Pribadi' : 'Kelompok'}</span>
                                    <span>{new Date(report.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editModalOpen && editingReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Edit Laporan</h3>
                                <p className="text-sm text-slate-500">
                                    {editingReport.report_type === 'pribadi' ? 'Pribadi' : 'Kelompok'} - {editingReport.class}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingReport(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Nama Siswa - Read Only */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nama Siswa
                                </label>
                                <div className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
                                    {editingReport.students.map(s => s.student_name).join(', ')}
                                </div>
                            </div>

                            {/* Jenis Layanan */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Jenis Layanan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editServiceType}
                                    onChange={(e) => setEditServiceType(e.target.value as 'pribadi' | 'kelompok')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                >
                                    <option value="pribadi">Pribadi</option>
                                    <option value="kelompok">Kelompok</option>
                                </select>
                            </div>

                            {/* Uraian Permasalahan */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Uraian Permasalahan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={editProblem}
                                    onChange={(e) => setEditProblem(e.target.value)}
                                    placeholder="Jelaskan permasalahan siswa..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                    required
                                />
                            </div>

                            {/* Solusi Tindak Lanjut */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Solusi Tindak Lanjut <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={editSolution}
                                    onChange={(e) => setEditSolution(e.target.value)}
                                    placeholder="Jelaskan solusi dan tindak lanjut..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                            <button
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingReport(null);
                                }}
                                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateReport}
                                disabled={editSubmitting}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
