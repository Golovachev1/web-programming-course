import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { useState } from "react";
import { QuizButton } from '../components/quiz/QuizButton';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { MultipleSelectQuestion } from '../components/quiz/MultipleSelectQuestion';
import { EssayQuestion } from '../components/quiz/EssayQuestion';
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

  const canProceed = currentQuestion?.type === 'multiple-select'
    ? gameStore.selectedAnswers.length > 0
    : gameStore.text.trim().length >= (currentQuestion?.minLength || 0);

  if (!gameStore.isPlaying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <QuizButton onClick={handleStartGame}>
          Начать игру
        </QuizButton>
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

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress
        current={gameStore.currentQuestionIndex}
        total={gameStore.questions.length}
      />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>

        <div className="flex gap-4 mb-6 text-sm">
          <span className="px-3 py-1 bg-gray-100 rounded">
            Тип: {currentQuestion.type}
          </span>
          <span className="px-3 py-1 bg-yellow-100 rounded">
            Сложность: {currentQuestion.difficulty}
          </span>
          <span className="px-3 py-1 bg-green-100 rounded">
            Баллов: {currentQuestion.maxPoints}
          </span>
        </div>

        {currentQuestion.type === 'multiple-select' && (
          <MultipleSelectQuestion
            question={currentQuestion}
            selectedAnswers={gameStore.selectedAnswers}
            onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
          />
        )}

        {currentQuestion.type === 'essay' && (
          <EssayQuestion
            question={currentQuestion}
            textAnswer={gameStore.text}
            onTextChange={(text) => gameStore.setTextAnswer(text)}
          />
        )}

        {canProceed && (
          <div className="mt-6">
            <QuizButton
              onClick={gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </QuizButton>
          </div>
        )}
      </div>
    </div>
  );
});

export default Task4;