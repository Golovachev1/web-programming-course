import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { useState } from "react";
import {
  usePostApiSessions,
  usePostApiSessionsSessionIdAnswers,
  usePostApiSessionsSessionIdSubmit,
} from "../../generated/api/sessions/sessions";
import { MultipleSelectQuestion } from "../components/quiz/MultipleSelectQuestion";
import { EssayQuestion } from "../components/quiz/EssayQuestion";
import { QuizProgress } from "../components/quiz/QuizProgress";
import { QuizButton } from "../components/quiz/QuizButton";

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // API хуки
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const {
    gameStatus,
    currentQuestion,
    selectedAnswers,
    score,
    currentQuestionIndex,
    questions,
    correctAnswersCount,
    isLastQuestion,
    isAnswerSelected,
    answerText
  } = gameStore;

  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);


  const bgGradient = theme === "light"
    ? "from-purple-500 to-indigo-600"
    : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";


  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 10,
        }
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          gameStore.setQuestionsFromAPI(response.questions);
          gameStore.startGame();
        },
        onError: (error) => {
          console.error("Failed to create session:", error);
          gameStore.startGame();
        },
      }
    );
  };


  const handleNextQuestion = () => {
    if (sessionId && currentQuestion && ((currentQuestion.type === 'multiple-select' && selectedAnswers.length > 0) || (currentQuestion.type === 'essay' && answerText.length > 0))) {
      gameStore.saveCurrentAnswer();

      submitAnswer.mutate(
        {
          sessionId: sessionId,
          data: {
            questionId: currentQuestion.id,
            selectedOptions: selectedAnswers,
            text: answerText
          },
        },
        {
          onSuccess: (response) => {
            if ('pointsEarned' in response) {
              const isCorrect = response.status === "correct" || response.status === "partial";
              gameStore.updateAnswerResult(
                currentQuestion.id,
                isCorrect,
                response.pointsEarned
              );
            }
            gameStore.nextQuestion();
          },
          onError: (error) => {
            console.error("Failed to submit answer:", error);
            gameStore.nextQuestion();
          },
        }
      );
    }
  };


  const handleFinishGame = async () => {
    console.log('🎯 FINISH GAME TRIGGERED');

    gameStore.forceSaveCurrentAnswer();

    try {
      if (sessionId && currentQuestion && ((currentQuestion.type === 'multiple-select' && selectedAnswers.length > 0) || (currentQuestion.type === 'essay' && answerText.length > 0))) {
        const answerResponse = await submitAnswer.mutateAsync({
          sessionId: sessionId,
          data: {
            questionId: currentQuestion.id,
            selectedOptions: selectedAnswers,
            text: answerText
          },
        });

        if ('pointsEarned' in answerResponse) {
          const isCorrect = answerResponse.status === "correct" || answerResponse.status === "partial";
          gameStore.updateAnswerStatusFromServer(
            currentQuestion.id,
            isCorrect,
            answerResponse.pointsEarned
          );
        }

        const sessionResponse = await submitSession.mutateAsync({ sessionId });

        if (sessionResponse.score && typeof sessionResponse.score === 'object') {
          gameStore.updateScoreFromServer(sessionResponse.score.earned);
        }
      } else if (sessionId) {
        await submitSession.mutateAsync({ sessionId });
      }
    } catch (error) {
      console.error('❌ Error finishing game:', error);
    } finally {
      gameStore.finishGame();
    }
  };


  const canProceed = () => {
    if (!currentQuestion) return false;

    switch (currentQuestion.type) {
      case 'multiple-select':
        return isAnswerSelected;
      case 'essay':
        return true;
      default:
        return false;
    }
  };


  const renderUnsupportedQuestion = () => {
    return (
      <div className={`
        p-6 rounded-lg border-2 text-center
        ${theme === 'light'
          ? 'bg-orange-50 border-orange-200 text-orange-800'
          : 'bg-orange-900 border-orange-700 text-orange-200'
        }
      `}>
        <p className="font-semibold mb-2">⚠️ Тип вопроса не поддерживается</p>
        <p>Тип: <strong>{currentQuestion?.type}</strong></p>
        <p className="text-sm mt-2">
          Этот формат вопроса пока не доступен в текущей версии приложения
        </p>
      </div>
    );
  };


  if (gameStatus === "idle") {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 text-center ${textColor}`}>
            Quiz Game
          </h1>
          <p className={`${mutedText} mb-2 text-center`}>MobX + Zustand + API Edition</p>
          <p className={`text-sm ${mutedText} mb-8 text-center`}>
            Звук: {soundEnabled ? '🔊' : '🔇'}
          </p>

          <QuizButton
            onClick={handleStartGame}
            disabled={createSession.isPending}
            theme={theme}
            variant="primary"
          >
            {createSession.isPending ? 'Создание сессии...' : 'Начать игру'}
          </QuizButton>

          <div className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
              <strong>Task 4:</strong> Комбинация MobX + Zustand + API
            </p>
            <ul className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
              <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт)</li>
              <li>• <strong>Zustand:</strong> UI настройки (тема, звук)</li>
              <li>• <strong>React Query:</strong> Работа с API</li>
              <li>• <strong>Множественный выбор:</strong> Включен ✓</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }


  if (gameStatus === "finished") {
    const percentage = questions.length ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
    const getEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '😊';
      if (percentage >= 40) return '🤔';
      return '😢';
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-6xl mb-4">{getEmoji()}</div>

          <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>
            Игра завершена!
          </h2>

          <div className="mb-6">
            <p className={`text-5xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
              {score}
            </p>
            <p className={mutedText}>очков заработано</p>
          </div>

          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4 mb-6`}>
            <p className={`text-lg ${textColor}`}>
              Правильных ответов: <span className="font-bold">{correctAnswersCount} из {questions.length}</span>
            </p>
            <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
              {percentage}%
            </p>
          </div>

          <QuizButton
            onClick={() => {
              setSessionId(null);
              gameStore.resetGame();
            }}
            theme={theme}
            variant="primary"
          >
            Играть снова
          </QuizButton>
        </div>
      </div>
    );
  }


  if (!currentQuestion) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl p-8 text-center`}>
          <p className={textColor}>Загрузка вопроса...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto">

        <QuizProgress
          current={currentQuestionIndex}
          total={questions.length}
          score={score}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

 
        <div className={`${cardBg} rounded-2xl shadow-2xl p-6 transition-colors duration-300`}>

          <div className="mb-4 flex gap-2 flex-wrap">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'}
              ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'}
              ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'}
              ${theme === 'dark' && 'bg-opacity-20'}
            `}>
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>

            <span className={`
              text-xs px-2 py-1 rounded-full
              ${currentQuestion.type === 'multiple-select' && 'bg-blue-100 text-blue-700'}
              ${currentQuestion.type === 'essay' && 'bg-purple-100 text-purple-700'}
              ${theme === 'dark' && 'bg-opacity-20'}
            `}>
              {currentQuestion.type === 'multiple-select' && 'Множественный выбор'}
              {currentQuestion.type === 'essay' && 'Развернутый ответ'}
              {!['multiple-select', 'essay'].includes(currentQuestion.type) && currentQuestion.type}
            </span>
          </div>

          <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
            {currentQuestion.question}
          </h2>


          {currentQuestion.type === 'multiple-select' && (
            <MultipleSelectQuestion
              question={currentQuestion}
              selectedAnswers={selectedAnswers}
              onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
              theme={theme}
            />
          )}

          {currentQuestion.type === 'essay' && (
            <EssayQuestion
              question={currentQuestion}
              textAnswer={answerText}
              onTextChange={(text) => gameStore.setText(text)}
              theme={theme}
            />
          )}

          {!['multiple-select', 'essay'].includes(currentQuestion.type) && renderUnsupportedQuestion()}

          {canProceed() && (
            <div className="mt-6">
              <QuizButton
                onClick={isLastQuestion ? handleFinishGame : handleNextQuestion}
                disabled={submitAnswer.isPending || submitSession.isPending}
                theme={theme}
                variant="primary"
              >
                {(submitAnswer.isPending || submitSession.isPending) ? (
                  'Отправка...'
                ) : (
                  isLastQuestion ? 'Завершить' : 'Следующий вопрос'
                )}
              </QuizButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Task4;