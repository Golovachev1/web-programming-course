export type GameStatus = "idle" | "playing" | "finished";
export type Theme = "light" | "dark";

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswers: number[];
    difficulty: 'easy' | 'medium' | 'hard';
    type: string;
    maxPoints?: number;
    minLength?: number;
    maxLength?: number;
}


export interface Answer {
    questionId: string;
    selectedAnswers?: number[];    
    isCorrect: boolean;
    pointsEarned?: number;         
    textAnswer?: string;          }


export interface MultipleSelectQuestionProps {
    question: Question;
    selectedAnswers: number[];
    onToggleAnswer: (index: number) => void;
    theme?: 'light' | 'dark';
}

export interface EssayQuestionProps {
    question: Question;
    textAnswer: string;
    onTextChange: (text: string) => void;
    theme?: 'light' | 'dark';
}

export interface QuizButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    theme?: 'light' | 'dark';
}

export interface QuizProgressProps {
    current: number;
    total: number;
    score: number;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}