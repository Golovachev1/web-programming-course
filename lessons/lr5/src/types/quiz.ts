export interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  minLength?: number;
  maxLength?: number;
}

export interface Answer {
  questionId: string | number;
  selectedAnswer: number;
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
