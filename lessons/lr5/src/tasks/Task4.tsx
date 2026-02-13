import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePostApiSessions } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdAnswers } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import * as React from 'react'
import { Start } from './Start';
import { EssayQuestion } from '../quiz/EssayQuestion';
import { Game } from './Game';

/**
 * Task 4: Комбинированное использование MobX + Zustand
 */
const Task4 = observer(() => {
  // MobX - бизнес-логика
  const { 
    gameStatus, 
    currentQuestion,
    selectedAnswers, 
    essayAnswer,
    score, 
    //progress,
    questions,
    correctAnswersCount,
    //currentQuestionIndex,
    //isLastQuestion,
    //setEssayAnswer,
  } = gameStore;

  // Zustand - UI состояние
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const handleStartGame = () => {
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
          // Загружаем вопросы в gameStore
          gameStore.startGame(response.questions);
        },
        onError: (error) => {
          console.error('Failed to create session:', error);
        },
      }
    );
  };

  const handleNextQuestion = () => {
    if (sessionId && currentQuestion) {
      // Определяем тип вопроса и формируем данные для отправки
      let answerData;
      
      if (currentQuestion.type === 'essay') {
        // Для эссе отправляем текстовый ответ
        answerData = {
          questionId: currentQuestion.id as never as string,
          text: essayAnswer || '' // Добавляем проверку на null/undefined
        };
      } else {
        // Для вопросов с выбором отправляем выбранные варианты
        answerData = {
          questionId: currentQuestion.id as never as string,
          selectedOptions: selectedAnswers
        };
      }
  
      // Отправляем ответ на сервер
      submitAnswer.mutate(
        {
          sessionId,
          data: answerData
        },
        {
          onSuccess: (response) => {
            // Обновляем счет на основе ответа сервера
            if ('pointsEarned' in response) {
              // const isCorrect = response.status === 'correct';
              // ... обновляем результат ...
            }
            // Переходим к следующему вопросу
            if (!gameStore.nextQuestion()) {
              handleFinishGame();
            };
          },
          onError: (error) => {
            console.error('Failed to submit answer:', error);
            gameStore.nextQuestion();
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

  // Проверяем, можно ли перейти к следующему вопросу
  const canProceed = () => {
    if (!currentQuestion) return false;
    
    if (currentQuestion.type === 'essay') {
      // Для эссе проверяем, что введен текст
      return essayAnswer && essayAnswer.trim().length > 0;
    } else {
      // Для вопросов с выбором проверяем, что выбран хотя бы один вариант
      return selectedAnswers.length > 0;
    }
  };

  /* 
  //Цвета в зависимости от темы
  const bgGradient = theme === 'light'
    ? 'from-purple-500 to-indigo-600'
    : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
  const primaryHover = theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';

   Расчет процентов для экрана результатов
  const percentage = questions.length > 0 
    ? Math.round((correctAnswersCount / questions.length) * 100)
    : 0;

  const getEmoji = () => {
    if (percentage >= 80) return '??';
    if (percentage >= 60) return '??';
    if (percentage >= 40) return '??';
    return '??';
  };
  */

  // Стартовый экран
  if (gameStatus === 'idle') {
    return (
      <Start
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        handleStartGame={handleStartGame}
      />
    );
  }

  // Экран результатов
  if (gameStatus === 'finished') {
    return (
    <EssayQuestion
      theme={theme}
      score={score}
      correctAnswersCount={correctAnswersCount}
      totalQuestions={questions.length}
      resetGame={() => gameStore.resetGame()}
    />
    );
  }

  // Игровой экран
  if (!currentQuestion) return null;

  return (
    <Game
      theme={theme}
      toggleTheme={toggleTheme}
      handleNextQuestion={handleNextQuestion}
    />
  );
});

export default Task4;