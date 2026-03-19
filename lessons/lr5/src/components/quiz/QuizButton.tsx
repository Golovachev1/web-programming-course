import type { QuizButtonProps } from '../../types/quiz';

export const QuizButton = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    theme = 'light'
}: QuizButtonProps) => {
    const baseClass = 'w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

    const variantStyles = {
        primary: theme === 'light'
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-purple-700 hover:bg-purple-800 text-white',
        secondary: theme === 'light'
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${variantStyles[variant]}`}
        >
            {children}
        </button>
    );
};