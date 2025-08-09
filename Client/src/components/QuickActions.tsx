interface QuickActionsProps {
    setMessage: (message: string) => void;
    setHashTag: (hashTag: string) => void;
    hashTag: string;
}

const QuickActions = ({
    setMessage,
    setHashTag,
    hashTag,
}: QuickActionsProps) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <button
                onClick={() => setMessage("/")}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer"
            >
                /commands
            </button>
            <button
                onClick={() => setHashTag("#confident")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#confident" ? "hidden" : ""
                }`}
            >
                confident
            </button>
            <button
                onClick={() => setHashTag("#formal")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#formal" ? "hidden" : ""
                }`}
            >
                formal
            </button>
            <button
                onClick={() => setHashTag("#casual")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#casual" ? "hidden" : ""
                }`}
            >
                casual
            </button>
        </div>
    );
};

export default QuickActions;
