import { LocalQuestion } from '../stores/gameStore';

export const mockQuestions: LocalQuestion[] = [
  {
    id: '1',
    question: 'Какие из этих языков являются языками программирования?',
    options: ['JavaScript', 'HTML', 'CSS', 'Python'],
    correctAnswers: [0, 3], // JavaScript и Python
    difficulty: 'easy',
    type: "multiple-select"
  },
  {
    id: '2',
    question: 'Какие теги являются блочными в HTML?',
    options: ['<div>', '<span>', '<p>', '<a>'],
    correctAnswers: [0, 2], // div и p
    difficulty: 'medium',
    type: "multiple-select"
  },
  {
    id: '3',
    question: 'Какие методы массива изменяют исходный массив?',
    options: ['map()', 'push()', 'filter()', 'splice()'],
    correctAnswers: [1, 3], // push и splice
    difficulty: 'hard',
    type: "multiple-select"
  }
];