
import React, { useState, useRef } from 'react';
import {
    FileText, Save, Printer, ArrowLeft, Plus, Trash2,
    Calendar, Clock, Users, BookOpen, Target, Activity,
    CheckCircle, FileQuestion, Download
} from 'lucide-react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { supabase } from '@/lib/supabaseClient';

interface RPLGeneratorProps {
    schoolMode: SchoolMode;
}

export default function RPLGenerator({ schoolMode }: RPLGeneratorProps) {
    const [activeStep, setActiveStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [savedDocs, setSavedDocs] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        // A. Identitas & Informasi Umum
        schoolName: 'Nama sekolah', // Satuan Pendidikan
        // topic moved to Step 2 as array
        serviceComponent: 'Layanan Dasar',
        serviceNumber: '1 (Satu)', // Layanan ke-
        targetClass: 'XII',
        semester: 'Ganjil',
        timeAllocation: '2 X 45 Menit',

        // A. Content Analysis (Moved to Step 2) & Strategies
        studentProfile: [
            'Peserta didik merupakan siswa kelas XII SMP PUPUK KUJANG yang sedang berada pada tahap perkembangan remaja akhir, di mana pencarian jati diri dan kebingungan dalam menentukan pilihan karier menjadi hal umum. Sebagian besar siswa masih belum memiliki gambaran yang jelas tentang arah masa depan mereka setelah lulus, baik dalam hal melanjutkan pendidikan, bekerja, maupun berwirausaha. Faktor kurangnya informasi, minimnya eksplorasi diri, serta pengaruh lingkungan sekitar turut memengaruhi ketidakpastian mereka. Oleh karena itu, diperlukan pembelajaran yang mampu membantu mereka mengenali potensi diri, memahami berbagai alternatif pilihan karier, dan menyusun rencana hidup secara mandiri dan bertanggung jawab.'
        ],
        materials: [
            'Materi "Alternatif Pilihan Karir Setelah Lulus SMA-MA" merupakan bagian penting dari layanan bimbingan dan konseling yang bertujuan untuk membantu siswa mengenali berbagai jalur karier yang dapat ditempuh setelah menyelesaikan pendidikan menengah. Materi ini mencakup pemahaman tentang pilihan kuliah, dunia kerja, wirausaha, pelatihan vokasi, hingga peluang pengabdian atau gap year. Dalam konteks pembelajaran berbasis deep learning, materi ini dirancang untuk mendorong siswa melakukan refleksi diri, eksplorasi minat dan bakat, serta perencanaan masa depan yang realistis dan bertanggung jawab. Materi ini relevan dengan kebutuhan siswa kelas XII yang sedang berada pada fase penentuan arah hidup pasca sekolah, dan sangat penting diberikan agar siswa mampu mengambil keputusan secara mandiri dan terinformasi.'
        ],
        graduateProfileDimension: [
            'Mandiri',
            'Bernalar Kritis',
            'Kreatif'
        ],
        serviceAchievement: [
            'Wawasan dan Kesiapan Karir',
            'Peserta didik dapat mengalami pertumbuhan, perkembangan, eksplorasi, aspirasi dan pengambilan keputusan karir sepanjang rentang hidupnya secara rasional dan realistis berdasarkan informasi potensi diri dan kesempatan yang tersedia di lingkungan hidupnya sehingga mencapai kesuksesan.',
            'Memiliki perilaku hidup hemat, cerdas mengelola keuangan dan mengaplikasikannya dalam setiap aspek kehidupan.'
        ],
        topic: ['Alternatif Pilihan Karir Setelah Lulus SMA-MA'],
        goal: [
            'Melanjutkan pendidikan ke perguruan tinggi (PTN, PTS, sekolah kedinasan, luar negeri, dll.)',
            'Memasuki dunia kerja secara langsung (entry-level jobs)',
            'Menjalani pelatihan keterampilan kerja (kursus, pelatihan vokasi, magang)',
            'Menjadi wirausahawan muda (entrepreneurship)',
            'Menjalani tahun jeda (gap year) yang produktif untuk eksplorasi diri'
        ],
        pedagogicModel: [
            'Pembelajaran Kolaboratif',
            'Pembelajaran Berbasis Masalah (Problem-Based Learning)',
            'Refleksi Diri dan Metakognisi'
        ],
        learningPartner: [
            'Alumni Sekolah (Berbagi pengalaman nyata tentang perjalanan karir dan pilihan studi lanjut)',
            'Orangtua Siswa (Mendukung siswa dalam refleksi dan pengambilan keputusan karir di rumah)',
            'Platform Digital Pendidikan (website karir, aplikasi tes minat dan bakat, dan video pembelajaran interaktif)'
        ],
        learningEnvironment: [
            'Lingkungan Fisik - Ruang kelas yang nyaman, dengan tata letak tempat duduk yang mendukung diskusi kelompok.'
        ],
        digitalTools: [
            'Video Inspiratif tentang variasi karir',
            'Slide Presentasi Interaktif',
            'Quiz Online / Tes Minat Bakat Digital'
        ],

        // C. Langkah Pembelajaran - Deep Learning
        stepsOpening: [
            'Guru membuka pelajaran dengan melakukan kegiatan awal rutin (Berdoa, menanyakan perasaan, Menanyakan kabar, Cek Kebersihan, Ice Breaking, menyampaikan kembali kesepakatan belajar dll)',
            'Pembelajaran akan diawali dengan permainan atau kuis singkat. Murid diminta untuk menjawab sebanyak-banyaknya pertanyaan yang disampaikan oleh guru. Pertanyaan yang diberikan adalah pertanyaan singkat yang terkait dengan kemampuan diri seperti:'
        ],
        stepsCoreUnderstanding: [ // Inti - Memahami
            'Peserta didik menyimak video kisah sukses alumni dengan berbagai jalur karir (Kuliah, Kerja, Wirausaha).',
            'Peserta didik membaca lembar materi tentang 5 opsi karir utama setelah lulus SMA.',
            'Peserta didik melakukan tanya jawab untuk memperjelas pemahaman tentang setiap opsi.'
        ],
        stepsCoreApplying: [ // Inti - Mengaplikasi
            'Peserta didik dibagi menjadi kelompok kecil dan diberikan studi kasus "Dilema Karir Andi".',
            'Setiap kelompok menganalisis studi kasus dan menghubungkannya dengan opsi karir yang ada.',
            'Peserta didik membuat "Peta Rencana Karir" sederhana berdasarkan minat awal mereka.'
        ],
        stepsCoreReflecting: [ // Inti - Merefleksi
            'Peserta didik melakukan hening sejenak (mindfulness) untuk merenungkan potensi dan keinginan diri.',
            'Peserta didik berbagi pemikiran dalam kelompok tentang ketakutan dan harapan mereka.',
            'Peserta didik menyimpulkan nilai penting dari mengenali diri sendiri sebelum memilih karir.'
        ],
        stepsClosing: [ // Penutup (Berkesadaran)
            'Guru dan Peserta didik menyimpulkan pembelajaran',
            'Guru mengajak peserta didik merencanakan pembelajaran selanjutnya dan strategi belajar yang akan digunakan (contoh: topik yang akan dipelajari, mitra yang akan diundang, eksperimen yang akan dilakukan, sumber/media pembelajaran yang digunakan)',
            'Guru memuliakan peserta didik dengan menghargai pencapaian pembelajaran'
        ],

        // D. Asesmen - Deep Learning
        assessmentStart: [
            'Observasi antusiasme siswa saat ice breaking.',
            'Jawaban lisan siswa terhadap pertanyaan pemantik.'
        ],
        assessmentProcess: [
            'Keaktifan siswa dalam diskusi kelompok.',
            'Kedalaman analisis siswa dalam membedah studi kasus dan membuat peta rencana.'
        ],
        assessmentEnd: [
            'Refleksi tertulis siswa tentang pilihan karir yang paling diminati.',
            'Komitmen siswa dalam merencanakan langkah selanjutnya setelah lulus.'
        ]
    });

    const classes = generateClasses(schoolMode);
    const serviceComponentOptions = ['Layanan Dasar', 'Layanan Peminatan', 'Layanan Responsif', 'Dukungan Sistem'];

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    // Types for Dynamic Fields
    type DynamicField =
        | 'studentProfile' | 'materials' | 'graduateProfileDimension' | 'serviceAchievement' | 'topic' | 'goal'
        | 'pedagogicModel' | 'learningPartner' | 'learningEnvironment' | 'digitalTools'
        | 'stepsOpening' | 'stepsCoreUnderstanding' | 'stepsCoreApplying' | 'stepsCoreReflecting' | 'stepsClosing'
        | 'assessmentStart' | 'assessmentProcess' | 'assessmentEnd';

    const handleArrayChange = (field: DynamicField, index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: DynamicField) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (field: DynamicField, index: number) => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    const renderDynamicList = (label: string, field: DynamicField, placeholder: string) => (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">{label}</label>
                <button
                    onClick={() => addArrayItem(field)}
                    className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                    <Plus size={14} />
                    Tambah
                </button>
            </div>
            <div className="space-y-3">
                {formData[field].map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <div className="flex-none pt-3 text-slate-400 text-xs font-medium w-4 text-right">
                            {index + 1}.
                        </div>
                        <textarea
                            value={item}
                            onChange={(e) => handleArrayChange(field, index, e.target.value)}
                            placeholder={placeholder}
                            rows={2}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-sm"
                        />
                        <button
                            onClick={() => removeArrayItem(field, index)}
                            disabled={formData[field].length === 1}
                            className="flex-none mt-2 p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('rpl_documents')
                .insert([
                    {
                        school_name: formData.schoolName,
                        class: formData.targetClass,
                        semester: formData.semester,
                        topic: formData.topic,
                        content: formData
                    }
                ]);

            if (error) throw error;

            alert('Data RPL berhasil disimpan!');
        } catch (error) {
            console.error('Error saving RPL:', error);
            alert('Gagal menyimpan data RPL. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchSavedDocs = async () => {
        try {
            const { data, error } = await supabase
                .from('rpl_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedDocs(data || []);
        } catch (error) {
            console.error('Error fetching docs:', error);
            alert('Gagal mengambil riwayat RPL.');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Apakah Anda yakin ingin menghapus RPL ini?')) return;

        try {
            const { error } = await supabase
                .from('rpl_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSavedDocs(savedDocs.filter(doc => doc.id !== id));
            alert('RPL berhasil dihapus.');
        } catch (error) {
            console.error('Error deleting doc:', error);
            alert('Gagal menghapus RPL.');
        }
    };

    const handleLoad = (doc: any) => {
        if (!confirm('Memuat data akan menimpa form yang sedang aktif. Lanjutkan?')) return;

        // Ensure content structure matches current state
        if (doc.content) {
            setFormData({ ...doc.content });
            setShowHistory(false);
            setActiveStep(1);
            alert('Data RPL berhasil dimuat!');
        } else {
            alert('Format data tidak valid.');
        }
    };

    // Toggle History View
    const toggleHistory = () => {
        if (!showHistory) {
            fetchSavedDocs();
        }
        setShowHistory(!showHistory);
    };

    const handleDownloadDocx = async () => {
        const createTextRun = (text: string, bold = false) => new TextRun({ text, bold, font: "Arial", size: 22 }); // 11pt = 22 half-points
        const createPara = (text: string, bold = false, alignment: any = AlignmentType.LEFT) => new Paragraph({
            children: [createTextRun(text, bold)],
            alignment,
            spacing: { after: 120 }
        });

        const createTableFullWidth = (rows: TableRow[]) => new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            }
        });

        const createRow = (label: string, content: string | string[], labelWidth = 30) => {
            const contentText = Array.isArray(content)
                ? content.map((c, i) => new Paragraph({ children: [createTextRun(`${i + 1}. ${c}`)], spacing: { after: 100 } }))
                : [new Paragraph({ children: [createTextRun(content)] })];

            return new TableRow({
                children: [
                    new TableCell({
                        children: [createPara(label, true)],
                        width: { size: labelWidth, type: WidthType.PERCENTAGE },
                        verticalAlign: "center",
                        margins: { top: 100, bottom: 100, left: 100, right: 100 }
                    }),
                    new TableCell({
                        children: Array.isArray(content) ? contentText : contentText,
                        width: { size: 100 - labelWidth, type: WidthType.PERCENTAGE },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 }
                    })
                ]
            });
        };

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "RENCANA PELAKSANAAN LAYANAN (RPL)", bold: true, size: 28, font: "Arial" }),
                            new TextRun({ text: "\nBIMBINGAN KLASIKAL", bold: true, size: 28, font: "Arial", break: 1 }),
                            new TextRun({ text: "\nDEEP LEARNING", bold: true, size: 28, font: "Arial", break: 1 }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NIL, size: 0 },
                            bottom: { style: BorderStyle.NIL, size: 0 },
                            left: { style: BorderStyle.NIL, size: 0 },
                            right: { style: BorderStyle.NIL, size: 0 },
                            insideHorizontal: { style: BorderStyle.NIL, size: 0 },
                            insideVertical: { style: BorderStyle.NIL, size: 0 },
                        },
                        rows: [
                            new TableRow({ children: [new TableCell({ children: [createPara("Satuan Pendidikan")], width: { size: 25, type: WidthType.PERCENTAGE } }), new TableCell({ children: [createPara(`: ${formData.schoolName}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [createPara("Kelas / Semester")] }), new TableCell({ children: [createPara(`: ${formData.targetClass} / ${formData.semester}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [createPara("Komponen")] }), new TableCell({ children: [createPara(`: ${formData.serviceComponent}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [createPara("Sub Tema")] }), new TableCell({ children: [createPara(`: ${formData.topic.join(', ')}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [createPara("Layanan ke")] }), new TableCell({ children: [createPara(`: ${formData.serviceNumber}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [createPara("Alokasi Waktu")] }), new TableCell({ children: [createPara(`: ${formData.timeAllocation}`)] })] }),
                        ]
                    }),
                    new Paragraph({ text: "", spacing: { after: 200 } }),
                    createTableFullWidth([
                        createRow("Identifikasi Peserta Didik", formData.studentProfile),
                        createRow("Identifikasi Materi Pelajaran", formData.materials),
                        createRow("Dimensi Profil Lulusan", formData.graduateProfileDimension),
                        createRow("Capaian Layanan", formData.serviceAchievement),
                        createRow("Topik Pembelajaran", formData.topic),
                        createRow("Tujuan Pembelajaran", formData.goal),
                        createRow("Praktik Pedagogis", formData.pedagogicModel),
                        createRow("Mitra Pembelajaran", formData.learningPartner),
                        createRow("Lingkungan Pembelajaran", formData.learningEnvironment),
                        createRow("Pemanfaatan Digital", formData.digitalTools),
                    ]),
                    new Paragraph({ children: [createTextRun("Langkah-Langkah Pembelajaran", true)], spacing: { before: 200, after: 100 } }),
                    createTableFullWidth([
                        createRow("1. Awal (Berkesadaran, Bermakna)", formData.stepsOpening),
                        createRow("2. Inti (Memahami)", formData.stepsCoreUnderstanding),
                        createRow("   (Mengaplikasi)", formData.stepsCoreApplying),
                        createRow("   (Merefleksi)", formData.stepsCoreReflecting),
                        createRow("3. Penutup (Berkesadaran)", formData.stepsClosing),
                    ]),
                    new Paragraph({ children: [createTextRun("Asesmen Pembelajaran", true)], spacing: { before: 200, after: 100 } }),
                    createTableFullWidth([
                        createRow("Asesmen Awal", formData.assessmentStart),
                        createRow("Asesmen Proses", formData.assessmentProcess),
                        createRow("Asesmen Akhir", formData.assessmentEnd),
                    ]),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NIL, size: 0 }, bottom: { style: BorderStyle.NIL, size: 0 }, left: { style: BorderStyle.NIL, size: 0 }, right: { style: BorderStyle.NIL, size: 0 }, insideHorizontal: { style: BorderStyle.NIL, size: 0 }, insideVertical: { style: BorderStyle.NIL, size: 0 } },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [createPara("Mengetahui,", false, AlignmentType.CENTER), createPara("Kepala Sekolah", false, AlignmentType.CENTER), new Paragraph({ text: "\n\n\n" }), createPara("( ..................................... )", false, AlignmentType.CENTER)] }),
                                    new TableCell({ children: [createPara(`Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, false, AlignmentType.CENTER), createPara("Guru BK / Konselor", false, AlignmentType.CENTER), new Paragraph({ text: "\n\n\n" }), createPara("( ..................................... )", false, AlignmentType.CENTER)] }),
                                ]
                            })
                        ]
                    })
                ]
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `RPL_${formData.topic[0] || 'Dokumen'}.docx`);
        });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up window diblokir. Izinkan pop-up untuk mencetak.');
            return;
        }

        const formatList = (items: string[]) => {
            if (!items || items.length === 0) return '-';
            if (items.length === 1 && !items[0]) return '-';
            return `
                <ol>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ol>
            `;
        };

        const content = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>RPL - ${formData.topic}</title>
          <style>
              body { font-family: Arial, Helvetica, sans-serif; line-height: 1.3; padding: 1.5cm; color: #000; font-size: 11pt; }
              .header { text-align: center; margin-bottom: 30px; font-weight: bold; font-size: 12pt; }
              .meta-info { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 10px; }
              .meta-info td { vertical-align: top; padding: 2px 0; border: none; }
              .meta-label { width: 180px; }
              
              .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .content-table td, .content-table th { border: 1px solid #000; padding: 8px; vertical-align: top; }
              .col-label { width: 250px; font-weight: bold; background-color: #fff; }
              
              .activity-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .activity-table td, .activity-table th { border: 1px solid #000; padding: 8px; vertical-align: top; }
              .activity-header { background-color: #f0f0f0; text-align: center; font-weight: bold; }
              
              .footer { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
              .signature-box { text-align: center; min-width: 200px; }
              .signature-space { height: 80px; }
              
              ul, ol { margin: 0; padding-left: 20px; }
              
              @media print {
                 body { padding: 0; margin: 1.5cm; }
                 @page { margin: 1.5cm; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              RENCANA PELAKSANAAN LAYANAN (RPL)<br/>
              BIMBINGAN KLASIKAL<br/>
              DEEP LEARNING
          </div>
          
          <table class="meta-info">
              <tr><td class="meta-label">Satuan Pendidikan</td><td>: ${formData.schoolName}</td></tr>
              <tr><td class="meta-label">Kelas / Semester</td><td>: ${formData.targetClass} / ${formData.semester}</td></tr>
              <tr><td class="meta-label">Komponen</td><td>: ${formData.serviceComponent}</td></tr>
              <tr><td class="meta-label">Sub Tema</td><td>: ${formData.topic.join(', ')}</td></tr>
              <tr><td class="meta-label">Layanan ke</td><td>: ${formData.serviceNumber}</td></tr>
              <tr><td class="meta-label">Alokasi Waktu</td><td>: ${formData.timeAllocation}</td></tr>
          </table>

          <table class="content-table">
              <tr>
                  <td class="col-label">Identifikasi Peserta Didik</td>
                  <td>${formatList(formData.studentProfile)}</td>
              </tr>
              <tr>
                  <td class="col-label">Identifikasi Materi Pelajaran</td>
                  <td>${formatList(formData.materials)}</td>
              </tr>
               <tr>
                  <td class="col-label">Dimensi Profil Lulusan</td>
                  <td>${formatList(formData.graduateProfileDimension)}</td>
              </tr>
              <tr>
                  <td class="col-label">Capaian Layanan</td>
                  <td>${formatList(formData.serviceAchievement)}</td>
              </tr>
              <tr>
                  <td class="col-label">Topik Pembelajaran</td>
                  <td>${formatList(formData.topic)}</td>
              </tr>
              <tr>
                  <td class="col-label">Tujuan Pembelajaran</td>
                  <td>${formatList(formData.goal)}</td>
              </tr>
              <tr>
                  <td class="col-label">Praktik Pedagogis</td>
                  <td>${formatList(formData.pedagogicModel)}</td>
              </tr>
              <tr>
                  <td class="col-label">Mitra Pembelajaran</td>
                  <td>${formatList(formData.learningPartner)}</td>
              </tr>
              <tr>
                  <td class="col-label">Lingkungan Pembelajaran</td>
                  <td>${formatList(formData.learningEnvironment)}</td>
              </tr>
               <tr>
                  <td class="col-label">Pemanfaatan Digital</td>
                  <td>${formatList(formData.digitalTools)}</td>
              </tr>
          </table>

          <!-- Langkah Pembelajaran Table -->
          <div style="margin-top: 20px; font-weight: bold; font-size: 11pt;">Langkah-Langkah Pembelajaran</div>
          <table class="activity-table">
               <tr>
                  <td style="width: 30%; font-weight: bold;">1. Awal (Berkesadaran, Bermakna)</td>
                  <td>
                      <ol>
                          ${formData.stepsOpening.map(step => `<li>${step}</li>`).join('')}
                      </ol>
                  </td>
              </tr>
              <tr>
                  <td colspan="2" style="background-color: #fff; font-weight: bold;">2. Inti (Bermakna, Menggembirakan)</td>
              </tr>
              <tr>
                  <td style="font-style: italic;">a. Memahami</td>
                  <td>
                      <ol>
                          ${formData.stepsCoreUnderstanding.map(step => `<li>${step}</li>`).join('')}
                      </ol>
                  </td>
              </tr>
              <tr>
                  <td style="font-style: italic;">b. Mengaplikasi</td>
                  <td>
                      <ol>
                          ${formData.stepsCoreApplying.map(step => `<li>${step}</li>`).join('')}
                      </ol>
                  </td>
              </tr>
               <tr>
                  <td style="font-style: italic;">c. Merefleksi (Berkesadaran, Bermakna)</td>
                  <td>
                      <ol>
                          ${formData.stepsCoreReflecting.map(step => `<li>${step}</li>`).join('')}
                      </ol>
                  </td>
              </tr>
              <tr>
                  <td style="font-weight: bold;">3. Penutup (Berkesadaran)</td>
                  <td>
                      <ol>
                          ${formData.stepsClosing.map(step => `<li>${step}</li>`).join('')}
                      </ol>
                  </td>
              </tr>
          </table>

          <!-- Asesmen Table -->
          <div style="margin-top: 20px; font-weight: bold; font-size: 11pt;">Asesmen Pembelajaran</div>
          <table class="content-table">
              <tr>
                  <td class="col-label">Asesmen pada Awal Pembelajaran (Evaluasi Proses)</td>
                  <td>${formatList(formData.assessmentStart)}</td>
              </tr>
              <tr>
                  <td class="col-label">Asesmen pada Proses Pembelajaran (Evaluasi Proses)</td>
                  <td>${formatList(formData.assessmentProcess)}</td>
              </tr>
              <tr>
                  <td class="col-label">Asesmen pada Akhir Pembelajaran (Evaluasi Hasil)</td>
                  <td>${formatList(formData.assessmentEnd)}</td>
              </tr>
          </table>

          <div class="footer">
              <div class="signature-box">
                  Mengetahui,<br/>
                  Kepala Sekolah
                  <div class="signature-space"></div>
                  ( ..................................... )
              </div>
              <div class="signature-box">
                  Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                  Guru BK / Konselor
                  <div class="signature-space"></div>
                  ( ..................................... )
              </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
      </body>
      </html>
    `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-6 md:mb-8 px-0 md:px-4">
            {[
                { id: 1, label: 'Info & Identitas', icon: BookOpen },
                { id: 2, label: 'Analisis & Strategi', icon: FileQuestion },
                { id: 3, label: 'Langkah Belajar', icon: Activity },
                { id: 4, label: 'Asesmen', icon: CheckCircle },
            ].map((step, index, arr) => (
                <React.Fragment key={step.id}>
                    <div
                        className={`flex flex-col items-center gap-2 cursor-pointer ${activeStep === step.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        onClick={() => setActiveStep(step.id)}
                    >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${activeStep === step.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' :
                            activeStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <step.icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className={`text-[10px] md:text-xs font-semibold text-center hidden md:block ${activeStep === step.id ? 'text-primary-600' : 'text-slate-500'}`}>
                            {step.label}
                        </span>
                    </div>
                    {index < arr.length - 1 && (
                        <div className="flex-1 h-0.5 bg-slate-200 mx-2 md:mx-4 relative">
                            <div
                                className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-300"
                                style={{ width: activeStep > index + 1 ? '100%' : '0%' }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="px-4 md:px-8 py-6 md:py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-primary-700 uppercase tracking-widest">Perangkat Layanan</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Rencana Pelaksanaan Layanan
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Buat dan kelola perangkat layanan BK secara digital dengan format RPL terbaru.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button
                                onClick={toggleHistory}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${showHistory ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}`}
                            >
                                <Clock size={18} />
                                <span>{showHistory ? 'Kembali' : 'Riwayat'}</span>
                            </button>
                            {!showHistory && (
                                <>
                                    <button
                                        onClick={handleDownloadDocx}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl hover:bg-primary-100 transition-all font-medium text-sm"
                                    >
                                        <Download size={18} />
                                        <span className="hidden md:inline">Word</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all font-medium text-sm"
                                    >
                                        <Printer size={18} />
                                        <span className="hidden md:inline">PDF</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {showHistory ? (
                <div className="animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-100">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="text-primary-600" />
                                Riwayat Dokumen RPL
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-800 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 md:px-6 py-4 whitespace-nowrap">Topik Layanan</th>
                                        <th className="px-4 md:px-6 py-4 whitespace-nowrap">Kelas / Semester</th>
                                        <th className="px-4 md:px-6 py-4 whitespace-nowrap">Tanggal Dibuat</th>
                                        <th className="px-4 md:px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {savedDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                                Belum ada riwayat dokumen RPL.
                                            </td>
                                        </tr>
                                    ) : (
                                        savedDocs.map((doc) => (
                                            <tr key={doc.id} onClick={() => handleLoad(doc)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-medium text-slate-900">
                                                    {(doc.content.topic && doc.content.topic[0]) || '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    {doc.class} / {doc.semester}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    {new Date(doc.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleLoad(doc); }}
                                                            className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                                                        >
                                                            Buka
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(doc.id, e)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    {/* Step Indicator Top */}
                    {renderStepIndicator()}

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Step 1: Info & Profil */}
                        {activeStep === 1 && (
                            <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <BookOpen className="text-primary-600" />
                                    Identitas & Informasi Umum
                                </h2>
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-primary-50/50 p-4 md:p-6 rounded-xl border border-primary-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {/* Satuan Pendidikan */}
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Satuan Pendidikan</label>
                                                <input
                                                    type="text"
                                                    value={formData.schoolName}
                                                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm md:text-base"
                                                />
                                            </div>

                                            {/* Kelas & Semester */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas / Tingkat</label>
                                                <select
                                                    value={formData.targetClass}
                                                    onChange={(e) => handleInputChange('targetClass', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none bg-white text-sm md:text-base"
                                                >
                                                    <option value="">Pilih Kelas</option>
                                                    {classes.map(cls => <option key={cls.value} value={cls.value}>{cls.label}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Semester</label>
                                                <select
                                                    value={formData.semester}
                                                    onChange={(e) => handleInputChange('semester', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none bg-white text-sm md:text-base"
                                                >
                                                    <option value="Ganjil">Ganjil</option>
                                                    <option value="Genap">Genap</option>
                                                </select>
                                            </div>

                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Komponen Layanan</label>
                                                <select
                                                    value={formData.serviceComponent}
                                                    onChange={(e) => handleInputChange('serviceComponent', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white text-sm md:text-base"
                                                >
                                                    {serviceComponentOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sub Tema (Topic) */}
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sub Tema (Topik)</label>
                                                <input
                                                    value={formData.topic[0] || ''}
                                                    onChange={(e) => handleArrayChange('topic', 0, e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                                                />
                                            </div>

                                            {/* Layanan ke */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Layanan ke-</label>
                                                <input
                                                    type="text"
                                                    value={formData.serviceNumber}
                                                    onChange={(e) => handleInputChange('serviceNumber', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                                                />
                                            </div>

                                            {/* Alokasi Waktu */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Alokasi Waktu</label>
                                                <input
                                                    type="text"
                                                    value={formData.timeAllocation}
                                                    onChange={(e) => handleInputChange('timeAllocation', e.target.value)}
                                                    placeholder="Contoh: 2 x 45 Menit"
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Analisis & Strategi */}
                        {activeStep === 2 && (
                            <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <FileQuestion className="text-blue-600" />
                                    Analisis & Strategi
                                </h2>
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="space-y-6">
                                            {renderDynamicList('Identifikasi Peserta Didik', 'studentProfile', '...')}
                                            {renderDynamicList('Identifikasi Materi Pelajaran', 'materials', '...')}
                                            {renderDynamicList('Dimensi Profil Lulusan', 'graduateProfileDimension', '...')}
                                            {renderDynamicList('Capaian Layanan', 'serviceAchievement', '...')}
                                            {renderDynamicList('Topik Pembelajaran', 'topic', '...')}
                                            {renderDynamicList('Tujuan Pembelajaran', 'goal', '...')}
                                            {renderDynamicList('Praktik Pedagogis', 'pedagogicModel', '...')}
                                            {renderDynamicList('Mitra Pembelajaran', 'learningPartner', '...')}
                                            {renderDynamicList('Lingkungan Pembelajaran', 'learningEnvironment', '...')}
                                            {renderDynamicList('Pemanfaatan Digital', 'digitalTools', '...')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Langkah Kegiatan Deep Learning */}
                        {activeStep === 3 && (
                            <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Activity className="text-blue-600" />
                                    Langkah Pembelajaran (Deep Learning)
                                </h2>

                                <div className="space-y-8">
                                    {/* Tahap Awal */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-slate-800 border-l-4 border-blue-500 pl-3 text-sm md:text-base">1. Awal (Berkesadaran, Bermakna)</h3>
                                            <button
                                                onClick={() => addArrayItem('stepsOpening')}
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50"
                                            >
                                                <Plus size={14} /> Tambah
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stepsOpening.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="w-6 h-10 flex items-center justify-center text-slate-400 font-medium text-sm pt-1">{index + 1}.</div>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleArrayChange('stepsOpening', index, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={() => removeArrayItem('stepsOpening', index)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tahap Inti - Memahami */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-slate-800 border-l-4 border-green-500 pl-3 text-sm md:text-base">2a. Inti - Memahami</h3>
                                            <button
                                                onClick={() => addArrayItem('stepsCoreUnderstanding')}
                                                className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 font-medium py-1 px-2 rounded hover:bg-green-50"
                                            >
                                                <Plus size={14} /> Tambah
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stepsCoreUnderstanding.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="w-6 h-10 flex items-center justify-center text-slate-400 font-medium text-sm pt-1">{index + 1}.</div>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleArrayChange('stepsCoreUnderstanding', index, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={() => removeArrayItem('stepsCoreUnderstanding', index)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tahap Inti - Mengaplikasi */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-slate-800 border-l-4 border-yellow-500 pl-3 text-sm md:text-base">2b. Inti - Mengaplikasi</h3>
                                            <button
                                                onClick={() => addArrayItem('stepsCoreApplying')}
                                                className="text-xs flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-medium py-1 px-2 rounded hover:bg-yellow-50"
                                            >
                                                <Plus size={14} /> Tambah
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stepsCoreApplying.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="w-6 h-10 flex items-center justify-center text-slate-400 font-medium text-sm pt-1">{index + 1}.</div>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleArrayChange('stepsCoreApplying', index, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={() => removeArrayItem('stepsCoreApplying', index)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tahap Inti - Merefleksi */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-slate-800 border-l-4 border-purple-500 pl-3 text-sm md:text-base">2c. Inti - Merefleksi</h3>
                                            <button
                                                onClick={() => addArrayItem('stepsCoreReflecting')}
                                                className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium py-1 px-2 rounded hover:bg-purple-50"
                                            >
                                                <Plus size={14} /> Tambah
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stepsCoreReflecting.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="w-6 h-10 flex items-center justify-center text-slate-400 font-medium text-sm pt-1">{index + 1}.</div>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleArrayChange('stepsCoreReflecting', index, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={() => removeArrayItem('stepsCoreReflecting', index)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tahap Penutup */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-slate-800 border-l-4 border-blue-500 pl-3 text-sm md:text-base">3. Penutup (Berkesadaran)</h3>
                                            <button
                                                onClick={() => addArrayItem('stepsClosing')}
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50"
                                            >
                                                <Plus size={14} /> Tambah
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stepsClosing.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="w-6 h-10 flex items-center justify-center text-slate-400 font-medium text-sm pt-1">{index + 1}.</div>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleArrayChange('stepsClosing', index, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                                                        rows={2}
                                                    />
                                                    <button
                                                        onClick={() => removeArrayItem('stepsClosing', index)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Asesmen Pembelajaran */}
                        {activeStep === 4 && (
                            <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <CheckCircle className="text-blue-600" />
                                    Asesmen & Evaluasi
                                </h2>
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="space-y-6">
                                            {renderDynamicList('Asesmen Awal (Evaluasi Proses)', 'assessmentStart', '...')}
                                            {renderDynamicList('Asesmen Proses (Evaluasi Proses)', 'assessmentProcess', '...')}
                                            {renderDynamicList('Asesmen Akhir (Evaluasi Hasil)', 'assessmentEnd', '...')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="bg-slate-50 px-6 md:px-8 py-5 border-t border-slate-200 flex justify-between">
                            <button
                                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                                disabled={activeStep === 1}
                                className="px-5 md:px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base"
                            >
                                {activeStep === 1 ? 'Batal' : 'Sebelumnya'}
                            </button>
                            <button
                                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                                className="px-5 md:px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all text-sm md:text-base"
                            >
                                {activeStep === 4 ? 'Selesai' : 'Lanjut'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
