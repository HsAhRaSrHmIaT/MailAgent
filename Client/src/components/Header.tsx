import { LuRefreshCcw } from "react-icons/lu";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    hashTag?: string;
}

interface HeaderProps {
    setMessages: (messages: Message[]) => void;
}

const Header = ({ setMessages }: HeaderProps) => {
    const handleRefresh = () => {
        // Logic to refresh messages or reset state
        setMessages([]);
    };

    return (
        <div className="bg-gray-700 text-white p-4 flex items-center justify-between select-none">
            <div>
                <h1 className="text-lg font-semibold">
                    Chat & Email Assistant
                </h1>
                <div className="flex items-center space-x-1 ml-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs">Online</span>
                </div>
            </div>
            <button className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-all duration-300 cursor-pointer hover:-rotate-180" onClick={handleRefresh}>
                <LuRefreshCcw size={20} />
            </button>
        </div>
    );
};

export default Header;
