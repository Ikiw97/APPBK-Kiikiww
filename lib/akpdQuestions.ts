export interface AKPDQuestion {
  id: string;
  category: string;
  text: string;
  gradeLevel?: 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII' | 'all';
}

// Pertanyaan untuk Kelas VII - Fokus adaptasi sekolah menengah
export const AKPD_QUESTIONS_GRADE_VII: AKPDQuestion[] = [
  // Kategori: Spiritual & Emosi
  {
    id: 'akpd_vii_1',
    category: 'Spiritual & Emosi',
    text: 'Saya dalam menjalankan ibadah masih karena terpaksa',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_2',
    category: 'Spiritual & Emosi',
    text: 'Saya merasa belum memiliki kebiasaan untuk berpikir positif',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_3',
    category: 'Emosi',
    text: 'Saya masih sulit menyesuaikan diri dengan lingkungan baru di SMP',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_4',
    category: 'Emosi',
    text: 'Saya masih merasa takut bertemu dengan teman baru',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_5',
    category: 'Emosi',
    text: 'Saya masih sulit mengendalikan emosi saat menghadapi masalah',
    gradeLevel: 'VII',
  },
  // Kategori: Akademik
  {
    id: 'akpd_vii_6',
    category: 'Akademik',
    text: 'Saya belum terbiasa dengan cara belajar di SMP yang berbeda dari SD',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_7',
    category: 'Akademik',
    text: 'Saya kesulitan mengikuti banyak mata pelajaran di SMP',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_8',
    category: 'Akademik',
    text: 'Saya belum bisa membagi waktu antara belajar dan bermain',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_9',
    category: 'Akademik',
    text: 'Saya kadang masih suka mencontek saat tes',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_10',
    category: 'Akademik',
    text: 'Saya belum tahu cara belajar yang efektif',
    gradeLevel: 'VII',
  },
  // Kategori: Sosial
  {
    id: 'akpd_vii_11',
    category: 'Sosial',
    text: 'Saya masih malu berkenalan dengan teman baru',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_12',
    category: 'Sosial',
    text: 'Saya belum berani mengutarakan pendapat di depan kelas',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_13',
    category: 'Sosial',
    text: 'Saya belum mengenal macam-macam kepribadian teman sekelas',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_14',
    category: 'Sosial',
    text: 'Saya sering merasa tidak percaya diri dalam pergaulan',
    gradeLevel: 'VII',
  },
  // Kategori: Perilaku & Kebiasaan
  {
    id: 'akpd_vii_15',
    category: 'Perilaku',
    text: 'Saya masih sering membuang sampah tidak pada tempatnya',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_16',
    category: 'Perilaku',
    text: 'Saya belum terbiasa mematuhi tata tertib sekolah',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_17',
    category: 'Ketergantungan',
    text: 'Saya sulit meninggalkan handphone saat belajar',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_18',
    category: 'Ketergantungan',
    text: 'Saya banyak menghabiskan waktu dengan bermain game',
    gradeLevel: 'VII',
  },
  // Kategori: Keluarga
  {
    id: 'akpd_vii_19',
    category: 'Keluarga',
    text: 'Saya masih bergantung pada orang tua untuk mengerjakan PR',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_20',
    category: 'Keluarga',
    text: 'Saya belum bisa terbuka membicarakan masalah dengan orang tua',
    gradeLevel: 'VII',
  },
  // Kategori: Kesehatan
  {
    id: 'akpd_vii_21',
    category: 'Kesehatan',
    text: 'Saya belum tahu cara menjaga kesehatan agar tetap fit untuk belajar',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_22',
    category: 'Kesehatan',
    text: 'Saya sering merasa lelah saat di sekolah',
    gradeLevel: 'VII',
  },
  // Kategori: Kepribadian & Percaya Diri
  {
    id: 'akpd_vii_23',
    category: 'Kepribadian',
    text: 'Saya belum mengenali bakat dan minat saya',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_24',
    category: 'Kepribadian',
    text: 'Saya masih ragu dengan kemampuan diri sendiri',
    gradeLevel: 'VII',
  },
  {
    id: 'akpd_vii_25',
    category: 'Karir',
    text: 'Saya belum memikirkan cita-cita masa depan',
    gradeLevel: 'VII',
  },
];

// Pertanyaan untuk Kelas VIII - Fokus perkembangan diri dan pergaulan
export const AKPD_QUESTIONS_GRADE_VIII: AKPDQuestion[] = [
  // Kategori: Spiritual & Emosi
  {
    id: 'akpd_viii_1',
    category: 'Spiritual & Emosi',
    text: 'Saya dalam menjalankan ibadah masih karena terpaksa',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_2',
    category: 'Spiritual & Emosi',
    text: 'Saya belum konsisten dalam beribadah',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_3',
    category: 'Emosi',
    text: 'Saya merasa tertekan (stress) menghadapi kehidupan sehari-hari',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_4',
    category: 'Emosi',
    text: 'Saya masih sulit mengendalikan emosi saat marah',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_5',
    category: 'Emosi',
    text: 'Saya mudah putus asa menghadapi kegagalan',
    gradeLevel: 'VIII',
  },
  // Kategori: Akademik
  {
    id: 'akpd_viii_6',
    category: 'Akademik',
    text: 'Saya merasa kesulitan mempelajari mata pelajaran tertentu',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_7',
    category: 'Akademik',
    text: 'Saya belum paham cara meningkatkan motivasi belajar',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_8',
    category: 'Akademik',
    text: 'Saya masih belum bisa belajar secara rutin',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_9',
    category: 'Akademik',
    text: 'Saya kadang masih mencontek saat ujian',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_10',
    category: 'Akademik',
    text: 'Saya belum paham cara meningkatkan konsentrasi belajar',
    gradeLevel: 'VIII',
  },
  // Kategori: Sosial & Pergaulan
  {
    id: 'akpd_viii_11',
    category: 'Sosial',
    text: 'Saya sering merasa tidak lancar dalam berkomunikasi dengan orang lain',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_12',
    category: 'Sosial',
    text: 'Saya belum tahu tentang bentuk-bentuk kenakalan remaja dan cara menyikapinya',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_13',
    category: 'Sosial',
    text: 'Saya belum tahu cara menjaga persahabatan agar tetap langgeng',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_14',
    category: 'Sosial',
    text: 'Saya belum tahu lebih banyak akibat tawuran di kalangan pelajar',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_15',
    category: 'Sosial',
    text: 'Saya belum tahu membuat persahabatan yang baik melalui media sosial',
    gradeLevel: 'VIII',
  },
  // Kategori: Perilaku & Kebiasaan
  {
    id: 'akpd_viii_16',
    category: 'Perilaku',
    text: 'Saya sulit menghilangkan kebiasaan begadang dan keluar malam',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_17',
    category: 'Perilaku',
    text: 'Saya kadang lupa mengucapkan maaf, tolong, dan terima kasih',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_18',
    category: 'Perilaku',
    text: 'Saya merasa sulit untuk antri',
    gradeLevel: 'VIII',
  },
  // Kategori: Ketergantungan
  {
    id: 'akpd_viii_19',
    category: 'Ketergantungan',
    text: 'Saya sulit meninggalkan ketergantungan dengan media sosial (FB, WA, IG, dll)',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_20',
    category: 'Ketergantungan',
    text: 'Saya sulit mengendalikan ketergantungan pada handphone',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_21',
    category: 'Ketergantungan',
    text: 'Saya banyak menghabiskan waktu dengan main game online',
    gradeLevel: 'VIII',
  },
  // Kategori: Pemahaman Risiko
  {
    id: 'akpd_viii_22',
    category: 'Pemahaman Risiko',
    text: 'Saya belum banyak tahu dampak pacaran di kalangan remaja',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_23',
    category: 'Pemahaman Risiko',
    text: 'Saya belum tahu akibat nikah di usia dini',
    gradeLevel: 'VIII',
  },
  // Kategori: Kepribadian
  {
    id: 'akpd_viii_24',
    category: 'Kepribadian',
    text: 'Saya masih merasa belum memiliki rasa percaya diri',
    gradeLevel: 'VIII',
  },
  {
    id: 'akpd_viii_25',
    category: 'Kepribadian',
    text: 'Saya belum tahu cara menyelesaikan masalah (konflik) dengan baik',
    gradeLevel: 'VIII',
  },
];

// Pertanyaan untuk Kelas IX - Fokus persiapan ke SMA/SMK dan orientasi karir
export const AKPD_QUESTIONS_GRADE_IX: AKPDQuestion[] = [
  // Kategori: Spiritual & Emosi
  {
    id: 'akpd_ix_1',
    category: 'Spiritual & Emosi',
    text: 'Saya dalam menjalankan ibadah masih karena terpaksa',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_2',
    category: 'Emosi',
    text: 'Saya merasa khawatir/takut tidak dapat lulus sekolah',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_3',
    category: 'Emosi',
    text: 'Saya merasa tertekan menghadapi ujian kelulusan',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_4',
    category: 'Emosi',
    text: 'Saya mudah putus asa menghadapi kegagalan',
    gradeLevel: 'IX',
  },
  // Kategori: Akademik
  {
    id: 'akpd_ix_5',
    category: 'Akademik',
    text: 'Saya belum tahu kiat sukses dalam menghadapi ujian',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_6',
    category: 'Akademik',
    text: 'Saya belum tahu informasi syarat-syarat kelulusan',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_7',
    category: 'Akademik',
    text: 'Saya masih memiliki kebiasaan belajar hanya saat ada tes/ujian',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_8',
    category: 'Akademik',
    text: 'Saya belum bisa mengevaluasi hasil prestasi belajar',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_9',
    category: 'Akademik',
    text: 'Saya kesulitan mempelajari mata pelajaran tertentu yang diujikan',
    gradeLevel: 'IX',
  },
  // Kategori: Karir & Masa Depan
  {
    id: 'akpd_ix_10',
    category: 'Karir',
    text: 'Saya masih ragu untuk melanjutkan sekolah ke jenjang SMA/SMK',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_11',
    category: 'Karir',
    text: 'Saya belum tahu tentang cara atau strategi masuk sekolah favorit',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_12',
    category: 'Karir',
    text: 'Saya masih bingung memikirkan karir setelah lulus SMP',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_13',
    category: 'Karir',
    text: 'Saya belum paham masalah peminatan/jurusan di SMA',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_14',
    category: 'Karir',
    text: 'Saya belum paham masalah peminatan/jurusan di SMK',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_15',
    category: 'Karir',
    text: 'Saya belum merencanakan karir masa depan',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_16',
    category: 'Karir',
    text: 'Cita-cita saya tidak sejalan dengan keinginan orang tua',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_17',
    category: 'Karir',
    text: 'Saya sulit untuk mengambil keputusan pilihan karir',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_18',
    category: 'Karir',
    text: 'Saya kurang berminat memikirkan masa depan',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_19',
    category: 'Karir',
    text: 'Saya belum memahami tentang dunia kerja',
    gradeLevel: 'IX',
  },
  // Kategori: Keuangan
  {
    id: 'akpd_ix_20',
    category: 'Keuangan',
    text: 'Saya berencana indekos saat lanjut ke SMA/SMK tetapi belum tahu cara mengelola keuangan',
    gradeLevel: 'IX',
  },
  // Kategori: Sosial
  {
    id: 'akpd_ix_21',
    category: 'Sosial',
    text: 'Saya belum mengenal jenis-jenis organisasi di sekolah lanjutan',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_22',
    category: 'Sosial',
    text: 'Saya merasa belum paham tentang kiat sukses hidup bermasyarakat',
    gradeLevel: 'IX',
  },
  {
    id: 'akpd_ix_23',
    category: 'Nilai Moral',
    text: 'Saya belum paham pentingnya nilai-nilai kehidupan di masyarakat',
    gradeLevel: 'IX',
  },
  // Kategori: Kesehatan
  {
    id: 'akpd_ix_24',
    category: 'Kesehatan',
    text: 'Saya belum tahu cara menjaga kesehatan agar tetap fit menghadapi ujian',
    gradeLevel: 'IX',
  },
  // Kategori: Kepribadian
  {
    id: 'akpd_ix_25',
    category: 'Kepribadian',
    text: 'Saya masih merasa belum memiliki rasa percaya diri untuk masa depan',
    gradeLevel: 'IX',
  },
];

// Untuk SMA/SMK - Menggunakan pertanyaan default yang sudah ada atau bisa ditambahkan nanti
export const AKPD_QUESTIONS_GRADE_X: AKPDQuestion[] = [];
export const AKPD_QUESTIONS_GRADE_XI: AKPDQuestion[] = [];
export const AKPD_QUESTIONS_GRADE_XII: AKPDQuestion[] = [];

// Map pertanyaan berdasarkan grade level
export const AKPD_QUESTIONS_BY_GRADE: Record<string, AKPDQuestion[]> = {
  'VII': AKPD_QUESTIONS_GRADE_VII,
  'VIII': AKPD_QUESTIONS_GRADE_VIII,
  'IX': AKPD_QUESTIONS_GRADE_IX,
  'X': AKPD_QUESTIONS_GRADE_X,
  'XI': AKPD_QUESTIONS_GRADE_XI,
  'XII': AKPD_QUESTIONS_GRADE_XII,
};

// Legacy: Pertanyaan default untuk kompatibilitas mundur (semua tingkat)
export const AKPD_QUESTIONS: AKPDQuestion[] = [
  // Kategori: Spiritual & Emosi (1-7)
  {
    id: 'akpd_1',
    category: 'Spiritual & Emosi',
    text: 'Saya dalam menjalankan ibadah masih karena terpaksa',
  },
  {
    id: 'akpd_2',
    category: 'Spiritual & Emosi',
    text: 'Saya merasa belum memiliki kebiasaan untuk berpikir dan bersikap positif',
  },
  {
    id: 'akpd_3',
    category: 'Akademik',
    text: 'Kadang saya masih suka mencontek saat tes',
  },
  {
    id: 'akpd_4',
    category: 'Emosi',
    text: 'Saya merasa tertekan (stress) menghadapi kehidupan/kegiatan',
  },
  {
    id: 'akpd_5',
    category: 'Emosi',
    text: 'Saya masih sulit mengendalikan emosi',
  },
  {
    id: 'akpd_6',
    category: 'Sosial',
    text: 'Saya belum mengenal macam-macam kepribadian manusia',
  },
  {
    id: 'akpd_7',
    category: 'Kesehatan',
    text: 'Saya belum tahu cara menjaga kesehatan agar tetap fit menghadapi waktu ujian',
  },

  // Kategori: Perilaku & Kebiasaan (8-15)
  {
    id: 'akpd_8',
    category: 'Perilaku',
    text: 'Saya merasa masih sering membuang sampah tidak pada tempatnya',
  },
  {
    id: 'akpd_9',
    category: 'Akademik',
    text: 'Saya jenuh dan enggan masuk sekolah',
  },
  {
    id: 'akpd_10',
    category: 'Ketergantungan',
    text: 'Saya merasa sulit meninggalkan ketergantungan dengan media sosial (FB, WA, IG, dll)',
  },
  {
    id: 'akpd_11',
    category: 'Perilaku',
    text: 'Saya merasa sulit menghilangkan kebiasaan keluar malam (bermain, begadang)',
  },
  {
    id: 'akpd_12',
    category: 'Emosi',
    text: 'Saya merasa khawatir/takut tidak dapat lulus sekolah',
  },
  {
    id: 'akpd_13',
    category: 'Keluarga',
    text: 'Saya sedang mempunyai masalah dengan anggota keluarga di rumah',
  },
  {
    id: 'akpd_14',
    category: 'Ketergantungan',
    text: 'Saya banyak menghabiskan waktu dengan main game atau game online',
  },
  {
    id: 'akpd_15',
    category: 'Ketergantungan',
    text: 'Saya merasa sulit mengendalikan ketergantungan pada handphone',
  },

  // Kategori: Kepercayaan Diri & Komunikasi (16-21)
  {
    id: 'akpd_16',
    category: 'Kepribadian',
    text: 'Saya masih merasa belum memiliki rasa percaya diri',
  },
  {
    id: 'akpd_17',
    category: 'Pemecahan Masalah',
    text: 'Saya belum tahu cara menyelesaikan masalah (konflik)',
  },
  {
    id: 'akpd_18',
    category: 'Sosial',
    text: 'Saya sering merasa tidak lancar dalam berkomunikasi dengan orang lain',
  },
  {
    id: 'akpd_19',
    category: 'Nilai Moral',
    text: 'Saya belum paham pentingnya nilai-nilai kehidupan di masyarakat',
  },
  {
    id: 'akpd_20',
    category: 'Perilaku',
    text: 'Saya belum memahami tentang etika berlalu lintas',
  },
  {
    id: 'akpd_21',
    category: 'Sosial',
    text: 'Saya merasa belum paham tentang kiat sukses hidup bermasyarakat',
  },

  // Kategori: Pergaulan & Persahabatan (22-28)
  {
    id: 'akpd_22',
    category: 'Sosial',
    text: 'Saya belum tahu lebih banyak akibat tawuran di kalangan pelajar',
  },
  {
    id: 'akpd_23',
    category: 'Sosial',
    text: 'Saya masih belum bisa menjaga sebuah persahabatan agar tetap langgeng',
  },
  {
    id: 'akpd_24',
    category: 'Perilaku',
    text: 'Saya merasa sulit untuk antri',
  },
  {
    id: 'akpd_25',
    category: 'Sosial',
    text: 'Saya belum tahu tentang bentuk-bentuk kenakalan remaja saat ini dan cara menyikapinya',
  },
  {
    id: 'akpd_26',
    category: 'Sosial',
    text: 'Saya belum tahu membuat persahabatan yang baik melalui media sosial',
  },
  {
    id: 'akpd_27',
    category: 'Perilaku',
    text: 'Saya kadang masih lupa mengucapkan kata maaf, tolong, dan terima kasih dalam pergaulan',
  },
  {
    id: 'akpd_28',
    category: 'Pemahaman Risiko',
    text: 'Saya belum tahu akibat nikah di usia dini',
  },

  // Kategori: Pacaran & Akademik (29-38)
  {
    id: 'akpd_29',
    category: 'Pemahaman Risiko',
    text: 'Saya belum banyak tahu dampak pacaran di kalangan remaja',
  },
  {
    id: 'akpd_30',
    category: 'Akademik',
    text: 'Saya belum paham cara meningkatkan motivasi belajar',
  },
  {
    id: 'akpd_31',
    category: 'Akademik',
    text: 'Saya belum bisa mengevaluasi hasil prestasi belajar',
  },
  {
    id: 'akpd_32',
    category: 'Akademik',
    text: 'Saya belum tahu kiat sukses dalam menghadapi ujian',
  },
  {
    id: 'akpd_33',
    category: 'Akademik',
    text: 'Saya masih belum bisa belajar secara rutin',
  },
  {
    id: 'akpd_34',
    category: 'Akademik',
    text: 'Saya masih memiliki kebiasaan belajar apabila akan ada tes/ujian',
  },
  {
    id: 'akpd_35',
    category: 'Akademik',
    text: 'Saya belum tahu informasi syarat-syarat kelulusan',
  },
  {
    id: 'akpd_36',
    category: 'Akademik',
    text: 'Saya belum paham cara meningkatkan konsentrasi belajar',
  },
  {
    id: 'akpd_37',
    category: 'Akademik',
    text: 'Saya merasa kesulitan mempelajari dan memahami mata pelajaran tertentu',
  },
  {
    id: 'akpd_38',
    category: 'Keuangan',
    text: 'Saya berencana untuk indekos saat melanjutkan ke SLTA tetapi belum tahu cara mengelola keuangan',
  },

  // Kategori: Kegigihan & Karir (39-50)
  {
    id: 'akpd_39',
    category: 'Emosi',
    text: 'Saya mudah putus asa setiap menghadapi kegagalan',
  },
  {
    id: 'akpd_40',
    category: 'Karir',
    text: 'Cita-cita saya tidak sejalan dengan orang tua',
  },
  {
    id: 'akpd_41',
    category: 'Sosial',
    text: 'Saya belum mengenal jenis-jenis organisasi di masyarakat',
  },
  {
    id: 'akpd_42',
    category: 'Karir',
    text: 'Saya sulit untuk mengambil keputusan pilihan karir',
  },
  {
    id: 'akpd_43',
    category: 'Karir',
    text: 'Saya masih ragu untuk melanjutkan sekolah ke jenjang SLTA',
  },
  {
    id: 'akpd_44',
    category: 'Karir',
    text: 'Saya belum tahu tentang cara atau strategi masuk sekolah favorit',
  },
  {
    id: 'akpd_45',
    category: 'Karir',
    text: 'Saya belum merencanakan karir masa depan',
  },
  {
    id: 'akpd_46',
    category: 'Karir',
    text: 'Saya kurang berminat memikirkan masa depan',
  },
  {
    id: 'akpd_47',
    category: 'Karir',
    text: 'Saya belum memahami tentang dunia kerja',
  },
  {
    id: 'akpd_48',
    category: 'Karir',
    text: 'Saya masih bingung memikirkan karir setelah lulus SMP/MTs',
  },
  {
    id: 'akpd_49',
    category: 'Karir',
    text: 'Saya belum paham masalah peminatan/jurusan di SMA/MA',
  },
  {
    id: 'akpd_50',
    category: 'Karir',
    text: 'Saya belum paham masalah peminatan/jurusan di SMK/MAK',
  },
];

export const AKPD_CATEGORIES = [
  'Spiritual & Emosi',
  'Emosi',
  'Akademik',
  'Sosial',
  'Kesehatan',
  'Perilaku',
  'Ketergantungan',
  'Keluarga',
  'Kepribadian',
  'Pemecahan Masalah',
  'Nilai Moral',
  'Pergaulan & Persahabatan',
  'Pemahaman Risiko',
  'Keuangan',
  'Karir',
];

/**
 * Get AKPD questions based on grade level
 * @param gradeLevel The grade level (VII, VIII, IX, X, XI, XII)
 * @returns Array of AKPDQuestion for that grade level
 */
export function getAKPDQuestionsByGrade(gradeLevel: string): AKPDQuestion[] {
  // Extract grade from class format like "VII-1" -> "VII"
  const grade = gradeLevel.split('-')[0].toUpperCase();
  
  const gradeQuestions = AKPD_QUESTIONS_BY_GRADE[grade];
  
  // Return grade-specific questions if available, otherwise fallback to default
  if (gradeQuestions && gradeQuestions.length > 0) {
    return gradeQuestions;
  }
  
  // Fallback to default questions for backward compatibility
  return AKPD_QUESTIONS;
}

/**
 * Get AKPD questions with custom edits from localStorage
 * Falls back to default AKPD_QUESTIONS if no custom questions found
 */
export function getAKPDQuestionsWithCustom(): AKPDQuestion[] {
  if (typeof window === 'undefined') {
    return AKPD_QUESTIONS;
  }

  try {
    const customQuestions = localStorage.getItem('customAKPDQuestions');
    if (customQuestions) {
      const parsed = JSON.parse(customQuestions);
      // Merge custom text with original questions to preserve structure
      return AKPD_QUESTIONS.map((original) => {
        const custom = parsed.find((q: any) => q.id === original.id);
        if (custom) {
          return {
            ...original,
            text: custom.text,
          };
        }
        return original;
      });
    }
  } catch (error) {
    console.error('Error loading custom AKPD questions:', error);
  }

  return AKPD_QUESTIONS;
}
