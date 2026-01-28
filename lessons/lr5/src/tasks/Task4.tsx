import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { useState } from "react";
import {
  usePostApiSessions,
  usePostApiSessionsSessionIdAnswers,
  usePostApiSessionsSessionIdSubmit,
} from "../../generated/api/sessions/sessions";

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");

  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const {
    gameStatus,
    currentQuestion,
    selectedAnswers,
    score,
    progress,
    currentQuestionIndex,
    questions,
    correctAnswersCount,
    isLastQuestion,
  } = gameStore;

  const theme = useUIStore((s) => s.theme);
  

  const bgGradient =
    theme === "light"
      ? "from-purple-500 to-indigo-600"
      : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";
  const primary = "bg-purple-600 hover:bg-purple-700";

  const handleStartGame = () => {
    setTextAnswer("");
    
    createSession.mutate(
    {
      data: {
        questionCount: 5,
        difficulty: 'medium'
      }
    },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          gameStore.setQuestionsFromAPI(response.questions);
          gameStore.startGame();
        },
        onError: (error) => {
        console.error('Failed to create session:', error);
        },
      }
    );
  };

  const handleNextQuestion = () => {
    // debugger;
    if (sessionId && currentQuestion && (selectedAnswers.length > 0 || textAnswer.length > 0)) {
    gameStore.saveCurrentAnswer();
    submitAnswer.mutate(
      {
        sessionId: sessionId!,
        data: {
          questionId: currentQuestion.id.toString(),
          selectedOptions: selectedAnswers,
          text: textAnswer,
        },
      },
      {
        onSuccess: (response) => {
          if ('pointsEarned' in response) {
            const isCorrect = response.status === 'correct';
          }
          gameStore.nextQuestion();
          setTextAnswer("");
        },
        onError: (error) => {
          console.error('Failed to submit answer:', error);
          gameStore.nextQuestion();
          setTextAnswer("");
        },
      }
    );
  }
};

  const handleFinishGame = () => {
  if (sessionId) {
    submitSession.mutate(
      { sessionId },
      {
        onSuccess: (response) => {
          console.log('Session completed:', response);
          gameStore.finishGame();
        },
        onError: (error) => {
          console.error('Failed to submit session:', error);
          gameStore.finishGame();
        },
      }
    );
  } else {
    gameStore.finishGame();
  }
};

  if (gameStatus === "idle") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
      >
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
          <h1 className={`text-4xl font-bold text-center mb-8 ${textColor}`}>
            Quiz Game
          </h1>
          <button
            onClick={handleStartGame}
            disabled={createSession.isPending}
            className={`w-full ${primary} text-white py-4 rounded-xl font-bold`}
          >
            {createSession.isPending ? "Загрузка..." : "Начать игру"}
          </button>
        </div>
      </div>
    );
  }

  if (gameStatus === "finished") {
    const percent = questions.length
      ? Math.round((correctAnswersCount / questions.length) * 100)
      : 0;
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
      >
        <div
          className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}
        >
          <h2 className={`text-3xl font-bold mb-6 ${textColor}`}>
            Игра завершена!
          </h2>
          <p className="text-5xl font-bold text-purple-600 mb-4">{score}</p>
          <p className={mutedText}>
            {correctAnswersCount} из {questions.length} правильных
          </p>
          <p className="text-3xl font-bold text-purple-600">{percent}%</p>
          <button
            onClick={() => {
              setSessionId(null);
              gameStore.resetGame();
            }}
            className={`mt-8 w-full ${primary} text-white py-4 rounded-xl font-bold`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Загрузка вопроса...</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${cardBg} rounded-lg p-4 mb-6`}>
          <div className="flex justify-between mb-2">
            <span className={mutedText}>
              Вопрос {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="font-bold text-purple-600">Счёт: {score}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl shadow-2xl p-8`}>
          <h2 className={`text-2xl font-bold mb-8 ${textColor}`}>
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'essay' && <div>{'Здесь должна быть форма для ввода текстового ответа'}
            <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Введите ваш ответ"
            className={`w-full h-24 p-2 border rounded-md ${mutedText}`}
          />

          {textAnswer.length > 0 && (
            <button
              onClick={gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
              className={`${primary} text-white py-2 rounded-xl font-bold mt-4 w-full`}
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
)}
            </div>}

          {currentQuestion.options && <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers.includes(index);

              return (
                <button
                  key={index}
                  onClick={() => gameStore.toggleAnswer(index)}
                  className={`
        w-full p-6 text-left rounded-2xl border-2 transition-all duration-300
        flex items-center gap-5 text-lg font-medium cursor-pointer select-none
        ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20"
            : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        }
      `}
                >
                  {/* Круг: либо буква, либо галочка */}
                  <div
                    className={`
          w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
          transition-all duration-300 flex-shrink-0
          ${
            isSelected
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }
        `}
                  >
                    {isSelected ? '✓' : String.fromCharCode(65 + index)}
                  </div>

                  <span className={`${textColor} leading-relaxed`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>}

          {selectedAnswers.length > 0 && (
            <button
              onClick={gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
              className={`${primary} text-white py-2 rounded-xl font-bold mt-4 w-full`}
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
)}
        </div>
      </div>
    </div>
  );
});

export default Task4;