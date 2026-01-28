import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Download, Clock } from 'lucide-react';
import { TestQuestion, PSIKOTEST_ADVANCED_QUESTIONS } from '@/lib/testQuestions';

const CATEGORY_INFO: Record<string, { label: string; description: string }> = {
  'numerical': {
    label: '🔢 Penalaran Numerik',
    description: 'Kemampuan menyelesaikan masalah matematika dan angka'
  },
  'verbal': {
    label: '📝 Penalaran Verbal',
    description: 'Kemampuan memahami hubungan kata dan makna'
  },
  'pattern': {
    label: '🎯 Pengenalan Pola',
    description: 'Kemampuan mengenali urutan dan pola logis'
  },
  'logic': {
    label: '🧩 Penalaran Deduktif',
    description: 'Kemampuan berpikir logis dan membuat kesimpulan'
  }
};

interface PsikotestFormProps {
  onBack?: () => void;
  questions?: TestQuestion[];
}

// Define PsikotestResult interface (assuming it's defined elsewhere or needs to be added)
interface PsikotestResult {
  category: string;
  correct: number;
  total: number;
  percentage: number;
  description: string;
}

export default function PsikotestForm({ onBack, questions = PSIKOTEST_ADVANCED_QUESTIONS }: PsikotestFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions[0].timeLimit);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answerIndex
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(questions[currentQuestionIndex + 1].timeLimit);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex - 1].id] ?? null);
      setShowFeedback(false);
      setTimeLeft(questions[currentQuestionIndex - 1].timeLimit);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowResults(false);
    setTimeLeft(questions[0].timeLimit);
  };

  const calculateResults = (): PsikotestResult[] => {
    const results: PsikotestResult[] = [];

    Object.keys(CATEGORY_INFO).forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      let correctCount = 0;

      categoryQuestions.forEach(q => {
        if (answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      // Handle division by zero if category has no questions
      if (categoryQuestions.length > 0) {
        const percentage = (correctCount / categoryQuestions.length) * 100;

        results.push({
          category,
          correct: correctCount,
          total: categoryQuestions.length,
          percentage,
          description: CATEGORY_INFO[category].description
        });
      }
    });

    return results;
  };

  const getTotalScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return { correct, total: totalQuestions };
  };

  const getScoreLevel = (percentage: number): { label: string; color: string; icon: string } => {
    if (percentage >= 85) return { label: 'Sangat Baik', color: 'bg-green-100 border-green-300 text-green-900', icon: '⭐' };
    if (percentage >= 70) return { label: 'Baik', color: 'bg-blue-100 border-blue-300 text-blue-900', icon: '👍' };
    if (percentage >= 55) return { label: 'Cukup', color: 'bg-yellow-100 border-yellow-300 text-yellow-900', icon: '➡️' };
    return { label: 'Perlu Ditingkatkan', color: 'bg-red-100 border-red-300 text-red-900', icon: '⚠️' };
  };

  const handleExportResults = () => {
    const results = calculateResults();
    const { correct, total } = getTotalScore();
    let csvContent = 'Hasil Tes Logika Psikotes\n\n';
    csvContent += `Total Skor: ${correct}/${total} (${((correct / total) * 100).toFixed(1)}%)\n\n`;
    csvContent += 'Kategori,Benar,Total,Persentase\n';

    results.forEach(result => {
      csvContent += `${CATEGORY_INFO[result.category].label},${result.correct},${result.total},${result.percentage.toFixed(1)}%\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `Hasil-Test-Logika-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧠 Test Logika Psikotes</h1>
          <p className="text-gray-600">Tes kemampuan penalaran logis, numerik, dan verbal</p>
        </div>

        {!showResults ? (
          <div className="card p-8 shadow-xl">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Soal {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Category Badge */}
            <div className="mb-8">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {CATEGORY_INFO[currentQuestion.category].label}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showCorrectness = showFeedback && (isSelected || isCorrect);

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${showCorrectness && isCorrect
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : showCorrectness && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : isSelected && !showFeedback
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showCorrectness && isCorrect
                          ? 'border-green-500 bg-green-500'
                          : showCorrectness && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-500'
                            : isSelected && !showFeedback
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                          {showCorrectness && isCorrect && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          {showCorrectness && isSelected && !isCorrect && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          {isSelected && !showFeedback && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className="font-medium">{answer}</span>
                      </div>
                      {showCorrectness && isCorrect && <CheckCircle size={24} className="text-green-600 flex-shrink-0" />}
                      {showCorrectness && isSelected && !isCorrect && <XCircle size={24} className="text-red-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`p-4 rounded-lg mb-8 ${selectedAnswer === currentQuestion.correctIndex
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
                }`}>
                <div className="flex gap-3">
                  {selectedAnswer === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-bold text-green-900">✓ Benar!</p>
                        <p className="text-sm text-green-800 mt-1">{currentQuestion.explanation}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-bold text-red-900">✗ Salah</p>
                        <p className="text-sm text-red-800 mt-1">
                          <strong>Jawaban yang benar:</strong> {currentQuestion.answers[currentQuestion.correctIndex]}
                        </p>
                        <p className="text-sm text-red-800 mt-2">{currentQuestion.explanation}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                ← Sebelumnya
              </button>
              <button
                onClick={handleNext}
                disabled={!showFeedback}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${!showFeedback
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Berikutnya →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="card p-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Test Selesai!</h2>
                  <p className="text-green-100">Hasil test logika psikotes Anda telah dianalisis</p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="card p-8 bg-blue-50 border-2 border-blue-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Skor Keseluruhan</p>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {getTotalScore().correct}/{getTotalScore().total}
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-4">
                  {((getTotalScore().correct / getTotalScore().total) * 100).toFixed(1)}%
                </p>
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getScoreLevel(((getTotalScore().correct / getTotalScore().total) * 100)).color
                  }`}>
                  {getScoreLevel(((getTotalScore().correct / getTotalScore().total) * 100)).label} {getScoreLevel(((getTotalScore().correct / getTotalScore().total) * 100)).icon}
                </div>
              </div>
            </div>

            {/* Results by Category */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Hasil Per Kategori</h3>
              <div className="space-y-4">
                {calculateResults().map((result) => {
                  const level = getScoreLevel(result.percentage);
                  return (
                    <div key={result.category} className={`card p-6 border-2 ${level.color}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold mb-1">
                            {CATEGORY_INFO[result.category].label}
                          </h3>
                          <p className="text-sm opacity-80">
                            {result.description}
                          </p>
                        </div>
                        <span className="text-3xl">{level.icon}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm opacity-75">Benar</p>
                          <p className="text-2xl font-bold">{result.correct}/{result.total}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Persentase</p>
                          <p className="text-2xl font-bold">{result.percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Level</p>
                          <p className="text-lg font-bold">{level.label}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-3">
                        <div
                          className="bg-current h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">💡 Saran Pengembangan</h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>✓ Analisis soal-soal mana yang sering salah untuk fokus perbaikan</li>
                <li>✓ Latih secara rutin test logika dan pengenalan pola</li>
                <li>✓ Pahami konsep dasar matematika dan verbal reasoning</li>
                <li>✓ Ikuti latihan soal secara berkala untuk meningkatkan kecepatan dan akurasi</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Ulang Test
              </button>
              <button
                onClick={handleExportResults}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Unduh Hasil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
