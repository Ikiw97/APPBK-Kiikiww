
export const ASSESSMENT_DESCRIPTIONS: Record<string, { title: string; items: { label: string; description: string }[] }> = {
  personality_career: { // RIASEC
    title: 'Penjelasan Tipe Kepribadian (RIASEC)',
    items: [
      {
        label: 'Realistic (R)',
        description: 'Menyukai kegiatan praktis, bekerja dengan alat, mesin, tumbuhan, atau hewan. Lebih suka bekerja di luar ruangan dan menggunakan keterampilan fisik.'
      },
      {
        label: 'Investigative (I)',
        description: 'Menyukai kegiatan berpikir, meneliti, menganalisis, dan memecahkan masalah. Gemar belajar dan memahami fenomena ilmiah atau matematika.'
      },
      {
        label: 'Artistic (A)',
        description: 'Menyukai kegiatan kreatif, imajinatif, dan ekspresif. Gemar seni, drama, musik, atau penulisan, serta menghindari rutinitas yang kaku.'
      },
      {
        label: 'Social (S)',
        description: 'Menyukai kegiatan membantu, mengajar, atau merawat orang lain. Senang berinteraksi, berdiskusi, dan bekerja dalam tim.'
      },
      {
        label: 'Enterprising (E)',
        description: 'Menyukai kegiatan memimpin, memengaruhi, atau membujuk orang lain. Tertarik pada bisnis, politik, atau kepemimpinan untuk mencapai tujuan.'
      },
      {
        label: 'Conventional (C)',
        description: 'Menyukai kegiatan yang teratur, rapi, dan mengikuti prosedur. Gemar bekerja dengan data, angka, atau administrasi kantor.'
      }
    ]
  },
  mbti: {
    title: 'Penjelasan Dimensi MBTI',
    items: [
      {
        label: 'Extraversion (E)',
        description: 'Mendapatkan energi dari interaksi dengan orang lain dan dunia luar. Cenderung ekspresif dan antusias.'
      },
      {
        label: 'Introversion (I)',
        description: 'Mendapatkan energi dari refleksi diri dan waktu sendiri. Cenderung tenang dan menjaga privasi.'
      },
      {
        label: 'Sensing (S)',
        description: 'Fokus pada fakta, detail konkret, dan realitas saat ini. Mengandalkan pengalaman nyata.'
      },
      {
        label: 'Intuition (N)',
        description: 'Fokus pada kemungkinan, pola, dan masa depan. Suka berimajinasi dan melihat gambaran besar.'
      },
      {
        label: 'Thinking (T)',
        description: 'Mengambil keputusan berdasarkan logika, analisis objektif, dan prinsip sebab-akibat.'
      },
      {
        label: 'Feeling (F)',
        description: 'Mengambil keputusan berdasarkan nilai-nilai pribadi, empati, dan dampaknya terhadap orang lain.'
      },
      {
        label: 'Judging (J)',
        description: 'Menyukai keteraturan, rencana, dan struktur. Lebih nyaman jika segala sesuatu sudah diputuskan.'
      },
      {
        label: 'Perceiving (P)',
        description: 'Menyukai fleksibilitas, spontanitas, dan pilihan terbuka. Beradaptasi dengan situasi yang muncul.'
      }
    ]
  },
  kecerdasan_majemuk: {
    title: 'Penjelasan Kecerdasan Majemuk',
    items: [
      { label: 'Verbal-Linguistik', description: 'Kemampuan menggunakan kata-kata secara efektif, baik lisan maupun tulisan. Unggul dalam membaca, menulis, dan berbicara.' },
      { label: 'Logis-Matematis', description: 'Kemampuan mengolah angka dan logika. Suka memecahkan masalah, bereksperimen, dan berpikir kritis.' },
      { label: 'Visual-Spasial', description: 'Kemampuan berpikir dalam gambar dan memvisualisasikan hasil. Suka menggambar, mendesain, dan membaca peta.' },
      { label: 'Kinestetik-Jasmani', description: 'Kemampuan menggunakan tubuh untuk mengekspresikan ide dan perasaan. Unggul dalam olahraga, menari, atau keterampilan tangan.' },
      { label: 'Musikal', description: 'Kemampuan menikmati, membedakan, dan mengekspresikan bentuk-bentuk musik. Peka terhadap nada, ritme, dan melodi.' },
      { label: 'Interpersonal', description: 'Kemampuan memahami dan berinteraksi dengan orang lain secara efektif. Peka terhadap perasaan dan motivasi orang lain.' },
      { label: 'Intrapersonal', description: 'Kemampuan memahami diri sendiri, termasuk keinginan, ketakutan, dan kemampuan diri. Suka merenung dan intropeksi.' },
      { label: 'Naturalis', description: 'Kemampuan mengenali dan mengkategorikan spesies flora dan fauna lingkungan sekitar. Suka alam dan kegiatan outdoor.' }
    ]
  },
  gaya_belajar: {
    title: 'Penjelasan Gaya Belajar',
    items: [
      { label: 'Visual', description: 'Belajar paling baik dengan melihat. Menyukai gambar, diagram, grafik, dan membaca buku.' },
      { label: 'Auditori', description: 'Belajar paling baik dengan mendengar. Menyukai diskusi, mendengarkan ceramah, dan membaca dengan suara keras.' },
      { label: 'Kinestetik', description: 'Belajar paling baik dengan melakukan. Menyukai praktik langsung, bergerak, dan menyentuh objek.' }
    ]
  },
  introvert_extrovert: {
    title: 'Tipe Kepribadian Sosial',
    items: [
      { label: 'Introvert', description: 'Cenderung lebih fokus pada pikiran dan perasaan internal. Membutuhkan waktu sendiri untuk memulihkan energi.' },
      { label: 'Extrovert', description: 'Cenderung lebih fokus pada lingkungan eksternal dan interaksi sosial. Mendapatkan energi saat bersama orang lain.' },
      { label: 'Ambivert', description: 'Memiliki keseimbangan antara ciri introvert dan extrovert. Dapat beradaptasi dengan situasi sosial maupun waktu sendiri.' }
    ]
  },
  big_five: {
    title: 'Lima Dimensi Kepribadian (Big Five)',
    items: [
      { label: 'Openness', description: 'Keterbukaan terhadap pengalaman baru, imajinasi, dan wawasan luas.' },
      { label: 'Conscientiousness', description: 'Tingkat kedisiplinan, keteraturan, dan tanggung jawab dalam mencapai tujuan.' },
      { label: 'Extraversion', description: 'Tingkat keramahan, ketegasan, dan energi dalam interaksi sosial.' },
      { label: 'Agreeableness', description: 'Tingkat kepedulian, kepercayaan, dan kerja sama dengan orang lain.' },
      { label: 'Neuroticism', description: 'Kecenderungan untuk mengalami emosi negatif seperti kecemasan atau kemurungan (kestabilan emosi).' }
    ]
  },
  grit: {
    title: 'Skala Ketekunan (GRIT)',
    items: [
      { label: 'Passion', description: 'Ketertarikan yang mendalam dan konsisten terhadap tujuan jangka panjang.' },
      { label: 'Perseverance', description: 'Kemampuan untuk bertahan dan terus berusaha meskipun menghadapi rintangan atau kegagalan.' }
    ]
  },
  emotional_intelligence: {
    title: 'Kecerdasan Emosional',
    items: [
      { label: 'Self-Awareness', description: 'Kemampuan mengenali dan memahami emosi diri sendiri serta dampaknya.' },
      { label: 'Self-Regulation', description: 'Kemampuan mengelola emosi dan perilaku impulsif.' },
      { label: 'Motivation', description: 'Dorongan untuk mencapai tujuan demi kepuasan pribadi, bukan sekadar imbalan eksternal.' },
      { label: 'Empathy', description: 'Kemampuan memahami emosi dan kebutuhan orang lain.' },
      { label: 'Social Skills', description: 'Kemampuan membangun hubungan dan mengelola interaksi sosial.' }
    ]
  },
  temperament: {
    title: 'Empat Tipe Temperamen',
    items: [
      { label: 'Sanguinis', description: 'Optimis, aktif, dan sosial. Cenderung periang namun bisa kurang terorganisir.' },
      { label: 'Koleris', description: 'Tegas, berorientasi tujuan, dan pemimpin alami. Bisa menjadi tidak sabaran atau dominan.' },
      { label: 'Melankolis', description: 'Analitis, detail, dan pemikir mendalam. Cenderung perfeksionis dan sensitif.' },
      { label: 'Plegmatis', description: 'Tenang, damai, dan santai. Bisa menjadi pasif atau menghindari konflik.' }
    ]
  },
  akpd: {
    title: 'Bidang Masalah AKPD',
    items: [
      { label: 'Pribadi', description: 'Masalah yang berkaitan dengan pemahaman diri, kepercayaan diri, kesehatan fisik/mental, dan nilai-nilai kehidupan.' },
      { label: 'Sosial', description: 'Masalah yang berkaitan dengan hubungan dengan orang lain, komunikasi, konflik teman sebaya, dan penyesuaian diri.' },
      { label: 'Belajar', description: 'Masalah yang berkaitan dengan kebiasaan belajar, motivasi, kesulitan memahami pelajaran, dan prestasi akademik.' },
      { label: 'Karir', description: 'Masalah yang berkaitan dengan perencanaan masa depan, pemilihan jurusan, dan pemahaman dunia kerja.' }
    ]
  },
  aum: {
    title: 'Bidang Masalah AUM',
    items: [
      { label: 'Jasmani & Kesehatan', description: 'Kesehatan fisik, kondisi tubuh, dan keluhan penyakit.' },
      { label: 'Diri Pribadi', description: 'Konsep diri, perasaan inferior/superior, dan masalah emosional.' },
      { label: 'Hubungan Sosial', description: 'Interaksi dengan orang lain, pergaulan, dan kemampuan sosial.' },
      { label: 'Ekonomi & Keuangan', description: 'Kondisi ekonomi keluarga, uang saku, dan kebutuhan materi.' },
      { label: 'Karir & Pekerjaan', description: 'Cita-cita, pemilihan karir, dan persiapan kerja.' },
      { label: 'Pendidikan & Pelajaran', description: 'Kesulitan belajar, hasil nilai, dan hubungan dengan guru.' },
      { label: 'Agama & Nilai', description: 'Praktik ibadah, keyakinan, dan moralitas.' },
      { label: 'Hubungan Keluarga', description: 'Hubungan dengan orang tua, saudara, dan situasi rumah.' },
      { label: 'Waktu Senggang', description: 'Pemanfaatan waktu luang dan hobi.' },
      { label: 'Keadaan Lingkungan', description: 'Situasi tempat tinggal dan lingkungan sekitar.' }
    ]
  }
};
