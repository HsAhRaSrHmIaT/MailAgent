import { BsFillSendFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";

interface SendButtonsProps {
    onSubmit: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

const SendButtons = ({
    onSubmit,
    disabled = false,
}: SendButtonsProps) => {
    return (
        <div className="flex flex-col space-y-3.5">
            <button
            onClick={onSubmit}
            disabled={disabled}
            className="px-3 py-3 bg-gray-700 text-white rounded-sm hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center cursor-pointer"
            >
            <BsFillSendFill className="w-5 h-5" />
            </button>
            <button
            className="px-3 py-3 bg-gray-700 text-white rounded-sm hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center cursor-pointer"
            >
            <FaMicrophone className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SendButtons;
