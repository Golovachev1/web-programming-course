import { makeAutoObservable, runInAction } from "mobx";
import type { QuestionPreview } from "../../generated/api/quizBattleAPI.schemas";
import { mockQuestions } from "../data/questions";

export interface LocalQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
}

export interface LocalAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  pointsEarned: number;
  textAnswer: string;
}

export class GameStore {
  gameStatus: "idle" | "playing" | "finished" = "idle";
  questions: LocalQuestion[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  answeredQuestions: LocalAnswer[] = [];
  answerText: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setQuestionsFromAPI(questions: QuestionPreview[]) {

    this.questions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options || [], 
      correctAnswers: [],
      difficulty: q.difficulty,
      type: q.type
    }));

    console.log('All questions loaded:', {
      total: questions.length,
      multipleSelect: questions.filter(q => q.type === 'multiple-select').length,
      essay: questions.filter(q => q.type === 'essay').length
    });

    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.score = 0;
  }

  startGame() {
    this.gameStatus = "playing";
    if (this.questions.length === 0) {
      this.questions = mockQuestions.map(q => ({
        ...q,
        type: 'multiple-select'
      }));
    }
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.score = 0;
  }

  toggleAnswer(index: number) {
    if (this.gameStatus !== "playing") return;

    // ДОБАВЛЯЕМ проверку типа вопроса
    if (this.currentQuestion?.type !== 'multiple-select') {
      console.log('Toggle answer available only for multiple-select questions');
      return;
    }

    if (this.selectedAnswers.includes(index)) {
      this.selectedAnswers = this.selectedAnswers.filter(i => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  setText(text: string) {
    this.answerText = text;
  }

  saveCurrentAnswer() {
    const question = this.currentQuestion;
    if (!question) return;


    if (question.type === 'multiple-select') {
      if (this.selectedAnswers.length === 0) return;

      this.answeredQuestions = this.answeredQuestions.filter(
        a => a.questionId !== question.id
      );

      this.answeredQuestions.push({
        questionId: question.id,
        selectedAnswers: [...this.selectedAnswers],
        isCorrect: false,
        pointsEarned: 0,
        textAnswer: ""
      });
    } else if (question.type === 'essay') {
      
      this.answeredQuestions = this.answeredQuestions.filter(
        a => a.questionId !== question.id
      );

      this.answeredQuestions.push({
        questionId: question.id,
        textAnswer: this.answerText, 
        isCorrect: false,
        pointsEarned: 0,
        selectedAnswers: []
      });
    }
  }

  forceSaveCurrentAnswer() {
    const question = this.currentQuestion;
    if (!question) return;

    const alreadyAnswered = this.answeredQuestions.some(a => a.questionId === question.id);
    if (!alreadyAnswered) {
      this.saveCurrentAnswer();
    }
  }

  updateAnswerResult(questionId: string, isCorrect: boolean, pointsEarned: number) {
    const answerIndex = this.answeredQuestions.findIndex(a => a.questionId === questionId);
    if (answerIndex !== -1) {
      this.answeredQuestions[answerIndex].isCorrect = isCorrect;
      this.answeredQuestions[answerIndex].pointsEarned = pointsEarned;

      if (isCorrect) {
        this.score += pointsEarned;
      }
    }
  }

  updateAnswerStatusFromServer(questionId: string, isCorrect: boolean, pointsEarned: number) {
    runInAction(() => {
      const answerIndex = this.answeredQuestions.findIndex(a => a.questionId === questionId);
      if (answerIndex !== -1) {
        this.answeredQuestions[answerIndex].isCorrect = isCorrect;
        this.answeredQuestions[answerIndex].pointsEarned = pointsEarned;
      }
    });
  }

  updateScoreFromServer(newScore: number) {
    runInAction(() => {
      this.score = newScore;
    });
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswers = [];
      this.answerText = "";
    } else {
      this.finishGame();
    }
  }

  finishGame() {
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }


  get currentQuestion(): LocalQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    return this.questions.length
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(a => a.isCorrect).length;
  }

  get isAnswerSelected(): boolean {
    if (this.currentQuestion?.type === 'multiple-select') {
      return this.selectedAnswers.length > 0;
    } else if (this.currentQuestion?.type === 'essay') {
      return true; 
    }
    return false;
  }
}


export const gameStore = new GameStore();