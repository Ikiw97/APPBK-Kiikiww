import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeightRule, Packer } from "docx";
import { saveAs } from "file-saver";

interface ParentGuestBookEntry {
    visit_date: string;
    student_name: string;
    parent_name: string;
    visit_purpose: string;
    problem_solution?: string;
    student_class: string;
}

export const generateParentGuestBookDoc = async (entry: ParentGuestBookEntry) => {
    const { visit_date, student_name, parent_name, visit_purpose, problem_solution, student_class } = entry;

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Calculate School Year (Tahun Ajaran)
    const date = new Date(visit_date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    let schoolYear = "";
    if (month >= 6) { // July onwards
        schoolYear = `${year}/${year + 1}`;
    } else {
        schoolYear = `${year - 1}/${year}`;
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Header
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "BUKU TAMU", bold: true, size: 24 }), // 12pt
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "ORANG TUA SISWA", bold: true, size: 24 }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: `TAHUN AJARAN ${schoolYear}`, bold: true, size: 24 }),
                        ],
                    }),

                    // Info Fields
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Hari/Tanggal\t: ", size: 24 }),
                            new TextRun({ text: formatDate(visit_date), size: 24 }),
                        ],
                        tabStops: [{ type: "left", position: 2000 }],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Nama Siswa\t: ", size: 24 }),
                            new TextRun({ text: `${student_name} (${student_class})`, size: 24 }),
                        ],
                        tabStops: [{ type: "left", position: 2000 }],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Nama Orang Tua\t: ", size: 24 }),
                            new TextRun({ text: parent_name, size: 24 }),
                        ],
                        tabStops: [{ type: "left", position: 2000 }],
                        spacing: { after: 400 },
                    }),

                    // Section 1: Uraian Keperluan
                    new Paragraph({
                        children: [
                            new TextRun({ text: "  URAIAN KEPERLUAN KEHADIRAN :", size: 24 }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: visit_purpose, size: 24 })] })],
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 },
                                        },
                                    }),
                                ],
                                height: { value: 3000, rule: HeightRule.ATLEAST },
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { after: 400 } }), // Spacer

                    // Section 2: Alternatif Pemecahan Masalah
                    new Paragraph({
                        children: [
                            new TextRun({ text: "  ALTERNATIF PEMECAHAN MASALAH :", size: 24 }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: problem_solution || "", size: 24 })] })],
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 },
                                        },
                                    }),
                                ],
                                height: { value: 3000, rule: HeightRule.ATLEAST },
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { after: 600 } }), // Spacer before signature

                    // Signatures
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE },
                            insideHorizontal: { style: BorderStyle.NONE },
                            insideVertical: { style: BorderStyle.NONE },
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({ text: "", size: 24 })],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({ text: "Mengetahui Wali Kelas", size: 24 })],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                spacing: { before: 1000 },
                                                children: [new TextRun({ text: "................................................", size: 24 })],
                                            }),
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({ text: "Karawang,", size: 24 })],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [new TextRun({ text: "Guru Bimbingan Dan Konseling", size: 24 })],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                spacing: { before: 1000 },
                                                children: [new TextRun({ text: "Nurfadillla Meilany Putri,S.Pd", size: 24 })],
                                            }),
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Buku_Tamu_Orang_Tua_${student_name.replace(/[^a-zA-Z0-9]/g, '_')}_${visit_date}.docx`);
};
