import { observer } from 'mobx-react-lite';
import type { MultipleSelectQuestionProps } from '../../types/quiz';

export const MultipleSelectQuestion = observer(({
    question,
    selectedAnswers,
    onToggleAnswer,
    theme = 'light'
}: MultipleSelectQuestionProps) => {
    if (!question.options || question.options.length === 0) {
        return (
            <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-yellow-50' : 'bg-yellow-900'}`}>
                <p className={`text-center ${theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'}`}>
                    Нет доступных вариантов ответа
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {question.options.map((option, index) => {
                const isSelected = selectedAnswers.includes(index);

                return (
                    <button
                        key={index}
                        onClick={() => onToggleAnswer(index)}
                        className={`
              w-full p-4 text-left rounded-lg border-2 transition-all
              ${theme === 'light'
                                ? 'hover:border-purple-400 hover:bg-purple-50'
                                : 'hover:border-purple-500 hover:bg-gray-700'
                            }
              ${!isSelected && (theme === 'light'
                                ? 'border-gray-200 bg-white'
                                : 'border-gray-600 bg-gray-700'
                            )}
              ${isSelected && (theme === 'light'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-purple-500 bg-gray-600'
                            )}
            `}
                    >
                        <div className="flex items-center">
                            <span className={`
                w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold
                ${isSelected
                                    ? 'bg-purple-500 text-white'
                                    : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-600 text-white')
                                }
              `}>
                                {isSelected ? '✓' : String.fromCharCode(65 + index)}
                            </span>
                            <span className={`flex-1 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                {option}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
});