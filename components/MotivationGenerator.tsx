import React, { useState } from 'react';
import { ChevronLeft, Quote, Sparkles, Heart, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MotivationGeneratorProps {
    onBack: () => void;
}

const QUOTES = [
    "Masa depan adalah milik mereka yang percaya pada keindahan mimpi-mimpi mereka. - Eleanor Roosevelt",
    "Kegagalan hanyalah kesempatan untuk memulai lagi dengan lebih cerdas. - Henry Ford",
    "Jangan menunggu kesempatan, buatlah kesempatanmu sendiri.",
    "Rahasia untuk maju adalah memulai. - Mark Twain",
    "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang Anda lakukan. - Steve Jobs",
    "Percayalah Anda bisa, dan Anda sudah setengah jalan. - Theodore Roosevelt",
    "Kesuksesan bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci kesuksesan. - Albert Schweitzer",
    "Jangan biarkan hari kemarin menyita terlalu banyak hari ini. - Will Rogers",
    "Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia. - Nelson Mandela",
    "Jadilah perubahan yang ingin kamu lihat di dunia. - Mahatma Gandhi",
    "Hidup adalah apa yang terjadi saat kamu sibuk membuat rencana lain. - John Lennon",
    "Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang.",
    "Jangan pernah menyerah pada sesuatu yang tidak bisa kamu lewatkan sehari pun tanpa memikirkannya. - Winston Churchill",
    "Cobalah untuk tidak menjadi orang sukses, melainkan mencoba menjadi orang yang bernilai. - Albert Einstein",
    "Orang pesimis melihat kesulitan di setiap kesempatan. Orang optimis melihat kesempatan dalam setiap kesulitan. - Winston Churchill",
    "Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya. - Mahatma Gandhi",
    "Kelemahan terbesar kita terletak pada menyerah. Cara paling pasti untuk sukses adalah selalu mencoba sekali lagi. - Thomas Edison",
    "Sukses berjalan dari satu kegagalan ke kegagalan yang lain, tanpa kita kehilangan semangat. - Winston Churchill",
    "Jika kamu tidak merancang rencana hidupmu sendiri, kemungkinan besar kamu akan jatuh ke dalam rencana orang lain.",
    "Bukan seberapa sering kamu terjatuh, tapi seberapa sering kamu bangkit kembali.",
    "Mimpi tidak akan berhasil kecuali kamu melakukannya.",
    "Jangan takut gagal, takutlah tidak mencoba.",
    "Perjalanan seribu mil dimulai dengan satu langkah. - Lao Tzu",
    "Lakukan apa yang kamu bisa, dengan apa yang kamu miliki, di mana pun kamu berada.",
    "Sikap adalah hal kecil yang membuat perbedaan besar. - Winston Churchill",
    "Jika kamu ingin mengangkat dirimu sendiri, angkatlah orang lain.",
    "Pendidikan bukan persiapan untuk hidup; pendidikan adalah hidup itu sendiri.",
    "Akar pendidikan itu pahit, tapi buahnya manis. - Aristoteles",
    "Pikiran itu seperti parasut, hanya berfungsi jika terbuka.",
    "Kamu tidak pernah terlalu tua untuk menetapkan tujuan lain atau memimpikan impian baru. - C.S. Lewis",
    "Kebahagiaan bukan sesuatu yang sudah jadi. Itu berasal dari tindakanmu sendiri. - Dalai Lama",
    "Tetapkan tujuanmu tinggi-tinggi, dan jangan berhenti sampai kamu mencapainya.",
    "Jenius adalah 1% inspirasi dan 99% keringat. - Thomas Edison",
    "Apa yang kita pikirkan, itulah yang kita jadi. - Buddha",
    "Jangan biarkan rasa takut kalah lebih besar daripada kegembiraan menang.",
    "Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.",
    "Kesempatan biasanya menyamar sebagai kerja keras, sehingga kebanyakan orang tidak mengenalinya.",
    "Setiap ahli dulunya adalah seorang pemula.",
    "Disiplin adalah jembatan antara tujuan dan pencapaian.",
    "Tindakan adalah kunci dasar untuk semua kesuksesan. - Pablo Picasso",
    "Jangan menghitung hari, buatlah hari-hari itu berarti. - Muhammad Ali",
    "Semakin keras kamu bekerja untuk sesuatu, semakin besar perasaanmu saat mencapainya.",
    "Bermimpilah, berpikirlah, berimajinasilah. Itulah awal dari segala sesuatu.",
    "Kesuksesan adalah jumlah dari upaya kecil, yang diulangi hari demi hari.",
    "Tidak ada lift menuju kesuksesan. Kamu harus menaiki tangga.",
    "Fokuslah pada menjadi produktif bukan sekadar sibuk.",
    "Kamu lebih kuat dari yang kamu tahu. Lebih cakap dari yang pernah kamu impikan.",
    "Keberanian bukanlah ketidakhadiran rasa takut, tetapi kemampuan untuk bertindak di hadapan rasa takut.",
    "Mulai di mana kamu berada. Gunakan apa yang kamu punya. Lakukan apa yang kamu bisa.",
    "Jangan batasi tantanganmu, tantang batasanmu."
];

const REFLECTIONS = [
    "Apa hal kecil yang kamu syukuri hari ini?",
    "Apa tantangan terbesar yang kamu hadapi minggu ini dan bagaimana kamu mengatasinya?",
    "Siapa orang yang paling memotivasi kamu dan mengapa?",
    "Apa satu hal baru yang ingin kamu pelajari bulan ini?",
    "Bagaimana perasaanmu tentang usahamu hari ini? Apakah kamu sudah memberikan yang terbaik?",
    "Apa arti kesuksesan bagimu secara pribadi?",
    "Jika kamu bisa mengubah satu kebiasaan burukmu, apa itu?",
    "Apa yang membuatmu merasa paling bangga dengan dirimu sendiri?",
    "Kapan terakhir kali kamu membantu orang lain tanpa mengharapkan imbalan?",
    "Apa nasihat yang akan kamu berikan kepada dirimu di masa lalu?",
    "Apa ketakutan terbesarmu dan apa langkah kecil untuk mengatasinya?",
    "Sebutkan tiga hal positif tentang dirimu sendiri.",
    "Bagaimana kamu bisa meluangkan waktu untuk istirahat minggu ini?",
    "Siapa yang bisa kamu hubungi hari ini untuk sekadar menyapa?",
    "Apa hal tersulit yang pernah kamu lalui dan apa yang kamu pelajari darinya?",
    "Apa impian masa kecilmu yang masih kamu ingat?",
    "Jika uang bukan masalah, apa yang akan kamu lakukan dengan hidupmu?",
    "Apa satu kata yang menggambarkan dirimu saat ini?",
    "Apa yang membuatmu tersenyum hari ini?",
    "Kapan kamu merasa paling damai?",
    "Apa buku atau film yang paling memengaruhi hidupmu?",
    "Apa kebaikan yang pernah orang lain lakukan padamu yang tak terlupakan?",
    "Bagaimana kamu menangani stres atau tekanan?",
    "Apa yang ingin kamu capai dalam 5 tahun ke depan?",
    "Apakah ada seseorang yang perlu kamu maafkan? Termasuk dirimu sendiri?",
    "Apa nilai hidup yang paling kamu junjung tinggi?",
    "Bagaimana kamu mendefinisikan kebahagiaan?",
    "Apa yang kamu lakukan ketika merasa sedih?",
    "Apa bakat terpendam yang ingin kamu kembangkan?",
    "Apa hal paling berani yang pernah kamu lakukan?",
    "Apakah kamu lebih banyak mendengarkan atau berbicara?",
    "Hal apa yang membuatmu lupa waktu saat melakukannya?",
    "Apa kebiasaan pagi yang membuat harimu lebih baik?",
    "Apa yang membuatmu merasa benar-benar hidup?",
    "Bagaimana cara kamu menunjukkan kasih sayang kepada orang terdekat?",
    "Apa kesalahan yang pernah kamu buat yang justru membawamu pada kebaikan?",
    "Jika kamu memiliki satu kekuatan super, apa yang akan kamu pilih?",
    "Apa satu hal yang ingin kamu ubah di dunia ini?",
    "Kapan terakhir kali kamu mencoba sesuatu untuk pertama kalinya?",
    "Apa yang kamu syukuri dari tubuhmu?",
    "Apa pelajaran hidup terpenting yang diajarkan orang tuamu?",
    "Bagaimana kamu ingin diingat oleh orang lain?",
    "Apa hal yang paling sering kamu khawatirkan dan apakah itu beralasan?",
    "Apa yang kamu butuhkan lebih banyak dalam hidupmu saat ini?",
    "Apa yang harus kamu lepaskan agar bisa lebih bahagia?",
    "Siapa teman yang paling bisa kamu andalkan?",
    "Apa tempat favoritmu untuk menyendiri?",
    "Apa pujian terbaik yang pernah kamu terima?",
    "Apakah kamu hidup sesuai dengan nilaimu sendiri atau harapan orang lain?",
    "Apa satu langkah kecil yang bisa kamu ambil hari ini menuju impianmu?"
];

const AFFIRMATIONS = [
    "Saya berharga dan saya mampu mengatasi semua tantangan.",
    "Saya percaya pada kemampuan diri saya sendiri.",
    "Hari ini saya memilih untuk menjadi bahagia dan produktif.",
    "Saya layak mendapatkan kesuksesan dan kebahagiaan.",
    "Setiap kesalahan adalah pelajaran yang membuat saya lebih kuat.",
    "Saya melepaskan keraguan dan memilih kepercayaan diri.",
    "Saya dikelilingi oleh hal-hal positif dan peluang baik.",
    "Saya bangga dengan kemajuan yang saya buat, sekecil apapun itu.",
    "Saya memiliki kekuatan untuk menciptakan perubahan positif dalam hidup saya.",
    "Saya menerima dan mencintai diri saya apa adanya.",
    "Saya cukup, apa adanya.",
    "Saya menarik energi positif ke dalam hidup saya.",
    "Saya memegang kendali atas kebahagiaan saya sendiri.",
    "Saya berani menghadapi ketakutan saya.",
    "Saya terus bertumbuh dan belajar setiap hari.",
    "Saya memaafkan diri saya untuk kesalahan di masa lalu.",
    "Saya pantas mendapatkan cinta dan penghargaan.",
    "Saya tenang, damai, dan terkendali.",
    "Tubuh saya sehat, pikiran saya kuat, jiwa saya tenang.",
    "Saya adalah arsitek kehidupan saya sendiri.",
    "Saya memancarkan kepercayaan diri dan kebaikan.",
    "Saya bersyukur atas semua berkah dalam hidup saya.",
    "Saya memiliki potensi yang tak terbatas.",
    "Tantangan membantu saya berkembang.",
    "Saya bebas untuk menjadi diri saya sendiri.",
    "Saya memilih pikiran yang memberdayakan saya.",
    "Saya dikelilingi oleh orang-orang yang mendukung saya.",
    "Saya fokus pada solusi, bukan masalah.",
    "Saya menghargai pendapat dan perasaan saya sendiri.",
    "Saya kuat, tangguh, dan berani.",
    "Saya menciptakan kedamaian dalam pikiran saya.",
    "Saya berhak untuk mengatakan tidak tanpa rasa bersalah.",
    "Saya merayakan setiap kemenangan kecil.",
    "Saya terbuka terhadap peluang baru yang datang.",
    "Saya adalah teman yang baik bagi diri saya sendiri.",
    "Saya menyebarkan cinta dan kepositifan ke mana pun saya pergi.",
    "Saya mempercayai intuisi saya.",
    "Saya melepaskan apa yang tidak bisa saya kendalikan.",
    "Saya unik dan itu adalah kekuatan saya.",
    "Saya layak untuk bermimpi besar.",
    "Saya bertanggung jawab atas reaksi saya terhadap situasi.",
    "Saya memilih untuk melihat sisi baik dalam setiap situasi.",
    "Saya bangga dengan siapa saya hari ini.",
    "Saya sedang dalam perjalanan menjadi versi terbaik dari diri saya.",
    "Saya memiliki keberanian untuk mengikuti kata hati saya.",
    "Saya memberikan yang terbaik dan itu sudah cukup.",
    "Saya aman dan terlindungi.",
    "Saya magnet bagi kesuksesan dan kebaikan.",
    "Saya mengizinkan diri saya untuk istirahat dan pulih.",
    "Saya mencintai diri saya tanpa syarat."
];

export default function MotivationGenerator({ onBack }: MotivationGeneratorProps) {
    const [activeTab, setActiveTab] = useState<'quote' | 'reflection' | 'affirmation'>('quote');
    const [content, setContent] = useState<string>(QUOTES[0]);
    const [isCopied, setIsCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const generateNew = () => {
        setIsAnimating(true);
        setTimeout(() => {
            let list: string[] = [];
            if (activeTab === 'quote') list = QUOTES;
            else if (activeTab === 'reflection') list = REFLECTIONS;
            else list = AFFIRMATIONS;

            const randomItem = list[Math.floor(Math.random() * list.length)];
            setContent(randomItem);
            setIsAnimating(false);
            setIsCopied(false);
        }, 300);
    };

    const handleTabChange = (tab: 'quote' | 'reflection' | 'affirmation') => {
        setActiveTab(tab);
        let list: string[] = [];
        if (tab === 'quote') list = QUOTES;
        else if (tab === 'reflection') list = REFLECTIONS;
        else list = AFFIRMATIONS;

        // Pick a random one immediately on tab switch logic or keep existing
        setContent(list[Math.floor(Math.random() * list.length)]);
        setIsCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const theme = {
        quote: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-800',
            border: 'border-indigo-200',
            button: 'bg-indigo-600 hover:bg-indigo-700',
            icon: <Quote size={24} className="text-indigo-500" />
        },
        reflection: {
            bg: 'bg-rose-50',
            text: 'text-rose-800',
            border: 'border-rose-200',
            button: 'bg-rose-600 hover:bg-rose-700',
            icon: <Sparkles size={24} className="text-rose-500" />
        },
        affirmation: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-800',
            border: 'border-emerald-200',
            button: 'bg-emerald-600 hover:bg-emerald-700',
            icon: <Heart size={24} className="text-emerald-500" />
        }
    };

    const currentTheme = theme[activeTab];

    return (
        <div className={`px-6 md:px-8 py-8 min-h-screen ${currentTheme.bg} transition-colors duration-500`}>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
                >
                    <ChevronLeft size={20} />
                    Kembali
                </button>

                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">✨ Motivasi & Refleksi</h1>

                    {/* Tabs */}
                    <div className="flex p-1 bg-white/50 rounded-xl mb-8 backdrop-blur-sm border border-gray-200 shadow-sm">
                        <button
                            onClick={() => handleTabChange('quote')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'quote' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Kata Motivasi
                        </button>
                        <button
                            onClick={() => handleTabChange('reflection')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reflection' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Refleksi Diri
                        </button>
                        <button
                            onClick={() => handleTabChange('affirmation')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'affirmation' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Afirmasi Positif
                        </button>
                    </div>

                    {/* Card */}
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-white/50 relative overflow-hidden transition-all duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            {currentTheme.icon}
                        </div>

                        <div className={`flex flex-col items-center text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                            <div className="mb-6 p-4 rounded-full bg-gray-50 text-gray-400">
                                {currentTheme.icon}
                            </div>

                            <p className={`text-2xl md:text-3xl font-medium leading-relaxed mb-8 ${currentTheme.text} font-serif italic link-preserved`}>
                                "{content}"
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={generateNew}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 ${currentTheme.button}`}
                                >
                                    <RefreshCw size={20} className={isAnimating ? 'animate-spin' : ''} />
                                    Acak Baru
                                </button>

                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                    title="Salin Teks"
                                >
                                    {isCopied ? <CheckCircle2 size={20} className="text-green-600" /> : <Copy size={20} />}
                                    {isCopied ? 'Tersalin' : 'Salin'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-gray-500 text-sm max-w-md">
                        Gunakan tombol "Salin" untuk membagikan pesan ini ke siswa atau menyimpannya sebagai catatan refleksi harian.
                    </p>
                </div>
            </div>
        </div>
    );
}
