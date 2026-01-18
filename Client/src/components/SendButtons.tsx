import type { SendButtonsProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import { BsFillSendFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";

const SendButtons = ({ onSubmit, disabled = false, isVoiceMode, onToggleVoiceMode }: SendButtonsProps) => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div className="flex flex-col space-y-2 sm:space-y-5">
            <button
                onClick={onSubmit}
                disabled={disabled}
                className="p-3 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                    backgroundColor: disabled
                        ? currentColors.border
                        : currentPalette.primary,
                    color: disabled ? currentColors.text : "#FFFFFF",
                }}
            >
                <BsFillSendFill className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
                className="p-3 rounded-lg transition-all duration-200 hover:opacity-80 cursor-pointer"
                style={{
                    backgroundColor: currentColors.border,
                    color: currentColors.text,
                }}
                onClick={onToggleVoiceMode}
                title={isVoiceMode ? "Disable Voice Mode" : "Enable Voice Mode"}
            >
                <FaMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
    );
};

export default SendButtons;
