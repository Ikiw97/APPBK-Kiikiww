// Game Question Storage Helper with Supabase Integration
// Allows super admins and teachers to edit game questions via API

import { supabase } from './supabaseClient';

export interface KahootQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

export interface VocabularyWord {
  id: number;
  term: string;
  scenario: string;
  example: string;
  question: string;
  answer: string;
}

export interface PuzzlePiece {
  id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// Default Kahoot Questions - Enhanced dengan soal-soal yang lebih menantang
const DEFAULT_KAHOOT_QUESTIONS: KahootQuestion[] = [
  {
    id: 1,
    question: 'Ketika menghadapi tekanan dari teman untuk melakukan sesuatu yang tidak sesuai nilai Anda, sikap paling bijaksana adalah:',
    options: ['Mengikuti saja karena takut kehilangan teman', 'Langsung menolak tegas dan menjauh dari teman', 'Mendengarkan perspektif teman, tapi tetap berpegang pada nilai Anda', 'Menghindari situasi tersebut selamanya'],
    correctIndex: 2,
    timeLimit: 30
  },
  {
    id: 2,
    question: 'Apa perbedaan utama antara percaya diri (confidence) dan percaya diri berlebihan (overconfidence)?',
    options: ['Tidak ada bedanya, keduanya adalah hal positif', 'Percaya diri adalah keyakinan realistis, overconfidence mengabaikan kekurangan', 'Overconfidence lebih baik karena membuat motivasi tinggi', 'Percaya diri berlebihan adalah tanda kepemimpinan yang kuat'],
    correctIndex: 1,
    timeLimit: 45
  },
  {
    id: 3,
    question: 'Ketika teman curhat tentang masalah mereka, respons pertama yang paling efektif adalah:',
    options: ['Langsung memberikan solusi dan saran konkret', 'Mendengarkan dengan empati dan bertanya lebih dalam tentang perasaan mereka', 'Membagikan pengalaman serupa dari diri Anda', 'Mencoba menghibur mereka dengan lelucon'],
    correctIndex: 1,
    timeLimit: 30
  },
  {
    id: 4,
    question: 'Bullying online (cyberbullying) lebih berbahaya dari bullying langsung karena:',
    options: ['Tidak benar, bullying apapun sama berdampaknya', 'Rekam jejak digital dapat bertahan selamanya dan menjangkau lebih banyak orang', 'Cyberbullying tidak seserius bullying langsung', 'Perpetrator tidak bisa diidentifikasi'],
    correctIndex: 1,
    timeLimit: 45
  },
  {
    id: 5,
    question: 'Kesehatan mental adalah tanggung jawab bersama antara individu dan lingkungan. Peran individu sendiri adalah:',
    options: ['Hanya mematuhi saran profesional kesehatan', 'Mengenali emosi, mencari bantuan saat perlu, dan mengembangkan coping strategies', 'Menunggu orang lain menyadari ada masalah pada Anda', 'Hanya mengurus kesehatan fisik saja'],
    correctIndex: 1,
    timeLimit: 30
  },
  {
    id: 6,
    question: 'Ketika kamu gagal dalam ujian penting, respons yang menunjukkan resiliensi adalah:',
    options: ['Menyalahkan guru atau sistem pendidikan', 'Merasa putus asa dan menyerah pada usaha berikutnya', 'Menganalisis kesalahan, belajar dari pengalaman, dan membuat rencana perbaikan', 'Bersikap seperti tidak peduli untuk menyembunyikan rasa sakit'],
    correctIndex: 2,
    timeLimit: 45
  },
  {
    id: 7,
    question: 'Dalam membangun hubungan yang sehat, batasan (boundaries) personal berfungsi untuk:',
    options: ['Menjauh dari orang yang tidak sesuai karakter', 'Mengomunikasikan kebutuhan dan mencegah eksploitasi emosional', 'Menciptakan jarak emosional dari semua orang', 'Menunjukkan bahwa kita tidak peduli dengan orang lain'],
    correctIndex: 1,
    timeLimit: 45
  },
  {
    id: 8,
    question: 'Empati berbeda dari simpati. Empati adalah:',
    options: ['Merasa kasihan pada orang lain', 'Memahami dan merasakan perspektif orang lain seolah-olah perasaan Anda sendiri', 'Memberikan uang atau barang kepada yang membutuhkan', 'Setuju dengan semua pendapat orang lain'],
    correctIndex: 1,
    timeLimit: 30
  },
  {
    id: 9,
    question: 'Komunikasi assertif yang efektif dalam konflik melibatkan:',
    options: ['Mengungkapkan pendapat Anda saja tanpa mendengarkan orang lain', 'Mendengarkan tanpa mengungkapkan pendapat sendiri', 'Mengekspresikan kebutuhan dengan jelas sambil menghormati perspektif orang lain', 'Menghindari konflik dengan mengangguk setuju saja'],
    correctIndex: 2,
    timeLimit: 45
  },
  {
    id: 10,
    question: 'Ketika menghadapi situasi yang membuat Anda cemas, strategi paling efektif untuk mengelola kecemasan adalah:',
    options: ['Mengabaikan perasaan dan berpura-pura tidak ada masalah', 'Mencari distraksi untuk melupakan masalahnya', 'Mengidentifikasi pemicu cemas, mencari informasi, dan mengembangkan strategi mengatasi', 'Menunggu cemas hilang dengan sendirinya'],
    correctIndex: 2,
    timeLimit: 45
  },
  {
    id: 11,
    question: 'Ketergantungan pada media sosial sering terjadi karena:',
    options: ['Media sosial itu buruk dan harus dihindari total', 'Desain aplikasi yang mengaktifkan reward system otak, dikombinasikan dengan kebutuhan sosial yang belum terpenuhi', 'Pengguna tidak punya disiplin diri', 'Semua pengguna media sosial akan menjadi kecanduan'],
    correctIndex: 1,
    timeLimit: 45
  },
  {
    id: 12,
    question: 'Untuk mencapai tujuan jangka panjang yang kompleks, strategi paling efektif adalah:',
    options: ['Fokus pada hasil akhir dan bekerja keras tanpa henti', 'Membagi tujuan besar menjadi milestone kecil yang terukur dan merayakan setiap pencapaian', 'Menunggu menjelang deadline untuk mulai bekerja', 'Bergantung pada motivasi saja tanpa perencanaan'],
    correctIndex: 1,
    timeLimit: 45
  },
];

// Default Vocabulary Words - Enhanced dengan konsep-konsep psikologi yang lebih mendalam
const DEFAULT_VOCABULARY_WORDS: VocabularyWord[] = [
  {
    id: 1,
    term: 'Kepribadian Introvert vs Ekstrovert',
    scenario: 'Seorang siswa yang lebih nyaman bicara dengan satu atau dua orang teman dekat daripada berbicara di depan kelas, berbeda dengan teman yang energik dalam kelompok besar',
    example: 'Roni merasa gugup saat presentasi tapi nyaman diskusi kecil, sementara Budi lebih energik saat berbicara di depan banyak orang.',
    question: 'Jelaskan perbedaan introvert dan ekstrovert, serta bagaimana kedua tipe dapat berkembang dengan baik?',
    answer: 'Introvert: energi berkurang dari interaksi intensif, fokus pada refleksi internal. Ekstrovert: energi meningkat dari interaksi sosial, fokus eksternal. Keduanya bisa berkembang dengan menerima tipe mereka dan melatih fleksibilitas sosial.'
  },
  {
    id: 2,
    term: 'Manajemen Stres Holistik',
    scenario: 'Tidak hanya mengatasi stres saat terjadi, tapi membangun sistem preventif melalui lifestyle, relasi sosial, dan mindfulness',
    example: 'Mira tidak hanya olahraga saat stress, tapi juga menjaga tidur, punya support system yang kuat, dan praktek meditasi mingguan.',
    question: 'Apa perbedaan antara coping stres jangka pendek dan strategi manajemen stres jangka panjang?',
    answer: 'Coping jangka pendek: teknik relief segera (olahraga, meditasi). Jangka panjang: perubahan lifestyle sistemik (sleep hygiene, social support, boundary setting, stress inoculation training) untuk resiliensi berkelanjutan.'
  },
  {
    id: 3,
    term: 'Peer Pressure & Assertiveness',
    scenario: 'Memahami tekanan sosial dan mengembangkan kemampuan untuk mengatakan "tidak" dengan assertif tanpa merusak relasi',
    example: 'Ketika teman mengajak cheating, Aldi bisa menolak dengan cara yang ramah: "Aku mengerti tekanannya, tapi aku ingin coba sendiri dan belajar dari prosesnya"',
    question: 'Bagaimana cara mengatasi peer pressure dengan assertive communication tanpa merusak persahabatan?',
    answer: 'Gunakan assertiveness: mengekspresikan kebutuhan dengan jelas, menunjukkan empati ke teman, menawarkan alternatif, dan consistent dalam boundaries. Contoh: I-statement, empati, penjelasan nilai, dan compromise jika possible.'
  },
  {
    id: 4,
    term: 'Self-Esteem vs Self-Efficacy',
    scenario: 'Self-esteem adalah penilaian diri secara umum; self-efficacy adalah percaya pada kemampuan spesifik untuk melakukan tugas tertentu',
    example: 'Siti mungkin punya low self-esteem umum, tapi high self-efficacy dalam matematika karena sudah banyak berhasil',
    question: 'Jelaskan perbedaan self-esteem dan self-efficacy, dan mengapa keduanya penting untuk kesuksesan akademik?',
    answer: 'Self-esteem: penilaian nilai diri secara keseluruhan (general). Self-efficacy: keyakinan pada kemampuan spesifik task (specific). Self-efficacy memiliki dampak lebih langsung pada performa akademik; keduanya penting untuk motivation dan persistence.'
  },
  {
    id: 5,
    term: 'Empati Kognitif vs Emosional',
    scenario: 'Empati kognitif: memahami perspektif orang lain secara intelektual. Empati emosional: merasakan emosi mereka secara visceral',
    example: 'Arif bisa memahami (cognitive) why temannya stress ujian, dan juga merasakan (emotional) kecemasan yang sama',
    question: 'Apa perbedaan empati kognitif dan emosional, dan bagaimana keduanya bekerja bersama dalam supporting others?',
    answer: 'Kognitif empati: perspective-taking intelektual. Emosional empati: emotional resonance. Keduanya penting: cognitive tanpa emotional bisa terasa cold; emotional tanpa cognitive bisa menjadi overwhelmed.'
  },
  {
    id: 6,
    term: 'SMART Goal Setting',
    scenario: 'Menetapkan tujuan yang Specific, Measurable, Achievable, Relevant, Time-bound untuk memastikan efektivitas',
    example: 'Bukan hanya "ingin masuk SMA favorit" tapi "meningkatkan nilai matematika dari 6.5 ke 8.5 dalam 6 bulan melalui les mingguan dan belajar 1 jam setiap hari"',
    question: 'Jelaskan framework SMART goal setting dan bagaimana ini berbeda dari wishful thinking?',
    answer: 'SMART: Specific (clear target), Measurable (quantifiable), Achievable (realistic), Relevant (meaningful), Time-bound (deadline). Ini berbeda wishful thinking karena ada struktur konkret, progress tracking, dan accountability built-in.'
  },
  {
    id: 7,
    term: 'Adaptasi vs Konformitas',
    scenario: 'Adaptasi adalah fleksibel namun tetap authentic; konformitas adalah menyerah identitas demi penerimaan sosial',
    example: 'Lina beradaptasi dengan budaya sekolah baru sambil tetap mempertahankan nilai-nilai inti, bukan meniru sepenuhnya teman yang tidak sesuai nilai',
    question: 'Bagaimana membedakan adaptasi sosial yang sehat dari konformitas yang harmful?',
    answer: 'Adaptasi sehat: fleksibel perilaku sosial namun authentic dalam nilai. Konformitas harmful: menyerah nilai demi acceptance. Indikator: apakah Anda bisa "no" pada sesuatu yang tidak align dengan nilai tanpa guilt?'
  },
  {
    id: 8,
    term: 'Growth Mindset vs Fixed Mindset',
    scenario: 'Growth mindset percaya kemampuan bisa dikembangkan; fixed mindset percaya abilities adalah fixed trait',
    example: 'Doni dengan growth mindset gagal ujian tapi belajar strategi baru; fixed mindset akan berpikir "saya memang tidak bisa matematika"',
    question: 'Apa impact dari mindset terhadap learning, resilience, dan pencapaian akademik?',
    answer: 'Growth mindset: effort leads to mastery, setbacks adalah learning opportunity, higher persistence. Fixed mindset: effort confirms lack of ability, setbacks adalah threat, learned helplessness. Growth mindset correlates dengan higher achievement dan resilience.'
  },
  {
    id: 9,
    term: 'Resiliensi: Bounce Back vs Bounce Forward',
    scenario: 'Bounce back: kembali ke kondisi sebelum krisis. Bounce forward: menggunakan krisis sebagai catalyst untuk pertumbuhan',
    example: 'Vina tidak hanya recover dari kehilangan (bounce back), tapi mengubah pengalaman menjadi misi untuk help others (bounce forward)',
    question: 'Bagaimana bounce forward resiliensi berbeda dari recovery biasa, dan apa yang memungkinkan transformasi ini?',
    answer: 'Bounce back: return to baseline. Bounce forward: post-traumatic growth, meaning-making, dan transformasi positif. Dipungkinkan melalui: support system, sense of purpose, dan integration of experience sebagai bagian identitas.'
  },
  {
    id: 10,
    term: 'Emotional Intelligence (EI) Framework',
    scenario: 'EI terdiri dari 4 komponen: Self-awareness, Self-management, Social awareness, Relationship management',
    example: 'Rudi tidak hanya aware emosi dirinya (self-awareness) tapi juga bisa regulate emosi (self-management), read others emotions (social awareness), dan manage interactions dengan skilled (relationship mgmt)',
    question: 'Jelaskan 4 komponen emotional intelligence dan bagaimana meningkatkan setiap komponen?',
    answer: 'Self-awareness: recognize own emotions (journaling, therapy). Self-management: regulate emotions (breathing, mindfulness, reframing). Social awareness: understand others emotions (active listening, perspective-taking). Relationship management: influence and inspire (communication, conflict resolution, collaboration).'
  },
  {
    id: 11,
    term: 'Assertiveness & Boundary Setting',
    scenario: 'Kemampuan mengkomunikasikan kebutuhan dengan jelas, respect diri sendiri dan orang lain, dan menetapkan boundaries yang sehat',
    example: 'Bukan agresif "aku tidak mau!" atau pasif "oke walaupun aku tidak mau", tapi assertif "aku appreciate ajakanmu, tapi aku punya komitmen lain yang lebih prioritas untuk saya sekarang"',
    question: 'Apa bedanya assertiveness, aggressiveness, dan passiveness dalam komunikasi dan relasi?',
    answer: 'Aggressiveness: kebutuhan sendiri di atas orang lain, disrespectful. Passiveness: kebutuhan orang lain di atas sendiri, suppresses authenticity. Assertiveness: balance antara self-respect dan respect others, honest dan direct. Assertiveness paling healthy untuk relasi jangka panjang.'
  },
  {
    id: 12,
    term: 'Locus of Control & Personal Responsibility',
    scenario: 'Internal locus of control: percaya outcomes tergantung effort sendiri. External locus: percaya fate/others yang determine',
    example: 'Dengan internal locus, siswa percaya grades tergantung study effort mereka; external locus menyalahkan guru/keberuntungan',
    question: 'Bagaimana locus of control mempengaruhi motivation, mental health, dan achievement?',
    answer: 'Internal locus: higher motivation, better coping dengan stress, better academic/career outcomes, proactive problem-solving. External locus: learned helplessness, higher depression/anxiety, reactive, less control perception. Healthy: balance antara keduanya - acknowledge factors beyond control tapi fokus pada apa bisa dikontrol.'
  },
];

// Default Puzzle Questions - Enhanced dengan soal-soal yang lebih menantang
const DEFAULT_PUZZLE_QUESTIONS: PuzzlePiece[] = [
  {
    id: 1,
    question: 'Apa langkah pertama yang paling penting ketika menghadapi konflik dengan teman yang dekat?',
    answer: 'Mengendalikan emosi terlebih dahulu, kemudian mencari waktu yang tepat untuk berkomunikasi terbuka dan jujur tanpa menyalahkan',
    difficulty: 'easy',
    category: 'Komunikasi'
  },
  {
    id: 2,
    question: 'Jelaskan mengapa manajemen waktu lebih efektif daripada hanya melalui hard work untuk mengatasi tekanan akademik?',
    answer: 'Manajemen waktu menciptakan efisiensi dan keseimbangan, mengurangi kecemasan, memberikan waktu istirahat untuk recovery otak, dan memungkinkan prioritas yang jelas',
    difficulty: 'medium',
    category: 'Manajemen Stres'
  },
  {
    id: 3,
    question: 'Sebutkan 3 siklus psikologis yang dialami korban bullying jangka panjang dan bagaimana hal ini mempengaruhi kepribadian mereka?',
    answer: 'Siklus trauma-isolasi-ketidakpercayaan, meningkatkan anxiety dan depression, menurunkan self-worth, dan mempengaruhi kemampuan membentuk relasi sehat di masa depan',
    difficulty: 'hard',
    category: 'Kesejahteraan Sosial'
  },
  {
    id: 4,
    question: 'Mengapa persiapan matang lebih penting daripada kepribadian natural dalam membangun percaya diri presentasi?',
    answer: 'Persiapan mengurangi uncertainty dan anxiety, memberikan basis faktual untuk kepercayaan, dan memungkinkan fokus pada delivery bukan self-doubt',
    difficulty: 'medium',
    category: 'Kepercayaan Diri'
  },
  {
    id: 5,
    question: 'Bagaimana empati berbeda dari simpati, dan mengapa perbedaan ini penting dalam membangun relasi?',
    answer: 'Empati adalah memahami dan merasakan perspektif orang lain (emotional resonance), sedangkan simpati adalah merasa kasihan dari jarak (pity). Empati membangun koneksi otentik, simpati bisa terasa condescending',
    difficulty: 'hard',
    category: 'Empati'
  },
  {
    id: 6,
    question: 'Jelaskan hubungan antara fixed mindset dan ketakutan akan kegagalan, dan bagaimana growth mindset mengubahnya?',
    answer: 'Fixed mindset melihat kegagalan sebagai bukti ketidakmampuan permanen, memicu fear; Growth mindset melihat kegagalan sebagai data untuk pembelajaran, mengubah fear menjadi curiosity dan resilience',
    difficulty: 'hard',
    category: 'Mindset'
  },
  {
    id: 7,
    question: 'Apa yang membuat adaptasi sosial menjadi challenging bagi sebagian orang dan strategi efektif untuk mengatasinya?',
    answer: 'Ketakutan penolakan, self-doubt, dan comfort zone. Strategi: exposure therapy progresif, self-compassion, mencari individu dengan nilai yang sama, dan practice active listening',
    difficulty: 'medium',
    category: 'Adaptasi'
  },
  {
    id: 8,
    question: 'Sebutkan 5 pertanyaan reflektif yang dapat membantu mengidentifikasi tujuan hidup yang bermakna, bukan hanya sekadar aspirasi?',
    answer: 'Apa yang membuat saya merasa alive dan energi meningkat? Apa kontribusi unik yang ingin saya berikan? Apa yang akan saya sesali jika tidak dicapai? Siapa yang ingin saya berdampak? Bagaimana saya ingin dikenang?',
    difficulty: 'hard',
    category: 'Tujuan Hidup'
  },
  {
    id: 9,
    question: 'Mengapa cyberbullying lebih sulit ditangani dibanding bullying tradisional, dan apa tindakan yang tepat sebagai korban?',
    answer: 'Cyberbullying lebih persisten (digital footprint), jangkauan lebih luas, terjadi 24/7, sulit diidentifikasi pelaku. Tindakan: dokumentasi, jangan balas (tidak feed troll), laporkan ke platform & pihak berwenang, minta dukungan emosional',
    difficulty: 'hard',
    category: 'Keamanan Digital'
  },
  {
    id: 10,
    question: 'Bagaimana cara mengubah self-talk negatif menjadi positif tanpa menjadi delusional? Berikan contoh konkreat.',
    answer: 'Gunakan realistic optimism: ganti "Saya pasti gagal" dengan "Ini challenging tapi saya punya strategi dan bisa minta bantuan". Ganti "Saya bodoh" dengan "Saya belum mengerti ini - mari saya cari resources untuk belajar"',
    difficulty: 'hard',
    category: 'Pengembangan Diri'
  },
  {
    id: 11,
    question: 'Jelaskan mengapa memiliki hobi/passion penting untuk kesehatan mental dan produktivitas akademik dalam jangka panjang?',
    answer: 'Hobi memberikan: outlet emosional, sense of mastery, intrinsic motivation yang meningkatkan dopamine, break dari academic stress, identitas yang kuat, dan creative problem-solving skills yang transferable',
    difficulty: 'medium',
    category: 'Pengembangan Diri'
  },
  {
    id: 12,
    question: 'Bagaimana cara mengidentifikasi apakah Anda memiliki healthy independence atau avoidant attachment dalam relasi?',
    answer: 'Healthy independence: nyaman sendiri, tapi terbuka untuk vulnerability dan support. Avoidant: menghindari emotional intimacy, kesulitan berbagi kebutuhan. Cek: apakah Anda bisa ask for help? Express feelings? Maintain relationships dengan effort?',
    difficulty: 'hard',
    category: 'Pengembangan Diri'
  },
];

// Load Kahoot Questions from Supabase (with fallback to localStorage and defaults)
export async function getKahootQuestionsWithCustom(): Promise<KahootQuestion[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_type', 'kahoot')
      .order('game_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.game_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading Kahoot questions from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customKahootQuestions');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error loading Kahoot questions from localStorage:', error);
    }
  }

  // Final fallback to defaults
  return Array.isArray(DEFAULT_KAHOOT_QUESTIONS) ? DEFAULT_KAHOOT_QUESTIONS : [];
}

// Load Vocabulary Words from Supabase (with fallback to localStorage and defaults)
export async function getVocabularyWordsWithCustom(): Promise<VocabularyWord[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_type', 'vocabulary')
      .order('game_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.game_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading Vocabulary words from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customVocabularyWords');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error loading Vocabulary words from localStorage:', error);
    }
  }

  // Final fallback to defaults
  return Array.isArray(DEFAULT_VOCABULARY_WORDS) ? DEFAULT_VOCABULARY_WORDS : [];
}

// Load Puzzle Questions from Supabase (with fallback to localStorage and defaults)
export async function getPuzzleQuestionsWithCustom(): Promise<PuzzlePiece[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_type', 'puzzle')
      .order('game_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.game_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading Puzzle questions from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customPuzzleQuestions');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error loading Puzzle questions from localStorage:', error);
    }
  }

  // Final fallback to defaults
  return Array.isArray(DEFAULT_PUZZLE_QUESTIONS) ? DEFAULT_PUZZLE_QUESTIONS : [];
}

// Save game questions via API (Supabase)
export async function saveGameQuestions(
  gameType: 'kahoot' | 'vocabulary' | 'puzzle',
  questions: KahootQuestion[] | VocabularyWord[] | PuzzlePiece[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/game-questions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameType,
        questions,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save questions' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving questions:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Save individual game questions
export async function saveKahootQuestions(
  questions: KahootQuestion[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveGameQuestions('kahoot', questions, currentUserId);
}

export async function saveVocabularyWords(
  words: VocabularyWord[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveGameQuestions('vocabulary', words, currentUserId);
}

export async function savePuzzleQuestions(
  questions: PuzzlePiece[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveGameQuestions('puzzle', questions, currentUserId);
}

// Reset all game questions (delete from Supabase) - requires super admin
export async function resetAllGameQuestions(
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/game-questions/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentUserId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to reset questions' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error resetting questions:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Get default questions for a game type
export function getDefaultQuestions(gameType: 'kahoot' | 'vocabulary' | 'puzzle') {
  switch (gameType) {
    case 'kahoot':
      return DEFAULT_KAHOOT_QUESTIONS;
    case 'vocabulary':
      return DEFAULT_VOCABULARY_WORDS;
    case 'puzzle':
      return DEFAULT_PUZZLE_QUESTIONS;
    default:
      return [];
  }
}
