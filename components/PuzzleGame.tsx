import React, { useState, useEffect } from 'react';
import { RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { getPuzzleQuestionsWithCustom, type PuzzlePiece } from '@/lib/gameQuestions';

// Puzzle questions are loaded from centralized storage (with localStorage override for admin edits)

interface GameState {
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  selectedAnswers: (boolean | null)[];
  showResults: boolean;
}

interface ShuffledOption {
  text: string;
  isCorrect: boolean;
}

export default function PuzzleGame({ onBack }: { onBack?: () => void }) {
  const [puzzleQuestions, setPuzzleQuestions] = useState<PuzzlePiece[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    totalQuestions: 0,
    selectedAnswers: [],
    showResults: false,
  });

  const [gameMode, setGameMode] = useState<'select' | 'play' | 'results' | 'tts'>('select');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[][]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<PuzzlePiece[]>([]);

  // Load puzzle questions from centralized storage
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await getPuzzleQuestionsWithCustom();
        setPuzzleQuestions(questions);
        setGameState(prev => ({
          ...prev,
          totalQuestions: questions.length,
          selectedAnswers: new Array(questions.length).fill(null),
        }));
      } catch (error) {
        console.error('Error loading Puzzle questions:', error);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (gameMode === 'play' && puzzleQuestions.length > 0) {
      const filtered = difficulty === 'all'
        ? puzzleQuestions
        : puzzleQuestions.filter(q => q.difficulty === difficulty);
      setFilteredQuestions(filtered);
      generateShuffledOptions(filtered);
    }
  }, [gameMode, difficulty, puzzleQuestions]);

  const generateShuffledOptions = (questions: PuzzlePiece[]) => {
    const options = questions.map(question => {
      const correctOption: ShuffledOption = {
        text: question.answer,
        isCorrect: true
      };

      // Generate fake answers
      const fakeAnswers: ShuffledOption[] = generateFakeAnswers(question.answer, 2).map(text => ({
        text,
        isCorrect: false
      }));

      const allOptions = [correctOption, ...fakeAnswers].sort(() => Math.random() - 0.5);
      return allOptions;
    });
    setShuffledOptions(options);
  };

  const generateFakeAnswers = (correct: string, count: number): string[] => {
    const fakes = [
      'Mengabaikan masalah dan berharap akan hilang',
      'Menyalahkan orang lain atas kesalahan',
      'Mencari bantuan dari internet tanpa refleksi',
      'Menolak untuk berbicara tentang hal tersebut',
      'Menunggu orang lain untuk menyelesaikannya',
      'Menggunakan cara-cara negatif atau berbahaya',
      'Hanya fokus pada konsekuensi negatif',
      'Tidak melakukan apa-apa dan terus stress',
    ];

    return fakes.slice(0, count);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...gameState.selectedAnswers];
    const isCorrect = shuffledOptions[gameState.currentQuestion][optionIndex].isCorrect;
    newAnswers[gameState.currentQuestion] = isCorrect;

    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        selectedAnswers: newAnswers,
        score: prev.score + 1,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        selectedAnswers: newAnswers,
      }));
    }

    setTimeout(() => {
      if (gameState.currentQuestion < filteredQuestions.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
        }));
      } else {
        setGameMode('results');
      }
    }, 800);
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      totalQuestions: puzzleQuestions.length,
      selectedAnswers: new Array(puzzleQuestions.length).fill(null),
      showResults: false,
    });
    setGameMode('select');
    setDifficulty('all');
  };

  // Select Mode - Choose Difficulty
  if (gameMode === 'select') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🧩 Puzzle Game</h1>
            <p className="text-gray-600">Pecahkan teka-teki dan uji pemahaman Anda tentang konsep BK</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={20} />
              Kembali
            </button>
          )}
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            {/* TTS Card */}
            <div
              onClick={() => {
                setGameMode('tts');
              }}
              className="card p-8 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200"
            >
              <div className="flex items-center gap-6">
                <div className="text-5xl">✍️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Teka Teki Silang (TTS)</h2>
                  <p className="text-gray-600 text-sm">
                    Asah otak dengan mengisi teka teki silang seputar Bimbingan Konseling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TTS Mode
  if (gameMode === 'tts') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">✍️ Teka Teki Silang</h1>
            <p className="text-gray-600">Lengkapi kotak-kotak kosong dengan jawaban yang benar</p>
          </div>
          <button
            onClick={() => setGameMode('select')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home size={20} />
            Kembali
          </button>
        </div>

        <div className="card p-4 bg-white shadow-lg rounded-xl overflow-hidden">
          <iframe
            style={{ maxWidth: '100%', width: '100%', height: '600px', border: 'none' }}
            src="https://wordwall.net/id/embed/a36d8f288d5d412d8093069e5f993480?themeId=60&templateId=11&fontStackId=12"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }

  // Play Mode
  if (gameMode === 'play' && shuffledOptions.length > 0 && filteredQuestions.length > 0) {
    const currentPuzzle = filteredQuestions[gameState.currentQuestion];
    const options = shuffledOptions[gameState.currentQuestion];
    const selectedAnswer = gameState.selectedAnswers[gameState.currentQuestion];

    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🧩 Puzzle Game</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Soal: {gameState.currentQuestion + 1}/{filteredQuestions.length}</span>
              <span>Skor: {gameState.score}/{filteredQuestions.length}</span>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round((gameState.currentQuestion / filteredQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8 mb-6">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-4">
              {currentPuzzle.category}
            </div>
            <h2 className="text-2xl font-bold text-purple-600 mb-4">{currentPuzzle.question}</h2>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 font-medium mb-4">Pilih jawaban yang paling tepat:</p>
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === (index === options.findIndex(o => o.isCorrect));
                const isCorrect = option.isCorrect;
                const showResult = selectedAnswer !== null;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${isSelected
                      ? isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                      : showResult && isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm leading-relaxed text-gray-900">{option.text}</p>
                      </div>
                      {showResult && (
                        isCorrect ? (
                          <CheckCircle className="text-green-600 flex-shrink-0 ml-4" size={20} />
                        ) : isSelected ? (
                          <XCircle className="text-red-600 flex-shrink-0 ml-4" size={20} />
                        ) : null
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedAnswer !== null && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {selectedAnswer === true ? '✅ Jawaban Benar!' : '❌ Jawaban Salah'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Results Mode
  if (gameMode === 'results') {
    const percentage = Math.round((gameState.score / filteredQuestions.length) * 100);
    let message = '';
    let emoji = '';

    if (percentage === 100) {
      message = 'Sempurna! Anda adalah master puzzle!';
      emoji = '👑';
    } else if (percentage >= 80) {
      message = 'Luar biasa! Pemahaman Anda sangat baik!';
      emoji = '⭐';
    } else if (percentage >= 60) {
      message = 'Bagus! Terus tingkatkan pemahaman Anda!';
      emoji = '🎉';
    } else {
      message = 'Terus belajar dan coba lagi!';
      emoji = '💪';
    }

    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="card p-12 text-center">
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Puzzle Selesai!</h1>
          <p className="text-sm text-gray-600 mb-6">
            Lihat hasil performa puzzle Anda
          </p>

          <div className="mb-8">
            <div className="text-5xl font-bold mb-2 text-purple-600">
              {gameState.score}/{filteredQuestions.length}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-4">{percentage}%</div>
            <p className="text-xl text-gray-600 mb-4">{message}</p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Detail Jawaban</h3>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {filteredQuestions.map((puzzle, index) => {
                const isCorrect = gameState.selectedAnswers[index] === true;
                return (
                  <div
                    key={puzzle.id}
                    className={`p-3 rounded-lg text-left flex items-center justify-between border ${isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                      }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{puzzle.question}</p>
                      <p className="text-xs text-gray-600 mt-1">{puzzle.category}</p>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 ml-4" size={20} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 ml-4" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <RotateCcw size={20} />
              Mainkan Lagi
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                <Home size={20} />
                Kembali
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
