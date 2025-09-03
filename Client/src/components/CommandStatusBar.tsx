import type { CommandStatusBarProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

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

    const { currentColors, currentPalette } = useTheme();

    return (
        <div
            className="border-t p-3 shadow-sm"
            style={{
                backgroundColor: isInvalidEmail
                    ? currentColors.surface + "22"
                    : currentColors.surface,
                borderColor: isInvalidEmail ? "#ec0c0cff" : currentColors.border,
                boxShadow: `0 1px 4px 0 ${currentColors.border}22`,
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span
                        className="font-medium select-none"
                        style={{
                            color: isInvalidEmail
                                ? "#d32f2f"
                                : currentPalette.primary,
                        }}
                    >
                        {commandState.command}
                    </span>

                    {commandState.command === "/clear" ? (
                        <div className="flex items-center space-x-2">
                            <span
                                className="text-xs select-none"
                                style={{ color: "#d32f2f" }}
                            >
                                Clearing in {clearCountdown}s
                            </span>
                        </div>
                    ) : (
                        <>
                            <span
                                className="text-sm select-none"
                                style={{
                                    color: isInvalidEmail
                                        ? "#d32f2f"
                                        : currentPalette.primary,
                                }}
                            >
                                Step {commandState.step + 1} of {totalSteps}
                            </span>
                            {commandState.data.receiverEmail && (
                                <span
                                    className="text-xs px-2 py-1 rounded shadow-sm"
                                    style={{
                                        backgroundColor:
                                            currentPalette.primary + "22",
                                        color: currentPalette.primary,
                                    }}
                                >
                                    To: {commandState.data.receiverEmail}
                                </span>
                            )}
                        </>
                    )}
                </div>
                {isInvalidEmail && (
                    <div className="flex items-center space-x-2">
                        <span
                            className="text-sm font-medium"
                            style={{ color: "#d32f2f" }}
                        >
                            Please enter a valid email address
                        </span>
                    </div>
                )}
                <button
                    onClick={onCancel}
                    className="text-sm cursor-pointer"
                    style={{
                        color: isInvalidEmail
                            ? "#d32f2f"
                            : currentPalette.primary,
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CommandStatusBar;
