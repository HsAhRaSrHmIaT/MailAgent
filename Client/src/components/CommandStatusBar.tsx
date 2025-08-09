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
}

const CommandStatusBar = ({
    commandState,
    clearCountdown,
    totalSteps,
    onCancel,
}: CommandStatusBarProps) => {
    return (
        <div className="bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-medium select-none">
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
                            <span className="text-sm text-blue-500 select-none">
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
                <button
                    onClick={onCancel}
                    className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CommandStatusBar;
