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
    showValidationError = false
}: CommandStatusBarProps) => {
    const isInvalidEmail = showValidationError && commandState.command === "/email" && commandState.step === 0 && currentMessage.trim() && isValidEmail && !isValidEmail(currentMessage.trim());

    return (
        <div className={`${isInvalidEmail ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"} border-t p-3`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className={`font-medium select-none ${isInvalidEmail ? "text-red-600" : "text-blue-600"}`}>
                        {commandState.command}
                    </span>

                    {commandState.command === "/clear" ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-red-500 select-none">
                                Clearing in {clearCountdown}s
                            </span>
                        </div>
                    ) : (
                        <>
                            <span className={`text-sm ${isInvalidEmail ? "text-red-600" : "text-blue-600"} select-none`}>
                                Step {commandState.step + 1} of {totalSteps}
                            </span>
                            {commandState.data.receiverEmail && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    To: {commandState.data.receiverEmail}
                                </span>
                            )}
                        </>
                    )}
                </div>
                {isInvalidEmail && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600 font-medium">
                            Please enter a valid email address
                        </span>
                    </div>
                )}
                <button
                    onClick={onCancel}
                    className={`${isInvalidEmail ? "text-red-500 hover:text-red-700" : "text-blue-500 hover:text-blue-700"} text-sm cursor-pointer`}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CommandStatusBar;
