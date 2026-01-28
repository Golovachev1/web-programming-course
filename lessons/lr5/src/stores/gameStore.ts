import { makeAutoObservable } from "mobx";
import type { QuestionPreview } from "../../generated/api/quizBattleAPI.schemas";

export interface LocalAnswer {
  questionId: string | number;
  selectedAnswers: number[];
  isCorrect: boolean;
}

class GameStore {
  gameStatus: "idle" | "playing" | "finished" = "idle";
  questions: QuestionPreview[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  text: string = ""
  answeredQuestions: LocalAnswer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setQuestionsFromAPI(questions: QuestionPreview[]) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.text = "";
    this.score = 0;
  }

  toggleAnswer(answerIndex: number) {
    if (this.gameStatus !== "playing") return;

    this.selectedAnswers = this.selectedAnswers.includes(answerIndex)
      ? this.selectedAnswers.filter((i) => i !== answerIndex)
      : [...this.selectedAnswers, answerIndex].sort((a, b) => a - b);
  }

  saveCurrentAnswer() {
    const q = this.currentQuestion;
    if (!q) return;

    this.answeredQuestions.push({
      questionId: q.id,
      selectedAnswers: [...this.selectedAnswers],
      isCorrect: false,
    });
  }

  updateAnswerResult(isCorrect: boolean, points: number = 0) {
    const last = this.answeredQuestions[this.answeredQuestions.length - 1];
    if (last) last.isCorrect = isCorrect;
    if (isCorrect) this.score += points;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswers = [];
    } else {
      this.finishGame();
    }
  }

  startGame() {
    this.gameStatus = "playing";
  }

  finishGame() {
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.text = "";
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  }

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress() {
    return this.questions.length
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion() {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount() {
    return this.answeredQuestions.filter((a) => a.isCorrect).length;
  }
}

export const gameStore = new GameStore();