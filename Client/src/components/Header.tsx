import { LuRefreshCcw } from "react-icons/lu";

const Header = () => {
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
            <button className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors cursor-pointer">
                <LuRefreshCcw size={20} />
            </button>
        </div>
    );
};

export default Header;
