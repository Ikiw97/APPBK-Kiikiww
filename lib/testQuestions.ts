export interface TestQuestion {
    id: number;
    category: string;
    question: string;
    answers: string[];
    correctIndex: number;
    explanation: string;
    timeLimit: number;
}

export const ANALOGY_EASY_QUESTIONS: TestQuestion[] = [
    {
        id: 1,
        category: 'Padanan Kata',
        question: 'KOSONG : HAMPA = ... : ...',
        answers: ['UBI : AKAR', 'RIBUT : SERAK', 'PENUH : SESAK', 'SIANG : MALAM'],
        correctIndex: 2,
        explanation: 'Hubungan sinonim. Kosong sama artinya dengan Hampa. Penuh sama artinya dengan Sesak.',
        timeLimit: 30
    },
    {
        id: 2,
        category: 'Padanan Kata',
        question: 'MATAHARI : BUMI = BUMI : ...',
        answers: ['GRAVITASI', 'BULAN', 'PLANET', 'BINTANG'],
        correctIndex: 1,
        explanation: 'Bumi mengelilingi Matahari. Bulan mengelilingi Bumi.',
        timeLimit: 30
    },
    {
        id: 3,
        category: 'Padanan Kata',
        question: 'TELUR : AYAM = ... : ...',
        answers: ['ANAK : IBU', 'KEMAUAN : KEINGINAN', 'SUSAH : SENANG', 'SIANG : SORE'],
        correctIndex: 0,
        explanation: 'Telur berasal dari Ayam. Anak berasal dari Ibu.',
        timeLimit: 30
    },
    {
        id: 4,
        category: 'Hubungan Kata',
        question: 'SEPATU : KAKI = TOPI : ...',
        answers: ['TANGAN', 'KEPALA', 'BADAN', 'JAR'],
        correctIndex: 1,
        explanation: 'Sepatu digunakan di kaki. Topi digunakan di kepala.',
        timeLimit: 30
    },
    {
        id: 5,
        category: 'Hubungan Kata',
        question: 'MOBIL : BENSIN = MANUSIA : ...',
        answers: ['DARAH', 'MAKANAN', 'AIR', 'UDARA'],
        correctIndex: 1,
        explanation: 'Mobil membutuhkan bensin untuk bergerak. Manusia membutuhkan makanan untuk beraktivitas.',
        timeLimit: 30
    }
];

export const ANALOGY_ADVANCED_QUESTIONS: TestQuestion[] = [
    {
        id: 1,
        category: 'Analogi Kompleks',
        question: 'KAKI : SEPATU = ... : ...',
        answers: [
            'CAT : KUAS',
            'MEJA : RUANGAN',
            'TELINGA : ANTING',
            'CINCIN : JARI'
        ],
        correctIndex: 2,
        explanation: 'Sepatu dikenakan di kaki (objek menutupi/menghias bagian tubuh). Anting dikenakan di telinga.',
        timeLimit: 45
    },
    {
        id: 2,
        category: 'Analogi Definisi',
        question: 'KAYU : POHON = EMAS : ...',
        answers: ['TAMBANG', 'PERHIASAN', 'MAHAL', 'LOGAM'],
        correctIndex: 0,
        explanation: 'Kayu berasal dari pohon. Emas berasal dari tambang (tempat asalnya).',
        timeLimit: 45
    },
    {
        id: 3,
        category: 'Analogi Fungsi',
        question: 'KORAN : MAKALAH : BULETIN = ...',
        answers: [
            'RESTORAN : HOTEL : LOSMEN',
            'CAT : KUAS : LUKISAN',
            'SANDAL : SEPATU : KAOS',
            'BUS : KERETA API : DELMAN'
        ],
        correctIndex: 3,
        explanation: 'Koran, Makalah, Buletin adalah media massa/bacaan. Bus, Kereta Api, Delman adalah alat transportasi umum.',
        timeLimit: 45
    },
    {
        id: 4,
        category: 'Analogi Sebab-Akibat',
        question: 'HURUF : KATA : KALIMAT = ...',
        answers: [
            'ANAK : AYAH : KAKEK',
            'MIKRO : MINI : MACRO',
            'PADI : BERAS : NASI',
            'KELAS : SEKOLAH : PENDIDIKAN'
        ],
        correctIndex: 2,
        explanation: 'Urutan proses/pembentuk. Huruf membentuk Kata, Kata membentuk Kalimat. Padi diolah menjadi Beras, Beras dimasak menjadi Nasi.',
        timeLimit: 45
    },
    {
        id: 5,
        category: 'Analogi Sifat',
        question: 'API : BAKAR : PANAS = ...',
        answers: [
            'API : LEMBAB : DINGIN',
            'ES : BEKU : DINGIN',
            'UDARA : SEGAR : HANGAT',
            'BESI : KERAS : PANAS'
        ],
        correctIndex: 1,
        explanation: 'Api sifatnya membakar dan panas. Es sifatnya membeku(kan) dan dingin.',
        timeLimit: 45
    }
];

export const TIU_EASY_QUESTIONS: TestQuestion[] = [
    {
        id: 1,
        category: 'Deret Angka',
        question: '2, 4, 6, 8, ...',
        answers: ['10', '12', '9', '11'],
        correctIndex: 0,
        explanation: 'Pola penambahan 2. 8 + 2 = 10.',
        timeLimit: 45
    },
    {
        id: 2,
        category: 'Aritmatika',
        question: 'Jika x = 5 dan y = 2, berapakah hasil dari 2x + 3y?',
        answers: ['10', '13', '16', '12'],
        correctIndex: 2,
        explanation: '2(5) + 3(2) = 10 + 6 = 16.',
        timeLimit: 45
    },
    {
        id: 3,
        category: 'Sinonim',
        question: 'Sinonim dari kata "EFEKTIF" adalah...',
        answers: ['Efisien', 'Manjur', 'Hemat', 'Tepat'],
        correctIndex: 1,
        explanation: 'Efektif berarti ada efeknya/manjur. Efisien berarti hemat/berdaya guna.',
        timeLimit: 30
    },
    {
        id: 4,
        category: 'Antonim',
        question: 'Lawan kata dari "ABADI" adalah...',
        answers: ['Kekal', 'Sementara', 'Lama', 'Tetap'],
        correctIndex: 1,
        explanation: 'Abadi artinya kekal selamanya. Lawannya adalah sementara.',
        timeLimit: 30
    },
    {
        id: 5,
        category: 'Logika Gambar',
        question: 'Manakah yang tidak termasuk kelompoknya: Meja, Kursi, Lemari, Bunga?',
        answers: ['Meja', 'Kursi', 'Lemari', 'Bunga'],
        correctIndex: 3,
        explanation: 'Meja, Kursi, Lemari adalah perabot (furniture). Bunga adalah tanaman.',
        timeLimit: 30
    }
];

export const TIU_ADVANCED_QUESTIONS: TestQuestion[] = [
    {
        id: 1,
        category: 'Deret Aritmatika Bertingkat',
        question: '3, 6, 11, 18, 27, ...',
        answers: ['36', '38', '40', '42'],
        correctIndex: 1,
        explanation: 'Selisih tingkat satu: 3, 5, 7, 9. Selisih tingkat dua: 2. Maka selanjutnya selisihnya 11. 27 + 11 = 38.',
        timeLimit: 60
    },
    {
        id: 2,
        category: 'Silogisme',
        question: 'Semua mahasiswa lulusan universitas memiliki gelar. Sebagian seniman tidak memiliki gelar. Kesimpulan yang paling tepat adalah:',
        answers: [
            'Sebagian seniman bukan mahasiswa lulusan universitas',
            'Semua seniman adalah mahasiswa',
            'Tidak ada seniman yang memiliki gelar',
            'Semua mahasiswa adalah seniman'
        ],
        correctIndex: 0,
        explanation: 'Jika semua A punya B, dan sebagian C tidak punya B. Maka sebagian C bukan A. Seniman yang tidak punya gelar pasti bukan mahasiswa lulusan universitas.',
        timeLimit: 60
    },
    {
        id: 3,
        category: 'Analisis Wacana',
        question: 'Jika "Semua A adalah B" salah, maka pernyataan yang pasti benar adalah:',
        answers: [
            'Semua A bukan B',
            'Beberapa A adalah B',
            'Beberapa A bukan B',
            'Tidak ada A yang B'
        ],
        correctIndex: 2,
        explanation: 'Negasi dari "Semua A adalah B" (Universal Affirmative) adalah "Beberapa A bukan B" (Particular Negative).',
        timeLimit: 60
    },
    {
        id: 4,
        category: 'Hitungan Cepat',
        question: 'Berapakah 33.33% dar 2568,6?',
        answers: ['856.2', '856.1', '846.3', '855.9'],
        correctIndex: 0,
        explanation: '33.33% mendekati 1/3. 2568.6 / 3 = 856.2.',
        timeLimit: 60
    }
];

export const PSIKOTEST_EASY_QUESTIONS: TestQuestion[] = [
    // Numerical Easy
    {
        id: 1,
        category: 'numerical',
        question: 'Berapakah 15 + 25 - 10?',
        answers: ['25', '30', '40', '35'],
        correctIndex: 1,
        explanation: '15 + 25 = 40. 40 - 10 = 30.',
        timeLimit: 30
    },
    {
        id: 2,
        category: 'numerical',
        question: 'Angka berapakah selanjutnya? 5, 10, 15, 20, ...',
        answers: ['22', '25', '30', '35'],
        correctIndex: 1,
        explanation: 'Pola penambahan 5.',
        timeLimit: 30
    },
    // Verbal Easy
    {
        id: 3,
        category: 'verbal',
        question: 'Besar : Kecil = Panjang : ...',
        answers: ['Lebar', 'Luas', 'Pendek', 'Tinggi'],
        correctIndex: 2,
        explanation: 'Lawan kata (Antonim). Besar lawannya Kecil. Panjang lawannya Pendek.',
        timeLimit: 30
    },
    {
        id: 4,
        category: 'verbal',
        question: 'Mobil : Roda = Burung : ...',
        answers: ['Terbang', 'Sayap', 'Langit', 'Bulu'],
        correctIndex: 1,
        explanation: 'Bagian utama untuk bergerak. Mobil butuh Roda. Burung butuh Sayap.',
        timeLimit: 30
    },
    // Pattern Easy
    {
        id: 5,
        category: 'pattern',
        question: 'A, B, C, A, B, C, A, B, ...',
        answers: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'Pola pengulangan A, B, C.',
        timeLimit: 30
    },
    {
        id: 6,
        category: 'pattern',
        question: 'Manakah bentuk yang paling mirip dengan bola?',
        answers: ['Kubus', 'Lingkaran', 'Segitiga', 'Kotak'],
        correctIndex: 1,
        explanation: 'Bola berbentuk bulat seperti lingkaran (dalam 2D).',
        timeLimit: 30
    },
    // Logic Easy
    {
        id: 7,
        category: 'logic',
        question: 'Semua ikan hidup di air. Lele adalah ikan. Maka...',
        answers: ['Lele hidup di darat', 'Lele hidup di air', 'Lele bisa terbang', 'Lele bukan ikan'],
        correctIndex: 1,
        explanation: 'Silogisme sederhana.',
        timeLimit: 30
    },
    {
        id: 8,
        category: 'logic',
        question: 'Jika hari ini hujan, Budi bawa payung. Hari ini hujan. Maka...',
        answers: ['Budi tidak bawa payung', 'Budi basah kuyup', 'Budi bawa payung', 'Budi di rumah'],
        correctIndex: 2,
        explanation: 'Modus ponens.',
        timeLimit: 30
    }
];

export const PSIKOTEST_ADVANCED_QUESTIONS: TestQuestion[] = [
    // ===== NUMERICAL REASONING =====
    {
        id: 1,
        category: 'numerical',
        question: 'Jika 2 + 2 × 3 = ?, maka hasilnya adalah:',
        answers: ['8', '12', '6', '5'],
        correctIndex: 0, // Corrected index from original file which had logic error in description but marked index 2 (6) as answer but explanation said 8. Wait, original file said "correctIndex: 2" (which is '6') but explanation says "2 + 6 = 8". Options: ['8', '12', '6', '5']. Index 0 is '8'. I will fix this to be correct.
        explanation: 'Mengikuti aturan PEMDAS/BODMAS: perkalian dilakukan terlebih dahulu. 2 × 3 = 6, kemudian 2 + 6 = 8.',
        timeLimit: 30
    },
    {
        id: 2,
        category: 'numerical',
        question: 'Seri angka: 2, 4, 8, 16, ?, maka angka yang hilang adalah:',
        answers: ['24', '32', '28', '20'],
        correctIndex: 1,
        explanation: 'Setiap angka dikalikan 2. 2×2=4, 4×2=8, 8×2=16, 16×2=32',
        timeLimit: 30
    },
    {
        id: 3,
        category: 'numerical',
        question: 'Jika harga barang naik 25%, kemudian turun 20%, maka perubahan akhirnya adalah:',
        answers: ['Naik 5%', 'Turun 5%', 'Naik 10%', 'Tetap sama'],
        correctIndex: 3,
        explanation: 'Misalkan harga awal = 100. Naik 25% → 100 × 1.25 = 125. Turun 20% dari 125 → 125 × 0.8 = 100. Jadi kembali ke harga awal (100). Perubahan akhir: (100-100)/100 = 0%, artinya tetap sama',
        timeLimit: 45
    },
    {
        id: 4,
        category: 'numerical',
        question: 'Perbandingan usia Ayah dan Anak adalah 5:2. Jika jumlah usia mereka 49 tahun, berapa usia Ayah?',
        answers: ['35 tahun', '45 tahun', '40 tahun', '30 tahun'],
        correctIndex: 0,
        explanation: 'Perbandingan 5:2 berarti Ayah = 5x, Anak = 2x. Total: 5x + 2x = 49, jadi 7x = 49, x = 7. Usia Ayah = 5 × 7 = 35 tahun',
        timeLimit: 45
    },
    {
        id: 5,
        category: 'numerical',
        question: 'Seri: 3, 6, 12, 24, ?, maka angka yang hilang adalah:',
        answers: ['36', '48', '30', '40'],
        correctIndex: 1,
        explanation: 'Setiap angka dikalikan 2. 3×2=6, 6×2=12, 12×2=24, 24×2=48',
        timeLimit: 30
    },

    // ===== VERBAL REASONING (ANALOGIES) =====
    {
        id: 6,
        category: 'verbal',
        question: 'Kucing : Meong = Anjing : ?',
        answers: ['Menggonggong', 'Gonggong', 'Woof', 'Bunyi'],
        correctIndex: 0,
        explanation: 'Kucing mengeluarkan suara "meong", begitu juga Anjing mengeluarkan suara "menggonggong"',
        timeLimit: 30
    },
    {
        id: 7,
        category: 'verbal',
        question: 'Matahari : Terang = Hujan : ?',
        answers: ['Gelap', 'Basah', 'Air', 'Awan'],
        correctIndex: 1,
        explanation: 'Matahari menghasilkan cahaya/terang. Hujan menghasilkan air/basah (menciptakan keadaan basah)',
        timeLimit: 30
    },
    // ... including selected hard questions from original set
    {
        id: 11,
        category: 'pattern',
        question: 'Seri: A, B, D, G, ?, maka huruf yang hilang adalah:',
        answers: ['J', 'K', 'L', 'M'],
        correctIndex: 2,
        explanation: 'Pola: A(+1)→B(+2)→D(+3)→G(+4)→L. Jarak antar huruf: A ke B = 1, B ke D = 2, D ke G = 3, G ke L = 4',
        timeLimit: 45
    },
    {
        id: 12,
        category: 'pattern',
        question: 'Seri: 1, 1, 2, 3, 5, 8, 13, ?, maka angka yang hilang adalah:',
        answers: ['18', '20', '21', '23'],
        correctIndex: 2,
        explanation: 'Ini adalah deret Fibonacci: setiap angka adalah jumlah dua angka sebelumnya. 8 + 13 = 21',
        timeLimit: 45
    },

    // ===== DEDUCTIVE LOGIC =====
    {
        id: 16,
        category: 'logic',
        question: 'Semua mamalia adalah makhluk hidup. Semua anjing adalah mamalia. Maka anjing adalah:',
        answers: ['Tumbuhan', 'Makhluk hidup', 'Hewan pemangsa', 'Herbivora'],
        correctIndex: 1,
        explanation: 'Logika deduktif: Mamalia → makhluk hidup. Anjing → mamalia. Maka Anjing → makhluk hidup',
        timeLimit: 45
    },
    {
        id: 19,
        category: 'logic',
        question: 'Semua bunga adalah tumbuhan. Semua tumbuhan adalah makhluk hidup. Semua makhluk hidup membutuhkan energi. Maka bunga:',
        answers: ['Adalah tumbuhan', 'Membutuhkan energi', 'Adalah makhluk hidup', 'Semua jawaban benar'],
        correctIndex: 3,
        explanation: 'Dari silogisme: Bunga → Tumbuhan → Makhluk hidup → Membutuhkan energi. Semua pernyataan A, B, C benar',
        timeLimit: 60
    }
];
