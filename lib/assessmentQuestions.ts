
export interface Question {
  id: string;
  category: string;
  categoryId: string;
  text: string;
  options: string[];
  scenario?: string;
  scores?: number[];
  dimension?: string;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  label: string;
}

export const AUM_CATEGORIES: AssessmentCategory[] = [
  { id: 'pribadi', name: 'Pribadi', label: 'Bidang Pribadi' },
  { id: 'sosial', name: 'Sosial', label: 'Bidang Sosial' },
  { id: 'belajar', name: 'Belajar', label: 'Bidang Belajar' },
  { id: 'karier', name: 'Karier', label: 'Bidang Karier' },
  { id: 'keluarga', name: 'Keluarga', label: 'Bidang Keluarga' },
  { id: 'agama', name: 'Agama', label: 'Bidang Agama' },
  { id: 'nilai_moral', name: 'Nilai & Moral', label: 'Bidang Nilai & Moral' },
];

export const assessmentQuestions: Record<string, Question[]> = {
  aum: [
    // Bidang Pribadi (10 pertanyaan)
    {
      id: 'pribadi_1',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya merasa tidak percaya diri',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_2',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya mudah merasa cemas atau khawatir',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_3',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya sulit mengendalikan emosi',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_4',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya merasa tidak puas dengan penampilan fisik saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_5',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya mudah merasa sedih atau murung',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_6',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya sulit membuat keputusan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_7',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya merasa tidak memiliki bakat khusus',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_8',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya mudah merasa stres',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_9',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya sulit menerima kritik dari orang lain',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'pribadi_10',
      category: 'Pribadi',
      categoryId: 'pribadi',
      text: 'Saya merasa tidak berharga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Sosial (10 pertanyaan)
    {
      id: 'sosial_1',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya sulit bergaul dengan teman sebaya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_2',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya merasa malu untuk berbicara di depan umum',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_3',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya sulit memulai percakapan dengan orang baru',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_4',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya merasa tidak diterima dalam kelompok',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_5',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya mudah tersinggung dengan perkataan orang lain',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_6',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya sulit bekerja sama dalam tim',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_7',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya merasa canggung dalam situasi sosial',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_8',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya sulit mengekspresikan pendapat saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_9',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya merasa berbeda dari teman-teman saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'sosial_10',
      category: 'Sosial',
      categoryId: 'sosial',
      text: 'Saya sulit mempertahankan persahabatan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Belajar (10 pertanyaan)
    {
      id: 'belajar_1',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya sulit berkonsentrasi saat belajar',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_2',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya mudah bosan dengan pelajaran',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_3',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya sulit memahami materi pelajaran',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_4',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya sering menunda-nunda mengerjakan tugas',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_5',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya merasa tidak memiliki motivasi untuk belajar',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_6',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya sulit mengatur waktu belajar',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_7',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya mudah lupa dengan materi yang sudah dipelajari',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_8',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya merasa takut dengan ujian atau tes',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_9',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya sulit mencatat pelajaran dengan baik',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'belajar_10',
      category: 'Belajar',
      categoryId: 'belajar',
      text: 'Saya merasa nilai saya selalu tidak memuaskan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Karier (10 pertanyaan)
    {
      id: 'karier_1',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya bingung menentukan cita-cita masa depan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_2',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya tidak tahu bakat dan minat saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_3',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya khawatir tidak bisa mencapai cita-cita',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_4',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya bingung memilih jurusan untuk melanjutkan sekolah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_5',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya merasa tidak memiliki kemampuan khusus',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_6',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya takut tidak bisa bersaing di masa depan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_7',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya tidak tahu cara mencapai cita-cita saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_8',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya merasa pesimis dengan masa depan saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_9',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya bingung dengan banyaknya pilihan karier',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'karier_10',
      category: 'Karier',
      categoryId: 'karier',
      text: 'Saya merasa tidak mendapat dukungan untuk cita-cita saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Keluarga (10 pertanyaan)
    {
      id: 'keluarga_1',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya sering bertengkar dengan orang tua',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_2',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa tidak dimengerti oleh keluarga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_3',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa kurang mendapat perhatian dari orang tua',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_4',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya sulit berkomunikasi dengan anggota keluarga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_5',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa terbebani dengan harapan keluarga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_6',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya sering merasa sedih karena masalah keluarga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_7',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa tidak nyaman di rumah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_8',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya sering dibanding-bandingkan dengan saudara',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_9',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa keluarga terlalu mengatur hidup saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'keluarga_10',
      category: 'Keluarga',
      categoryId: 'keluarga',
      text: 'Saya merasa tidak mendapat dukungan dari keluarga',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Agama (10 pertanyaan)
    {
      id: 'agama_1',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya merasa kurang dalam menjalankan ibadah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_2',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya sering meragukan ajaran agama',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_3',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya merasa berdosa karena perbuatan saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_4',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya sulit memahami ajaran agama',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_5',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya merasa jauh dari Tuhan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_6',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya sering melanggar aturan agama',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_7',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya merasa tidak khusyuk saat beribadah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_8',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya bingung dengan berbagai pandangan agama',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_9',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya merasa takut dengan azab Tuhan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'agama_10',
      category: 'Agama',
      categoryId: 'agama',
      text: 'Saya sulit menerapkan nilai agama dalam kehidupan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    // Bidang Nilai & Moral (10 pertanyaan)
    {
      id: 'nilai_moral_1',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sering berbohong kepada orang lain',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_2',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya mudah terpengaruh hal-hal negatif',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_3',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sering melanggar aturan sekolah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_4',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sulit membedakan yang benar dan salah',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_5',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sering merasa bersalah atas perbuatan saya',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_6',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya mudah tergoda untuk berbuat curang',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_7',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sering tidak menepati janji',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_8',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sulit menghormati orang yang lebih tua',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_9',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya sering berperilaku tidak sopan',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
    {
      id: 'nilai_moral_10',
      category: 'Nilai & Moral',
      categoryId: 'nilai_moral',
      text: 'Saya mudah marah dan kasar kepada orang lain',
      options: ['Tidak Pernah', 'Kadang-kadang', 'Sering', 'Selalu'],
    },
  ],
  personality_career: Array.from({ length: 50 }, (_, i) => {
    const types = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
    const type = types[i % 6];
    return {
      id: `pc_${i + 1}`,
      category: type,
      categoryId: 'karier',
      text: [
        'Saya suka memperbaiki barang elektronik', 'Saya tertarik memecahkan masalah matematika', 'Saya suka menggambar atau melukis', 'Saya senang mengajar teman yang belum paham', 'Saya suka menjadi ketua kelompok', 'Saya suka merapikan arsip atau data',
        'Saya lebih suka bekerja di luar ruangan', 'Saya ingin tahu bagaimana mesin bekerja', 'Saya suka membaca buku fiksi', 'Saya peduli dengan masalah sosial', 'Saya berani berbicara di depan umum', 'Saya teliti dalam menghitung uang',
        'Saya suka merakit peralatan mekanik', 'Saya suka melakukan eksperimen sains', 'Saya suka menonton pertunjukan seni', 'Saya suka mendengarkan curhat teman', 'Saya suka meyakinkan orang lain', 'Saya suka mengikuti aturan dan prosedur',
        'Saya suka berkebun atau bertani', 'Saya suka menganalisis data statistik', 'Saya suka menulis puisi atau cerpen', 'Saya suka kegiatan sukarelawan', 'Saya suka berdagang atau berjualan', 'Saya suka membuat jadwal kegiatan',
        'Saya suka mengoperasikan mesin berat', 'Saya suka mempelajari biologi', 'Saya suka bermain musik', 'Saya suka merawat orang sakit', 'Saya ambisius dalam mencapai target', 'Saya suka menyusun laporan keuangan',
        'Saya suka olahraga fisik', 'Saya suka meneliti fenomena alam', 'Saya suka mendesain pakaian', 'Saya suka diskusi kelompok', 'Saya suka memimpin rapat', 'Saya suka pekerjaan administrasi',
        'Saya suka membuat kerajinan tangan dari kayu', 'Saya suka memprogram komputer', 'Saya suka fotografi', 'Saya suka memberikan nasihat', 'Saya suka negosiasi harga', 'Saya suka mengorganisir dokumen',
        'Saya suka mendaki gunung', 'Saya suka membaca artikel ilmiah', 'Saya suka menari atau akting', 'Saya suka membantu orang tua', 'Saya suka mencalonkan diri dalam pemilihan', 'Saya suka membuat daftar inventaris',
        'Saya suka memperbaiki kendaraan', 'Saya suka mengamati bintang'
      ][i] || `Pertanyaan minat karir ${type} nomor ${i + 1}`,
      options: ['Sangat Tidak Suka', 'Tidak Suka', 'Netral', 'Suka', 'Sangat Suka'],
    };
  }),

  sma_smk: Array.from({ length: 50 }, (_, i) => ({
    id: `ss_${i + 1}`,
    category: i % 2 === 0 ? 'Minat Akademik (SMA)' : 'Minat Vokasi (SMK)',
    categoryId: 'belajar',
    text: [
      'Saya lebih suka belajar teori di kelas', 'Saya lebih suka praktik langsung di bengkel/lab', 'Saya berencana kuliah S1 setelah lulus', 'Saya ingin langsung bekerja setelah lulus', 'Saya suka membaca buku pelajaran tebal',
      'Saya suka membongkar pasang alat', 'Saya tertarik pada ilmu sosial dan saintek', 'Saya tertarik pada keterampilan teknis spesifik', 'Saya ingin jadi ilmuwan atau akademisi', 'Saya ingin jadi teknisi atau ahli madya',
      'Saya betah duduk lama mendengarkan ceramah', 'Saya tidak betah duduk diam, harus bergerak', 'Saya suka menulis esai panjang', 'Saya suka membuat benda nyata', 'Saya memprioritaskan nilai rapor akademik',
      'Saya memprioritaskan sertifikat kompetensi', 'Saya suka diskusi filosofis', 'Saya suka simulasi kerja nyata', 'Saya ingin mendalami satu mata pelajaran secara luas', 'Saya ingin menguasai satu keahlian kerja secara dalam',
      'Saya suka pelajaran Sejarah atau Sosiologi', 'Saya suka pelajaran Produktif kejuruan', 'Saya melihat diri saya sebagai mahasiswa', 'Saya melihat diri saya sebagai karyawan profesional', 'Saya suka riset perpustakaan',
      'Saya suka kunjungan industri', 'Saya ingin memperluas wawasan umum', 'Saya ingin mempertajam skill khusus', 'Saya suka ujian tertulis', 'Saya suka ujian praktik',
      'Saya tertarik dengan konsep abstrak', 'Saya tertarik dengan aplikasi nyata', 'Saya ingin belajar manajemen', 'Saya ingin belajar operasional mesin', 'Saya suka debat akademik',
      'Saya suka lomba keterampilan siswa', 'Saya ingin menjadi peneliti', 'Saya ingin menjadi praktisi', 'Saya suka lingkungan sekolah formil', 'Saya suka lingkungan kerja industri',
      'Saya siap belajar 4 tahun lagi setelah lulus', 'Saya ingin cepat mandiri secara finansial', 'Saya suka menganalisis masalah sosial', 'Saya suka memperbaiki kerusakan alat', 'Saya tertarik sastra dan budaya',
      'Saya tertarik otomotif atau tata boga', 'Saya suka matematika murni', 'Saya suka matematika terapan', 'Saya ingin jadi dosen/guru', 'Saya ingin jadi pengusaha/profesional'
    ][i] || 'Pertanyaan preferensi SMA/SMK',
    options: ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju'],
  })),

  mbti: Array.from({ length: 50 }, (_, i) => {
    const pairs = [
      ['Extraversion', 'Introversion'],
      ['Sensing', 'Intuition'],
      ['Thinking', 'Feeling'],
      ['Judging', 'Perceiving']
    ];
    const pairIndex = i % 4;
    const isSecondPole = Math.floor(i / 4) % 2 === 1;
    const category = isSecondPole ? pairs[pairIndex][1] : pairs[pairIndex][0];

    return {
      id: `mbti_${i + 1}`,
      category: category,
      categoryId: 'pribadi',
      text: [
        'Saya merasa berenergi setelah bertemu banyak orang', 'Saya lebih percaya pada fakta nyata daripada teori', 'Saya memutuskan berdasarkan logika, bukan perasaan', 'Saya suka membuat rencana detail',
        'Saya lebih suka diam dan mengamati daripada bicara', 'Saya suka berimajinasi tentang masa depan', 'Saya mudah tersentuh oleh cerita sedih', 'Saya suka bekerja spontan tanpa jadwal ketat',
        'Saya mudah berteman dengan orang baru', 'Saya suka instruksi yang jelas dan bertahap', 'Saya lebih mementingkan kebenaran daripada kedamaian', 'Saya suka menyelesaikan tugas jauh sebelum tenggat',
        'Saya butuh waktu sendiri untuk recharge energi', 'Saya sering memikirkan makna tersembunyi', 'Saya menjaga harmoni dalam kelompok', 'Saya suka fleksibilitas dan perubahan mendadak',
        'Saya suka menjadi pusat perhatian', 'Saya realistis dan praktis', 'Saya bisa mengkritik tanpa merasa bersalah', 'Saya tidak suka kejutan',
        'Saya pendengar yang baik', 'Saya suka kiasan dan metafora', 'Saya memutuskan dengan hati nurani', 'Saya sering menunda pekerjaan sampai menit akhir',
        'Saya suka keramaian pesta', 'Saya detail oriented', 'Saya objektif dalam menilai masalah', 'Saya punya to-do list harian',
        'Saya memikirkan jawaban lama sebelum bicara', 'Saya suka ide-ide baru yang belum teruji', 'Saya peka terhadap perasaan orang lain', 'Saya merasa terkekang oleh aturan kaku',
        'Saya bicara cepat dan lantang', 'Saya fokus pada masa kini (here and now)', 'Saya tidak mudah tersinggung', 'Saya suka keteraturan di kamar saya',
        'Saya lebih suka komunikasi tertulis (chat/email)', 'Saya suka melihat gambaran besar (big picture)', 'Saya hangat dan penuh empati', 'Saya "go with the flow"',
        'Saya inisiator dalam pergaulan', 'Saya mengandalkan pengalaman masa lalu', 'Saya analitis dan kritis', 'Saya terganggu jika rencana berubah',
        'Saya selektif memilih teman dekat', 'Saya suka berandai-andai "bagaimana jika"', 'Saya memprioritaskan perasaan orang', 'Saya bekerja paling baik saat terdesak deadline', 'Saya suka berkenalan duluan', 'Saya fokus pada data konkret'
      ][i],
      options: ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju'],
    };
  }),

  kecerdasan_majemuk: Array.from({ length: 50 }, (_, i) => {
    const cats = ['Linguistik', 'Logis-Matematis', 'Spasial', 'Musikal', 'Kinestetik', 'Interpersonal', 'Intrapersonal', 'Naturalis'];
    const cat = cats[i % 8];
    return {
      id: `km_${i + 1}`,
      category: cat,
      categoryId: 'belajar',
      text: [
        'Saya suka membaca buku di waktu luang', 'Saya suka menghitung uang kembalian dengan cepat', 'Saya mudah membaca peta', 'Saya bisa memainkan alat musik', 'Saya suka olahraga fisik', 'Saya punya banyak teman dekat', 'Saya tahu kelemahan dan kekuatan diri sendiri', 'Saya suka berkebun dan merawat hewan',
        'Saya punya perbendaharaan kata yang luas', 'Saya suka teka-teki logika atau sudoku', 'Saya suka menggambar atau mencoret-coret', 'Saya mudah mengingat melodi lagu', 'Saya tidak bisa duduk diam lama-lama', 'Saya suka memimpin kelompok', 'Saya suka merenung sendirian', 'Saya peduli lingkungan alam',
        'Saya suka menulis cerita atau diary', 'Saya suka pelajaran matematika dan sains', 'Saya bisa membayangkan bentuk benda dari berbagai sisi', 'Saya peka terhadap nada sumbang', 'Saya terampil dalam kerajinan tangan', 'Orang sering curhat kepada saya', 'Saya punya tujuan hidup yang jelas', 'Saya suka mengoleksi batu, daun, atau serangga',
        'Saya suka permainan kata (scrabble, teka-teki silang)', 'Saya suka bereksperimen "bagaimana jika"', 'Saya suka fotografi atau videografi', 'Saya sering bernyanyi atau bersenandung', 'Saya suka menari atau akting', 'Saya mudah bergaul dengan orang baru', 'Saya mandiri dan percaya diri', 'Saya suka mendaki gunung atau camping',
        'Saya mudah belajar bahasa asing', 'Saya berpikir secara logis dan runtut', 'Saya suka mendesain layout ruangan', 'Saya suka mendengarkan musik saat belajar', 'Saya belajar lebih baik dengan mempraktikkan', 'Saya peka terhadap mood orang lain', 'Saya suka mengevaluasi diri sendiri', 'Saya tahu nama-nama tanaman dan hewan',
        'Saya pandai berpidato atau bercerita', 'Saya penasaran bagaimana cara kerja gadget', 'Saya punya sense of direction yang baik', 'Saya bisa mengetuk irama dengan pas', 'Saya cekatan dan tangkas', 'Saya suka kerja tim', 'Saya butuh privasi', 'Saya suka menonton dokumenter alam',
        'Saya suka puisi dan pantun', 'Saya suka strategi permainan (catur, game strategi)'
      ][i],
      options: ['Sangat Tidak Sesuai', 'Tidak Sesuai', 'Netral', 'Sesuai', 'Sangat Sesuai'],
    };
  }),

  introvert_extrovert: Array.from({ length: 50 }, (_, i) => ({
    id: `ie_${i + 1}`,
    category: i % 2 === 0 ? 'Introversion' : 'Extroversion',
    categoryId: 'sosial',
    text: [
      'Saya merasa lelah jika terlalu lama bersosialisasi', 'Saya mendapatkan energi dari bertemu orang banyak',
      'Saya lebih suka pembicaraan mendalam berdua', 'Saya suka ngobrol ringan dengan siapa saja',
      'Saya berpikir dulu baru bicara', 'Saya bicara dulu baru berpikir (spontan)',
      'Saya lebih suka di rumah saat akhir pekan', 'Saya harus keluar rumah saat libur',
      'Saya punya sedikit teman tapi sangat dekat', 'Saya punya banyak kenalan di mana-mana',
      'Saya tidak suka menjadi pusat perhatian', 'Saya menikmati sorotan perhatian orang',
      'Saya merasa canggung di pesta besar', 'Saya adalah "life of the party"',
      'Saya lebih suka kerja mandiri', 'Saya lebih suka kerja kelompok (brainstorming)',
      'Saya butuh ketenangan untuk konsentrasi', 'Saya bisa fokus meski suasana ramai',
      'Saya membatasi berbagi info pribadi', 'Saya terbuka menceritakan diri saya',
      'Orang bilang saya pendiam', 'Orang bilang saya bawel/ramah',
      'Saya menghindari konflik terbuka', 'Saya berani mengkonfrontasi masalah',
      'Saya lebih suka pesan teks daripada telepon', 'Saya lebih suka menelepon daripada mengetik',
      'Saya mendengarkan lebih banyak daripada bicara', 'Saya mendominasi percakapan',
      'Saya enggan memulai perkenalan', 'Saya selalu menyapa duluan',
      'Saya butuh waktu lama untuk akrab', 'Saya cepat akrab dengan orang asing',
      'Saya menjaga jarak fisik dengan orang lain', 'Saya suka kontak fisik (salaman, tepuk bahu)',
      'Saya selektif menerima undangan acara', 'Saya jarang menolak ajakan main',
      'Saya lebih suka mengamati situasi dulu', 'Saya langsung terjun ke dalam situasi',
      'Saya merasa kesepian bukan hal buruk', 'Saya tidak tahan kesepian',
      'Saya menyimpan emosi untuk diri sendiri', 'Saya ekspresif menunjukkan emosi',
      'Saya suka hobi yang soliter (baca, game)', 'Saya suka hobi sosial (team sport, nongkrong)',
      'Saya merasa acara reuni melelahkan', 'Saya sangat menantikan acara reuni',
      'Saya lebih suka makan sendirian di kantin', 'Saya mencari teman untuk makan bareng',
      'Saya merasa nyaman dengan keheningan', 'Saya merasa canggung jika hening',
      'Saya, Introvert', 'Saya, Extrovert'
    ][i],
    options: ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju'],
  })),

  stress_akademik: Array.from({ length: 50 }, (_, i) => ({
    id: `sa_${i + 1}`,
    category: 'Stress Level',
    categoryId: 'belajar',
    text: [
      'Saya merasa pusing memikirkan PR yang menumpuk', 'Jantung saya berdebar kencang saat guru menunjuk saya', 'Saya sulit tidur karena cemas besok ada ujian', 'Saya merasa tidak punya waktu istirahat', 'Orang tua menuntut nilai saya harus sempurna',
      'Saya merasa bodoh jika tidak bisa menjawab soal', 'Saya sering sakit perut sebelum berangkat sekolah', 'Saya tidak semangat bangun pagi untuk sekolah', 'Saya merasa materi pelajaran terlalu sulit', 'Saya takut tidak naik kelas',
      'Saya merasa guru pilih kasih', 'Saya merasa teman sekelas lebih pintar dari saya', 'Saya overload dengan jadwal les/bimbel', 'Saya tidak bisa konsentrasi di kelas', 'Saya sering melamun saat pelajaran',
      'Saya merasa lelah mental setiap pulang sekolah', 'Saya mudah marah tanpa sebab yang jelas', 'Saya kehilangan nafsu makan saat banyak tugas', 'Saya ingin bolos sekolah saja', 'Saya menangis karena nilai ujian jelek',
      'Saya merasa tidak ada yang membantu saya belajar', 'Saya takut mengecewakan orang tua', 'Saya merasa persaingan di kelas terlalu ketat', 'Saya sering lupa materi yang baru dihafal', 'Saya panik saat waktu ujian hampir habis',
      'Tangan saya berkeringat dingin saat presentasi', 'Saya merasa tugas kelompok membebani saya', 'Saya tidak punya waktu untuk hobi lagi', 'Saya merasa hidup saya hanya untuk belajar', 'Saya sering sakit kepala di sekolah',
      'Saya merasa tertekan dengan target ranking', 'Saya merasa salah pilih jurusan/minat', 'Saya takut masa depan saya suram', 'Saya merasa burnout (lelah luar biasa)', 'Saya jadi malas bersosialisasi',
      'Saya merasa guru terlalu cepat menjelaskan', 'Saya takut bertanya pada guru', 'Saya merasa catatan saya berantakan', 'Saya bingung mengatur jadwal belajar', 'Saya merasa fasilitas belajar kurang mendukung',
      'Saya sering menunda tugas karena takut salah', 'Saya perfeksionis yang menyiksa diri', 'Saya membandingkan diri dengan teman', 'Saya merasa usaha saya sia-sia', 'Saya butuh liburan panjang',
      'Saya merasa orang lain tidak paham beban saya', 'Saya sensitif/mudah tersinggung', 'Saya jadi sering bengong', 'Saya kehilangan motivasi berprestasi', 'Saya merasa stress berat'
    ][i],
    options: ['Tidak Pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Selalu'],
  })),

  big_five: Array.from({ length: 50 }, (_, i) => {
    const traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
    const trait = traits[i % 5];
    return {
      id: `bf_${i + 1}`,
      category: trait,
      categoryId: 'pribadi',
      text: [
        'Saya punya ide-ide yang cemerlang', 'Saya selalu siap sedia', 'Saya suka bicara dengan banyak orang', 'Saya bersimpati pada perasaan orang lain', 'Saya mudah merasa stress',
        'Saya cepat memahami hal-hal abstrak', 'Saya meletakkan barang pada tempatnya', 'Saya nyaman menjadi pusat perhatian', 'Saya punya hati yang lembut', 'Saya sering khawatir berlebihan',
        'Saya punya imajinasi yang jelas', 'Saya bekerja sesuai jadwal', 'Saya yang memulai percakapan', 'Saya tertarik pada orang lain', 'Saya mudah terganggu emosinya',
        'Saya tertarik pada ide-ide filosofis', 'Saya memperhatikan detail', 'Saya suka keramaian', 'Saya menghormati orang lain', 'Saya sering merasa sedih (moody)',
        'Saya suka memikirkan konsep yang dalam', 'Saya menyelesaikan tugas tepat waktu', 'Saya tidak keberatan jadi sorotan', 'Saya suka menolong orang', 'Saya mudah panik',
        'Saya suka seni dan keindahan', 'Saya bekerja keras untuk tujuan', 'Saya penuh energi', 'Saya memaafkan kesalahan orang', 'Saya sering merasa tertekan',
        'Saya suka variasi dan hal baru', 'Saya sangat tertib dan rapi', 'Saya antusias dan ceria', 'Saya percaya pada kebaikan orang', 'Saya takut pada banyak hal',
        'Saya suka puisi dan sastra', 'Saya menepati janji', 'Saya orang yang assertif', 'Saya kooperatif, tidak suka konflik', 'Saya sering merasa iri hati',
        'Saya penasaran dengan banyak hal', 'Saya rajin dan tekun', 'Saya suka memimpin', 'Saya sopan dan santun', 'Saya merasa tidak stabil emosinya',
        'Saya kreatif', 'Saya bisa diandalkan', 'Saya suka petualangan', 'Saya pendengar yang baik', 'Saya gampang gugup'
      ][i],
      options: ['Sangat Tidak Setuju', 'Tidak Setuju', 'Netral', 'Setuju', 'Sangat Setuju'],
    };
  }),

  grit: Array.from({ length: 50 }, (_, i) => ({
    id: `grit_${i + 1}`,
    category: 'Ketekunan',
    categoryId: 'pribadi',
    text: [
      'Saya tidak mudah patah semangat', 'Saya pekerja keras', 'Saya menyelesaikan apa yang saya mulai', 'Saya punya minat yang bertahan lama', 'Saya rajin berlatih untuk jadi lebih baik',
      'Kegagalan tidak membuat saya berhenti', 'Saya tetap fokus pada proyek jangka panjang', 'Saya tidak terganggu oleh rintangan', 'Saya memiliki disiplin diri tinggi', 'Saya berjuang untuk keunggulan',
      'Saya konsisten dengan tujuan saya', 'Saya tidak mudah bosan dengan tugas rutin', 'Saya mengatasi kemunduran untuk menaklukkan tantangan', 'Saya adalah orang yang "tahan banting"', 'Saya berlatih bahkan saat merasa malas',
      'Saya terobsesi pada ide/proyek tertentu dalam waktu lama', 'Saya lebih tekun dibanding teman-teman saya', 'Saya mencapai tujuan meski butuh waktu bertahun-tahun', 'Saya didorong oleh hasrat untuk berhasil', 'Saya tidak menyerah saat orang lain menyerah',
      'Saya menanggapi kritik sebagai masukan', 'Saya selalu mencoba lagi', 'Saya punya stamina mental yang kuat', 'Saya berdedikasi tinggi', 'Saya tidak melompat-lompat antar minat',
      'Saya fokus pada proses, bukan hasil instan', 'Saya mengorbankan kesenangan sesaat untuk tujuan besar', 'Saya percaya usaha mengalahkan bakat', 'Saya gigih memperjuangkan mimpi', 'Saya tetap optimis saat sulit',
      'Saya mampu menjaga motivasi sendiri', 'Saya menyelesaikan tugas sampai tuntas', 'Saya tidak mencari jalan pitas', 'Saya siap bekerja ekstra', 'Saya menyukai tantangan sulit',
      'Saya bangkit setelah jatuh', 'Saya belajar dari kesalahan', 'Saya berkomitmen pada janji saya', 'Saya mengendalikan impuls', 'Saya punya visi jangka panjang',
      'Saya tidak mudah teralihkan', 'Saya sabar menjalani proses', 'Saya menikmati kerja keras', 'Saya mandiri dalam berusaha', 'Saya konsisten setiap hari',
      'Saya punya standar tinggi', 'Saya terus maju walau perlahan', 'Saya "keras kepala" dalam arti positif', 'Saya berani bermimpi besar', 'Saya memiliki GRIT (kegigihan)'
    ][i],
    options: ['Sangat Tidak Seperti Saya', 'Tidak Seperti Saya', 'Netral', 'Seperti Saya', 'Sangat Seperti Saya'],
  })),

  rmib: Array.from({ length: 50 }, (_, i) => {
    const cats = ['Outdoor', 'Mechanical', 'Computational', 'Scientific', 'Persuasive', 'Artistic', 'Literary', 'Musical', 'Social Service', 'Clerical'];
    const cat = cats[i % 10];
    return {
      id: `rmib_${i + 1}`,
      category: cat,
      categoryId: 'karier',
      text: [
        'Bekerja sebagai petani modern', 'Merakit mesin mobil', 'Menjadi akuntan', 'Melakukan eksperimen kimia', 'Menjadi sales manager', 'Menjadi pelukis', 'Menulis novel', 'Menjadi komposer musik', 'Menjadi pekerja sosial', 'Menjadi staf administrasi',
        'Menjadi jagawana hutan', 'Memperbaiki jam tangan', 'Mengaudit keuangan', 'Meneliti virus', 'Menjadi pengacara', 'Mendesain interior', 'Menjadi jurnalis', 'Bermain di orkestra', 'Menjadi perawat', 'Menjadi sekretaris',
        'Berkebun tanaman hias', 'Mengelas besi', 'Kasir bank', 'Ahli geologi', 'Politikus', 'Pematung', 'Editor buku', 'Guru musik', 'Guru TK', 'Pustakawan',
        'Nelayan profesional', 'Operator alat berat', 'Guru matematika', 'Astronom', 'Humas perusahaan', 'Desainer grafis', 'Penyair', 'Penyanyi', 'Psikolog', 'Resepsionis',
        'Peternak hewan', 'Tukang kayu', 'Statistisi', 'Dokter bedah', 'Marketing executive', 'Fotografer', 'Penulis skenario', 'DJ / Sound Enginer', 'Konselor', 'Arsiparis'
      ][i],
      options: ['Sangat Tidak Tertarik', 'Tidak Tertarik', 'Netral', 'Tertarik', 'Sangat Tertarik'],
    };
  }),

  self_awareness: Array.from({ length: 50 }, (_, i) => ({
    id: `sa_${i + 1}`,
    category: 'Self Awareness',
    categoryId: 'pribadi',
    text: [
      'Saya tahu apa yang membuat saya bahagia', 'Saya tahu apa yang membuat saya marah', 'Saya sadar saat mood saya berubah', 'Saya tahu kekuatan utama saya', 'Saya tahu kelemahan terbesar saya',
      'Saya mengerti dampak perilaku saya pada orang lain', 'Saya bisa menjelaskan perasaan saya dengan kata-kata', 'Saya tahu nilai-nilai hidup yang saya pegang', 'Saya jujur pada diri sendiri', 'Saya menerima diri saya apa adanya',
      'Saya tahu kapan saya butuh istirahat', 'Saya tahu keterbatasan kemampuan saya', 'Saya bisa menertawakan diri sendiri', 'Saya sadar akan prasangka yang saya miliki', 'Saya bertanggung jawab atas kesalahan saya',
      'Saya tahu apa yang memotivasi saya', 'Saya tahu pemicu stress saya', 'Saya bisa mengendalikan impuls saya', 'Saya mendengarkan kata hati', 'Saya refleksi diri setiap hari',
      'Saya terbuka terhadap kritik', 'Saya tahu tujuan hidup saya', 'Saya sadar bagaimana orang melihat saya', 'Saya tidak menyalahkan orang lain atas nasib saya', 'Saya bisa membedakan kebutuhan dan keinginan',
      'Saya tahu gaya belajar saya', 'Saya tahu bahasa cinta saya', 'Saya mengenali pola perilaku saya yang buruk', 'Saya berusaha menjadi lebih baik', 'Saya memaafkan diri sendiri',
      'Saya tidak membohongi perasaan sendiri', 'Saya berani berkata tidak', 'Saya tahu kapan harus meminta tolong', 'Saya menghargai pencapaian saya', 'Saya belajar dari masa lalu',
      'Saya tidak iri pada orang lain', 'Saya memiliki keyakinan diri', 'Saya sadar akan nada bicara saya', 'Saya sadar akan bahasa tubuh saya', 'Saya tahu prioritas saya',
      'Saya menjaga kesehatan mental saya', 'Saya memilih lingkungan yang positif', 'Saya selektif dalam berteman', 'Saya berani mengakui ketidaktahuan', 'Saya tidak pura-pura tahu',
      'Saya nyaman sendirian', 'Saya bersyukur setiap hari', 'Saya hidup di masa kini', 'Saya memiliki integritas', 'Saya mengenal siapa diri saya'
    ][i],
    options: ['Sangat Tidak Setuju', 'Tidak Setuju', 'Netral', 'Setuju', 'Sangat Setuju'],
  })),

  temperament: Array.from({ length: 50 }, (_, i) => {
    const types = ['Sanguinis', 'Koleris', 'Melankolis', 'Plegmatis'];
    const type = types[i % 4];
    return {
      id: `tmp_${i + 1}`,
      category: type,
      categoryId: 'pribadi',
      text: [
        'Saya suka bicara dan menjadi pusat perhatian', 'Saya suka memimpin dan mengatur', 'Saya suka menganalisis dan berpikir dalam', 'Saya suka ketenangan dan kedamaian',
        'Saya antusias dan ekspresif', 'Saya berkemauan keras dan tegas', 'Saya sensitif dan artistik', 'Saya santai dan mudah bergaul',
        'Saya mudah lupa dan tidak teratur', 'Saya tidak sabaran dan suka mendominasi', 'Saya mudah tersinggung dan murung', 'Saya sering menunda dan kurang motivasi',
        'Saya punya banyak teman', 'Saya fokus pada target/tujuan', 'Saya setia dan rela berkorban', 'Saya pendengar yang baik',
        'Saya optimis dan ceria', 'Saya mandiri dan percaya diri', 'Saya perfeksionis dan detail', 'Saya diplomatis dan menghindari konflik',
        'Saya suka kejutan dan spontanitas', 'Saya suka tantangan dan kompetisi', 'Saya suka ketertiban dan jadwal', 'Saya suka rutinitas dan stabilitas',
        'Saya menghidupkan suasana pesta', 'Saya mengambil keputusan dengan cepat', 'Saya merencanakan segalanya dengan matang', 'Saya sulit berkata tidak',
        'Saya emosional dan demonstratif', 'Saya logis dan praktis', 'Saya idealis dan filosofis', 'Saya praktis dan efisien',
        'Saya suka menyela pembicaraan', 'Saya suka berdebat', 'Saya suka mengkritik', 'Saya suka memendam perasaan',
        'Saya pemaaf dan tidak pendendam', 'Saya produktif dan aktif', 'Saya berbakat dan kreatif', 'Saya tenang di bawah tekanan',
        'Saya butuh pengakuan sosial', 'Saya butuh penghargaan prestasi', 'Saya butuh pemahaman mendalam', 'Saya butuh rasa hormat',
        'Saya suka cerita lucu', 'Saya suka visi besar', 'Saya suka diagram dan grafik', 'Saya suka tidur dan istirahat', 'Saya Sanguinis', 'Saya Koleris'
      ][i],
      options: ['Sangat Tidak Sesuai', 'Tidak Sesuai', 'Netral', 'Sesuai', 'Sangat Sesuai'],
    };
  }),

  sdq: Array.from({ length: 50 }, (_, i) => {
    const scales = ['Emosional', 'Perilaku', 'Hiperaktivitas', 'Teman Sebaya', 'Prososial'];
    const scale = scales[i % 5];
    return {
      id: `sdq_${i + 1}`,
      category: scale,
      categoryId: 'pribadi',
      text: [
        'Saya sering sakit kepala/perut', 'Saya sering marah meledak-ledak', 'Saya tidak bisa diam/gelisah', 'Saya lebih suka main sendiri', 'Saya suka berbagi dengan teman',
        'Saya banyak kekhawatiran', 'Saya sering berkelahi/bertengkar', 'Saya mudah teralihkan perhatiannya', 'Saya punya satu teman baik', 'Saya suka menolong orang sakit',
        'Saya sering tidak bahagia/sedih', 'Saya sering berbohong/curang', 'Saya selalu bergerak', 'Saya sering diganggu teman', 'Saya bersikap baik pada anak kecil',
        'Saya gugup dalam situasi baru', 'Saya mencuri barang orang lain', 'Saya tidak menyelesaikan tugas', 'Saya lebih gaul dengan orang dewasa', 'Saya sering menawarkan bantuan',
        'Saya mudah takut', 'Saya sering membantah orang dewasa', 'Saya impulsif (bertindak tanpa mikir)', 'Teman-teman tidak menyukai saya', 'Saya peduli perasaan orang lain',
        'Saya sering menangis', 'Saya merusak barang milik orang', 'Saya gelisah di kursi', 'Saya kesepian', 'Saya sukarela membantu guru',
        'Saya tidur tidak nyenyak', 'Saya kejam pada binatang', 'Saya cerewet/banyak bicara', 'Saya merasa berbeda dari teman', 'Saya menghibur teman yang sedih',
        'Saya cemas berpisah dari orang tua', 'Saya bolos sekolah', 'Saya memanjat-manjat berbahaya', 'Saya tidak punya sahabat', 'Saya berbagi bekal makanan',
        'Saya gemetar saat stress', 'Saya kasar pada orang lain', 'Saya ceroboh', 'Saya ditolak oleh peer group', 'Saya ramah pada orang asing',
        'Saya psikosomatis', 'Saya agresif', 'Saya hiperaktif', 'Saya introvert sosial', 'Saya empatik'
      ][i],
      options: ['Tidak Benar', 'Agak Benar', 'Benar'],
    };
  }),

  gaya_belajar: [
    {
      id: 'gb_1',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Ketika kamu berbicara, kamu lebih suka...',
      options: ['Berbicara dengan cepat', 'Berbicara dengan irama yang teratur', 'Berbicara dengan lambat'],
      dimension: 'Visual'
    },
    {
      id: 'gb_2',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Apa yang paling mengganggumu saat belajar?',
      options: ['Suasana yang berantakan/visual yang ramai', 'Suara bising', 'Duduk diam terlalu lama'],
      dimension: 'Visual'
    },
    {
      id: 'gb_3',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Ketika menerima petunjuk, kamu lebih suka...',
      options: ['Melihat diagram atau peta', 'Mendengarkan penjelasan lisan', 'Mencoba langsung'],
      dimension: 'Visual'
    },
    {
      id: 'gb_4',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Apa yang kamu lakukan saat antre?',
      options: ['Melihat-lihat sekeliling', 'Berbicara dengan orang sebelah atau mendengarkan musik', 'Memainkan kunci atau mengetuk-ngetuk kaki'],
      dimension: 'Visual'
    },
    {
      id: 'gb_5',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Saat bertemu orang baru, apa yang paling kamu ingat?',
      options: ['Wajah atau penampilan mereka', 'Nama atau suara mereka', 'Perasaan saat bersalaman atau berinteraksi'],
      dimension: 'Visual'
    },
    {
      id: 'gb_6',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Bagaimana cara kamu menghafal sesuatu?',
      options: ['Menulisnya atau membayangkannya', 'Mengucapkannya berulang-ulang', 'Mempragakannya atau berjalan sambil menghafal'],
      dimension: 'Visual'
    },
    {
      id: 'gb_7',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Apa yang kamu lakukan saat marah?',
      options: ['Diam dan memendam (ekspresi wajah berubah)', 'Mengungkapkannya dengan kata-kata', 'Membanting barang atau pergi keluar'],
      dimension: 'Visual'
    },
    {
      id: 'gb_8',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Untuk bersantai, kamu lebih suka...',
      options: ['Membaca buku atau menonton film', 'Mendengarkan musik', 'Berolahraga atau membuat kerajinan tangan'],
      dimension: 'Visual'
    },
    {
      id: 'gb_9',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Dalam sebuah presentasi, apa yang paling menarik bagimu?',
      options: ['Gambar, grafik, dan slide yang bagus', 'Intonasi suara pembicara dan penjelasannya', 'Demonstrasi atau contoh nyata'],
      dimension: 'Visual'
    },
    {
      id: 'gb_10',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Jika kamu tersesat, apa yang kamu lakukan?',
      options: ['Melihat peta', 'Bertanya pada orang', 'Mengandalkan perasaan atau intuisi arah'],
      dimension: 'Visual'
    },
    {
      id: 'gb_11',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Saat membaca buku cerita, apa yang kamu bayangkan?',
      options: ['Gambaran adegannya', 'Suara dialog tokoh-tokohnya', 'Perasaan yang dialami tokoh'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_12',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Apa jenis pujian yang paling kamu sukai?',
      options: ['Diberi hadiah atau sertifikat (terlihat)', 'Dipuji secara lisan', 'Ditepuk pundak atau diajak salaman'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_13',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Saat merakit mainan baru, kamu...',
      options: ['Melihat gambar petunjuknya', 'Meminta orang membacakan petunjuknya', 'Langsung mencoba merakitnya'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_14',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Apa yang lebih mudah kamu ingat dari film?',
      options: ['Setting tempat dan kostumnya', 'Musik soundtrack dan dialognya', 'Adegan aksinya'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_15',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Saat tidak ada kegiatan, kamu cenderung...',
      options: ['Melamun atau mengamati sekitar', 'Bersenandung atau berbicara pada diri sendiri', 'Bergerak atau tidak bisa diam'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_16',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Kamu mengetahui seseorang berbohong dari...',
      options: ['Ekspresi wajahnya yang aneh', 'Nada bicaranya yang berubah', 'Gerak-gerik tubuhnya'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_17',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Saat berbicara dengan orang lain, kamu suka...',
      options: ['Menatap matanya', 'Mendengarkan dengan seksama (bisa sambil memalingkan muka)', 'Menyentuh lengan atau berdiri dekat'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_18',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Kondisi ruangan belajar idealmu adalah...',
      options: ['Terang dan rapi', 'Tenang atau ada musik lembut', 'Nyaman dan ada ruang gerak'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_19',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Kamu lebih cepat paham jika guru...',
      options: ['Menulis di papan tulis', 'Menjelaskan dengan cerita', 'Meminta siswa mempraktikkan'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_20',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Hadiah ulang tahun yang paling kamu inginkan...',
      options: ['Buku, poster, atau perhiasan', 'Alat musik atau tiket konser', 'Peralatan olahraga atau game'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_21',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Ketika kamu punya masalah, kamu...',
      options: ['Membuat daftar pemecahan masalah', 'Menelepon teman untuk curhat', 'Pergi jalan-jalan atau tidur'],
      dimension: 'Visual'
    },
    {
      id: 'gb_22',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Kamu merasa senang ketika...',
      options: ['Melihat pemandangan indah', 'Mendengarkan lagu favorit', 'Melakukan aktivitas fisik'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_23',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Saat di pesta atau acara ramai, kamu...',
      options: ['Duduk dan mengamati orang-orang', 'Mengobrol dengan banyak orang', 'Ikut menari atau bermain games'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_24',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Jika membeli barang elektronik baru, kamu...',
      options: ['Membaca buku manualnya', 'Bertanya pada penjual cara pakainya', 'Langsung memencet tombol-tombolnya'],
      dimension: 'Visual'
    },
    {
      id: 'gb_25',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Kamu lebih mudah mengingat nomor telepon dengan cara...',
      options: ['Melihat angkanya di layar', 'Mengucapkannya berulang kali', 'Mengetikkan polanya di keypad'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_26',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Kegiatan ekstrakurikuler yang paling menarik bagimu...',
      options: ['Melukis atau Fotografi', 'Paduan Suara atau Debat', 'Olahraga atau Teater'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_27',
      category: 'Visual',
      categoryId: 'belajar',
      text: 'Saat mengeja kata sulit, kamu...',
      options: ['Membayangkan tulisannya', 'Mengejanya dengan suara keras', 'Menulisnya di kertas dulu'],
      dimension: 'Visual'
    },
    {
      id: 'gb_28',
      category: 'Auditorial',
      categoryId: 'belajar',
      text: 'Kamu paling tidak suka jika...',
      options: ['Melihat tulisan yang jelek/coretan', 'Mendengar suara bising/nada sumbang', 'Mengenakan pakaian yang tidak nyaman'],
      dimension: 'Auditorial'
    },
    {
      id: 'gb_29',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Liburan impianmu adalah...',
      options: ['Tamasya melihat pemandangan', 'Menonton konser musik', 'Hiking atau berenang di pantai'],
      dimension: 'Kinestetik'
    },
    {
      id: 'gb_30',
      category: 'Kinestetik',
      categoryId: 'belajar',
      text: 'Gaya belajarmu secara umum...',
      options: ['Harus melihat catatan/buku', 'Harus mendengarkan guru', 'Harus mempraktikkan/melakukan'],
      dimension: 'Kinestetik'
    }
  ],

  emotional_intelligence: [
    // Self-Awareness
    {
      id: 'ei_1',
      dimension: 'self-awareness',
      category: 'Self-Awareness',
      categoryId: 'pribadi',
      scenario: 'Kamu baru saja mendapat nilai ujian yang tidak memuaskan',
      text: 'Apa yang kamu rasakan dan bagaimana kamu merespons?',
      options: ['Merasa sangat kecewa dan ingin menyalahkan guru', 'Merasa kecewa tapi mencoba melihat nilai-nilai positif', 'Merasa kecewa dan langsung mencari tahu apa yang salah', 'Merasa sedikit kecewa dan fokus pada pembelajaran berikutnya', 'Merasa sangat kecewa tapi bersemangat untuk perbaikan'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_2',
      dimension: 'self-awareness',
      category: 'Self-Awareness',
      categoryId: 'pribadi',
      scenario: 'Saat teman memberikan kritik tentang tingkah lakumu',
      text: 'Bagaimana kamu biasanya bereaksi?',
      options: ['Merasa terserang dan marah', 'Merasa tidak nyaman tapi mendengarkan', 'Mendengarkan dan mulai merefleksikan diri', 'Menerima dengan tenang dan mencari saran lebih lanjut', 'Sangat terbuka untuk memahami perspektif mereka'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_3',
      dimension: 'self-awareness',
      category: 'Self-Awareness',
      categoryId: 'pribadi',
      text: 'Apa kekuatan terbesar yang kamu miliki?',
      options: ['Tidak yakin dengan kekuatan saya', 'Punya beberapa ide tapi tidak terlalu yakin', 'Tahu beberapa kekuatan tapi tidak jelas sepenuhnya', 'Cukup yakin dengan 2-3 kekuatan utama saya', 'Sangat yakin dan bisa menjelaskan kekuatan saya'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_4',
      dimension: 'self-awareness',
      category: 'Self-Awareness',
      categoryId: 'pribadi',
      scenario: 'Ketika kamu merasa marah atau kesal',
      text: 'Apa yang kamu lakukan?',
      options: ['Langsung meledak dan melakukan hal yang mungkin disesali', 'Merasa kesal dan butuh waktu lama untuk tenang', 'Menyadari emosi tapi kesulitan mengaturnya', 'Menyadari emosi dan bisa mengatasinya dengan cukup baik', 'Menyadari emosi dan segera mencari cara untuk tenang'],
      scores: [1, 2, 3, 4, 5]
    },
    // Self-Regulation
    {
      id: 'ei_5',
      dimension: 'self-regulation',
      category: 'Self-Regulation',
      categoryId: 'pribadi',
      scenario: 'Teman mengajak bermain game online saat kamu harus mengerjakan PR',
      text: 'Bagaimana kamu menangani situasi ini?',
      options: ['Langsung bermain game dan lupa PR', 'Tergoda bermain game tapi akhirnya PR selesai tergesa-gesa', 'Merasa ragu tapi bisa menyelesaikan PR dulu', 'Menunda bermain game demi menyelesaikan PR dengan baik', 'Tegas mengatur waktu dan menyelesaikan keduanya dengan terencana'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_6',
      dimension: 'self-regulation',
      category: 'Self-Regulation',
      categoryId: 'pribadi',
      scenario: 'Kamu merasa sangat kesal dengan teman dan ingin berbicara kasar',
      text: 'Apa yang biasanya kamu lakukan?',
      options: ['Langsung membentaknya tanpa pikir panjang', 'Menahan diri tapi masih bicara dengan kasar', 'Menahan diri dan mencoba bicara normal', 'Mencoba menenangkan diri sebelum berbicara', 'Pergi dulu, tenang, baru diskusi dengan tenang'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_7',
      dimension: 'self-regulation',
      category: 'Self-Regulation',
      categoryId: 'pribadi',
      text: 'Saat menghadapi tantangan atau tugas yang sulit, kamu:',
      options: ['Langsung menyerah karena terlalu sulit', 'Cepat menyerah setelah beberapa percobaan', 'Berusaha beberapa kali tapi mudah putus asa', 'Terus berusaha meski ada hambatan', 'Sangat persistent dan cari cara kreatif untuk menyelesaikan'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_8',
      dimension: 'self-regulation',
      category: 'Self-Regulation',
      categoryId: 'pribadi',
      scenario: 'Kamu mengalami kegagalan atau kesalahan yang cukup besar',
      text: 'Bagaimana kamu merespons?',
      options: ['Merasa sangat malu dan tidak ingin bertemu orang', 'Merasa malu dan butuh waktu lama untuk move on', 'Merasa sedih tapi bisa jalan kembali', 'Bisa move on dengan cepat dan belajar dari kesalahan', 'Langsung belajar dari kegagalan dan fokus improvement'],
      scores: [1, 2, 3, 4, 5]
    },
    // Empathy
    {
      id: 'ei_9',
      dimension: 'empathy',
      category: 'Empathy',
      categoryId: 'sosial',
      scenario: 'Teman terlihat sedih dan murung di sekolah',
      text: 'Apa yang kamu lakukan?',
      options: ['Tidak memperhatikan dan fokus dengan aktivitas sendiri', 'Memperhatikan tapi tidak tahu harus bilang apa', 'Tanya dengan singkat apa yang terjadi', 'Tanya dengan tulus dan mendengarkan dengan baik', 'Tanya dengan tulus, mendengarkan, dan tawarkan dukungan'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_10',
      dimension: 'empathy',
      category: 'Empathy',
      categoryId: 'sosial',
      scenario: 'Teman mu sedang presentasi tapi gugup dan sering salah kata',
      text: 'Apa yang kamu lakukan?',
      options: ['Tertawa atau membuat komentar negatif', 'Diam saja tanpa memberikan respons', 'Diam tapi memberikan pandangan yang mendukung', 'Memberikan tepukan tangan untuk support', 'Memberikan support dan tanyakan kabar setelahnya'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_11',
      dimension: 'empathy',
      category: 'Empathy',
      categoryId: 'sosial',
      text: 'Ketika teman curhat tentang masalah pribadi, kamu:',
      options: ['Mengubah topik karena tidak tertarik', 'Mendengarkan sekilas saja', 'Mendengarkan tapi lebih fokus membalas cerita sendiri', 'Mendengarkan dengan perhatian penuh', 'Mendengarkan dengan empati dan memberi saran yang membantu'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_12',
      dimension: 'empathy',
      category: 'Empathy',
      categoryId: 'sosial',
      scenario: 'Ada teman yang sering dikerjain atau dijauhi oleh kelompok lain',
      text: 'Bagaimana sikapmu terhadapnya?',
      options: ['Ikut menjauh atau bahkan ikut mengerjain', 'Diam saja dan tidak terlibat', 'Sesekali berbicara baik dengan mereka', 'Berusaha berbicara baik dan ajak bergabung kadang', 'Secara aktif berteman dan membela mereka saat dikerjain'],
      scores: [1, 2, 3, 4, 5]
    },
    // Relationship
    {
      id: 'ei_13',
      dimension: 'relationship',
      category: 'Relationship',
      categoryId: 'sosial',
      scenario: 'Kamu dan teman dekat sedang berselisih pendapat yang cukup serius',
      text: 'Bagaimana kamu menangani konflik ini?',
      options: ['Marah-marah dan tidak mau lagi berteman', 'Diam dengan kesal dan biarkan waktu berjalan', 'Coba bicara tapi mudah panas lagi', 'Coba berbicara dengan tenang dan mencari solusi', 'Langsung bicara dengan tenang, dengar pendapat mereka, cari solusi bersama'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_14',
      dimension: 'relationship',
      category: 'Relationship',
      categoryId: 'sosial',
      scenario: 'Kamu perlu meminta bantuan atau maaf kepada seseorang',
      text: 'Apakah kamu bisa melakukannya?',
      options: ['Sangat sulit, merasa malu dan tertinggal', 'Sulit tapi bisa jika sangat perlu', 'Bisa tapi perlu waktu untuk berani', 'Bisa dengan cukup mudah', 'Sangat mudah dan tahu itu penting untuk hubungan'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_15',
      dimension: 'relationship',
      category: 'Relationship',
      categoryId: 'sosial',
      text: 'Dalam bekerja sama dengan teman/tim, kamu biasanya:',
      options: ['Mendominasi atau egois dengan ide sendiri', 'Cenderung tapi bisa mendengarkan pendapat lain', 'Bisa mendengarkan tapi susah berkompromi', 'Bisa mendengarkan dan mencari jalan tengah', 'Sangat collaborative, terbuka, dan menghargai ide semua orang'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_16',
      dimension: 'relationship',
      category: 'Relationship',
      categoryId: 'sosial',
      scenario: 'Teman memiliki prestasi yang lebih baik dari kamu',
      text: 'Apa perasaanmu?',
      options: ['Iri dan ingin menjauhkan diri atau mengerjain', 'Iri tapi tetap berbicara normal', 'Sedikit iri tapi bisa bangga untuk mereka', 'Bangga untuk mereka dan ingin belajar dari mereka', 'Sangat bangga dan minta tips/bantuan dari mereka'],
      scores: [1, 2, 3, 4, 5]
    },
    // Motivation
    {
      id: 'ei_17',
      dimension: 'motivation',
      category: 'Motivation',
      categoryId: 'pribadi',
      text: 'Apa yang memotivasi kamu untuk belajar?',
      options: ['Hanya karena dipaksa orang tua atau guru', 'Takut nilainya jelek atau dimarahi', 'Ingin mendapat nilai bagus dan naik kelas', 'Ingin mendapat nilai bagus dan membanggakan keluarga', 'Ingin belajar karena penasaran dan ingin berkembang'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_18',
      dimension: 'motivation',
      category: 'Motivation',
      categoryId: 'pribadi',
      scenario: 'Kamu sedang menghadapi banyak masalah di sekolah dan rumah',
      text: 'Bagaimana sikapmu?',
      options: ['Merasa putus asa dan tidak ada harapan', 'Merasa sedih dan tertekan', 'Merasa tertekan tapi yakin bisa dilewati', 'Yakin bisa mengatasinya dengan bantuan orang lain', 'Sangat yakin dan percaya ini adalah pembelajaran yang baik'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_19',
      dimension: 'motivation',
      category: 'Motivation',
      categoryId: 'pribadi',
      text: 'Impian atau tujuan jangka panjang kamu adalah:',
      options: ['Tidak ada, hidup aja', 'Vague, tidak terlalu jelas', 'Ada tapi belum terlalu spesifik', 'Cukup jelas dan sudah mulai merencanakan', 'Sangat jelas dan sudah punya action plan konkret'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'ei_20',
      dimension: 'motivation',
      category: 'Motivation',
      categoryId: 'pribadi',
      scenario: 'Saat menghadapi kegagalan atau hasil yang tidak sesuai harapan',
      text: 'Apa yang kamu pikirkan?',
      options: ['Saya memang bodoh dan tidak bisa', 'Saya tidak cukup baik untuk ini', 'Ini sulit tapi mungkin saya bisa berusaha lagi', 'Saya bisa jika lebih giat dan strategi yang tepat', 'Ini pembelajaran penting dan saya akan lebih baik lagi'],
      scores: [1, 2, 3, 4, 5]
    },
  ],



};

export function getAssessmentQuestions(assessmentId: string): Question[] {
  return assessmentQuestions[assessmentId] || [];
}

export function getAUMQuestions(): Question[] {
  return assessmentQuestions['aum'] || [];
}

export function getAUMQuestionsByCategory(categoryId: string): Question[] {
  return getAUMQuestions().filter((q) => q.categoryId === categoryId);
}

export function getSeverityLevel(score: number): { level: string; color: string; emoji: string } {
  if (score <= 13) {
    return { level: 'Ringan', color: 'bg-green-100 text-green-800', emoji: '🟢' };
  } else if (score <= 26) {
    return { level: 'Sedang', color: 'bg-yellow-100 text-yellow-800', emoji: '🟡' };
  } else {
    return { level: 'Berat', color: 'bg-red-100 text-red-800', emoji: '🔴' };
  }
}

export function getAUMQuestionsWithCustom(): Question[] {
  // Try to get custom questions from localStorage
  if (typeof window !== 'undefined') {
    const customQuestions = localStorage.getItem('customAUMQuestions');
    if (customQuestions) {
      try {
        return JSON.parse(customQuestions);
      } catch (error) {
        console.error('Error parsing custom questions from localStorage:', error);
      }
    }
  }
  // Fall back to default questions
  return getAUMQuestions();
}
