import type { SendButtonsProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import { BsFillSendFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";

const SendButtons = ({ onSubmit, disabled = false }: SendButtonsProps) => {
    const { currentColors } = useTheme();

    return (
        <div className="flex flex-col space-y-3">
            <button
                onClick={onSubmit}
                disabled={disabled}
                className={`px-3 py-3 rounded-sm disabled:cursor-not-allowed flex items-center cursor-pointer shadow-sm dark:shadow-gray-900/30 border`}
                style={{
                    backgroundColor: currentColors.bg,
                    color: disabled
                        ? `${currentColors.text}99`
                        : currentColors.text,
                    borderColor: currentColors.border,
                }}
            >
                <BsFillSendFill className="w-5 h-5" />
            </button>
            <button
                className={`px-3 py-3 rounded-sm disabled:cursor-not-allowed flex items-center cursor-pointer shadow-sm dark:shadow-gray-900/30 border`}
                style={{
                    backgroundColor: currentColors.bg,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                }}
            >
                <FaMicrophone className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SendButtons;
