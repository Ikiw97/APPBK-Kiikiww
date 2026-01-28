import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { getVocabularyWordsWithCustom, type VocabularyWord } from '@/lib/gameQuestions';

// Vocabulary words are loaded from centralized storage (with localStorage override for admin edits)

interface GameState {
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  selectedAnswers: (number | null)[];
  showResults: boolean;
}

export default function VocabularyGame({ onBack }: { onBack?: () => void }) {
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    totalQuestions: 0,
    selectedAnswers: [],
    showResults: false,
  });

  const [gameMode, setGameMode] = useState<'select' | 'play' | 'sprint' | 'results'>('select');
  const [gameType, setGameType] = useState<'match' | 'sprint'>('match');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [shuffledOptions, setShuffledOptions] = useState<VocabularyWord[][]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load vocabulary words from centralized storage
  useEffect(() => {
    const loadWords = async () => {
      try {
        const words = await getVocabularyWordsWithCustom();
        setVocabularyWords(words);
        setGameState(prev => ({
          ...prev,
          totalQuestions: words.length,
          selectedAnswers: new Array(words.length).fill(null),
        }));
      } catch (error) {
        console.error('Error loading vocabulary words:', error);
      }
    };
    loadWords();
  }, []);

  useEffect(() => {
    if (gameMode === 'play' || gameMode === 'sprint') {
      generateShuffledOptions();
      if (gameMode === 'sprint') {
        setTimeLeft(120); // 2 minutes for sprint mode
      }
    }
  }, [gameMode, difficulty]);

  // Timer effect for sprint mode
  useEffect(() => {
    if (gameMode !== 'sprint' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameMode('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, timeLeft]);

  const generateShuffledOptions = () => {
    const options = vocabularyWords.map(word => {
      const otherWords = vocabularyWords.filter(w => w.id !== word.id);
      const randomOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [word, ...randomOthers].sort(() => Math.random() - 0.5);
      return allOptions;
    });
    setShuffledOptions(options);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...gameState.selectedAnswers];
    newAnswers[gameState.currentQuestion] = optionIndex;

    const isCorrect = optionIndex === 0;
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

    // In sprint mode, auto-advance faster
    const delay = gameMode === 'sprint' ? 300 : 800;

    setTimeout(() => {
      if (gameState.currentQuestion < vocabularyWords.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
        }));
      } else {
        setGameMode('results');
      }
    }, delay);
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      totalQuestions: vocabularyWords.length,
      selectedAnswers: new Array(vocabularyWords.length).fill(null),
      showResults: false,
    });
    setGameMode('select');
    setGameType('match');
    setTimeLeft(0);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Select Mode
  if (gameMode === 'select') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Game BK Asah Cerita</h1>
            <p className="text-gray-600">Pelajari konsep BK melalui situasi nyata dalam kehidupan sehari-hari</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => {
              setGameMode('play');
              setDifficulty('all');
            }}
            className="card p-8 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
          >
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Match Definitions</h2>
            <p className="text-gray-600 text-sm mb-4">
              Cocokkan istilah BK dengan situasi nyata yang sesuai
            </p>
            <p className="text-xs text-gray-500">
              Total soal: {vocabularyWords.length}
            </p>
          </div>

          <div
            onClick={() => {
              setGameMode('sprint');
              setGameType('sprint');
              setDifficulty('all');
            }}
            className="card p-8 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200"
          >
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Word Sprint</h2>
            <p className="text-gray-600 text-sm mb-4">
              Atasi tantangan waktu untuk menjawab dengan cepat dan akurat
            </p>
            <p className="text-xs text-orange-600 font-semibold">
              2 menit challenge
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Play Mode
  if (gameMode === 'play' && shuffledOptions.length > 0) {
    const currentWord = vocabularyWords[gameState.currentQuestion];
    const options = shuffledOptions[gameState.currentQuestion];
    const selectedAnswer = gameState.selectedAnswers[gameState.currentQuestion];

    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Definitions</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Soal: {gameState.currentQuestion + 1}/{gameState.totalQuestions}</span>
              <span>Skor: {gameState.score}/{gameState.totalQuestions}</span>
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
            <span className="text-sm text-gray-600">{Math.round((gameState.currentQuestion / gameState.totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">{currentWord.term}</h2>
            <p className="text-gray-600 italic mb-4">{currentWord.example}</p>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 font-medium mb-4">Pilih situasi yang tepat:</p>
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = currentWord.id === option.id;
                const showResult = selectedAnswer !== null;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                        : showResult && isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                    } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm leading-relaxed text-gray-900">{option.scenario}</p>
                      </div>
                      {showResult && (
                        isCorrect ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : isSelected ? (
                          <XCircle className="text-red-600" size={20} />
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
              {selectedAnswer === 0 ? '✅ Jawaban Benar!' : '❌ Jawaban Salah'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Sprint Mode
  if (gameMode === 'sprint' && shuffledOptions.length > 0) {
    const currentWord = vocabularyWords[gameState.currentQuestion];
    const options = shuffledOptions[gameState.currentQuestion];
    const selectedAnswer = gameState.selectedAnswers[gameState.currentQuestion];

    return (
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Word Sprint</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Soal: {gameState.currentQuestion + 1}/{gameState.totalQuestions}</span>
              <span>Skor: {gameState.score}/{gameState.totalQuestions}</span>
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

        {/* Timer Card */}
        <div className={`card p-6 mb-8 text-center border-2 ${
          timeLeft <= 30 ? 'border-red-500 bg-red-50' : 'border-orange-200 bg-orange-50'
        }`}>
          <p className="text-sm text-gray-600 font-medium mb-2">SISA WAKTU</p>
          <div className={`text-5xl font-bold mb-2 ${
            timeLeft <= 30 ? 'text-red-600' : 'text-orange-600'
          }`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-600">Jawab soal sebanyak mungkin sebelum waktu habis!</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round((gameState.currentQuestion / gameState.totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-orange-600 mb-4">{currentWord.term}</h2>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 font-medium mb-4">Pilih situasi yang tepat:</p>
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = currentWord.id === option.id;
                const showResult = selectedAnswer !== null;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                        : showResult && isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer'
                    } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm leading-relaxed text-gray-900">{option.scenario}</p>
                      </div>
                      {showResult && (
                        isCorrect ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : isSelected ? (
                          <XCircle className="text-red-600" size={20} />
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
              {selectedAnswer === 0 ? '✅ Jawaban Benar!' : '❌ Jawaban Salah'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Results Mode
  if (gameMode === 'results') {
    const percentage = Math.round((gameState.score / gameState.totalQuestions) * 100);
    let message = '';
    let emoji = '';

    if (gameType === 'sprint') {
      // Sprint mode messages
      if (percentage === 100) {
        message = 'Luar biasa! Anda sempurna dalam sprint!';
        emoji = '🔥';
      } else if (percentage >= 80) {
        message = 'Sangat cepat dan akurat!';
        emoji = '⚡';
      } else if (percentage >= 60) {
        message = 'Bagus! Kecepatan dan akurasi Anda terus meningkat!';
        emoji = '🏃';
      } else {
        message = 'Coba lagi untuk meningkatkan kecepatan Anda!';
        emoji = '💨';
      }
    } else {
      // Match mode messages
      if (percentage === 100) {
        message = 'Sempurna! Anda menguasai semua istilah!';
        emoji = '🏆';
      } else if (percentage >= 80) {
        message = 'Luar biasa! Anda memiliki pemahaman yang sangat baik!';
        emoji = '⭐';
      } else if (percentage >= 60) {
        message = 'Bagus! Terus tingkatkan kemampuan Anda!';
        emoji = '👍';
      } else {
        message = 'Terus belajar dan coba lagi!';
        emoji = '💪';
      }
    }

    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="card p-12 text-center">
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {gameType === 'sprint' ? '⚡ Word Sprint Selesai!' : 'Permainan Selesai!'}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {gameType === 'sprint' ? 'Kecepatan dan akurasi Anda diuji!' : 'Kemahiran istilah BK Anda diuji!'}
          </p>
          
          <div className="mb-8">
            <div className={`text-5xl font-bold mb-2 ${
              gameType === 'sprint' ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {gameState.score}/{gameState.totalQuestions}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-4">{percentage}%</div>
            <p className="text-xl text-gray-600 mb-4">{message}</p>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Detail Jawaban</h3>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {vocabularyWords.map((word, index) => {
                const isCorrect = gameState.selectedAnswers[index] === 0;
                return (
                  <div
                    key={word.id}
                    className={`p-3 rounded-lg text-left flex items-center justify-between border ${
                      isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{word.term}</span>
                    {isCorrect ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-red-600" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-medium ${
                gameType === 'sprint'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
