import React, { useState, useEffect } from 'react';
import { RotateCcw, Home, CheckCircle, XCircle, Zap, User } from 'lucide-react';
import { formatTime } from '@/lib/kahootLeaderboard';
import { getKahootQuestionsWithCustom, type KahootQuestion } from '@/lib/gameQuestions';

// Questions are loaded from centralized storage (with localStorage override for admin edits)
const getKahootQuestions = async (): Promise<KahootQuestion[]> => {
  return getKahootQuestionsWithCustom();
};

interface GameState {
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  selectedAnswers: (number | null)[];
  timeLeft: number;
  totalGameTime: number;
}

interface AnswerOption {
  text: string;
  isCorrect: boolean;
  color: string;
  emoji: string;
}

const answerColors = [
  { color: 'bg-red-500 hover:bg-red-600', emoji: '🔴' },
  { color: 'bg-blue-500 hover:bg-blue-600', emoji: '🔵' },
  { color: 'bg-yellow-500 hover:bg-yellow-600', emoji: '🟡' },
  { color: 'bg-green-500 hover:bg-green-600', emoji: '🟢' }
];

interface KahootGameProps {
  onBack?: () => void;
  onScoreSubmitted?: () => void;
}

export default function KahootGame({ onBack, onScoreSubmitted }: KahootGameProps) {
  const [kahootQuestions, setKahootQuestions] = useState<KahootQuestion[]>([]);
  const [gameMode, setGameMode] = useState<'enter-name' | 'select' | 'play' | 'eliminated' | 'results'>('enter-name');
  const [studentName, setStudentName] = useState('');
  const [studentNameError, setStudentNameError] = useState('');

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    totalQuestions: 0,
    selectedAnswers: [],
    timeLeft: 0,
    totalGameTime: 0,
  });

  const [answered, setAnswered] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Load questions from centralized storage (with admin edits from localStorage)
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await getKahootQuestions();
        setKahootQuestions(questions);
        setGameState({
          currentQuestion: 0,
          score: 0,
          totalQuestions: questions.length,
          selectedAnswers: new Array(questions.length).fill(null),
          timeLeft: questions[0]?.timeLimit || 30,
          totalGameTime: 0,
        });
      } catch (error) {
        console.error('Error loading Kahoot questions:', error);
      }
    };
    loadQuestions();
  }, []);

  // Timer effect for question time
  useEffect(() => {
    if (gameMode !== 'play' || answered || gameState.timeLeft <= 0 || kahootQuestions.length === 0) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeLeft - 1;
        if (newTime <= 0) {
          setAnswered(true);
          setTimeout(() => {
            if (prev.currentQuestion < kahootQuestions.length - 1) {
              setGameState(state => ({
                ...state,
                currentQuestion: state.currentQuestion + 1,
                timeLeft: kahootQuestions[state.currentQuestion + 1].timeLimit
              }));
            } else {
              setGameMode('results');
            }
            setAnswered(false);
          }, 1000);
          return prev;
        }
        return {
          ...prev,
          timeLeft: newTime
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, answered, gameState.timeLeft, kahootQuestions]);

  // Track total game time
  useEffect(() => {
    if (gameMode !== 'play') return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        totalGameTime: prev.totalGameTime + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode]);

  const handleEnterName = () => {
    if (!studentName.trim()) {
      setStudentNameError('Nama siswa harus diisi');
      return;
    }
    if (studentName.trim().length < 2) {
      setStudentNameError('Nama minimal harus 2 karakter');
      return;
    }
    setStudentNameError('');
    setGameMode('select');
  };


  const saveIntermediateScore = async (studentNameParam: string, scoreParam: number, totalTimeParam: number, answersParam: (number | null)[]) => {
    try {
      console.log('💾 [Intermediate] Saving intermediate score...', {
        studentName: studentNameParam,
        score: scoreParam,
        totalTime: totalTimeParam,
      });

      const response = await fetch('/api/kahoot/save-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: studentNameParam,
          score: scoreParam,
          totalQuestions: kahootQuestions.length,
          totalTime: totalTimeParam,
          answers: answersParam,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Intermediate] Error saving:', errorData);
      } else {
        const data = await response.json();
        console.log('✅ [Intermediate] Intermediate score saved:', data.data);
      }
    } catch (error) {
      console.error('❌ [Intermediate] Exception:', error);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (answered) return;

    const newAnswers = [...gameState.selectedAnswers];
    newAnswers[gameState.currentQuestion] = optionIndex;

    const isCorrect = optionIndex === kahootQuestions[gameState.currentQuestion].correctIndex;

    if (isCorrect) {
      // Correct answer - update score
      const newScore = gameState.score + 1;

      setGameState(prev => ({
        ...prev,
        selectedAnswers: newAnswers,
        score: newScore,
      }));

      // Save intermediate score immediately
      saveIntermediateScore(studentName, newScore, gameState.totalGameTime, newAnswers);

      setAnswered(true);

      setTimeout(() => {
        if (gameState.currentQuestion < kahootQuestions.length - 1) {
          setGameState(prev => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1,
            timeLeft: kahootQuestions[prev.currentQuestion + 1].timeLimit
          }));
        } else {
          setGameMode('results');
        }
        setAnswered(false);
      }, 1500);
    } else {
      // Wrong answer - eliminate student
      setGameState(prev => ({
        ...prev,
        selectedAnswers: newAnswers,
      }));

      setAnswered(true);

      setTimeout(() => {
        // Student is eliminated after wrong answer
        setGameMode('eliminated');
      }, 1500);
    }
  };

  const handleStartGame = () => {
    setGameStartTime(Date.now());
    setGameMode('play');
    setGameState(prev => ({ ...prev, totalGameTime: 0 }));
  };

  const handleSaveAndFinish = async () => {
    // Save score to Supabase via API
    console.log('💾 handleSaveAndFinish called');
    console.log('💾 Saving score with studentName:', studentName);

    try {
      const response = await fetch('/api/kahoot/save-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          score: gameState.score,
          totalQuestions: gameState.totalQuestions,
          totalTime: gameState.totalGameTime,
          answers: gameState.selectedAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan skor');
      }

      const data = await response.json();
      console.log('💾 Score saved successfully:', data.data);

      // Trigger a small delay to ensure backend is updated before callback
      setTimeout(() => {
        if (onScoreSubmitted) {
          console.log('💾 Calling onScoreSubmitted callback');
          onScoreSubmitted();
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error saving score:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan skor. Silahkan coba lagi.';
      alert(errorMessage);
    }
  };

  const resetGame = () => {
    if (kahootQuestions.length === 0) return;
    setGameState({
      currentQuestion: 0,
      score: 0,
      totalQuestions: kahootQuestions.length,
      selectedAnswers: new Array(kahootQuestions.length).fill(null),
      timeLeft: kahootQuestions[0].timeLimit,
      totalGameTime: 0,
    });
    setGameMode('select');
    setAnswered(false);
    setGameStartTime(null);
  };

  const backToNameEntry = () => {
    setStudentName('');
    setStudentNameError('');
    if (kahootQuestions.length === 0) return;
    setGameState({
      currentQuestion: 0,
      score: 0,
      totalQuestions: kahootQuestions.length,
      selectedAnswers: new Array(kahootQuestions.length).fill(null),
      timeLeft: kahootQuestions[0].timeLimit,
      totalGameTime: 0,
    });
    setGameMode('enter-name');
    setAnswered(false);
    setGameStartTime(null);
  };

  // Enter Name Mode
  if (gameMode === 'enter-name') {
    return (
      <div className="px-6 md:px-8 py-8 min-h-full flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card p-12 text-center bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-7xl mb-6">🎮</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kahoot Game</h1>
            <p className="text-gray-600 mb-8">Quiz cepat dan seru tentang BK</p>

            <div className="mb-6">
              <label className="block text-left mb-3">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} />
                  Nama Siswa
                </span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setStudentNameError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleEnterName()}
                placeholder="Masukkan nama Anda"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${studentNameError
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-indigo-600'
                  }`}
                autoFocus
              />
              {studentNameError && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <XCircle size={16} />
                  {studentNameError}
                </p>
              )}
            </div>

            <button
              onClick={handleEnterName}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-colors text-lg"
            >
              Mulai Bermain! 🚀
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

  // Select Mode
  if (gameMode === 'select') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎮 Kahoot Game</h1>
            <p className="text-gray-600">Halo, <span className="font-semibold">{studentName}</span>! 👋</p>
          </div>
          <button
            onClick={backToNameEntry}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User size={20} />
            Ganti Nama
          </button>
        </div>

        <div className="card p-12 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="text-center">
            <Zap className="mx-auto text-yellow-500 mb-6" size={64} />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Siap Bermain?</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Jawab {kahootQuestions.length} pertanyaan dengan cepat dan akurat. Setiap pertanyaan diberi waktu 30 detik!
            </p>
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Mulai Bermain! 🚀
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">Cepat</h3>
            <p className="text-sm text-gray-600">30 detik per soal</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Akurat</h3>
            <p className="text-sm text-gray-600">Pilih jawaban yang benar</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-gray-900 mb-2">Peringkat</h3>
            <p className="text-sm text-gray-600">Lihat ranking siswa</p>
          </div>
        </div>
      </div>
    );
  }

  // Play Mode
  if (gameMode === 'play') {
    const currentQuestion = kahootQuestions[gameState.currentQuestion];
    const selectedAnswer = gameState.selectedAnswers[gameState.currentQuestion];
    const timeColor = gameState.timeLeft <= 10 ? 'text-red-600' : 'text-indigo-600';

    return (
      <div className="px-6 md:px-8 py-8 min-h-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-slate-800">
              <h1 className="text-3xl font-bold mb-2">🎮 Kahoot Game</h1>
              <div className="flex gap-4 text-sm text-slate-500 font-medium">
                <span>Soal: {gameState.currentQuestion + 1}/{kahootQuestions.length}</span>
                <span>Skor: {gameState.score}</span>
                <span>Nama: {studentName}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${timeColor}`}>
              {gameState.timeLeft}
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${gameState.timeLeft <= 10
                  ? 'bg-red-400'
                  : 'bg-yellow-400'
                  }`}
                style={{ width: `${(gameState.timeLeft / currentQuestion.timeLimit) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-4">PERTANYAAN {gameState.currentQuestion + 1}</p>
            <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.question}</h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showResult = answered;
              const answerColor = answerColors[index];

              let bgClass = `${answerColor.color}`;
              if (showResult) {
                if (isCorrect) {
                  bgClass = 'bg-green-500';
                } else if (isSelected && !isCorrect) {
                  bgClass = 'bg-red-500';
                } else {
                  bgClass = 'bg-gray-400 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={answered}
                  className={`p-8 rounded-lg text-white text-left transition-all duration-200 transform hover:scale-105 ${isSelected && !answered ? 'ring-4 ring-white scale-105' : ''
                    } ${bgClass} disabled:hover:scale-100`}
                >
                  <div className="text-4xl mb-4">{answerColor.emoji}</div>
                  <p className="text-xl font-bold">{option}</p>
                  {showResult && isCorrect && (
                    <div className="mt-4">
                      <CheckCircle size={32} />
                    </div>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <div className="mt-4">
                      <XCircle size={32} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className="text-center text-slate-800 text-lg font-bold mb-4">
              {selectedAnswer === currentQuestion.correctIndex ? '✅ Benar!' : '❌ Salah!'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Eliminated Mode
  if (gameMode === 'eliminated') {
    const eliminatedAtQuestion = gameState.currentQuestion + 1;
    const questionsAnswered = gameState.currentQuestion;

    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="card p-12 text-center bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="text-7xl mb-4">💥</div>
          <h1 className="text-4xl font-bold text-red-600 mb-2">Tereliminasi!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Jawaban Anda salah pada soal nomor <span className="font-bold text-red-600">{eliminatedAtQuestion}</span>
          </p>

          <div className="mb-8 p-6 bg-white rounded-lg">
            <p className="text-gray-600 mb-2">Statistik Permainan Anda:</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-3xl font-bold text-indigo-600">{gameState.score}</p>
                <p className="text-sm text-gray-600">Jawaban Benar</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{questionsAnswered - gameState.score}</p>
                <p className="text-sm text-gray-600">Jawaban Salah</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{questionsAnswered}</p>
                <p className="text-sm text-gray-600">Soal Dijawab</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{formatTime(gameState.totalGameTime)}</p>
                <p className="text-sm text-gray-600">Durasi Bermain</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Jangan kecil hati! Setiap salah adalah kesempatan untuk belajar. Coba lagi!
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium"
            >
              <RotateCcw size={20} />
              Coba Lagi
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

  // Results Mode
  if (gameMode === 'results') {
    const percentage = Math.round((gameState.score / kahootQuestions.length) * 100);
    let message = '';
    let emoji = '';

    if (percentage === 100) {
      message = 'Sempurna! Anda adalah BK Master!';
      emoji = '👑';
    } else if (percentage >= 80) {
      message = 'Luar biasa! Anda sangat hebat!';
      emoji = '⭐';
    } else if (percentage >= 60) {
      message = 'Bagus! Terus belajar!';
      emoji = '🎉';
    } else {
      message = 'Jangan menyerah! Coba lagi!';
      emoji = '💪';
    }

    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="card p-12 text-center bg-white rounded-2xl shadow-xl border border-indigo-100">
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kahoot Selesai!</h1>
          <p className="text-sm text-gray-600 mb-4">
            Selamat, <span className="font-semibold">{studentName}</span>! 🎊
          </p>

          <div className="mb-8">
            <div className="text-5xl font-bold mb-2 text-indigo-600">
              {gameState.score}/{kahootQuestions.length}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{percentage}%</div>
            <p className="text-xl text-gray-600 mb-6">{message}</p>
            <p className="text-lg text-gray-700 font-semibold">
              ⏱️ Waktu Tempuh: {formatTime(gameState.totalGameTime)}
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Detail Jawaban</h3>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {kahootQuestions.map((question, index) => {
                const isCorrect = gameState.selectedAnswers[index] === question.correctIndex;
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg text-left flex items-center justify-between border ${isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                      }`}
                  >
                    <span className="font-medium text-gray-900 flex-1">{question.question}</span>
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

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleSaveAndFinish}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium"
            >
              <CheckCircle size={20} />
              Simpan & Selesai
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
