interface CommandStatusBarProps {
    commandState: {
        command: string;
        step: number;
        data: {
            receiverEmail?: string;
        };
    };
    clearCountdown: number;
    totalSteps: number;
    onCancel: () => void;
    currentMessage?: string;
    isValidEmail?: (email: string) => boolean;
    showValidationError?: boolean;
}

const CommandStatusBar = ({
    commandState,
    clearCountdown,
    totalSteps,
    onCancel,
    currentMessage = "",
    isValidEmail,
    showValidationError = false,
}: CommandStatusBarProps) => {
    const isInvalidEmail =
        showValidationError &&
        commandState.command === "/email" &&
        commandState.step === 0 &&
        currentMessage.trim() &&
        isValidEmail &&
        !isValidEmail(currentMessage.trim());

    return (
        <div
            className={`${
                isInvalidEmail
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            } border-t p-3 shadow-sm dark:shadow-gray-900/30`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span
                        className={`font-medium select-none ${
                            isInvalidEmail
                                ? "text-red-600 dark:text-red-400"
                                : "text-blue-600 dark:text-blue-400"
                        }`}
                    >
                        {commandState.command}
                    </span>

                    {commandState.command === "/clear" ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-red-500 dark:text-red-400 select-none">
                                Clearing in {clearCountdown}s
                            </span>
                        </div>
                    ) : (
                        <>
                            <span
                                className={`text-sm ${
                                    isInvalidEmail
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-blue-600 dark:text-blue-400"
                                } select-none`}
                            >
                                Step {commandState.step + 1} of {totalSteps}
                            </span>
                            {commandState.data.receiverEmail && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded shadow-sm dark:shadow-gray-900/30">
                                    To: {commandState.data.receiverEmail}
                                </span>
                            )}
                        </>
                    )}
                </div>
                {isInvalidEmail && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Please enter a valid email address
                        </span>
                    </div>
                )}
                <button
                    onClick={onCancel}
                    className={`${
                        isInvalidEmail
                            ? "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            : "text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    } text-sm cursor-pointer`}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CommandStatusBar;
