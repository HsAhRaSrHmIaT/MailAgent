import { BsFillSendFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import type { SendButtonsProps } from "../types";

const SendButtons = ({ onSubmit, disabled = false }: SendButtonsProps) => {
    return (
        <div className="flex flex-col space-y-3.5">
            <button
                onClick={onSubmit}
                disabled={disabled}
                className="px-3 py-3 bg-gray-700 dark:bg-gray-600 text-white rounded-sm hover:bg-gray-900 dark:hover:bg-gray-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center cursor-pointer shadow-sm dark:shadow-gray-900/30"
            >
                <BsFillSendFill className="w-5 h-5" />
            </button>
            <button className="px-3 py-3 bg-gray-700 dark:bg-gray-600 text-white rounded-sm hover:bg-gray-900 dark:hover:bg-gray-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center cursor-pointer shadow-sm dark:shadow-gray-900/30">
                <FaMicrophone className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SendButtons;
