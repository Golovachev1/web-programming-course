import { observer } from 'mobx-react-lite';

interface QuizProgressProps {
    current: number;
    total: number;
    score: number;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

export const QuizProgress = observer(({
    current,
    total,
    score,
    theme = 'light',
    onToggleTheme
}: QuizProgressProps) => {
    const percentage = ((current + 1) / total) * 100;
    const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';

    return (
        <div className={`${cardBg} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${mutedText}`}>
                    Вопрос {current + 1} из {total}
                </span>
                <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                        Счёт: {score}
                    </span>
                    {onToggleTheme && (
                        <button
                            onClick={onToggleTheme}
                            className={`p-2 rounded ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    )}
                </div>
            </div>

            <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2`}>
                <div
                    className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
});