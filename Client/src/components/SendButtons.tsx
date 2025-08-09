import { BsFillSendFill } from 'react-icons/bs';
import { FaMicrophone } from 'react-icons/fa';

interface SendButtonsProps {
    handleSubmit: () => void;
}

const SendButtons = ({ handleSubmit }: SendButtonsProps) => {
    return (
        <div className="flex flex-col space-y-3 items-center mb-0.5">
            <button
                onClick={handleSubmit}
                className="bg-gray-700 text-white p-3 hover:bg-gray-800 transition-colors cursor-pointer"
            >
                <BsFillSendFill size={20} />
            </button>
            <button className="bg-gray-700 text-white p-3 hover:bg-gray-800 transition-colors cursor-pointer">
                <FaMicrophone size={20} />
            </button>
        </div>
    );
};

export default SendButtons;
