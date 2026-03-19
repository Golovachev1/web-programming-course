import type { EssayQuestionProps } from '../../types/quiz';

export const EssayQuestion = ({
    textAnswer,
    onTextChange,
    theme = 'light'
}: EssayQuestionProps) => {
    const charCount = textAnswer.length; 
    const maxLength = 1000;
    return (
        <div className="space-y-4">
            <textarea
                placeholder="Введите ваш развернутый ответ здесь..."
                className={`
          w-full h-40 p-4 rounded-lg border-2 resize-none focus:outline-none
          ${theme === 'light'
                        ? 'border-gray-300 bg-white text-gray-800 focus:border-purple-500'
                        : 'border-gray-600 bg-gray-700 text-white focus:border-purple-500'
                    }
        `}
                rows={6}
                value={textAnswer}
                onChange={(e) => onTextChange(e.target.value)}
            />

            <div className={`flex justify-between text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                <span>Символов: {charCount}</span>
                <span>Максимум: {maxLength}</span>
            </div>

            <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                <p>💡 Это вопрос с развернутым ответом. Напишите ваш ответ в поле выше.</p>
            </div>
        </div>
    );
};